import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, ClipboardList, UserPlus, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import BreadcrumbNavigation from '../../components/ui/BreadcrumNavigation'; // Import the new component
import { motion } from 'framer-motion'
import apiFetch from '@/lib/api'

const StatCard = ({ title, value, icon: Icon, iconBgColor, onClick, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay }}>
    <Card className="shadow-sm hover:shadow-md transition-all cursor-pointer bg-blue-50 border border-transparent hover:border-blue-200" onClick={onClick}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-full ${iconBgColor}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [rubricsCount, setRubricsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- No changes to your data fetching logic ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('prograde_token');
      const headers = { Authorization: `Bearer ${token}` };
      const [coursesRes, facultyRes, assignmentsRes, rubricsRes] = await Promise.all([
        apiFetch('/api/admin/courses', { headers }),
        apiFetch('/api/admin/faculty', { headers }),
        apiFetch('/api/admin/course-assignments', { headers }),
        apiFetch('/api/rubrics', { headers }),
      ]);
      setCourses(await coursesRes.json());
      setFaculty(await facultyRes.json());
      const assignmentData = await assignmentsRes.json();
      const rubricsData = await rubricsRes.json();
      setAssignments(assignmentData.assignments || []);
      setRubricsCount((rubricsData?.rubrics || []).length);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600">Welcome back! Here's an overview of your institution.</p>
        </div>

        {/* The rest of your component remains the same... */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard 
            title="Courses" 
            value={courses.length} 
            icon={BookOpen} 
            iconBgColor="bg-blue-500" 
            onClick={() => navigate('/admin/courses')} 
            delay={0.02}
          />
          <StatCard 
            title="Faculty" 
            value={faculty.length} 
            icon={Users} 
            iconBgColor="bg-emerald-500"
            onClick={() => navigate('/admin/faculty')} 
            delay={0.02}
          />
          <StatCard 
            title="Course Assignments" 
            value={assignments.length} 
            icon={ClipboardList} 
            iconBgColor="bg-purple-500"
            onClick={() => navigate('/admin/assignments')} 
            delay={0.02}
          />
          <StatCard 
            title="Rubrics" 
            value={rubricsCount}
            icon={ClipboardList} 
            iconBgColor="bg-indigo-500"
            onClick={() => navigate('/admin/rubrics')} 
            delay={0.02}
          />
          <StatCard 
            title="Upload" 
            value="Students" 
            icon={UserPlus} 
            iconBgColor="bg-pink-500"
            onClick={() => navigate('/admin/students')} 
            delay={0.02}
          />
          <StatCard 
            title="Export" 
            value="Data" 
            icon={Download} 
            iconBgColor="bg-orange-500"
            onClick={() => navigate('/admin/export')} 
            delay={0.02}
          />
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Recent Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-gray-500">No courses found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="bg-blue-100 text-xs text-gray-600 uppercase">
                    <tr>
                      {['Course Code', 'Name', 'Semester', 'Year'].map((header) => (
                        <th key={header} scope="col" className="px-6 py-3 border-b-0">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {courses.slice(0, 5).map((course) => (
                      <tr 
                        key={course.id} 
                        className="odd:bg-white even:bg-blue-50 hover:bg-blue-100 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 font-medium border-b-0">{course.courseCode}</td>
                        <td className="px-6 py-4 border-b-0">{course.name}</td>
                        <td className="px-6 py-4 border-b-0">{course.semester}</td>
                        <td className="px-6 py-4 border-b-0">{course.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;