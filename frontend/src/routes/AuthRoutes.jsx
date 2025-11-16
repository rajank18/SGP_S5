import React, { Suspense, lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

// Lazy-load auth pages to avoid top-level import/reference errors in production bundles
const Login = lazy(() => import('../pages/auth/Login.jsx'))
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword.jsx'))
const ChangePassword = lazy(() => import('../pages/auth/ChangePassword.jsx'))

//imports auth pages

const AuthRoutes = () => {
    return (
        <>
            <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
                <Routes>
                    {/* <Route element={<Auth />}> */}

                    <Route path="login" element={<Login/>} />
                    <Route path="forgot-password" element={<ForgotPassword/>} />
                    <Route path="reset-password/:resetToken" element={<ResetPassword/>} />
                    <Route path="change-password" element={<ChangePassword/>} />
                    <Route path="/" element={<Navigate to="login" replace />} />
                    
                    {/* </Route> */}
                      
                </Routes>
            </Suspense>
        </>
    )
}

export default AuthRoutes