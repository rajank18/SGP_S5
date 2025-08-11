import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FacultyModal = ({ isOpen, onClose, onSave, faculty = null, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    name: faculty?.name || '',
    email: faculty?.email || '',
    password: faculty?.password || '',
    departmentId: faculty?.departmentId || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave(formData, faculty?.id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 min-h-screen">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {mode === 'add' ? 'Add New Faculty' : 'Edit Faculty'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-700">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full"
              placeholder="Enter faculty name"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700">
              {mode === 'add' ? 'Password' : 'Password (leave blank to keep current)'}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required={mode === 'add'}
              value={formData.password}
              onChange={handleChange}
              className="w-full"
              placeholder={mode === 'add' ? 'Enter password' : 'Enter new password'}
            />
          </div>

          <div>
            <Label htmlFor="departmentId" className="text-gray-700">Department ID</Label>
            <Input
              id="departmentId"
              name="departmentId"
              type="number"
              value={formData.departmentId}
              onChange={handleChange}
              className="w-full"
              placeholder="Enter department ID"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'add' ? 'Add Faculty' : 'Update Faculty'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyModal; 