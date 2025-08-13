import React, { useState, useEffect, useRef } from 'react';
import BreadcrumbNavigation from '@/components/ui/BreadcrumNavigation';
import { useParams, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { UploadCloud, ChevronDown, ChevronUp } from 'lucide-react';

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
    const [showUploadSection, setShowUploadSection] = useState(false);

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
                                        className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => navigate(`/faculty/courses/${encodeURIComponent(course.courseCode)}/groups/${encodeURIComponent(group.groupNo)}`)}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="font-bold text-xl text-gray-900">Group {group.groupNo}</div>
                                                {group.groupName && (
                                                    <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                                        {group.groupName}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-gray-800 mb-3">
                                                <span className="font-medium text-gray-700">Project:</span>
                                                <div className="text-sm mt-1">{group.title || group.projectName}</div>
                                            </div>
                                            {group.externalGuideName && (
                                                <div className="text-gray-700 text-sm mb-3">
                                                    <span className="font-medium">External Guide:</span>
                                                    <div className="mt-1">{group.externalGuideName}</div>
                                                </div>
                                            )}
                                            <div className="text-gray-700 text-sm mb-2">
                                                <span className="font-medium">Students:</span>
                                            </div>
                                            <ul className="space-y-1">
                                                {Array.isArray(group.participants) && group.participants.length > 0 ? (
                                                    group.participants.map((p, i) => {
                                                        const stu = p.student || {};
                                                        const display = stu.name ? `${stu.name} (${stu.email})` : (stu.email || p.studentId);
                                                        return (
                                                            <li key={i} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                                                {display}
                                                            </li>
                                                        );
                                                    })
                                                ) : (
                                                    (group.studentIds ? group.studentIds.split(',') : []).map((sid, i) => (
                                                        <li key={i} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                                            {sid}
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-gray-100">
                                            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                Click to view details
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* --- CSV Upload Component JSX --- */}
                    <div className="mt-8">
                        <button
                            onClick={() => setShowUploadSection(!showUploadSection)}
                            className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 ease-in-out"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <UploadCloud className="h-5 w-5 text-gray-600" />
                                    <span className="text-gray-800 font-medium">
                                        {groups.length === 0 ? 'Upload Project Groups CSV' : 'Upload More Project Groups'}
                                    </span>
                                </div>
                                <div className={`transform transition-transform duration-200 ease-in-out ${showUploadSection ? 'rotate-180' : 'rotate-0'}`}>
                                    <ChevronDown className="h-5 w-5 text-gray-600" />
                                </div>
                            </div>
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showUploadSection ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                            <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    {groups.length === 0 ? 'Upload Project Groups CSV' : 'Upload Additional Project Groups CSV'}
                                </h3>
                                <ul className="list-disc pl-5 text-sm text-gray-600 mb-4 space-y-1">
                                    <li>CSV columns: <b>GroupNo</b>, <b>GroupName</b>, <b>ProjectTitle</b>, <b>ProjectDescription</b>, <b>FileUrl</b>, <b>InternalGuideEmail</b>, <b>ExternalGuideName</b>, <b>StudentEmail</b></li>                                
                                    <li>Accepted file type: <b>.csv</b> (max ~10MB)</li>
                                </ul>
                                <form onSubmit={handleUpload} className="space-y-4">
                                    {/* Dropzone */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragEnter={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                                            isDragging ? 'border-blue-400 bg-blue-50/50' : 'border-gray-300 hover:border-blue-300'
                                        }`}
                                    >
                                        <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                                        <div className="mt-2">
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
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-green-800 text-sm font-medium">
                                                    {file.name} ({Math.round(file.size / 1024)} KB)
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setFile(null)}
                                                    className="text-green-600 hover:text-green-800"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {uploadError && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <span className="text-red-800 text-sm">{uploadError}</span>
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={!file || uploading}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload CSV'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    
                </main>
            </div>
        </div>
    );
};

export default CourseDetailsPage;