import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

const MAX_DEFAULT_WEEKS = 5;

export default function WeeklyReportsCarousel({ projectId,project, weeklyReports = [], token, reloadProject }) {
  const [weeks, setWeeks] = useState(() => {
    const maxWeek = Math.max(MAX_DEFAULT_WEEKS, ...weeklyReports.map(r => r.week || 0));
    return Array.from({ length: maxWeek }, (_, i) => i + 1);
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [fileInputs, setFileInputs] = useState({});
  const [uploadingWeek, setUploadingWeek] = useState(null);
  const [deletingWeek, setDeletingWeek] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');

  const currentWeek = weeks[currentIdx];
  const report = weeklyReports.find(r => r.week === currentWeek);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleAddWeek = () => {
    setWeeks(w => [...w, w.length + 1]);
    setCurrentIdx(weeks.length); // move to new week
  };

  const handleFileChange = (file) => {
    setFileInputs(inputs => ({ ...inputs, [currentWeek]: file }));
  };

  const handleUpload = async () => {
    const file = fileInputs[currentWeek];
    if (!file) return;
    setUploadingWeek(currentWeek);
    setUploadMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('week', currentWeek);
      const res = await fetch(`http://localhost:3001/api/student/projects/${projectId}/upload-weekly-report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload');
      setUploadMsg(`Week ${currentWeek} report uploaded!`);
      setTimeout(() => setUploadMsg(''), 2000);
      setFileInputs(inputs => ({ ...inputs, [currentWeek]: null }));
      if (reloadProject) reloadProject();
    } catch (err) {
      setUploadMsg(err.message);
    } finally {
      setUploadingWeek(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete Week ${currentWeek} report?`)) return;
    setDeletingWeek(currentWeek);
    setUploadMsg('');
    try {
      const res = await fetch(`http://localhost:3001/api/student/projects/${projectId}/delete-weekly-report/${currentWeek}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete');
      setUploadMsg(`Week ${currentWeek} report deleted!`);
      setTimeout(() => setUploadMsg(''), 2000);
      if (reloadProject) reloadProject();
    } catch (err) {
      setUploadMsg(err.message);
    } finally {
      setDeletingWeek(null);
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
  return (
    <Card className="mb-6">
      <CardHeader className="flex items-center gap-4">
        <div className="flex gap-2">
          <button type="button" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
            <ChevronLeft size={18} />
          </button>
          {weeks.map((week, idx) => (
            <button
              key={week}
              className={`px-2 py-1 rounded ${idx === currentIdx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setCurrentIdx(idx)}
            >
              Week {week}
            </button>
          ))}
          <button type="button" onClick={handleAddWeek} className="p-2 rounded-full bg-green-200 hover:bg-green-300 ml-2">
            <Plus size={18} />
          </button>
          <button type="button" disabled={currentIdx === weeks.length - 1} onClick={() => setCurrentIdx(i => Math.min(weeks.length - 1, i + 1))} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
            <ChevronRight size={18} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-2">
          <div className="font-semibold mb-2">Week {currentWeek}</div>
          {report ? (
            <div className="flex flex-col items-center gap-2">
              <a onClick={() => handleDownload(report.url, `Group${project.title}_Week${report.week}_Report`, 'pdf')}
                rel="noopener noreferrer" className="text-green-700 cursor-pointer underline mb-2">
                {report.filename}
              </a>
              <button
                type="button"
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                disabled={deletingWeek === currentWeek}
                onClick={handleDelete}
              >
                <Trash2 size={14} />
                {deletingWeek === currentWeek ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ) : (
            <>
              <input type="file" accept=".pdf,.ppt,.pptx" onChange={e => handleFileChange(e.target.files[0])} />
              <button
                type="button"
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
                disabled={uploadingWeek === currentWeek || !fileInputs[currentWeek]}
                onClick={handleUpload}
              >
                {uploadingWeek === currentWeek ? 'Uploading...' : 'Upload'}
              </button>
            </>
          )}
          {uploadMsg && <div className="mt-2 text-blue-600 font-semibold">{uploadMsg}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
