import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Plus } from 'lucide-react';

const MAX_DEFAULT_WEEKS = 5;

export default function WeeklyReportsCard({ projectId, weeklyReports = [], token, reloadProject }) {
  const [weeks, setWeeks] = useState(() => {
    const maxWeek = Math.max(MAX_DEFAULT_WEEKS, ...weeklyReports.map(r => r.week || 0));
    return Array.from({ length: maxWeek }, (_, i) => i + 1);
  });
  const [uploadingWeek, setUploadingWeek] = useState(null);
  const [fileInputs, setFileInputs] = useState({});
  const [uploadMsg, setUploadMsg] = useState('');

  const handleAddWeek = () => {
    setWeeks(w => [...w, w.length + 1]);
  };

  const handleFileChange = (week, file) => {
    setFileInputs(inputs => ({ ...inputs, [week]: file }));
  };

  const handleUpload = async (week) => {
    const file = fileInputs[week];
    if (!file) return;
    setUploadingWeek(week);
    setUploadMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('week', week);
      const res = await fetch(`http://localhost:3001/api/student/projects/${projectId}/upload-weekly-report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload');
      setUploadMsg(`Week ${week} report uploaded!`);
      setTimeout(() => setUploadMsg(''), 2000);
      setFileInputs(inputs => ({ ...inputs, [week]: null }));
      if (reloadProject) reloadProject();
    } catch (err) {
      setUploadMsg(err.message);
    } finally {
      setUploadingWeek(null);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Weekly Reports</CardTitle>
        <button type="button" onClick={handleAddWeek} className="ml-auto text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <Plus size={18} /> Add Week
        </button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {weeks.map(week => {
            const report = weeklyReports.find(r => r.week === week);
            return (
              <div key={week} className="border rounded-lg p-4 min-w-[180px] flex flex-col items-center">
                <div className="font-semibold mb-2">Week {week}</div>
                {report ? (
                  <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-green-700 underline mb-2">
                    {report.filename}
                  </a>
                ) : (
                  <>
                    <input type="file" accept=".pdf,.ppt,.pptx" onChange={e => handleFileChange(week, e.target.files[0])} />
                    <button
                      type="button"
                      className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
                      disabled={uploadingWeek === week || !fileInputs[week]}
                      onClick={() => handleUpload(week)}
                    >
                      {uploadingWeek === week ? 'Uploading...' : 'Upload'}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {uploadMsg && <div className="mt-4 text-blue-600 font-semibold">{uploadMsg}</div>}
      </CardContent>
    </Card>
  );
}
