import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, ClipboardList, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('prograde_token');
      
      const [coursesRes, facultyRes, assignmentsRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/courses', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/admin/faculty', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/admin/course-assignments', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setCourses(await coursesRes.json());
      setFaculty(await facultyRes.json());
      const assignmentData = await assignmentsRes.json();
      setAssignments(assignmentData.assignments || []);

    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;
  }

  const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
    <motion.div whileHover={{ scale: 1.03 }}>
      <Card className={`bg-gradient-to-r ${color} text-white shadow-lg cursor-pointer`} onClick={onClick}>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5" /> {title}
          </CardTitle>
          <span className="text-green-200 text-sm flex items-center gap-1">
            <ArrowUp className="h-4 w-4" /> 12%
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Courses" value={courses.length} icon={BookOpen} color="from-blue-500 to-blue-600" onClick={() => navigate('/admin/courses')} />
        <StatCard title="Faculty" value={faculty.length} icon={Users} color="from-green-500 to-green-600" onClick={() => navigate('/admin/faculty')} />
        <StatCard title="Assignments" value={assignments.length} icon={ClipboardList} color="from-purple-500 to-purple-600" onClick={() => navigate('/admin/assignments')} />
      </div>

      {/* Recent Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-gray-500">No courses found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {['Course Code', 'Name', 'Semester', 'Year', 'Status'].map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.slice(0, 5).map(course => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{course.courseCode}</td>
                      <td className="px-6 py-4">{course.name}</td>
                      <td className="px-6 py-4">{course.semester}</td>
                      <td className="px-6 py-4">{course.year}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${course.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {course.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
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

export default AdminDashboard;
