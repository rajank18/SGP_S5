import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

const MAX_DEFAULT_WEEKS = 5;
const MAX_WEEKS = 20;

export default function WeeklyReportsCarousel({ projectId,project, weeklyReports = [], token, reloadProject }) {
  const [localWeeklyReports, setLocalWeeklyReports] = useState(() => Array.isArray(weeklyReports) ? weeklyReports.slice() : []);
  const [weeks, setWeeks] = useState(() => {
    const maxWeek = Math.max(MAX_DEFAULT_WEEKS, ... (Array.isArray(weeklyReports) ? weeklyReports.map(r => r.week || 0) : []));
    return Array.from({ length: maxWeek }, (_, i) => i + 1);
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [fileInputs, setFileInputs] = useState({});
  const [uploadingWeek, setUploadingWeek] = useState(null);
  const [deletingWeek, setDeletingWeek] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');
  const weekRefs = useRef([]);

  const currentWeek = weeks[currentIdx];
  const report = localWeeklyReports.find(r => r.week === currentWeek);

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
    if (weeks.length >= MAX_WEEKS) {
      setUploadMsg(`Maximum of ${MAX_WEEKS} weeks reached`);
      setTimeout(() => setUploadMsg(''), 2500);
      return;
    }
    setWeeks(prev => {
      const newWeeks = [...prev, prev.length + 1];
      // move to new week
      setCurrentIdx(newWeeks.length - 1);
      return newWeeks;
    });
  };

  // remove the last week (safe operation — avoids renumbering existing weeks)
  const handleRemoveLastWeek = async () => {
    if (weeks.length <= 1) {
      setUploadMsg('Cannot remove the last week');
      setTimeout(() => setUploadMsg(''), 2000);
      return;
    }

    const lastWeek = weeks[weeks.length - 1];
    if (!confirm(`Remove Week ${lastWeek}? This will delete its report if present.`)) return;

  // if there's a report for that week, delete it on server
  const existingReport = localWeeklyReports.find(r => r.week === lastWeek);
    if (existingReport) {
      try {
        setDeletingWeek(lastWeek);
        const res = await fetch(`http://localhost:3001/api/student/projects/${projectId}/delete-weekly-report/${lastWeek}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to delete week report');
      } catch (err) {
        setUploadMsg(err.message || 'Failed to delete report');
        setDeletingWeek(null);
        return;
      } finally {
        setDeletingWeek(null);
      }
    }

    // remove the last week locally
    setWeeks(prev => {
      const newWeeks = prev.slice(0, -1);
      setCurrentIdx(i => Math.min(i, newWeeks.length - 1));
      return newWeeks;
    });

    if (reloadProject) reloadProject();
    setUploadMsg(`Week ${lastWeek} removed`);
    setTimeout(() => setUploadMsg(''), 2000);
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
      // update local list to show uploaded report immediately
      setLocalWeeklyReports(prev => {
        const filtered = prev.filter(r => r.week !== currentWeek);
        return [...filtered, { week: currentWeek, url: data.url || '', filename: data.filename || `Week${currentWeek}`, publicId: data.publicId }];
      });
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
      // remove only this week's report from local list (do not alter other weeks)
      setLocalWeeklyReports(prev => prev.filter(r => r.week !== currentWeek));
      setTimeout(() => setUploadMsg(''), 2000);
      if (reloadProject) reloadProject();
    } catch (err) {
      setUploadMsg(err.message);
    } finally {
      setDeletingWeek(null);
    }
  };

  // keep localWeeklyReports in sync if parent prop changes
  useEffect(() => {
    setLocalWeeklyReports(Array.isArray(weeklyReports) ? weeklyReports.slice() : []);
    // ensure weeks length at least covers reported weeks
    const maxReported = Math.max(MAX_DEFAULT_WEEKS, ...(Array.isArray(weeklyReports) ? weeklyReports.map(r => r.week || 0) : []));
    setWeeks(prev => {
      if (prev.length >= maxReported) return prev;
      return Array.from({ length: maxReported }, (_, i) => i + 1);
    });
  }, [weeklyReports]);

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
  // ensure active week tab is scrolled into view
  useEffect(() => {
    if (weekRefs.current && weekRefs.current[currentIdx]) {
      try {
        weekRefs.current[currentIdx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } catch (e) {
        // ignore on older browsers
      }
    }
  }, [currentIdx, weeks]);

  return (
    <Card className="mb-6">
      <CardHeader className="flex items-center gap-4">
        <div className="flex items-center gap-2 w-full">
          <button type="button" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 flex-shrink-0">
            <ChevronLeft size={18} />
          </button>

          <div className="flex-1 overflow-x-auto py-1">
            <div className="flex gap-2 items-center w-max">
              {weeks.map((week, idx) => (
                <button
                  key={week}
                  ref={el => weekRefs.current[idx] = el}
                  className={`flex-shrink-0 min-w-[88px] text-center px-3 py-1 rounded ${idx === currentIdx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setCurrentIdx(idx)}
                >
                  Week {week}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            <button type="button" onClick={handleAddWeek} className="p-2 rounded-full bg-green-200 hover:bg-green-300">
              <Plus size={18} />
            </button>
            <button type="button" disabled={currentIdx === weeks.length - 1} onClick={() => setCurrentIdx(i => Math.min(weeks.length - 1, i + 1))} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
              <ChevronRight size={18} />
            </button>
            <button type="button" disabled={weeks.length <= 1} onClick={handleRemoveLastWeek} className="p-2 rounded-full bg-red-100 hover:bg-red-200" title="Remove last week">
              <Trash2 size={16} />
            </button>
          </div>
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
