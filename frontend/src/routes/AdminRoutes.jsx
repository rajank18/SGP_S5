import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Web from '../layout/Web'
import AdminDashboard from '../pages/admin/AdminDashboard'
import FacultyManagement from '../pages/admin/FacultyManagement'
import CourseManagement from '../pages/admin/CourseManagement'
import CourseAssignments from '../pages/admin/CourseAssignments'
import StudentManagement from '../pages/admin/StudentManagement';
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AdminRubrics from '../pages/admin/Rubrics'
import AdminRubricDetails from '../pages/admin/RubricDetails'
import AdminCustomRubric from '../pages/admin/CustomRubric'
import SendMailCSV from '../components/SendMailCSV'
import ExportData from '../pages/admin/ExportData'

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowRoles={["admin"]} />}>
        <Route path="" element={<Web/>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="faculty" element={<FacultyManagement />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="assignments" element={<CourseAssignments />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="rubrics" element={<AdminRubrics />} />
          <Route path="rubrics/custom" element={<AdminCustomRubric />} />
          <Route path="rubrics/:id" element={<AdminRubricDetails />} />
          <Route path="bulk-mail" element={<SendMailCSV />} />
          <Route path="export" element={<ExportData />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AdminRoutes;