import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Web from '../layout/Web'
import Dashboard from '../pages/faculty/Dashboard'
import CourseDetailsPage from '../pages/faculty/CourseDetails'
import GroupDetailsPage from '../pages/faculty/GroupDetails'
import RubricsPage from '../pages/faculty/Rubrics'
import RubricDetailsPage from '../pages/faculty/RubricDetails'

const FacultyRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<Web/>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="csv" element={<CourseDetailsPage />} />
        <Route path="courses/:courseCode" element={<CourseDetailsPage />} />
        <Route path="courses/:courseCode/groups/:groupNo" element={<GroupDetailsPage />} />
        <Route path="rubrics" element={<RubricsPage />} />
        <Route path="rubrics/:id" element={<RubricDetailsPage />} />
      </Route>
    </Routes>
  );
}

export default FacultyRoutes