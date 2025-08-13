import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StuDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('prograde_token');
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:3001/api/student/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch your group');
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading your group...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              No group assigned yet
            </div>
            <p className="text-gray-600">You will be assigned to a project group by your faculty.</p>
          </div>
        </div>
      </div>
    );
  }

  // Since student can only be in one group, take the first project
  const project = projects[0];

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Project Group</h1>
          <p className="text-gray-600">View and manage your assigned project</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          {/* Group Header */}
          <div className="text-center mb-6 pb-6 border-b border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span className="text-2xl font-bold text-blue-600">G{project.groupNo}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {project.title || 'Untitled Project'}
            </h2>
            {project.groupName && (
              <div className="text-lg text-gray-600 mb-2">{project.groupName}</div>
            )}
            <div className="text-sm text-gray-500">
              Course: {project.course ? `${project.course.courseCode} • ${project.course.name}` : '—'}
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Information</h3>
                {project.description ? (
                  <div className="text-gray-700 bg-gray-50 rounded-lg p-4">
                    {project.description}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No description provided yet.</div>
                )}
              </div>

              {project.fileUrl && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Project File</h4>
                  <a 
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium" 
                    href={project.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Project File
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Faculty Guide</h3>
                {project.faculty ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="font-medium text-gray-800">{project.faculty.name}</div>
                    <div className="text-gray-600 text-sm">{project.faculty.email}</div>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No faculty assigned yet.</div>
                )}
              </div>

              {project.externalGuideName && (
                <div>
                  <h4 className="font-medium text-lg text-gray-800 mb-2">External Guide</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="font-medium text-gray-800">{project.externalGuideName}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={() => navigate(`/student/projects/${project.id}`)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Click to view your group details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StuDashboard;