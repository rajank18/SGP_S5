import React, { useState, useEffect, useRef } from 'react';
import BackButton from '@/components/ui/BackButton';
import { useParams } from 'react-router-dom';
import Papa from 'papaparse';

const CourseDetailsPage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loadingCourse, setLoadingCourse] = useState(true);
    const [courseError, setCourseError] = useState('');

    // CSV Upload State
    const [file, setFile] = useState(null);
    const [csvPreview, setCsvPreview] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const fileInputRef = useRef();

    // Project Groups State
    const [groups, setGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [groupsError, setGroupsError] = useState('');

    const token = localStorage.getItem('prograde_token');

    // Fetch course details from backend
    useEffect(() => {
        const fetchCourse = async () => {
            setLoadingCourse(true);
            setCourseError("");
            try {
                const res = await fetch(`http://localhost:3001/api/faculty/courses`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to fetch assigned courses");
                const data = await res.json();
                // Find the course with the matching courseId
                const found = (data.courses || []).find(c => String(c.id) === String(courseId));
                if (!found) throw new Error("Course not found");
                setCourse(found);
            } catch (err) {
                setCourseError(err.message);
            } finally {
                setLoadingCourse(false);
            }
        };
        fetchCourse();
    }, [courseId, token]);

    // Fetch project groups
    const fetchGroups = async () => {
        setLoadingGroups(true);
        setGroupsError('');
        try {
            const res = await fetch(`http://localhost:3001/api/faculty/courses/${courseId}/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch project groups');
            const data = await res.json();
            setGroups(data);
        } catch (err) {
            setGroupsError(err.message);
        } finally {
            setLoadingGroups(false);
        }
    };
    useEffect(() => { fetchGroups(); }, [courseId]);

    // CSV file change handler
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setUploadError('');
        setUploadSuccess('');
        setCsvPreview([]);
        if (e.target.files[0]) {
            Papa.parse(e.target.files[0], {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setCsvPreview(results.data);
                },
                error: () => setCsvPreview([])
            });
        }
    };

    // Upload handler
    const handleUpload = async (e) => {
        e.preventDefault();
        setUploadError('');
        setUploadSuccess('');
        if (!file) {
            setUploadError('Please select a CSV file to upload.');
            return;
        }
        if (!token) {
            setUploadError('Authentication error. Please log in again.');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`http://localhost:3001/api/faculty/upload-groups`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'File upload failed.');
            const { createdProjects = 0, addedParticipants = 0, skippedRows = 0, skippedByReason = {} } = data || {};
            const reasonText = Object.entries(skippedByReason)
                .filter(([, v]) => v > 0)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
            setUploadSuccess(
                `Created ${createdProjects} project(s), added ${addedParticipants} participant(s), skipped ${skippedRows} row(s)` +
                (reasonText ? ` (${reasonText})` : '')
            );
            setFile(null);
            setCsvPreview([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchGroups();
            setTimeout(() => setUploadSuccess(''), 3000);
        } catch (err) {
            setUploadError(err.message);
        } finally {
            setUploading(false);
        }
    };

    if (loadingCourse) {
        return <div className="p-8">Loading course details...</div>;
    }
    if (courseError) {
        return <div className="p-8 text-red-500">Error: {courseError}</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <div className="mb-2">
                        <BackButton />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">{course.name}</h1>
                    <p className="text-lg text-gray-600">{course.courseCode}</p>
                </header>
                <main>
                    {/* --- CSV Upload Component JSX --- */}
                    <div className="mb-12">
                        <div className="bg-white rounded-xl shadow p-6 w-full max-w-2xl">
                            <h3 className="text-xl font-semibold text-gray-800">Upload Project Groups CSV</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                CSV columns: <b>groupNo</b>, <b>groupName</b>, <b>projectTitle</b>, <b>projectDescription</b>, <b>fileUrl</b>, <b>internalGuideEmail</b>, <b>externalGuideName</b>, <b>courseCode</b>, <b>studentEmail</b><br/>
                                Each row should represent a student in a group.
                            </p>
                            <form onSubmit={handleUpload} className="mt-4 space-y-4">
                                {/* Single upload to /api/faculty/upload-groups */}
                                <div>
                                    <label htmlFor="file-upload" className="sr-only">Choose file</label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                                {/* CSV Preview Table */}
                                {csvPreview.length > 0 && (
                                    <div className="overflow-x-auto border rounded mb-2">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2">Group No</th>
                                                    <th className="px-4 py-2">Group Name</th>
                                                    <th className="px-4 py-2">Project Title</th>
                                                    <th className="px-4 py-2">Project Description</th>
                                                    <th className="px-4 py-2">File URL</th>
                                                    <th className="px-4 py-2">Internal Guide Email</th>
                                                    <th className="px-4 py-2">External Guide Name</th>
                                                    <th className="px-4 py-2">Course Code</th>
                                                    <th className="px-4 py-2">Student Email</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {csvPreview.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2">{row.groupNo || row.GroupNo}</td>
                                                        <td className="px-4 py-2">{row.groupName || row.GroupName}</td>
                                                        <td className="px-4 py-2">{row.projectTitle || row.ProjectTitle}</td>
                                                        <td className="px-4 py-2">{row.projectDescription || row.ProjectDescription}</td>
                                                        <td className="px-4 py-2">{row.fileUrl || row.FileUrl}</td>
                                                        <td className="px-4 py-2">{row.internalGuideEmail || row.InternalGuideEmail}</td>
                                                        <td className="px-4 py-2">{row.externalGuideName || row.ExternalGuideName}</td>
                                                        <td className="px-4 py-2">{row.courseCode || row.CourseCode}</td>
                                                        <td className="px-4 py-2">{row.studentEmail || row.StudentEmail}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <button
                                        type="submit"
                                        disabled={uploading || !file}
                                        className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload CSV'}
                                    </button>
                                    <div className="text-sm">
                                        {uploadError && <p className="text-red-600 font-medium">{uploadError}</p>}
                                        {uploadSuccess && <p className="text-green-600 font-medium">{uploadSuccess}</p>}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    {/* Project Groups Display */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Project Groups</h2>
                        <div className="p-6 bg-white rounded-xl shadow">
                            {loadingGroups ? (
                                <div className="text-gray-500">Loading project groups...</div>
                            ) : groupsError ? (
                                <div className="text-red-500">{groupsError}</div>
                            ) : groups.length === 0 ? (
                                <div className="text-gray-500">No project groups assigned yet.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groups.map((group, idx) => (
                                        <div key={group.id || idx} className="bg-white rounded-lg border shadow-sm p-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="font-semibold text-gray-900">Group {group.groupNo}</div>
                                                {group.groupName && (
                                                    <div className="text-sm text-gray-600">{group.groupName}</div>
                                                )}
                                            </div>
                                            <div className="text-gray-800 mb-1">
                                                <span className="font-medium">Project:</span> {group.title || group.projectName}
                                            </div>
                                            {group.externalGuideName && (
                                                <div className="text-gray-700 text-sm mb-2">
                                                    <span className="font-medium">External Guide:</span> {group.externalGuideName}
                                                </div>
                                            )}
                                            <div className="text-gray-700 text-sm mb-1">Students:</div>
                                            <ul className="list-disc ml-6 text-sm space-y-1">
                                                {Array.isArray(group.participants) && group.participants.length > 0 ? (
                                                    group.participants.map((p, i) => {
                                                        const stu = p.student || {};
                                                        const display = stu.name ? `${stu.name} (${stu.email})` : (stu.email || p.studentId);
                                                        return <li key={i}>{display}</li>;
                                                    })
                                                ) : (
                                                    (group.studentIds ? group.studentIds.split(',') : []).map((sid, i) => (
                                                        <li key={i}>{sid}</li>
                                                    ))
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CourseDetailsPage;