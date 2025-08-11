import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

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
      
      // Fetch courses
      const coursesResponse = await fetch('http://localhost:3001/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const coursesData = await coursesResponse.json();
      setCourses(coursesData);

      // Fetch faculty
      const facultyResponse = await fetch('http://localhost:3001/api/admin/faculty', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const facultyData = await facultyResponse.json();
      setFaculty(facultyData);

      // Fetch assignments
      await fetchAssignments();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('prograde_token');
      const response = await fetch('http://localhost:3001/api/admin/course-assignments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Courses Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{courses.length}</div>
            <p className="text-gray-600">Total Courses</p>
            <Button 
              className="mt-4 w-full" 
              variant="outline"
              onClick={() => navigate('/admin/courses')}
            >
              Manage Courses
            </Button>
          </CardContent>
        </Card>

        {/* Faculty Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{faculty.length}</div>
            <p className="text-gray-600">Total Faculty</p>
            <Button 
              className="mt-4 w-full" 
              variant="outline"
              onClick={() => navigate('/admin/faculty')}
            >
              Manage Faculty
            </Button>
          </CardContent>
        </Card>

        {/* Course Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600">Course Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-purple-600">
                {assignments.length}
              </div>
              <p className="text-sm text-gray-600">Active Assignments</p>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => navigate('/admin/assignments')}
            >
              Assign Courses to Faculty
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Courses</h2>
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.slice(0, 5).map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.courseCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.year}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 