import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';

const App = () => {
    const { user } = useAuth();

    return (
        <div className="app">
            <Navbar />
            <main className="container">
                <Routes>
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                    <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                {user?.role === 'admin' ? <Dashboard /> : <Tasks />}
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute adminOnly>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/tasks"
                        element={
                            <PrivateRoute>
                                <Tasks />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
};

export default App;
