import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, ClipboardCheck, FileText, FileDown, Presentation, Mail, Calendar, X } from 'lucide-react';

const GroupDetailsPage = () => {
    const { courseCode, groupNo } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [showPptModal, setShowPptModal] = useState(false);
    const [reportDeadline, setReportDeadline] = useState('');
    const [pptDeadline, setPptDeadline] = useState('');
    const [sendingReport, setSendingReport] = useState(false);
    const [sendingPpt, setSendingPpt] = useState(false);
    const [notificationMsg, setNotificationMsg] = useState('');

    const token = localStorage.getItem('prograde_token');
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

    const sendEmailNotification = async (submissionType, deadlineDate) => {
        if (submissionType === 'report') {
            setSendingReport(true);
        } else {
            setSendingPpt(true);
        }

        try {
            const response = await fetch(`http://localhost:3001/api/faculty/courses/${course.id}/projects/${project.id}/notify-students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    submissionType,
                    deadlineDate
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send notification');
            }

            setNotificationMsg(`✓ Notification sent to ${data.emailsSent} student(s)!`);
            setTimeout(() => setNotificationMsg(''), 5000);

            if (submissionType === 'report') {
                setShowReportModal(false);
                setReportDeadline('');
            } else {
                setShowPptModal(false);
                setPptDeadline('');
            }
        } catch (err) {
            setNotificationMsg(`✗ Error: ${err.message}`);
            setTimeout(() => setNotificationMsg(''), 5000);
        } finally {
            if (submissionType === 'report') {
                setSendingReport(false);
            } else {
                setSendingPpt(false);
            }
        }
    };



    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                // Get assigned courses, find by courseCode
                const coursesRes = await fetch('http://localhost:3001/api/faculty/courses', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!coursesRes.ok) throw new Error('Failed to fetch courses');
                const coursesData = await coursesRes.json();
                const foundCourse = (coursesData.courses || []).find(c => String(c.courseCode) === String(courseCode));
                if (!foundCourse) throw new Error('Course not found');
                setCourse(foundCourse);

                // Fetch this course's projects, then find by groupNo
                const projectsRes = await fetch(`http://localhost:3001/api/faculty/courses/${foundCourse.id}/projects`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!projectsRes.ok) throw new Error('Failed to fetch projects');
                const projects = await projectsRes.json();
                const foundProject = (projects || []).find(p => String(p.groupNo) === String(groupNo));
                if (!foundProject) throw new Error('Group not found');
                setProject(foundProject);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [courseCode, groupNo, token]);

    if (loading) {
        return <div className="p-8">Loading group details...</div>;
    }
    if (error) {
        return <div className="p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{project.title}</h1>
                        <div className="text-gray-600 mt-1">
                            Group {project.groupNo}{project.groupName ? ` • ${project.groupName}` : ''}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {course.name} ({course.courseCode})
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            onClick={() => navigate(`/faculty/courses/${course.id}/projects/${project.id}/evaluate`)}
                        >
                            <ClipboardCheck className="h-4 w-4" />
                            Evaluate Project
                        </button>
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={() => navigate(`/faculty/courses/${encodeURIComponent(course.courseCode)}`)}
                        >
                            Back to Course
                        </button>
                    </div>
                </header>

                <main className="space-y-6">
                    {/* Students Section - Single Row */}
                    <section className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Team Members</h2>
                        {Array.isArray(project.participants) && project.participants.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {project.participants.map((p, i) => {
                                    const stu = p.student || {};
                                    const name = stu.name || 'Unnamed';
                                    const email = stu.email || p.studentEmail || '—';
                                    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

                                    return (
                                        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-medium">
                                                {initials}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{name}</div>
                                                <div className="text-sm text-gray-500">{email}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-gray-500 italic">No team members listed yet.</div>
                        )}
                    </section>

                    {/* Description and File URL - Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Description Card */}
                        <section className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Description</h2>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="text-gray-800 whitespace-pre-wrap">
                                    {project.description?.trim() || 'No description provided yet.'}
                                </div>
                            </div>
                        </section>

                        {/* Project Repository Card */}
                        <section className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Repository</h2>
                            {project.fileUrl ? (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col">
                                    <div className="flex-grow">
                                        <a
                                            href={project.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 break-all text-sm"
                                        >
                                            <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">{project.fileUrl}</span>
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500 italic h-full flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    No repository URL provided yet.
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Project Files - Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Project Report Card */}
                        <section className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Report (PDF)</h2>
                            {project.projectReportUrl ? (
                                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <FileDown className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">Project Report</h3>
                                            <a
                                                onClick={() => handleDownload(project.projectReportUrl, `Group${project.groupNo}_Report`, 'pdf')}
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-sm text-blue-600 cursor-pointer hover:text-blue-700 mt-1"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                Download Report
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                                    No project report uploaded yet.
                                </div>
                            )}
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm border border-blue-200"
                            >
                                <Mail className="h-4 w-4" />
                                Send Deadline Reminder
                            </button>
                        </section>

                        {/* Presentation Card */}
                        <section className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Presentation (PPT/PPTX)</h2>
                            {project.presentationUrl ? (
                                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Presentation className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">Presentation</h3>
                                            <a
                                                onClick={() => handleDownload(project.presentationUrl, `${project.title}_Presentation`, 'pptx')}
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-sm cursor-pointer text-blue-600 hover:text-blue-700 mt-1"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                Download Presentation
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                                    No presentation uploaded yet.
                                </div>
                            )}
                            <button
                                onClick={() => setShowPptModal(true)}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm border border-blue-200"
                            >
                                <Mail className="h-4 w-4" />
                                Send Deadline Reminder
                            </button>
                        </section>
                    </div>

                    {/* Weekly Reports - Centered */}
                    <section className="bg-white rounded-xl shadow p-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Weekly Reports</h2>
                            <p className="text-gray-500 mt-1">Track project progress with weekly updates</p>
                        </div>

                        {(() => {
                            let weeklyReports = [];
                            try {
                                if (typeof project.weeklyReportUrls === 'string') {
                                    weeklyReports = JSON.parse(project.weeklyReportUrls);
                                } else if (Array.isArray(project.weeklyReportUrls)) {
                                    weeklyReports = project.weeklyReportUrls;
                                }
                            } catch (e) {
                                console.error('Failed to parse weeklyReportUrls', e);
                            }

                            if (!weeklyReports || weeklyReports.length === 0) {
                                return (
                                    <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-gray-500">No weekly reports uploaded yet.</p>
                                    </div>
                                );
                            }

                            // Sort by week number
                            const sortedReports = [...weeklyReports].sort((a, b) => a.week - b.week);

                            return (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sortedReports.map((report) => {
                                        const uploadDate = report.uploadedAt
                                            ? new Date(report.uploadedAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })
                                            : 'Date not available';

                                        return (
                                            <div
                                                key={report.week}
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-blue-50 rounded-lg">
                                                        <FileText className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">Week {report.week}</h3>
                                                        <div className="text-xs text-gray-500">
                                                            {uploadDate}
                                                        </div>
                                                    </div>
                                                </div>
                                                <a
                                                    onClick={() => handleDownload(report.url, report.filename || `Week_${report.week}_Report`, 'pdf')}
                                                    rel="noreferrer"
                                                    className="inline-flex items-center cursor-pointer gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    {report.filename || `View Week ${report.week} Report`}
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </section>
                </main>
            </div>

            {/* Report Deadline Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/20 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Mail className="h-5 w-5 text-blue-600" />
                                Send Report Deadline Reminder
                            </h3>
                            <button
                                onClick={() => {
                                    setShowReportModal(false);
                                    setReportDeadline('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="h-4 w-4 inline mr-2" />
                                Select Submission Deadline
                            </label>
                            <input
                                type="date"
                                value={reportDeadline}
                                onChange={(e) => setReportDeadline(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            A notification email will be sent to all {project.participants?.length || 0} student(s) with this deadline date.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowReportModal(false);
                                    setReportDeadline('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => sendEmailNotification('report', reportDeadline)}
                                disabled={!reportDeadline || sendingReport}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sendingReport ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-4 w-4" />
                                        Send Reminder
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PPT Deadline Modal */}
            {showPptModal && (
                <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/20 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Mail className="h-5 w-5 text-blue-600" />
                                Send Presentation Deadline Reminder
                            </h3>
                            <button
                                onClick={() => {
                                    setShowPptModal(false);
                                    setPptDeadline('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="h-4 w-4 inline mr-2" />
                                Select Submission Deadline
                            </label>
                            <input
                                type="date"
                                value={pptDeadline}
                                onChange={(e) => setPptDeadline(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            A notification email will be sent to all {project.participants?.length || 0} student(s) with this deadline date.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPptModal(false);
                                    setPptDeadline('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => sendEmailNotification('ppt', pptDeadline)}
                                disabled={!pptDeadline || sendingPpt}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sendingPpt ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-4 w-4" />
                                        Send Reminder
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Message */}
            {notificationMsg && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 ${notificationMsg.startsWith('✓') ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                    {notificationMsg}
                </div>
            )}
        </div>
    );
};

export default GroupDetailsPage;


