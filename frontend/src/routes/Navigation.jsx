import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import AuthRoutes from "../routes/AuthRoutes"
import StudentRoutes from './StudentRoutes'
import FacultyRoutes from './FacultyRoutes'


const Navigation = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path='/auth/*' element={<AuthRoutes />} />
                    <Route path='/*' element={<FacultyRoutes />} />
                    <Route path='/student/*' element={<StudentRoutes />} />
                    
                </Routes>
            </Router>
        </>
    )
}

export default Navigation