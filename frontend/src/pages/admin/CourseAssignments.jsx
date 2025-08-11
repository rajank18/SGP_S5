import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';

const CourseAssignments = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('prograde_token');
      
      // Fetch courses
      const coursesResponse = await fetch('http://localhost:3001/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const coursesData = await coursesResponse.json();
      setCourses(coursesData);

      // Fetch faculty
      const facultyResponse = await fetch('http://localhost:3001/api/admin/faculty', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const facultyData = await facultyResponse.json();
      setFaculty(facultyData);

      // Fetch current assignments
      await fetchAssignments();
    } catch (err) {
      setError('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('prograde_token');
      const response = await fetch('http://localhost:3001/api/admin/course-assignments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const assignmentsData = data.assignments || [];
        setAssignments(assignmentsData);
        setFilteredAssignments(assignmentsData); // Initialize filtered assignments
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };



  const handleRemoveAssignment = async (courseId, facultyId) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('prograde_token');
      const response = await fetch(`http://localhost:3001/api/admin/courses/${courseId}/faculty/${facultyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchAssignments();
        setError('');
        setSuccess('Assignment removed successfully!');
        setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to remove assignment');
      }
    } catch (err) {
      setError('Error removing assignment: ' + err.message);
    }
  };

  const handleAssignCourse = () => {
    setIsModalOpen(true);
    setSelectedCourse('');
    setSelectedFaculty('');
  };

  const handleSaveAssignment = async () => {
    if (!selectedCourse || !selectedFaculty) {
      setError('Please select both a course and a faculty member');
      return;
    }

    try {
      const token = localStorage.getItem('prograde_token');
      const requestBody = { facultyId: selectedFaculty };
      console.log('Assigning course:', { courseId: selectedCourse, facultyId: selectedFaculty });
      console.log('Request body:', requestBody);
      
      const response = await fetch(`http://localhost:3001/api/admin/courses/${selectedCourse}/faculty`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        await fetchAssignments();
        setIsModalOpen(false);
        setSelectedCourse('');
        setSelectedFaculty('');
        setError('');
        setSuccess('Course assigned successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to assign course');
        } catch (parseErr) {
          // If we can't parse JSON, show the raw response text
          const responseText = await response.text();
          console.error('Raw response:', responseText);
          setError(`Failed to assign course. Server returned: ${response.status} ${response.statusText}`);
        }
      }
    } catch (err) {
      console.error('Assignment error:', err);
      setError('Error assigning course: ' + err.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse('');
    setSelectedFaculty('');
    setError('');
  };


  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading assignments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Course Assignments</h1>
        </div>
        <Button onClick={handleAssignCourse} className="bg-blue-600 hover:bg-blue-700">
          + Assign Course to Faculty
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {/* Quick Assignment Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="course-select">Course</Label>
              <select
                id="course-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mt-1"
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="faculty-select">Faculty</Label>
              <select
                id="faculty-select"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mt-1"
              >
                <option value="">Select a faculty member</option>
                {faculty.map(facultyMember => (
                  <option key={facultyMember.id} value={facultyMember.id}>
                    {facultyMember.name} ({facultyMember.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSaveAssignment}
                disabled={!selectedCourse || !selectedFaculty}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                Assign Course
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Assign Course to Faculty</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="modal-course-select">Course</Label>
                <select
                  id="modal-course-select"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.courseCode} - {course.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="modal-faculty-select">Faculty</Label>
                <select
                  id="modal-faculty-select"
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                >
                  <option value="">Select a faculty member</option>
                  {faculty.map(facultyMember => (
                    <option key={facultyMember.id} value={facultyMember.id}>
                      {facultyMember.name} ({facultyMember.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAssignment}
                disabled={!selectedCourse || !selectedFaculty}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                Assign Course
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Assignments ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Filter */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search assignments by course code, course name, or faculty name..."
              className="max-w-md"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = assignments.filter(assignment => 
                  assignment.courseCode.toLowerCase().includes(searchTerm) ||
                  assignment.courseName.toLowerCase().includes(searchTerm) ||
                  assignment.facultyName.toLowerCase().includes(searchTerm)
                );
                setFilteredAssignments(filtered);
                if (e.target.value === '') {
                  setFilteredAssignments(assignments); // Reset to original data
                }
              }}
            />
          </div>
          
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No course assignments found. Assign courses to faculty members!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => (
                    <tr key={`${assignment.courseId}-${assignment.facultyId}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {assignment.courseName} ({assignment.courseCode})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.facultyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button 
                          onClick={() => handleRemoveAssignment(assignment.courseId, assignment.facultyId)} 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unassigned Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Unassigned Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {courses.filter(course => 
              !assignments.some(assignment => assignment.courseId === course.id)
            ).length === 0 ? (
              <p className="text-green-600 font-medium">All courses are assigned!</p>
            ) : (
              <div className="space-y-2">
                {courses.filter(course => 
                  !assignments.some(assignment => assignment.courseId === course.id)
                ).slice(0, 3).map(course => (
                  <div key={course.id} className="text-sm text-gray-600">
                    {course.courseCode} - {course.name}
                  </div>
                ))}
                {courses.filter(course => 
                  !assignments.some(assignment => assignment.courseId === course.id)
                ).length > 3 && (
                  <p className="text-xs text-gray-500">
                    +{courses.filter(course => 
                      !assignments.some(assignment => assignment.courseId === course.id)
                    ).length - 3} more unassigned courses
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Faculty Without Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {faculty.filter(facultyMember => 
              !assignments.some(assignment => assignment.facultyId === facultyMember.id)
            ).length === 0 ? (
              <p className="text-green-600 font-medium">All faculty have courses!</p>
            ) : (
              <div className="space-y-2">
                {faculty.filter(facultyMember => 
                  !assignments.some(assignment => assignment.facultyId === facultyMember.id)
                ).slice(0, 3).map(facultyMember => (
                  <div key={facultyMember.id} className="text-sm text-gray-600">
                    {facultyMember.name} ({facultyMember.email})
                  </div>
                ))}
                {faculty.filter(facultyMember => 
                  !assignments.some(assignment => assignment.facultyId === facultyMember.id)
                ).length > 3 && (
                  <p className="text-xs text-gray-500">
                    +{faculty.filter(facultyMember => 
                      !assignments.some(assignment => assignment.facultyId === facultyMember.id)
                    ).length - 3} more faculty without courses
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default CourseAssignments; 