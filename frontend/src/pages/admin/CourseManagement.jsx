import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { BookOpen, Edit, Trash, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ name: '', courseCode: '', semester: '', year: new Date().getFullYear(), description: '' });
  const navigate = useNavigate();

  useEffect(() => { fetchCourses(); }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
      if (isModalOpen) {
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
      } else {
        document.body.style.overflow = 'auto';
      }
    }, [isModalOpen]);

  const fetchCourses = async () => {
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

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className={`container mx-auto p-6 space-y-6 ${isModalOpen ? 'overflow-hidden' : ''}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><BookOpen /> Course Management</h1>
        <Button onClick={() => { setIsModalOpen(true); setEditingCourse(null); }} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-white">
          <PlusCircle /> Add Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No courses found.</p>
          ) : (
            <div className="overflow-x-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Code', 'Name', 'Semester', 'Year', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <motion.tr key={c.id} whileHover={{ scale: 1.01 }} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{c.courseCode}</td>
                      <td className="px-6 py-4">{c.name}</td>
                      <td className="px-6 py-4">{c.semester}</td>
                      <td className="px-6 py-4">{c.year}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingCourse(c); setFormData(c); setIsModalOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteCourse(c.id)} className="text-red-600">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <>
          {/* Blur + dark backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingCourse ? 'Edit Course' : 'Add Course'}</h2>
              <form onSubmit={handleSaveCourse} className="space-y-4">
                {['name', 'courseCode', 'semester', 'year', 'description'].map((field) => (
                  <div key={field}>
                    <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                    <Input id={field} name={field} value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} />
                  </div>
                ))}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {editingCourse ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseManagement;
