import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Web from '../layout/Web'
import Dashboard from '../pages/faculty/Dashboard'
import CourseDetailsPage from '../pages/faculty/CourseDetails'

const FacultyRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Web/>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="csv" element={<CourseDetailsPage />} />
      </Route>
    </Routes>
  );
}

export default FacultyRoutes