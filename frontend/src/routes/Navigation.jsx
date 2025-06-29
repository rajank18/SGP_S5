import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import AuthRoutes from "../routes/AuthRoutes"
import WebRoutes from "../routes/WebRoutes"


const Navigation = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path='/auth/*' element={<AuthRoutes />} />
                    <Route path='/*' element={<WebRoutes />} />
                    
                </Routes>
            </Router>
        </>
    )
}

export default Navigation