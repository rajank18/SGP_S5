import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { BookOpen, Edit, Trash, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import BreadcrumbNavigation from '@/components/ui/BreadcrumNavigation';
import Modal from '@/components/ui/Modal'; 

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({ name: '', courseCode: '', semester: '', year: new Date().getFullYear(), description: '' });
    const navigate = useNavigate();

    // --- All your data fetching and other logic remains unchanged ---
    useEffect(() => { fetchCourses(); }, []);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isModalOpen]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('prograde_token');
            const res = await fetch('http://localhost:3001/api/admin/courses', { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to fetch courses');
            setCourses(await res.json());
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCourse = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('prograde_token');
            const url = editingCourse
                ? `http://localhost:3001/api/admin/courses/${editingCourse.id}`
                : 'http://localhost:3001/api/admin/courses';
            const method = editingCourse ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Failed to save course');
            toast.success(`Course ${editingCourse ? 'updated' : 'added'} successfully`);
            setIsModalOpen(false);
            fetchCourses();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm('Delete this course?')) return;
        try {
            const token = localStorage.getItem('prograde_token');
            const res = await fetch(`http://localhost:3001/api/admin/courses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Course deleted');
            fetchCourses();
        } catch (err) {
            toast.error(err.message);
        }
    };
    
    // --- The main component render ---
    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <BreadcrumbNavigation />
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen /> Course Management
                    </h1>
                    <Button onClick={() => { setIsModalOpen(true); setEditingCourse(null); setFormData({ name: '', courseCode: '', semester: '', year: new Date().getFullYear(), description: '' }); }} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-white">
                        <PlusCircle /> Add Course
                    </Button>
                </div>
                <Card>
                    <CardHeader><CardTitle>Courses ({courses.length})</CardTitle></CardHeader>
                    <CardContent>
                        {/* Table remains the same */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-blue-50">
                                    <tr>
                                        {['Code', 'Name', 'Semester', 'Year', 'Actions'].map((h) => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((c, index) => (
                                        <motion.tr 
                                            key={c.id} 
                                            whileHover={{ scale: 1.00 }} 
                                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100 transition-colors duration-150`}
                                        >
                                            <td className="px-6 py-4">{c.courseCode}</td>
                                            <td className="px-6 py-4">{c.name}</td>
                                            <td className="px-6 py-4">{c.semester}</td>
                                            <td className="px-6 py-4">{c.year}</td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <Button variant="" size="sm" onClick={() => { setEditingCourse(c); setFormData(c); setIsModalOpen(true); }}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="" size="sm" onClick={() => handleDeleteCourse(c.id)} className="text-red-600">
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* MODAL IMPLEMENTATION - USING THE NEW COMPONENT */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingCourse ? 'Edit Course' : 'Add Course'}
                >
                    <form onSubmit={handleSaveCourse} className="space-y-4">
                        {['name', 'courseCode', 'semester', 'year', 'description'].map((field) => (
                            <div key={field}>
                                <Label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                </Label>
                                <Input 
                                    id={field} 
                                    name={field} 
                                    value={formData[field]} 
                                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} 
                                />
                            </div>
                        ))}
                        {/* Styled Buttons - CORRECTED */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                className="w-1/2 bg-gray-200 text-gray-700 hover:bg-gray-300"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {editingCourse ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default CourseManagement;