import { Route, Routes, Navigate } from 'react-router-dom'
import Auth from '../layout/Auth'
import Login from '../pages/auth/Login'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
import ChangePassword from '../pages/auth/ChangePassword'

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