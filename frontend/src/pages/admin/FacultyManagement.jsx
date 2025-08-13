import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Users, PlusCircle, Edit, Trash } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import BreadcrumbNavigation from "@/components/ui/BreadcrumNavigation";
import Modal from "@/components/ui/Modal";

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    departmentId: "",
    password: "",
  });
  const navigate = useNavigate();

  // --- All your data fetching and logic functions remain unchanged ---
  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isModalOpen]);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("prograde_token");
      const res = await fetch("http://localhost:3001/api/admin/faculty", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch faculty");
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
      const token = localStorage.getItem("prograde_token");
      const url = editingFaculty
        ? `http://localhost:3001/api/admin/faculty/${editingFaculty.id}`
        : "http://localhost:3001/api/admin/faculty";
      const method = editingFaculty ? "PUT" : "POST";
      const body = { ...formData, role: "faculty" };
      if (editingFaculty && !body.password) {
        delete body.password;
      }
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save faculty");
      toast.success(
        `Faculty ${editingFaculty ? "updated" : "added"} successfully`
      );
      setIsModalOpen(false);
      fetchFaculty();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm("Delete this faculty member?")) return;
    try {
      const token = localStorage.getItem("prograde_token");
      const res = await fetch(`http://localhost:3001/api/admin/faculty/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete faculty");
      toast.success("Faculty deleted");
      fetchFaculty();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- The main component render ---
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <BreadcrumbNavigation />
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Users /> Faculty Management
          </h1>
          <Button
            onClick={() => {
              setIsModalOpen(true);
              setEditingFaculty(null);
              setFormData({
                name: "",
                email: "",
                departmentId: "",
                password: "",
              });
            }}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-white"
          >
            <PlusCircle /> Add Faculty
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Faculty Members ({faculty.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Table remains the same */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    {["Name", "Email", "Department ID", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {faculty.map((f) => (
                    <motion.tr
                      key={f.id}
                      whileHover={{ scale: 1.00 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">{f.name}</td>
                      <td className="px-6 py-4">{f.email}</td>
                      <td className="px-6 py-4">{f.departmentId || "N/A"}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingFaculty(f);
                            setFormData({ ...f, password: "" });
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFaculty(f.id)}
                          className="text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* MODAL IMPLEMENTATION - CLEANED UP! */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingFaculty ? "Edit Faculty" : "Add Faculty"}
        >
          <form onSubmit={handleSaveFaculty} className="space-y-4">
            {["name", "email", "departmentId"].map((field) => (
              <div key={field}>
                <Label
                  htmlFor={field}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.charAt(0).toUpperCase() +
                    field.slice(1).replace("Id", " ID")}
                </Label>
                <Input
                  type={field === "email" ? "email" : "text"}
                  id={field}
                  name={field}
                  value={formData[field] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                  required={field !== "departmentId"}
                />
              </div>
            ))}
            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password{" "}
                {editingFaculty ? (
                  <span className="text-gray-500 text-xs">
                    (leave blank to keep unchanged)
                  </span>
                ) : (
                  ""
                )}
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingFaculty}
              />
            </div>
            {/* Styled Buttons */}
            {/* find this part in FacultyManagement.js */}

            {/* Styled Buttons - CORRECTED */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                className="w-1/2 bg-gray-200 text-gray-700 hover:bg-gray-300" // Changed from w-full
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white" // Changed from w-full
              >
                {editingFaculty ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default FacultyManagement;
