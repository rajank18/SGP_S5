import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FacultyModal from '../../components/admin/FacultyModal';
import { useNavigate } from 'react-router-dom';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem('prograde_token');
      const response = await fetch('http://localhost:3001/api/admin/faculty', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch faculty');
      }
      
      const data = await response.json();
      setFaculty(data);
    } catch (error) {
      setError('Error fetching faculty: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaculty = () => {
    setModalMode('add');
    setEditingFaculty(null);
    setIsModalOpen(true);
  };

  const handleEditFaculty = (facultyMember) => {
    setModalMode('edit');
    setEditingFaculty(facultyMember);
    setIsModalOpen(true);
  };

  const handleSaveFaculty = async (formData, facultyId = null) => {
    try {
      const token = localStorage.getItem('prograde_token');
      const url = facultyId 
        ? `http://localhost:3001/api/admin/faculty/${facultyId}`
        : 'http://localhost:3001/api/admin/faculty';
      
      const method = facultyId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          role: 'faculty'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save faculty');
      }

      // Refresh the faculty list
      await fetchFaculty();
      
    } catch (error) {
      throw new Error('Failed to save faculty: ' + error.message);
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (!window.confirm('Are you sure you want to delete this faculty member? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('prograde_token');
      const response = await fetch(`http://localhost:3001/api/admin/faculty/${facultyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete faculty');
      }

      // Refresh the faculty list
      await fetchFaculty();
      
    } catch (error) {
      setError('Error deleting faculty: ' + error.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFaculty(null);
    setError('');
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
          <h1 className="text-3xl font-bold text-gray-800">Faculty Management</h1>
        </div>
        <Button onClick={handleAddFaculty} className="bg-blue-600 hover:bg-blue-700">
          + Add New Faculty
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Faculty Members ({faculty.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {faculty.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No faculty members found. Add your first faculty member to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {faculty.map((facultyMember) => (
                    <tr key={facultyMember.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {facultyMember.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facultyMember.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facultyMember.departmentId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEditFaculty(facultyMember)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteFaculty(facultyMember.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <FacultyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveFaculty}
        faculty={editingFaculty}
        mode={modalMode}
      />
    </div>
  );
};

export default FacultyManagement; 