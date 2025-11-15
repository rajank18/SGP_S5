import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';

const MAX_DEFAULT_WEEKS = 5;
const MAX_WEEKS = 20;

// export default function WeeklyReportsCarousel({ projectId,project, weeklyReports = [], token, reloadProject }) {
//   const [localWeeklyReports, setLocalWeeklyReports] = useState(() => Array.isArray(weeklyReports) ? weeklyReports.slice() : []);
export default function WeeklyReportsCarousel({ projectId, project, weeklyReports = [], token, reloadProject }) {
  const [weeks, setWeeks] = useState(() => {
    const maxWeek = Math.max(MAX_DEFAULT_WEEKS, ... (Array.isArray(weeklyReports) ? weeklyReports.map(r => r.week || 0) : []));
    return Array.from({ length: maxWeek }, (_, i) => i + 1);
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [fileInputs, setFileInputs] = useState({});
  const [uploadingWeek, setUploadingWeek] = useState(null);
  const [deletingWeek, setDeletingWeek] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');
  const [localWeeklyReports, setLocalWeeklyReports] = useState(() => Array.isArray(weeklyReports) ? weeklyReports.slice() : []);
  const weekRefs = useRef([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      setShowDeleteModal(false);
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
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Week {currentWeek}</h3>
          </div>
          {report ? (
            <div className="w-full flex flex-col items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">Report Submitted</span>
              </div>
              <a
                onClick={() => handleDownload(report.url, `Group${project.title}_Week${report.week}_Report`, 'pdf')}
                rel="noopener noreferrer"
                className="text-blue-600 cursor-pointer hover:text-blue-700 hover:underline text-sm font-medium"
              >
                {report.filename}
              </a>
              <button
                type="button"
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                disabled={deletingWeek === currentWeek}
                onClick={() => setShowDeleteModal(true)}
              >
                {deletingWeek === currentWeek ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Report
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <label className="flex-1 flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  className="hidden"
                />
                <div className="text-center">
                  <svg className="h-10 w-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">
                    {fileInputs[currentWeek] ? fileInputs[currentWeek].name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, PPT or PPTX files up to 50MB</p>
                </div>
              </label>
              <button
                type="button"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={uploadingWeek === currentWeek || !fileInputs[currentWeek]}
                onClick={handleUpload}
              >
                {uploadingWeek === currentWeek ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Report'
                )}
              </button>
            </div>
          )}
          {uploadMsg && (
            <div className={`text-sm font-medium ${uploadMsg.includes('failed') || uploadMsg.includes('Error') ? 'text-red-600' : 'text-blue-600'}`}>
              {uploadMsg}
            </div>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/20 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Week {currentWeek} Report</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the Week {currentWeek} report? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingWeek === currentWeek}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deletingWeek === currentWeek ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
