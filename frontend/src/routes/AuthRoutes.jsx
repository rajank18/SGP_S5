import { Route, Routes } from 'react-router-dom'
import Auth from '../layout/Auth'
//imports auth pages

const AuthRoutes = () => {
    return (
        <>
            <Routes>
                <Route element={<Auth />}>
                
                
                </Route>
                  
            </Routes>
        </>
    )
}

export default AuthRoutes