import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Web from '../layout/Web'
import StuDashboard from '../pages/student/StuDashboard'

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Web/>}>
        <Route path="dashboard" element={<StuDashboard />} />
      </Route>
    </Routes>
  );
}

export default StudentRoutes