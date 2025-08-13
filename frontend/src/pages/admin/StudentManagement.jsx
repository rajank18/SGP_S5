import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, FileText, UserCheck, UserX, Users, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import BreadcrumbNavigation from '@/components/ui/BreadcrumNavigation';

const StudentManagement = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('prograde_token');
            const res = await fetch('http://localhost:3001/api/admin/students', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch students');
            const data = await res.json();
            setStudents(data);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setResult(null);
        } else {
            toast.error('Please select a valid .csv file.');
            setFile(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select a CSV file to upload.');
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
            setFile(null); // Clear the file input
            fetchStudents(); // Refresh student list
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUploading(false);
        }
    };

    const sortedStudents = [...students].sort((a, b) => (Number(b.id || 0) - Number(a.id || 0)));
    const filteredStudents = sortedStudents.filter((student) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;
        const nameMatch = (student.name || '').toLowerCase().includes(query);
        const deptMatch = String(student.departmentId ?? '').toLowerCase().includes(query);
        return nameMatch || deptMatch;
    });
    const displayedStudents = (searchQuery.trim() || showAll) ? filteredStudents : filteredStudents.slice(0, 5);

    return (
        <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Breadcrumb Navigation */}
                <BreadcrumbNavigation />

                 <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <Users /> Student Management
                    </h1>
                </div>

                {/* Upload Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Student Bulk Upload</CardTitle>
                        <p className="text-sm text-gray-500">Upload a CSV file with columns: `name`, `email`, `departmentId`.</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} disabled={uploading} />
                                </label>
                                <p className="text-xs text-gray-500">CSV up to 10MB</p>
                                {file && <p className="text-sm mt-2 text-gray-700"><FileText className="inline-block h-4 w-4 mr-1"/>{file.name}</p>}
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={uploading || !file}>
                                {uploading ? 'Uploading...' : 'Upload CSV'}
                            </Button>
                        </form>
                        {result && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-lg">Upload Summary</h3>
                                <div className="mt-2 space-y-2 text-sm">
                                   <p className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-green-500" />Inserted: {result.insertedCount}</p>
                                   <p className="flex items-center gap-2"><UserX className="h-5 w-5 text-yellow-500" />Skipped: {result.skippedCount}</p>
                                   {result.skippedEmails && result.skippedEmails.length > 0 && (
                                       <div>
                                           <p className="font-medium">Skipped Emails (already exist):</p>
                                           <ul className="list-disc ml-6 text-gray-600">
                                               {result.skippedEmails.map((email) => <li key={email}>{email}</li>)}
                                           </ul>
                                       </div>
                                   )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Student List Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle>
                                {searchQuery.trim()
                                    ? `Student List (${filteredStudents.length} result${filteredStudents.length === 1 ? '' : 's'})`
                                    : showAll
                                        ? `Student List (${students.length})`
                                        : `Student List (Showing last ${Math.min(5, students.length)} of ${students.length})`}
                            </CardTitle>
                            <div className="w-full sm:w-80">
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or department"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-blue-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="text-center py-4 text-gray-500">No students found.</td>
                                        </tr>
                                    ) : (
                                        displayedStudents.map((student, index) => (
                                            <tr 
                                                key={student.id} 
                                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100 transition-colors duration-150`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{student.departmentId || 'N/A'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {!searchQuery.trim() && students.length > 5 && (
                            <div className="flex justify-center mt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAll(!showAll)}
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                >
                                    {showAll ? (<><ChevronUp className="h-4 w-4" /> Show less</>) : (<><ChevronDown className="h-4 w-4" /> Show all</>)}
                                </button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StudentManagement;