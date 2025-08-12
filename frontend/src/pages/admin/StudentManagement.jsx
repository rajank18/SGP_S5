import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';
import toast from 'react-hot-toast';

const StudentManagement = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('prograde_token');
      const res = await fetch('http://localhost:3001/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setStudents(data);
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a CSV file.');
      return;
    }
    setUploading(true);
    setResult(null);
    try {
      const token = localStorage.getItem('prograde_token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('http://localhost:3001/api/admin/upload-students', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setResult(data);
      toast.success('Upload complete!');
      setFile(null);
      fetchStudents(); // Refresh student list
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-2">
        <BackButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Student Bulk Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <input type="file" accept=".csv" onChange={handleFileChange} disabled={uploading} />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </Button>
          </form>
          {result && (
            <div className="mt-4">
              <div>Inserted: {result.insertedCount}</div>
              <div>Skipped: {result.skippedCount}</div>
              {result.skippedEmails && result.skippedEmails.length > 0 && (
                <div>
                  <div>Skipped Emails:</div>
                  <ul className="list-disc ml-6">
                    {result.skippedEmails.map((email) => (
                      <li key={email}>{email}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-500">No students found.</td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{student.name}</td>
                      <td className="px-6 py-4">{student.departmentId || 'N/A'}</td>
                      <td className="px-6 py-4">{student.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;
