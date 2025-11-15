import React, { useState, useEffect, useRef } from 'react';
import BreadcrumbNavigation from '@/components/ui/BreadcrumNavigation';
import { useParams, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { UploadCloud, ChevronDown, ChevronUp } from 'lucide-react';
import ExportCourseData from '@/components/faculty/ExportCourseData';
import UploadGroupsModal from '@/components/faculty/UploadGroupsModal';

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

    const [showUploadModal, setShowUploadModal] = useState(false);


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
    const handleUploadCSV = async (e) => {
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

            if (!res.ok) {
                throw new Error(data.message || 'File upload failed.');
            }

            // Build success message with details
            let successMsg = data.message || 'Project groups created successfully!';
            if (data.projectsCreated !== undefined) {
                successMsg += ` (${data.projectsCreated} project(s), ${data.participantsAdded} participant(s))`;
            }
            if (data.warning) {
                successMsg += ` Warning: ${data.warning}`;
                if (data.missingStudents && data.missingStudents.length > 0) {
                    console.warn('Missing students:', data.missingStudents);
                }
            }

            setUploadSuccess(successMsg);
            setFile(null);
            setCsvPreview([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchGroups();
            setTimeout(() => setUploadSuccess(''), 5000);
        } catch (err) {
            console.error('Upload error:', err);
            setUploadError(err.message || 'An unexpected error occurred during upload.');
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

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                        {/* LEFT SIDE – Course Title */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{course.name}</h1>
                            <p className="text-lg text-gray-600">{course.courseCode}</p>
                        </div>
                        <div className='flex items-center gap-4'>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="px-5 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition flex items-center gap-2"
                            >
                                <UploadCloud className="h-5 w-5 text-gray-600" />
                                <span className="text-gray-800 font-medium">
                                    {groups.length === 0 ? "Upload Project Groups CSV" : "Upload More Groups"}
                                </span>
                            </button>

                            <UploadGroupsModal
                                open={showUploadModal}
                                onClose={() => setShowUploadModal(false)}
                                onUpload={handleUploadCSV}        // NEW function (see below)
                                uploading={uploading}
                                uploadError={uploadError}
                                uploadSuccess={uploadSuccess}
                            />

                            {/* RIGHT SIDE – Export Buttons */}
                            <ExportCourseData courseId={course?.id} courseName={course?.name} />
                        </div>
                    </div>
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
                            <>


                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groups.map((group, idx) => (
                                        <div
                                            key={group.id || idx}
                                            className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer"
                                            onClick={() =>
                                                navigate(
                                                    `/faculty/courses/${encodeURIComponent(
                                                        course.courseCode
                                                    )}/groups/${encodeURIComponent(group.groupNo)}`
                                                )
                                            }
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="font-bold text-xl text-gray-900">
                                                        Group {group.groupNo}
                                                    </div>

                                                    {group.groupName && (
                                                        <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                                            {group.groupName}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-gray-800 mb-3">
                                                    <span className="font-medium text-gray-700">Project:</span>
                                                    <div className="text-sm mt-1">
                                                        {group.title || group.projectName}
                                                    </div>
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
                                                    {Array.isArray(group.participants) &&
                                                        group.participants.length > 0 ? (
                                                        group.participants.map((p, i) => {
                                                            const stu = p.student || {};
                                                            const display = stu.name
                                                                ? `${stu.name} (${stu.email})`
                                                                : stu.email || p.studentId;

                                                            return (
                                                                <li
                                                                    key={i}
                                                                    className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
                                                                >
                                                                    {display}
                                                                </li>
                                                            );
                                                        })
                                                    ) : (
                                                        (group.studentIds
                                                            ? group.studentIds.split(",")
                                                            : []
                                                        ).map((sid, i) => (
                                                            <li
                                                                key={i}
                                                                className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
                                                            >
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
                            </>
                        )}
                    </div>


                </main>
            </div>
        </div>
    );
};

export default CourseDetailsPage;