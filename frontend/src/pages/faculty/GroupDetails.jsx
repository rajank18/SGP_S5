import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

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
                        <button
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => navigate(`/faculty/courses/${encodeURIComponent(course.courseCode)}`)}
                        >
                            Back to course
                        </button>
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
                </main>
            </div>
        </div>
    );
};

export default GroupDetailsPage;


