import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, ClipboardList, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import BreadcrumbNavigation from '../../components/ui/BreadcrumNavigation'; // Import the new component

// StatCard component remains the same
const StatCard = ({ title, value, icon: Icon, iconBgColor, onClick }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-blue-50" onClick={onClick}>
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
);

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [assignments, setAssignments] = useState([]);
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
      const [coursesRes, facultyRes, assignmentsRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/courses', { headers }),
        fetch('http://localhost:3001/api/admin/faculty', { headers }),
        fetch('http://localhost:3001/api/admin/course-assignments', { headers })
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
          />
          <StatCard 
            title="Faculty" 
            value={faculty.length} 
            icon={Users} 
            iconBgColor="bg-emerald-500"
            onClick={() => navigate('/admin/faculty')} 
          />
          <StatCard 
            title="Assignments" 
            value={assignments.length} 
            icon={ClipboardList} 
            iconBgColor="bg-purple-500"
            onClick={() => navigate('/admin/assignments')} 
          />
          <StatCard 
            title="Bulk Upload" 
            value="Students" 
            icon={UserPlus} 
            iconBgColor="bg-pink-500"
            onClick={() => navigate('/admin/students')} 
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
                  <thead className="bg-blue-50 text-xs text-gray-600 uppercase">
                    <tr>
                      {['Course Code', 'Name', 'Semester', 'Year', 'Status'].map((header) => (
                        <th key={header} scope="col" className="px-6 py-3">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {courses.slice(0, 5).map((course) => (
                      <tr key={course.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{course.courseCode}</td>
                        <td className="px-6 py-4">{course.name}</td>
                        <td className="px-6 py-4">{course.semester}</td>
                        <td className="px-6 py-4">{course.year}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            course.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }`}>
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
    </div>
  );
};

export default AdminDashboard;