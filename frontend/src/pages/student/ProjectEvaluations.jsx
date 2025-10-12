import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';
import { ArrowLeft, Award, User } from 'lucide-react';

const ProjectEvaluations = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState([]);
  const [project, setProject] = useState(null);

  const token = localStorage.getItem('prograde_token');

  useEffect(() => {
    fetchEvaluations();
  }, [projectId]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      
      // Fetch evaluations
      const res = await fetch(
        `http://localhost:3001/api/evaluations/student/projects/${projectId}/evaluations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch evaluations');

      setEvaluations(data.evaluations || []);
      
      // Try to fetch project details
      try {
        const projectRes = await fetch(
          `http://localhost:3001/api/student/projects/${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (projectRes.ok) {
          const projectData = await projectRes.json();
          setProject(projectData);
        } else {
          setProject({ id: projectId });
        }
      } catch (err) {
        setProject({ id: projectId });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading evaluations...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Project Evaluations</h1>
            {project && (
              <p className="text-gray-600 mt-1">
                {project.title} - Group {project.groupNo}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {evaluations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No evaluations yet. Your faculty will evaluate your project soon.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {evaluations.map((evaluation, idx) => (
              <Card key={evaluation.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{evaluation.rubric.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Evaluated by: {evaluation.evaluator.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {evaluation.totalMarks}
                      </div>
                      <div className="text-sm text-gray-600">
                        / {evaluation.rubric.criteria.reduce((sum, c) => sum + c.maxScore, 0)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Criteria Breakdown */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 text-lg">Criteria Breakdown</h3>
                    {evaluation.criteriaMarks.map((item, index) => {
                      const criterion = evaluation.rubric.criteria.find(c => c.id === item.criterionId);
                      if (!criterion) return null;
                      
                      const percentage = (item.marks / criterion.maxScore) * 100;
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{criterion.name}</h4>
                              {criterion.description && (
                                <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-gray-800">
                                {item.marks} / {criterion.maxScore}
                              </div>
                              <div className="text-xs text-gray-600">
                                {percentage.toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                percentage >= 80 ? 'bg-green-500' :
                                percentage >= 60 ? 'bg-blue-500' :
                                percentage >= 40 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          
                          {item.feedback && (
                            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                              <p className="text-sm text-gray-600">{item.feedback}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* General Feedback */}
                  {evaluation.generalFeedback && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">General Feedback</h3>
                      <p className="text-gray-700">{evaluation.generalFeedback}</p>
                    </div>
                  )}

                  {/* Evaluation Date */}
                  <div className="text-sm text-gray-500 text-right mt-4">
                    Evaluated on: {new Date(evaluation.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectEvaluations;
