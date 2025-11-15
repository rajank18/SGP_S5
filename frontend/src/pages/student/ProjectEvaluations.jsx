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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading evaluations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Project Evaluations</h1>
            {project && (
              <p className="text-gray-500 text-sm mt-1">
                {project.title} • Group {project.groupNo}
              </p>
            )}
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

        {evaluations.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Evaluations Yet</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Your project hasn't been evaluated yet. Your faculty will evaluate your work and provide feedback soon.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation, idx) => {
              const totalPossible = evaluation.rubric.criteria.reduce((sum, c) => sum + c.maxScore, 0);
              const percentage = (evaluation.totalMarks / totalPossible) * 100;
              
              return (
                <div key={evaluation.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">{evaluation.rubric.title}</h2>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <User className="h-4 w-4 mr-1.5 text-gray-400" />
                          <span>Evaluated by {evaluation.evaluator.name}</span>
                        </div>
                      </div>
                      <div className="text-center bg-blue-50 px-4 py-2 rounded-lg min-w-[120px]">
                        <div className="text-2xl font-bold text-blue-600">
                          {evaluation.totalMarks}
                          <span className="text-gray-500 text-lg"> / {totalPossible}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Criteria Breakdown</h3>
                    <div className="space-y-4">
                      {evaluation.criteriaMarks.map((item, index) => {
                        const criterion = evaluation.rubric.criteria.find(c => c.id === item.criterionId);
                        if (!criterion) return null;
                        
                        const criterionPercentage = (item.marks / criterion.maxScore) * 100;
                        
                        return (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                              <div>
                                <h4 className="font-medium text-gray-800">{criterion.name}</h4>
                                {criterion.description && (
                                  <p className="text-sm text-gray-500 mt-1">{criterion.description}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-800">
                                  <span className={item.marks > 0 ? 'text-blue-600' : 'text-gray-500'}>
                                    {item.marks}
                                  </span>
                                  <span className="text-gray-400"> / {criterion.maxScore}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {criterionPercentage.toFixed(0)}% achieved
                                </div>
                              </div>
                            </div>
                            
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  criterionPercentage >= 80 ? 'bg-green-500' :
                                  criterionPercentage >= 60 ? 'bg-blue-500' :
                                  criterionPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${criterionPercentage}%` }}
                              />
                            </div>
                            
                            {item.feedback && (
                              <div className="mt-3 p-3 bg-white rounded-lg">
                                <p className="text-sm text-gray-700">{item.feedback}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* General Feedback */}
                    {evaluation.generalFeedback && (
                      <div className="mt-6 bg-blue-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-800 mb-2">General Feedback</h3>
                        <p className="text-gray-700">{evaluation.generalFeedback}</p>
                      </div>
                    )}

                    {/* Evaluation Date */}
                    <div className="text-xs text-gray-400 text-right mt-4 pt-3 border-t border-gray-100">
                      Evaluated on {new Date(evaluation.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectEvaluations;
