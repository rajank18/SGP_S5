import AuthHeader from '@/components/auth/AuthHeader'
import Header from '@/components/header'
import React from 'react'
import { Outlet } from 'react-router-dom'

const Auth = () => {
  return (
    <>
     <AuthHeader/>
     <Outlet />
    </>
  )
}

export default Auth