import React, { useState, useEffect } from 'react';
import BackButton from '@/components/ui/BackButton';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAssignedCourses();
    }, []);

    const fetchAssignedCourses = async () => {
        try {
            const token = localStorage.getItem('prograde_token');
            if (!token) {
                setError('No authentication token found');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:3001/api/faculty/courses', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAssignedCourses(data.courses || []);
            } else {
                const errorData = await response.json();
                console.error('Faculty courses error response:', errorData); // Debug log
                setError(`Failed to fetch assigned courses: ${errorData.message || 'Unknown error'}`);
            }
        } catch (err) {
            setError('Error fetching courses: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-lg text-gray-600">Loading your courses...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">

                <h1 className="text-3xl font-bold text-gray-800 mb-6">My Assigned Courses</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {assignedCourses.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <div className="text-gray-500 text-lg mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            No courses assigned yet
                        </div>
                        <p className="text-gray-600">Courses will appear here once an admin assigns them to you.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {assignedCourses.map((course, index) => (
                            <div
                                key={course.id || index}
                                className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => navigate(`/faculty/courses/${course.id}`)}
                            >
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{course.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{course.courseCode}</p>
                                    {course.semester && (
                                        <p className="text-sm text-gray-500 mt-1">Semester: {course.semester}</p>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        Assigned Course
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Main App component to render the Dashboard
export default Dashboard;
