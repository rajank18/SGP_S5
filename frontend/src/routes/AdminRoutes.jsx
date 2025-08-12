import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Web from '../layout/Web'
import AdminDashboard from '../pages/admin/AdminDashboard'
import FacultyManagement from '../pages/admin/FacultyManagement'
import CourseManagement from '../pages/admin/CourseManagement'
import CourseAssignments from '../pages/admin/CourseAssignments'
import StudentManagement from '../pages/admin/StudentManagement';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Web/>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="faculty" element={<FacultyManagement />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="assignments" element={<CourseAssignments />} />
        <Route path="students" element={<StudentManagement />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes 