import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom'
import AuthRoutes from "../routes/AuthRoutes"
import AdminRoutes from './AdminRoutes'
import FacultyRoutes from './FacultyRoutes'
import StudentRoutes from './StudentRoutes'


const Navigation = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path='/' element={<Navigate to="/auth/login" replace />} />
                    <Route path='/auth/*' element={<AuthRoutes />} />
                    <Route path='/admin/*' element={<AdminRoutes />} />
                    <Route path='/faculty/*' element={<FacultyRoutes />} />
                    <Route path='/student/*' element={<StudentRoutes />} />
                    <Route path='/*' element={<Navigate to="/auth/login" replace />} />
                </Routes>
            </Router>
        </>
    )
}

export default Navigation