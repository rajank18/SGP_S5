import React, { useState, useEffect, useRef } from 'react';
import BreadcrumbNavigation from '@/components/ui/BreadcrumNavigation';
import { useParams, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { UploadCloud } from 'lucide-react';

const CourseDetailsPage = () => {
    const { courseCode } = useParams();
    const [course, setCourse] = useState(null);
    const [loadingCourse, setLoadingCourse] = useState(true);
    const [courseError, setCourseError] = useState('');

    // CSV Upload State
    const [file, setFile] = useState(null);
    const [csvPreview, setCsvPreview] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef();

    // Project Groups State
    const [groups, setGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [groupsError, setGroupsError] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const token = localStorage.getItem('prograde_token');
    const navigate = useNavigate();

    // Fetch course details from backend (map courseCode -> course)
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
                // Find the course with the matching courseCode
                const found = (data.courses || []).find(c => String(c.courseCode) === String(courseCode));
                if (!found) throw new Error("Course not found");
                setCourse(found);
            } catch (err) {
                setCourseError(err.message);
            } finally {
                setLoadingCourse(false);
            }
        };
        fetchCourse();
    }, [courseCode, token]);

    // Fetch project groups
    const fetchGroups = async () => {
        setLoadingGroups(true);
        setGroupsError('');
        try {
            // Use course.id from fetched course object
            const res = await fetch(`http://localhost:3001/api/faculty/courses/${course?.id}/projects`, {
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
    useEffect(() => { if (course?.id) { fetchGroups(); } }, [course?.id]);

    // CSV file change handler
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setUploadError('');
        setUploadSuccess('');
        setCsvPreview([]);
        
        if (selectedFile) {
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setCsvPreview(results.data);
                },
                error: (error) => {
                    setCsvPreview([]);
                }
            });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFile = e.dataTransfer?.files?.[0];
        if (droppedFile) {
            handleFileChange({ target: { files: [droppedFile] } });
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
        if (!csvPreview || csvPreview.length === 0) {
            setUploadError('No CSV data to process. Please select a valid CSV file.');
            return;
        }
        if (!token) {
            setUploadError('Authentication error. Please log in again.');
            return;
        }
        
        setUploading(true);
        
        try {
            // Send the actual CSV file to the backend
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch(`http://localhost:3001/api/faculty/courses/${course?.id}/projects/upload`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`
                    // Note: Don't set Content-Type for FormData, let browser set it
                },
                body: formData,
            });
            
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'File upload failed.');
            
            setUploadSuccess('Project groups created successfully!');
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

    // Process CSV data to group students by groupNo
    const processCsvData = (csvData) => {
        const groups = {};
        
        csvData.forEach(row => {
            const groupNo = row.groupNo || row.GroupNo;
            const groupName = row.groupName || row.GroupName;
            const projectTitle = row.projectTitle || row.ProjectTitle;
            const projectDescription = row.projectDescription || row.ProjectDescription;
            const fileUrl = row.fileUrl || row.FileUrl;
            const internalGuideEmail = row.internalGuideEmail || row.InternalGuideEmail;
            const externalGuideName = row.externalGuideName || row.ExternalGuideName;
            const courseCode = row.courseCode || row.CourseCode;
            const studentEmail = row.studentEmail || row.StudentEmail;
            
            if (!groupNo || !studentEmail) {
                return;
            }
            
            if (!groups[groupNo]) {
                groups[groupNo] = {
                    groupNo: parseInt(groupNo),
                    groupName: groupName,
                    projectTitle: projectTitle,
                    projectDescription: projectDescription,
                    fileUrl: fileUrl,
                    internalGuideEmail: internalGuideEmail,
                    externalGuideName: externalGuideName,
                    courseCode: courseCode,
                    students: []
                };
            }
            
            // Add student to the group
            groups[groupNo].students.push({
                email: studentEmail,
                courseCode: courseCode
            });
        });
        
        return Object.values(groups);
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
                    <BreadcrumbNavigation />
                    <h1 className="text-3xl font-bold text-gray-800">{course.name}</h1>
                    <p className="text-lg text-gray-600">{course.courseCode}</p>
                </header>
                <main>
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
                                        <div
                                            key={group.id || idx}
                                            className="bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => navigate(`/faculty/courses/${encodeURIComponent(course.courseCode)}/groups/${encodeURIComponent(group.groupNo)}`)}
                                        >
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
                    {/* --- CSV Upload Component JSX --- */}
                    <div className="mt-12">
                        <div className="bg-white rounded-xl shadow p-6 w-full max-w">
                            <h3 className="text-xl font-semibold text-gray-800">Upload Project Groups CSV</h3>
                            <ul className="list-disc pl-5 text-sm text-gray-600 mt-2 space-y-1">
                                <li>CSV columns: <b>groupNo</b>, <b>groupName</b>, <b>projectTitle</b>, <b>projectDescription</b>, <b>fileUrl</b>, <b>internalGuideEmail</b>, <b>externalGuideName</b>, <b>studentEmail</b></li>
                                <li>Each row represents one student; same <b>groupNo</b> are grouped together automatically</li>
                                <li>Course code is auto-detected from the selected course</li>
                                <li>Accepted file type: <b>.csv</b> (max ~10MB)</li>
                            </ul>
                            <form onSubmit={handleUpload} className="mt-4 space-y-4">
                                {/* Dropzone */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${
                                        isDragging ? 'border-blue-400 bg-blue-50/50' : 'border-gray-300 hover:border-blue-300'
                                    }`}
                                >
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-3">
                                        <span className="text-blue-600 font-medium">Upload a file</span>
                                        <div className="text-xs text-gray-500">CSV up to 10MB</div>
                                    </div>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                        className="hidden"
                                    />
                                </div>
                                {file && (
                                    <div className="mt-1 text-sm text-gray-700">
                                        Selected: <span className="font-medium">{file.name}</span> <span className="text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                                    </div>
                                )}
                                {csvPreview.length > 0 && (
                                        <div className="mt-2 text-sm text-blue-600">
                                            ✓ CSV parsed: {csvPreview.length} rows loaded
                                            <button 
                                                type="button"
                                                onClick={() => {}}
                                                className="ml-2 text-blue-800 underline"
                                            >
                                                Debug Data
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => {}}
                                                className="ml-2 text-red-800 underline"
                                            >
                                                Check State
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={async () => {}}
                                                className="ml-2 text-green-800 underline"
                                            >
                                                Test Upload
                                            </button>
                                        </div>
                                    )}
                                {/* CSV Preview Table */}
                                {csvPreview.length > 0 && (
                                    <div className="space-y-4">
                                        {/* Raw CSV Data */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">Raw CSV Data:</h4>
                                            <div className="overflow-x-auto border rounded">
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
                                        </div>
                                        
                                        {/* Grouped Data Preview */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">How data will be grouped:</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(() => {
                                                    try {
                                                        const grouped = processCsvData(csvPreview);
                                                        return grouped.map((group, idx) => (
                                                            <div key={idx} className="bg-gray-50 rounded-lg p-3 border">
                                                                <div className="font-semibold text-gray-800">Group {group.groupNo}: {group.groupName}</div>
                                                                <div className="text-sm text-gray-600 mb-2">Project: {group.projectTitle}</div>
                                                                <div className="text-sm text-gray-600 mb-2">External Guide: {group.externalGuideName}</div>
                                                                <div className="text-sm text-gray-700">
                                                                    <span className="font-medium">Students ({group.students.length}):</span>
                                                                    <ul className="list-disc ml-4 mt-1">
                                                                        {group.students.map((student, i) => (
                                                                            <li key={i}>{student.email}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        ));
                                                    } catch (error) {
                                                        return <div className="text-red-500">Error processing preview: {error.message}</div>;
                                                    }
                                                })()}
                                            </div>
                                        </div>
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
                    
                    
                </main>
            </div>
        </div>
    );
};

export default CourseDetailsPage;