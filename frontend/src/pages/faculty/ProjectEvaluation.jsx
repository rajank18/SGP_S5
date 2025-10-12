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
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">No rubrics assigned to this course. Please contact admin.</p>
              <Button onClick={() => navigate(-1)} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Evaluate Project</h1>
            <p className="text-gray-600 mt-1">
              Project ID: {projectId} | Course ID: {courseId}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Rubric Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Rubric</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rubrics.map(rubric => (
                <button
                  key={rubric.id}
                  onClick={() => selectRubric(rubric)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedRubric?.id === rubric.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-800">{rubric.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {rubric.criteria?.length || 0} criteria
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Form */}
        {selectedRubric && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedRubric.title}</CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalMarks} / {maxTotalMarks}
                  </div>
                  <div className="text-sm text-gray-600">Total Marks</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedRubric.criteria.map((criterion, index) => {
                const currentMark = criteriaMarks.find(m => m.criterionId === criterion.id);
                return (
                  <div key={criterion.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {index + 1}. {criterion.name}
                        </h4>
                        {criterion.description && (
                          <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-600 ml-4">
                        Max: {criterion.maxScore}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`marks-${criterion.id}`}>
                          Marks (Max: {criterion.maxScore})
                        </Label>
                        <Input
                          id={`marks-${criterion.id}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={currentMark?.marks || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            updateCriterionMark(criterion.id, 'marks', value);
                          }}
                          placeholder={`Enter marks (0-${criterion.maxScore})`}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`feedback-${criterion.id}`}>Feedback</Label>
                        <Textarea
                          id={`feedback-${criterion.id}`}
                          value={currentMark?.feedback || ''}
                          onChange={(e) => updateCriterionMark(criterion.id, 'feedback', e.target.value)}
                          placeholder="Enter feedback for this criterion..."
                          rows={2}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* General Feedback */}
              <div className="space-y-2">
                <Label htmlFor="general-feedback">General Feedback (Optional)</Label>
                <Textarea
                  id="general-feedback"
                  value={generalFeedback}
                  onChange={(e) => setGeneralFeedback(e.target.value)}
                  placeholder="Enter overall feedback for the project..."
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end gap-4">
                {existingEvaluation && (
                  <span className="text-sm text-green-600">
                    Last saved: {new Date(existingEvaluation.updatedAt).toLocaleString()}
                  </span>
                )}
                <Button
                  onClick={handleSaveEvaluation}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : existingEvaluation ? 'Update Evaluation' : 'Save Evaluation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectEvaluation;
