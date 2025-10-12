import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Web from '../layout/Web'
import Dashboard from '../pages/faculty/Dashboard'
import CourseDetailsPage from '../pages/faculty/CourseDetails'
import GroupDetailsPage from '../pages/faculty/GroupDetails'
import ProjectEvaluation from '../pages/faculty/ProjectEvaluation'
import ProtectedRoute from '../components/auth/ProtectedRoute'

const FacultyRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowRoles={["faculty"]} />}>
        <Route path="" element={<Web/>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="csv" element={<CourseDetailsPage />} />
          <Route path="courses/:courseCode" element={<CourseDetailsPage />} />
          <Route path="courses/:courseCode/groups/:groupNo" element={<GroupDetailsPage />} />
          <Route path="courses/:courseId/projects/:projectId/evaluate" element={<ProjectEvaluation />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default FacultyRoutes