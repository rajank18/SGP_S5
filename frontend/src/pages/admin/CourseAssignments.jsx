import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ClipboardList, PlusCircle, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import BreadcrumbNavigation from '@/components/ui/BreadcrumNavigation';

const CourseAssignments = () => {
    const [courses, setCourses] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const navigate = useNavigate();

    // --- No changes to your data fetching and other logic ---
    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('prograde_token');
            const headers = { Authorization: `Bearer ${token}` };
            const [cRes, fRes, aRes] = await Promise.all([
                fetch('http://localhost:3001/api/admin/courses', { headers }),
                fetch('http://localhost:3001/api/admin/faculty', { headers }),
                fetch('http://localhost:3001/api/admin/course-assignments', { headers }),
            ]);
            setCourses(await cRes.json());
            setFaculty(await fRes.json());
            const aData = await aRes.json();
            setAssignments(aData.assignments || []);
            setFilteredAssignments(aData.assignments || []);
        } catch (err) {
            toast.error('Failed to load data');
        }
    };

    const handleSaveAssignment = async () => {
        if (!selectedCourse || !selectedFaculty) {
            toast.error('Please select both a course and a faculty member.');
            return;
        }
        try {
            const token = localStorage.getItem('prograde_token');
            const res = await fetch(`http://localhost:3001/api/admin/courses/${selectedCourse}/faculty`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ facultyId: selectedFaculty })
            });
            if (!res.ok) throw new Error('Failed to assign course');
            toast.success('Course assigned successfully');
            fetchData(); // Refresh data to show the new assignment
            setSelectedCourse(''); // Reset selections
            setSelectedFaculty('');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleRemoveAssignment = async (courseId, facultyId) => {
        if (!window.confirm('Are you sure you want to remove this assignment?')) return;
        try {
            const token = localStorage.getItem('prograde_token');
            const res = await fetch(`http://localhost:3001/api/admin/courses/${courseId}/faculty/${facultyId}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to remove assignment');
            toast.success('Assignment removed successfully');
            fetchData(); // Refresh data
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Breadcrumb Navigation - Replaces BackButton */}
                <BreadcrumbNavigation />

                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <ClipboardList /> Course Assignments
                    </h1>
                </div>

                {/* Quick Assignment Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Assign</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="course-select" className="text-sm font-medium text-gray-700">Course</Label>
                                <select
                                    id="course-select"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-500"
                                >
                                    <option value="">Select a course</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.courseCode} - {c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="faculty-select" className="text-sm font-medium text-gray-700">Faculty</Label>
                                <select
                                    id="faculty-select"
                                    value={selectedFaculty}
                                    onChange={(e) => setSelectedFaculty(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-500"
                                >
                                    <option value="">Select faculty</option>
                                    {faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button 
                                    onClick={handleSaveAssignment} 
                                    disabled={!selectedCourse || !selectedFaculty} 
                                    className="w-full md:w-auto h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Assign
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assignments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Assignments ({filteredAssignments.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Input
                                placeholder="Search by course, code, or faculty name..."
                                onChange={(e) => {
                                    const term = e.target.value.toLowerCase();
                                    setFilteredAssignments(assignments.filter(a =>
                                        a.courseName.toLowerCase().includes(term) ||
                                        a.courseCode.toLowerCase().includes(term) ||
                                        a.facultyName.toLowerCase().includes(term)
                                    ));
                                }}
                                className="max-w-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                            />
                            {filteredAssignments.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No assignments found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-blue-50">
                                            <tr>
                                                {['Course', 'Faculty', 'Assigned Date', 'Remove'].map(h => (
                                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAssignments.map((a, index) => (
                                                <motion.tr 
                                                    key={`${a.courseId}-${a.facultyId}`} 
                                                    whileHover={{ scale: 1.00 }} 
                                                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100 transition-colors duration-150`}
                                                >
                                                    <td className="px-6 py-4 font-medium">{a.courseName} <span className="text-gray-500">({a.courseCode})</span></td>
                                                    <td className="px-6 py-4">{a.facultyName}</td>
                                                    <td className="px-6 py-4">{new Date(a.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <Button variant="" size="sm" onClick={() => handleRemoveAssignment(a.courseId, a.facultyId)} className="text-red-600">
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CourseAssignments;