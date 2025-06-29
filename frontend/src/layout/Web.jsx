// import React from 'react'
// 

// import Footer from '../components/website/Footer' 
// 

// const Web = () => {
//   return (
//     <>
//       
//       
//       <Footer />
//     </> 
//   )
// }

// export default Web

import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/header'

const Web = () => {
  return (
    <>
    <Header />
    <Outlet />
    </>
  )
}

export default Web