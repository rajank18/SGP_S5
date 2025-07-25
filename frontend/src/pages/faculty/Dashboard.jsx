import React from 'react'
import { useState } from 'react';
import CoursePopup from '../../models/faculty/CoursePopup';

const Dashboard = () => {
    // State to manage whether the popup is open or closed
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    
    // State to hold the list of courses. We'll add some initial data for display.
    const [courses, setCourses] = useState([
        { name: 'Advanced Web Development', code: 'IT501', semester: '5', year: 2025 },
        { name: 'Database Management Systems', code: 'CE402', semester: '4', year: 2025 },
    ]);

    // This function is passed to the popup. It receives the new course data.
    const handleCreateCourse = (newCourseData) => {
        console.log("New Course Created:", newCourseData); // For testing
        // Add the new course to our list of courses
        setCourses(prevCourses => [...prevCourses, newCourseData]);
        // Close the popup
        setIsPopupOpen(false);
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">My Courses</h1>
                
                {/* Grid container for course cards and the create button */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    
                    {/* Map over the courses and display a card for each */}
                    {courses.map((course, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{course.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{course.code}</p>
                            </div>
                            <div className="mt-4">
                                <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    Sem {course.semester} - {course.year}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* The "Create Course" button */}
                    <button 
                        onClick={() => setIsPopupOpen(true)}
                        className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-200 hover:border-gray-400 transition-colors h-48 cursor-pointer">
                        {/* Plus Icon (SVG) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span className="mt-2 font-semibold">Create New Course</span>
                    </button>
                </div>
            </div>

            {/* Conditionally render the popup */}
            {isPopupOpen && <CoursePopup onCreateCourse={handleCreateCourse} onClose={() => setIsPopupOpen(false)} />}
        </div>
    );
};

// Main App component to render the Dashboard
export default Dashboard;
