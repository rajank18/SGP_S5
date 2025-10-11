import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Web from '../layout/Web'
import Dashboard from '../pages/faculty/Dashboard'
import CourseDetailsPage from '../pages/faculty/CourseDetails'
import GroupDetailsPage from '../pages/faculty/GroupDetails'
import RubricsPage from '../pages/faculty/Rubrics'
import RubricDetailsPage from '../pages/faculty/RubricDetails'
import CustomRubricPage from '../pages/faculty/CustomRubric'
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
          <Route path="rubrics" element={<RubricsPage />} />
          <Route path="rubrics/custom" element={<CustomRubricPage />} />
          <Route path="rubrics/:id" element={<RubricDetailsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default FacultyRoutes