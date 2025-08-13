import AuthHeader from '@/components/auth/AuthHeader'
import Header from '@/components/header'
import React from 'react'
import { Outlet } from 'react-router-dom'

const Auth = () => {
  return (
    <>
     <AuthHeader/>
     <div className="pt-32">
       <Outlet />
     </div>
    </>
  )
}

export default Auth