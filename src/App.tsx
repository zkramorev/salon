import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ClientDashboard from './pages/ClientDashboard'
import MasterDashboard from './pages/MasterDashboard'

function App() {
    const { user, init } = useAuth()

    useEffect(() => {
        init()
    }, [])

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
                <Route
                    path="/"
                    element={
                        user ? (
                            user.role === 'client' ? <ClientDashboard /> : <MasterDashboard />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}

export default App