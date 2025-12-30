import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import EditTask from './pages/EditTask';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';

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
                                {user?.role === 'admin' ? <Dashboard /> : <Home />}
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
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/task/:id"
                        element={
                            <PrivateRoute>
                                <TaskDetails />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/edit-task/:id"
                        element={
                            <PrivateRoute adminOnly>
                                <EditTask />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <PrivateRoute adminOnly>
                                <UserManagement />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
};

export default App;
