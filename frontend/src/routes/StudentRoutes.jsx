import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Web from '../layout/Web'
import StuDashboard from '../pages/student/StuDashboard'
import StudentProjectDetails from '../pages/student/StudentProjectDetails'
import ProtectedRoute from '../components/auth/ProtectedRoute'

const StudentRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowRoles={["student"]} />}>
        <Route path="" element={<Web/>}>
          <Route path="dashboard" element={<StuDashboard />} />
          <Route path="projects/:projectId" element={<StudentProjectDetails />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default StudentRoutes