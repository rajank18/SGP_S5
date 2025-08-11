import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlusCircle, Edit, Trash } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', departmentId: '' });
  const navigate = useNavigate();
  
  useEffect(() => { fetchFaculty(); }, []);
    // Prevent body scroll when modal is open
  useEffect(() => {
        if (isModalOpen) {
          document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        } else {
          document.body.style.overflow = 'auto';
        }
  }, [isModalOpen]);

  const fetchFaculty = async () => {
    try {
      const token = localStorage.getItem('prograde_token');
      const res = await fetch('http://localhost:3001/api/admin/faculty', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch faculty');
      setFaculty(await res.json());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('prograde_token');
      const url = editingFaculty
        ? `http://localhost:3001/api/admin/faculty/${editingFaculty.id}`
        : 'http://localhost:3001/api/admin/faculty';
      const method = editingFaculty ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, role: 'faculty' })
      });
      if (!res.ok) throw new Error('Failed to save faculty');
      toast.success(`Faculty ${editingFaculty ? 'updated' : 'added'} successfully`);
      setIsModalOpen(false);
      fetchFaculty();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Delete this faculty member?')) return;
    try {
      const token = localStorage.getItem('prograde_token');
      const res = await fetch(`http://localhost:3001/api/admin/faculty/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to delete faculty');
      toast.success('Faculty deleted');
      fetchFaculty();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-2">
        <BackButton />
      </div>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><Users /> Faculty Management</h1>
        <Button onClick={() => { setIsModalOpen(true); setEditingFaculty(null); setFormData({ name: '', email: '', departmentId: '' }); }} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-white">
          <PlusCircle /> Add Faculty
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty Members ({faculty.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {faculty.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No faculty members found.</p>
          ) : (
            <div className="overflow-x-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'Email', 'Department ID', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {faculty.map((f) => (
                    <motion.tr key={f.id} whileHover={{ scale: 1.01 }} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{f.name}</td>
                      <td className="px-6 py-4">{f.email}</td>
                      <td className="px-6 py-4">{f.departmentId || 'N/A'}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingFaculty(f); setFormData(f); setIsModalOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteFaculty(f.id)} className="text-red-600">
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
          {/* Backdrop with blur + slight dark overlay */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 min-h-screen"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal content */}
          <div className="fixed inset-0 flex justify-center items-center z-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md border-0">
              <h2 className="text-xl font-bold mb-4">
                {editingFaculty ? 'Edit Faculty' : 'Add Faculty'}
              </h2>
              <form onSubmit={handleSaveFaculty} className="space-y-4">
                {['name', 'email', 'departmentId'].map((field) => (
                  <div key={field}>
                    <label
                      htmlFor={field}
                      className="block text-sm font-medium"
                    >
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type="text"
                      id={field}
                      value={formData[field] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required={field !== 'departmentId'}
                    />
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
                  {editingFaculty ? 'Update' : 'Add'}
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

export default FacultyManagement;
