import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, Trash2 } from 'lucide-react';

const StudentProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [presentationFile, setPresentationFile] = useState(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [uploadingPresentation, setUploadingPresentation] = useState(false);
  const [reportMsg, setReportMsg] = useState('');
  const [presentationMsg, setPresentationMsg] = useState('');
  const [deleteReportMsg, setDeleteReportMsg] = useState('');
  const [deletePresentationMsg, setDeletePresentationMsg] = useState('');

  const token = localStorage.getItem('prograde_token');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3001/api/student/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load project');
      setProject(data);
      setDescription(data.description || '');
      setFileUrl(data.fileUrl || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch(`http://localhost:3001/api/student/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, fileUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 2000);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReportUpload = async (e) => {
    e.preventDefault();
    if (!reportFile) return;
    setUploadingReport(true);
    setReportMsg('');
    try {
      const formData = new FormData();
      formData.append('file', reportFile);
      const res = await fetch(`http://localhost:3001/api/student/projects/${projectId}/upload-report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload report');
      setReportMsg('Report uploaded successfully!');
      setTimeout(() => {
        setReportMsg('');
        setReportFile(null);
      }, 2000);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingReport(false);
    }
  };

  const handlePresentationUpload = async (e) => {
    e.preventDefault();
    if (!presentationFile) return;
    setUploadingPresentation(true);
    setPresentationMsg('');
    try {
      const formData = new FormData();
      formData.append('file', presentationFile);
      const res = await fetch(`http://localhost:3001/api/student/projects/${projectId}/upload-presentation`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload presentation');
      setPresentationMsg('Presentation uploaded successfully!');
      setTimeout(() => {
        setPresentationMsg('');
        setPresentationFile(null);
      }, 2000);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingPresentation(false);
    }
  };

  const handleReportDelete = async () => {
    setDeleteReportMsg('');
    try {
      const res = await fetch(`http://localhost:3001/api/student/projects/${projectId}/delete-report`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete report');
      setDeleteReportMsg('Report deleted successfully!');
      setTimeout(() => {
        setDeleteReportMsg('');
      }, 2000);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePresentationDelete = async () => {
    setDeletePresentationMsg('');
    try {
      const res = await fetch(`http://localhost:3001/api/student/projects/${projectId}/delete-presentation`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete presentation');
      setDeletePresentationMsg('Presentation deleted successfully!');
      setTimeout(() => {
        setDeletePresentationMsg('');
      }, 2000);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-8">Loading project...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!project) return null;

  const course = project.course || {};

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <div className="text-gray-600">Group {project.groupNo}{project.groupName ? ` • ${project.groupName}` : ''}</div>
            <div className="text-sm text-gray-500 mt-1">Course: {course.name} ({course.courseCode})</div>
          </div>
          <button className="text-blue-600 font-bold hover:text-blue-700" onClick={() => navigate('/student/dashboard')}>Back</button>
        </header>

        <main className="space-y-6">
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Students</h2>
            {Array.isArray(project.participants) && project.participants.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {project.participants.map((p, i) => {
                  const stu = p.student || {};
                  const name = stu.name || 'Unnamed';
                  const email = stu.email || '—';
                  return (
                    <li key={i} className="py-2">
                      <div className="font-medium text-gray-900">{name}</div>
                      <div className="text-sm text-gray-600">{email}</div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-gray-600">No students listed yet.</div>
            )}
          </section>

          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <textarea
                className="w-full border rounded p-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Enter your project description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project File URL</label>
                <input
                  type="url"
                  className="w-full border rounded p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/student/sgp"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
                {project.fileUrl && (
                  <div className="mt-2">
                    <a href={project.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 break-all">
                      <ExternalLink className="h-4 w-4" />
                      Current file
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400">
                  {saving ? 'Saving...' : 'Save' }
                </button>
                {saveMsg && <span className="text-sm text-green-600">{saveMsg}</span>}
              </div>
            </form>
          </section>

          {/* Project Report Upload Section */}
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Project Report (PDF)</h2>
            <form onSubmit={handleReportUpload} className="space-y-4">
              <input
                type="file"
                accept=".pdf"
                className="w-full border rounded p-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => setReportFile(e.target.files[0])}
              />
              {project.projectReportUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <a href={project.projectReportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 break-all">
                    <ExternalLink className="h-4 w-4" />
                    View Uploaded Report
                  </a>
                  <button
                    onClick={handleReportDelete}
                    className="p-1 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50"
                    title="Delete Report"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              <button type="submit" disabled={uploadingReport} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400">
                {uploadingReport ? 'Uploading...' : 'Upload Report' }
              </button>
              {reportMsg && <span className="text-sm text-green-600">{reportMsg}</span>}
              {deleteReportMsg && <span className="text-sm text-green-600">{deleteReportMsg}</span>}
            </form>
          </section>

          {/* Presentation Upload Section */}
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Presentation (PPT/PPTX)</h2>
            <form onSubmit={handlePresentationUpload} className="space-y-4">
              <input
                type="file"
                accept=".ppt,.pptx"
                className="w-full border rounded p-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => setPresentationFile(e.target.files[0])}
              />
              {project.presentationUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <a href={project.presentationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 break-all">
                    <ExternalLink className="h-4 w-4" />
                    View Uploaded Presentation
                  </a>
                  <button
                    onClick={handlePresentationDelete}
                    className="p-1 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50"
                    title="Delete Presentation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              <button type="submit" disabled={uploadingPresentation} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400">
                {uploadingPresentation ? 'Uploading...' : 'Upload Presentation' }
              </button>
              {presentationMsg && <span className="text-sm text-green-600">{presentationMsg}</span>}
              {deletePresentationMsg && <span className="text-sm text-green-600">{deletePresentationMsg}</span>}
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StudentProjectDetails;


