import Rubric from '../models/Rubric.js';
import Criterion from '../models/Criterion.js';
import CourseRubric from '../models/CourseRubric.js';
import Evaluation from '../models/Evaluation.js';
import sequelize from '../config/db.js';
import { QueryTypes } from 'sequelize';

// GET /api/rubrics
// Returns default rubrics (isDefault=true) + rubrics created by the logged-in faculty
export const listRubrics = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find default rubrics and user-created rubrics
    const rubrics = await Rubric.findAll({
      where: {
        // Sequelize OR condition implemented using raw SQL or Op.or; use literal simpler two queries merged
      }
    });

    // Since combining conditions without Op is clunky, perform two queries and merge unique by id
    const [defaultRubrics, userRubrics] = await Promise.all([
      Rubric.findAll({ where: { isDefault: true } }),
      Rubric.findAll({ where: { creatorId: userId } }),
    ]);

    const map = new Map();
    for (const r of [...defaultRubrics, ...userRubrics]) {
      map.set(r.id, r);
    }
    const merged = Array.from(map.values());

    res.json({ rubrics: merged });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rubrics', error: error.message });
  }
};

// GET /api/rubrics/:id
// Returns a single rubric with its criteria
export const getRubricById = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      return res.status(400).json({ message: 'Invalid rubric id' });
    }
    console.log('[GET /api/rubrics/:id] incoming id =', id, 'parsed =', numericId);
    // First attempt: include criteria via association
    let rubric = await Rubric.findOne({
      where: { id: numericId },
      include: [{ model: Criterion, as: 'criteria', required: false }],
    });
    console.log('[GET /api/rubrics/:id] ORM result exists =', Boolean(rubric));

    // Fallback: fetch rubric only, then criteria separately
    if (!rubric) {
      // Raw SQL fallback to avoid any ORM association quirks
      const rubricRows = await sequelize.query(
        'SELECT * FROM rubrics WHERE id = ? LIMIT 1',
        { replacements: [numericId], type: QueryTypes.SELECT }
      );
      console.log('[GET /api/rubrics/:id] RAW rows length =', rubricRows?.length || 0);
      if (!rubricRows || rubricRows.length === 0) {
        return res.status(404).json({ message: 'Rubric not found' });
      }
      const criteriaRows = await sequelize.query(
        'SELECT * FROM criteria WHERE rubricId = ? ORDER BY id ASC',
        { replacements: [numericId], type: QueryTypes.SELECT }
      );
      console.log('[GET /api/rubrics/:id] RAW criteria length =', criteriaRows?.length || 0);
      return res.json({ ...rubricRows[0], criteria: criteriaRows || [] });
    }

    return res.json(rubric);
  } catch (error) {
    console.error('[GET /api/rubrics/:id] error', error);
    return res.status(500).json({ message: 'Failed to fetch rubric', error: error.message });
  }
};

// POST /api/rubrics
// Creates a custom rubric with criteria. Body: { title, description, criteria: [{name, description, maxScore}] }
export const createRubric = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user?.id;
    if (!userId) {
      await transaction.rollback();
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, description, criteria } = req.body || {};
    if (!title || !Array.isArray(criteria) || criteria.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Title and at least one criterion are required' });
    }

    const rubric = await Rubric.create({
      title,
      description: description || null,
      creatorId: userId,
      isDefault: false,
    }, { transaction });

    const criteriaRows = [];
    for (const c of criteria) {
      if (!c || !c.name || typeof c.maxScore !== 'number') continue;
      const created = await Criterion.create({
        rubricId: rubric.id,
        name: c.name,
        description: c.description || null,
        maxScore: c.maxScore,
      }, { transaction });
      criteriaRows.push(created);
    }

    await transaction.commit();
    return res.status(201).json({ ...rubric.toJSON(), criteria: criteriaRows });
  } catch (error) {
    try { await transaction.rollback(); } catch (_) { /* ignore */ }
    return res.status(500).json({ message: 'Failed to create rubric', error: error.message });
  }
};

// DELETE /api/rubrics/:id
// Deletes a rubric (admin only)
export const deleteRubric = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);
    
    if (Number.isNaN(numericId)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid rubric id' });
    }

    // Find the rubric
    const rubric = await Rubric.findByPk(numericId);
    if (!rubric) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Rubric not found' });
    }

    // Check if rubric is being used in evaluations
    const evaluationCount = await Evaluation.count({ where: { rubricId: numericId } });
    if (evaluationCount > 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Cannot delete rubric. It is being used in ${evaluationCount} evaluation(s). Please delete those evaluations first.` 
      });
    }

    // Delete associated course rubric assignments
    await CourseRubric.destroy({ where: { rubricId: numericId }, transaction });

    // Delete associated criteria
    await Criterion.destroy({ where: { rubricId: numericId }, transaction });

    // Delete the rubric
    await rubric.destroy({ transaction });

    await transaction.commit();
    return res.json({ message: 'Rubric deleted successfully' });
  } catch (error) {
    try { await transaction.rollback(); } catch (_) { /* ignore */ }
    return res.status(500).json({ message: 'Failed to delete rubric', error: error.message });
  }
};


