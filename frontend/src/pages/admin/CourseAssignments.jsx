import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { ClipboardList, PlusCircle, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CourseAssignments = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('prograde_token');
      const [cRes, fRes, aRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/courses', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/admin/faculty', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/admin/course-assignments', { headers: { Authorization: `Bearer ${token}` } }),
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
      toast.error('Select course and faculty');
      return;
    }
    try {
      const token = localStorage.getItem('prograde_token');
      const res = await fetch(`http://localhost:3001/api/admin/courses/${selectedCourse}/faculty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ facultyId: selectedFaculty })
      });
      if (!res.ok) throw new Error('Failed to assign');
      toast.success('Course assigned');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemoveAssignment = async (courseId, facultyId) => {
    if (!window.confirm('Remove this assignment?')) return;
    try {
      const token = localStorage.getItem('prograde_token');
      const res = await fetch(`http://localhost:3001/api/admin/courses/${courseId}/faculty/${facultyId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to remove');
      toast.success('Assignment removed');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><ClipboardList /> Course Assignments</h1>
        <Button onClick={handleSaveAssignment} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-white">
          <PlusCircle /> Assign
        </Button>
      </div>

      {/* Quick Assignment Form */}
      <Card>
        <CardHeader><CardTitle>Quick Assign</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Course</Label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Select a course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.courseCode} - {c.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Faculty</Label>
            <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Select faculty</option>
              {faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleSaveAssignment} disabled={!selectedCourse || !selectedFaculty} className="w-full bg-blue-600 hover:bg-blue-700">Assign</Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader><CardTitle>Current Assignments ({assignments.length})</CardTitle></CardHeader>
        <CardContent>
          <Input placeholder="Search assignments..." onChange={(e) => {
            const term = e.target.value.toLowerCase();
            setFilteredAssignments(assignments.filter(a =>
              a.courseName.toLowerCase().includes(term) ||
              a.courseCode.toLowerCase().includes(term) ||
              a.facultyName.toLowerCase().includes(term)
            ));
          }} className="mb-4" />

          {filteredAssignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No assignments found.</p>
          ) : (
            <div className="overflow-x-auto hide-scrollbar">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Course', 'Faculty', 'Assigned Date', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map(a => (
                    <motion.tr key={`${a.courseId}-${a.facultyId}`} whileHover={{ scale: 1.01 }} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{a.courseName} ({a.courseCode})</td>
                      <td className="px-6 py-4">{a.facultyName}</td>
                      <td className="px-6 py-4">{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => handleRemoveAssignment(a.courseId, a.facultyId)} className="text-red-600">
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
    </div>
  );
};

export default CourseAssignments;
