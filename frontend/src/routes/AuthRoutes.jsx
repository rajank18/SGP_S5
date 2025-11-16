import React, { Suspense, useState, useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

// Runtime loader component: imports the page when mounted and renders it.
const createAsyncComponent = (loader) => {
    return function AsyncComponent(props) {
        const [Comp, setComp] = useState(null)

        useEffect(() => {
            let mounted = true
            loader()
                .then((m) => {
                    const C = m && (m.default || m)
                    if (mounted) setComp(() => C)
                })
                .catch((err) => {
                    console.error('Failed to load component', err)
                })
            return () => {
                mounted = false
            }
        }, [])

        if (!Comp) return <div className="p-6 text-center">Loading...</div>
        const Loaded = Comp
        return <Loaded {...props} />
    }
}

const Login = createAsyncComponent(() => import('../pages/auth/Login.jsx'))
const ForgotPassword = createAsyncComponent(() => import('../pages/auth/ForgotPassword.jsx'))
const ResetPassword = createAsyncComponent(() => import('../pages/auth/ResetPassword.jsx'))
const ChangePassword = createAsyncComponent(() => import('../pages/auth/ChangePassword.jsx'))

const AuthRoutes = () => {
    return (
        <>
            <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
                <Routes>
                    <Route path="login" element={<Login />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password/:resetToken" element={<ResetPassword />} />
                    <Route path="change-password" element={<ChangePassword />} />
                    <Route path="/" element={<Navigate to="login" replace />} />
                </Routes>
            </Suspense>
        </>
    )
}

export default AuthRoutes