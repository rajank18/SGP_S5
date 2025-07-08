import { Route, Routes } from 'react-router-dom'
import Auth from '../layout/Auth'
import Login from '../pages/auth/login'

//imports auth pages

const AuthRoutes = () => {
    return (
        <>
            <Routes>
                <Route element={<Auth />}>

                <Route path="login" element={<Login/>} />
                
                
                </Route>
                  
            </Routes>
        </>
    )
}

export default AuthRoutes