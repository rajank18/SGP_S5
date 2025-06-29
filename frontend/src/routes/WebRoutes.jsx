import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Web from '../layout/Web'
import Homepage from '../pages/web/Home'

//import web pages here

const WebRoutes = () => {
  return (
    <>
      <Routes>
        <Route element={<Web/>}>
          
            {/*------------------------------------------------------------Homepage Route-------------------------------------------------------*/}
            <Route path="home" element={<Homepage />} />
            </Route>
             
      </Routes>
    </>
  );
}

export default WebRoutes