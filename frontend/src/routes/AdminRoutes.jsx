import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Web from '../layout/Web'
import AdminDashboard from '../pages/admin/AdminDashboard'
import FacultyManagement from '../pages/admin/FacultyManagement'

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Web/>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="faculty" element={<FacultyManagement />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes 