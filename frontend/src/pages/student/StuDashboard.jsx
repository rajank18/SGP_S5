import React, { useEffect, useState } from 'react';

const StuDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('prograde_token');
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:3001/api/student/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch your groups');
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

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">My Groups</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && projects.length === 0 && (
        <div>No groups found.</div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <div key={p.id} className="border rounded p-4 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Group #{p.groupNo}{p.groupName ? ` • ${p.groupName}` : ''}</div>
            </div>
            <div className="text-lg font-medium mb-1">{p.title || 'Untitled Project'}</div>
            {p.description && (
              <div className="text-sm text-gray-700 line-clamp-2 mb-2">{p.description}</div>
            )}
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Faculty:</span>{' '}
              {p.faculty ? `${p.faculty.name} (${p.faculty.email})` : '—'}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Course:</span>{' '}
              {p.course ? `${p.course.courseCode} • ${p.course.name}` : '—'}
            </div>
            {p.externalGuideName && (
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">External Guide:</span> {p.externalGuideName}
              </div>
            )}
            {p.fileUrl && (
              <div className="mt-2">
                <a className="text-blue-600 hover:underline text-sm" href={p.fileUrl} target="_blank" rel="noreferrer">
                  View File
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StuDashboard;