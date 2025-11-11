import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, ClipboardCheck, FileText, FileDown, Presentation } from 'lucide-react';

const GroupDetailsPage = () => {
    const { courseCode, groupNo } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('prograde_token');

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
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-6">
                    <div className="flex items-center justify-between mt-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                            <div className="text-gray-600">Group {project.groupNo}{project.groupName ? ` • ${project.groupName}` : ''}</div>
                            <div className="text-sm text-gray-500 mt-1">Course: {course.name} ({course.courseCode})</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                onClick={() => navigate(`/faculty/courses/${course.id}/projects/${project.id}/evaluate`)}
                            >
                                <ClipboardCheck className="h-4 w-4" />
                                Evaluate Project
                            </button>
                            <button
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => navigate(`/faculty/courses/${encodeURIComponent(course.courseCode)}`)}
                            >
                                Back to course
                            </button>
                        </div>
                    </div>
                </header>

                <main className="space-y-6">
                    <section className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Students</h2>
                        {Array.isArray(project.participants) && project.participants.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {project.participants.map((p, i) => {
                                    const stu = p.student || {};
                                    const name = stu.name || 'Unnamed';
                                    const email = stu.email || p.studentEmail || '—';
                                    return (
                                        <li key={i} className="py-2 flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-gray-900">{name}</div>
                                                <div className="text-sm text-gray-600">{email}</div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="text-gray-600">No students listed yet.</div>
                        )}
                    </section>

                    <section className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
                        <div className="text-gray-800 whitespace-pre-wrap bg-gray-50 rounded p-3 border">
                            {project.description?.trim() ? project.description : 'No description provided yet.'}
                        </div>
                    </section>

                    <section className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Project File URL</h2>
                        {project.fileUrl ? (
                            <a
                                href={project.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 break-all"
                            >
                                <ExternalLink className="h-4 w-4" />
                                {project.fileUrl}
                            </a>
                        ) : (
                            <div className="text-gray-600">No file URL provided yet.</div>
                        )}
                    </section>

                     <section className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Reports</h2>
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
                                return <div className="text-gray-600">No weekly reports uploaded yet.</div>;
                            }

                            // Sort by week number
                            const sortedReports = [...weeklyReports].sort((a, b) => a.week - b.week);

                            return (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                    <span className="font-semibold text-gray-800">Week {report.week}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mb-2">
                                                    Uploaded: {uploadDate}
                                                </div>
                                                <a
                                                    href={report.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline break-all"
                                                >
                                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">{report.filename || `Week ${report.week} Report`}</span>
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </section>

                    <section className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Report (PDF)</h2>
                        {project.projectReportUrl ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileDown className="h-5 w-5 text-blue-600" />
                                        <span className="font-semibold text-gray-800">Project Report</span>
                                    </div>
                                    <a
                                        href={project.projectReportUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline break-all"
                                    >
                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">Download Report</span>
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-600">No project report uploaded yet.</div>
                        )}
                    </section>

                    <section className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Presentation (PPT)</h2>
                        {project.presentationUrl ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Presentation className="h-5 w-5 text-blue-600" />
                                        <span className="font-semibold text-gray-800">Presentation</span>
                                    </div>
                                    <a
                                        href={project.presentationUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline break-all"
                                    >
                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">Download Presentation</span>
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-600">No presentation uploaded yet.</div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default GroupDetailsPage;


