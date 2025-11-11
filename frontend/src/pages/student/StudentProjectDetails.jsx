import WeeklyReportsCarousel from '@/components/student/WeeklyReportsCarousel';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, Trash2, Award } from 'lucide-react';

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

  const handleDownload = async (fileUrl, fileName, fileType = '') => {
    console.log(project);
    if (!fileUrl) {
      alert("No file available for download.");
      return;
    }

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Sanitize filename
      const cleanName = fileName?.replace(/[^\w\s-]/g, '').trim() || 'file';
      a.download = `${cleanName}${fileType.startsWith('.') ? fileType : fileType ? `.${fileType}` : ''}`;

      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  if (loading) return <div className="p-8">Loading project...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!project) return null;

  const course = project.course || {};

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{project.title}</h1>
            <div className="text-gray-600 mt-1">
              Group {project.groupNo}{project.groupName ? ` • ${project.groupName}` : ''}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              onClick={() => navigate(`/student/projects/${projectId}/evaluations`)}
            >
              <Award className="h-4 w-4" />
              View Evaluations
            </button>
            <button 
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/student/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </header>

        <main className="space-y-6">
          {/* Students Section - Single Row */}
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Team Members</h2>
            {Array.isArray(project.participants) && project.participants.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {project.participants.map((p, i) => {
                  const stu = p.student || {};
                  const name = stu.name || 'Unnamed';
                  const email = stu.email || '—';
                  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
                  
                  return (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-medium">
                        {initials}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{name}</div>
                        <div className="text-sm text-gray-500">{email}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 italic">No team members listed yet.</div>
            )}
          </section>

          {/* Description and File URL - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description Card */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Description</h2>
              <form onSubmit={handleSave} className="h-full flex flex-col">
                <div className="flex-grow">
                  <textarea
                    className="w-full border rounded-lg p-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
                    placeholder="Enter your project description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Description'}
                  </button>
                  {saveMsg && <span className="text-sm text-green-600">{saveMsg}</span>}
                </div>
              </form>
            </section>

            {/* File URL Card */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Repository</h2>
              <form onSubmit={handleSave} className="h-full flex flex-col">
                <div className="flex-grow">
                  <div className="space-y-2">
                    <input
                      type="url"
                      className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/username/project"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                    />
                    {project.fileUrl && (
                      <div className="mt-2">
                        <a 
                          href={project.fileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 break-all text-sm"
                        >
                          <ExternalLink className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{project.fileUrl}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save URL'}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Project Files - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Report Card */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Report (PDF)</h2>
              <form onSubmit={handleReportUpload} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Upload Report</label>
                    {project.projectReportUrl && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(project.projectReportUrl, `Group${project.groupNo}_Report`, 'pdf')}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={handleReportDelete}
                          className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                          title="Delete Report"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept=".pdf"
                      className="flex-1 border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-50"
                      onChange={(e) => setReportFile(e.target.files[0])}
                    />
                    <button 
                      type="submit" 
                      disabled={uploadingReport || !reportFile}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploadingReport ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {reportMsg && <div className="text-sm text-green-600">{reportMsg}</div>}
                  {deleteReportMsg && <div className="text-sm text-green-600">{deleteReportMsg}</div>}
                </div>
              </form>
            </section>

            {/* Presentation Card */}
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Presentation (PPT/PPTX)</h2>
              <form onSubmit={handlePresentationUpload} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Upload Presentation</label>
                    {project.presentationUrl && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(project.presentationUrl, `${project.title}_Presentation`, 'pptx')}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={handlePresentationDelete}
                          className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                          title="Delete Presentation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept=".ppt,.pptx"
                      className="flex-1 border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-50"
                      onChange={(e) => setPresentationFile(e.target.files[0])}
                    />
                    <button 
                      type="submit" 
                      disabled={uploadingPresentation || !presentationFile}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploadingPresentation ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {presentationMsg && <div className="text-sm text-green-600">{presentationMsg}</div>}
                  {deletePresentationMsg && <div className="text-sm text-green-600">{deletePresentationMsg}</div>}
                </div>
              </form>
            </section>
          </div>

          {/* Weekly Reports - Centered */}
          <section className="bg-white rounded-xl shadow p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Weekly Reports</h2>
              <p className="text-gray-500 mt-1">Track your project progress with weekly updates</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <WeeklyReportsCarousel
                projectId={projectId}
                project={project}
                weeklyReports={project.weeklyReportUrls ? (typeof project.weeklyReportUrls === 'string' ? JSON.parse(project.weeklyReportUrls) : project.weeklyReportUrls) || [] : []}
                token={token}
                reloadProject={load}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StudentProjectDetails;


