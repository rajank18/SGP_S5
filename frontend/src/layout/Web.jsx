import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/header'
import Chatbot from '@/components/ChatBot'

const Web = () => {
  return (
    <>
    <Header />
    <div className="pt-16">
      <Outlet />
    </div>
    <Chatbot/>
    </>
  )
}

export default Web