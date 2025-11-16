import { Route, Routes, Navigate } from 'react-router-dom'
// import Auth from '../layout/Auth.jsx'
// import Login from '../pages/auth/Login.jsx'
import Login from '../pages/auth/Login.jsx'
import ForgotPassword from '../pages/auth/ForgotPassword.jsx'
import ResetPassword from '../pages/auth/ResetPassword.jsx'
import ChangePassword from '../pages/auth/ChangePassword.jsx'

//imports auth pages

const AuthRoutes = () => {
    return (
        <>
            <Routes>
                {/* <Route element={<Auth />}> */}

                <Route path="login" element={<Login/>} />
                <Route path="forgot-password" element={<ForgotPassword/>} />
                <Route path="reset-password/:resetToken" element={<ResetPassword/>} />
                <Route path="change-password" element={<ChangePassword/>} />
                <Route path="/" element={<Navigate to="login" replace />} />
                
                {/* </Route> */}
                  
            </Routes>
        </>
    )
}

export default AuthRoutes