import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import toast from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';

const ProjectEvaluation = () => {
  const { courseId, projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rubrics, setRubrics] = useState([]);
  const [selectedRubric, setSelectedRubric] = useState(null);
  const [project, setProject] = useState(null);
  const [criteriaMarks, setCriteriaMarks] = useState([]);
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [existingEvaluation, setExistingEvaluation] = useState(null);

  const token = localStorage.getItem('prograde_token');

  useEffect(() => {
    fetchData();
  }, [courseId, projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch rubrics
      const rubricsRes = await fetch(`http://localhost:3001/api/evaluations/faculty/courses/${courseId}/projects/${projectId}/rubrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const rubricsData = await rubricsRes.json();

      if (!rubricsRes.ok) throw new Error(rubricsData.message || 'Failed to fetch rubrics');
      
      setRubrics(rubricsData.rubrics || []);
      
      // Fetch project details separately (we'll get basic info from the rubrics endpoint or set manually)
      // For now, we can get project info from the URL params or fetch from student endpoint
      setProject({ id: projectId, courseId: courseId });
      
      // Auto-select first rubric if available
      if (rubricsData.rubrics && rubricsData.rubrics.length > 0) {
        selectRubric(rubricsData.rubrics[0]);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectRubric = async (rubric) => {
    setSelectedRubric(rubric);
    
    // Initialize criteria marks
    const initialMarks = rubric.criteria.map(criterion => ({
      criterionId: criterion.id,
      marks: 0,
      feedback: ''
    }));
    setCriteriaMarks(initialMarks);
    setGeneralFeedback('');

    // Try to fetch existing evaluation
    try {
      const res = await fetch(
        `http://localhost:3001/api/evaluations/faculty/evaluations/${projectId}/${rubric.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.ok) {
        const data = await res.json();
        setExistingEvaluation(data.evaluation);
        setCriteriaMarks(data.evaluation.criteriaMarks);
        setGeneralFeedback(data.evaluation.generalFeedback || '');
        toast.success('Loaded existing evaluation');
      } else {
        setExistingEvaluation(null);
      }
    } catch (error) {
      // No existing evaluation, that's fine
      setExistingEvaluation(null);
    }
  };

  const updateCriterionMark = (criterionId, field, value) => {
    if (field === 'marks') {
      // Find the criterion to get max score
      const criterion = selectedRubric.criteria.find(c => c.id === criterionId);
      
      // Allow empty string for clearing
      if (value === '') {
        setCriteriaMarks(prev => 
          prev.map(item => 
            item.criterionId === criterionId 
              ? { ...item, marks: 0 }
              : item
          )
        );
        return;
      }
      
      const numValue = parseInt(value);
      
      // Don't allow marks to exceed max score
      if (numValue > criterion.maxScore) {
        toast.error(`Marks cannot exceed ${criterion.maxScore}`);
        return;
      }
      
      // Don't allow negative marks
      if (numValue < 0) {
        return;
      }
      
      setCriteriaMarks(prev => 
        prev.map(item => 
          item.criterionId === criterionId 
            ? { ...item, marks: numValue }
            : item
        )
      );
    } else {
      // For feedback field
      setCriteriaMarks(prev => 
        prev.map(item => 
          item.criterionId === criterionId 
            ? { ...item, [field]: value }
            : item
        )
      );
    }
  };

  const handleSaveEvaluation = async () => {
    if (!selectedRubric) {
      toast.error('Please select a rubric');
      return;
    }

    // Validate marks
    for (const item of criteriaMarks) {
      const criterion = selectedRubric.criteria.find(c => c.id === item.criterionId);
      if (item.marks > criterion.maxScore) {
        toast.error(`Marks for "${criterion.name}" cannot exceed ${criterion.maxScore}`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('http://localhost:3001/api/evaluations/faculty/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          projectId: parseInt(projectId),
          rubricId: selectedRubric.id,
          criteriaMarks,
          generalFeedback
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save evaluation');

      toast.success(existingEvaluation ? 'Evaluation updated successfully' : 'Evaluation saved successfully');
      setExistingEvaluation(data.evaluation);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const totalMarks = criteriaMarks.reduce((sum, item) => sum + (item.marks || 0), 0);
  const maxTotalMarks = selectedRubric?.criteria.reduce((sum, c) => sum + c.maxScore, 0) || 0;

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (rubrics.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl p-8 text-center shadow-sm">
          <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Rubrics Available</h2>
          <p className="text-gray-600 mb-6">There are no rubrics assigned to this course yet.</p>
          <Button 
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-blue-600 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Evaluate Project</h1>
            <p className="text-gray-500 text-sm mt-1">
              {project?.title || 'Project'} • Group {project?.groupNo || 'N/A'}
            </p>
          </div>
          <Button 
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to projects
          </Button>
        </div>

        {/* Rubric Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Rubric</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {rubrics.map(rubric => (
              <div
                key={rubric.id}
                onClick={() => selectRubric(rubric)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedRubric?.id === rubric.id
                    ? 'bg-blue-50 ring-2 ring-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <h3 className="font-medium text-gray-800">{rubric.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {rubric.criteria?.length || 0} criteria • {rubric.criteria?.reduce((sum, c) => sum + c.maxScore, 0) || 0} points
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Form */}
        {selectedRubric && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{selectedRubric.title}</h2>
                {selectedRubric.description && (
                  <p className="text-gray-500 text-sm mt-1">{selectedRubric.description}</p>
                )}
              </div>
              <div className="bg-blue-50 px-4 py-3 rounded-lg text-center min-w-[140px]">
                <div className="text-2xl font-bold text-blue-600">{totalMarks}</div>
                <div className="text-sm text-gray-600">of {maxTotalMarks} points</div>
              </div>
            </div>
            
            <div className="space-y-4">
              {selectedRubric.criteria.map((criterion, index) => {
                const currentMark = criteriaMarks.find(m => m.criterionId === criterion.id) || {};
                const percentage = ((currentMark.marks || 0) / criterion.maxScore) * 100;
                
                return (
                  <div key={criterion.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <h3 className="font-medium text-gray-800">{criterion.name}</h3>
                        </div>
                        {criterion.description && (
                          <p className="text-sm text-gray-500 mt-1 ml-8">{criterion.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-800">
                          <span className={currentMark.marks > 0 ? 'text-blue-600' : 'text-gray-400'}>
                            {currentMark.marks || 0}
                          </span>
                          <span className="text-gray-400"> / {criterion.maxScore}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-8 space-y-3">
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min="0"
                          max={criterion.maxScore}
                          value={currentMark.marks || ''}
                          onChange={(e) => {
                            const value = Math.min(Number(e.target.value), criterion.maxScore);
                            updateCriterionMark(criterion.id, 'marks', value);
                          }}
                          placeholder="0"
                          className="w-24"
                        />
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              percentage >= 80 ? 'bg-green-500' :
                              percentage >= 60 ? 'bg-blue-500' :
                              percentage >= 40 ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}
                            style={{ width: `${Math.max(5, percentage)}%` }}
                          />
                        </div>
                      </div>
                      
                      <Textarea
                        value={currentMark.feedback || ''}
                        onChange={(e) => updateCriterionMark(criterion.id, 'feedback', e.target.value)}
                        placeholder="Add feedback (optional)"
                        className="w-full text-sm min-h-[80px]"
                      />
                    </div>
                  </div>
                );
              })}

              {/* General Feedback */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-800 mb-3">General Feedback</h3>
                <Textarea
                  value={generalFeedback}
                  onChange={(e) => setGeneralFeedback(e.target.value)}
                  placeholder="Share your overall feedback about this project..."
                  className="w-full min-h-[100px] text-sm border-b-black bg-gray-50 focus:bg-white focus:ring-2 transition-all"
                />
              </div>

              {/* Save Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                {existingEvaluation && (
                  <span className="text-sm text-gray-500">
                    Last saved: {new Date(existingEvaluation.updatedAt).toLocaleString()}
                  </span>
                )}
                <Button
                  onClick={handleSaveEvaluation}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : (existingEvaluation ? 'Update Evaluation' : 'Save Evaluation')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectEvaluation;
