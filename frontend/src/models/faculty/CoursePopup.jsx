import React, { useState, useEffect } from 'react';

// This would be your CoursePopup.jsx component
const CoursePopup = ({ onCreateCourse, onClose }) => {
    // State to manage the form inputs
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [semester, setSemester] = useState('3'); // Default to semester 3
    const [description, setDescription] = useState('');
    
    // The year is determined once and is not a state variable
    const currentYear = new Date().getFullYear();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!courseName || !courseCode) {
            alert('Please fill out Course Name and Course Code.');
            return;
        }
        // Pass the new course data up to the parent component (Dashboard)
        onCreateCourse({
            name: courseName,
            code: courseCode,
            semester,
            year: currentYear,
            description,
        });
    };

    return (
        // Modal backdrop with blur effect
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 min-h-screen">
            {/* Modal container */}
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg border-0">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Create New Course</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        {/* Close Icon (SVG) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Course Name */}
                        <div>
                            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                            <input type="text" id="courseName" value={courseName} onChange={(e) => setCourseName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        {/* Course Code */}
                        <div>
                            <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                            <input type="text" id="courseCode" value={courseCode} onChange={(e) => setCourseCode(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        {/* Semester and Year */}
                        <div className="flex space-x-4">
                            <div className="w-1/2">
                                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                <select id="semester" value={semester} onChange={(e) => setSemester(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                </select>
                            </div>
                            <div className="w-1/2">
                                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <input type="text" id="year" value={currentYear} readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500" />
                            </div>
                        </div>
                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                    </div>
                    {/* Form Actions */}
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                            Create Course
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CoursePopup;