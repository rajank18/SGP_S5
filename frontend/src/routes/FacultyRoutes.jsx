import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Web from '../layout/Web'
import Dashboard from '../pages/faculty/Dashboard'

const FacultyRoutes = () => {
  return (
    <Routes>
      <Route path="faculty" element={<Web/>}>
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default FacultyRoutes