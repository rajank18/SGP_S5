import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Web from '../layout/Web'
import Dashboard from '../pages/faculty/Dashboard'
import CourseDetailsPage from '../pages/faculty/CourseDetails'
import GroupDetailsPage from '../pages/faculty/GroupDetails'

const FacultyRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Web/>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="csv" element={<CourseDetailsPage />} />
        <Route path="courses/:courseCode" element={<CourseDetailsPage />} />
        <Route path="courses/:courseCode/groups/:groupNo" element={<GroupDetailsPage />} />
      </Route>
    </Routes>
  );
}

export default FacultyRoutes