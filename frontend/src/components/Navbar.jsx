import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMenuOpen(false);
    };

    const handleLinkClick = () => {
        setMenuOpen(false);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" onClick={handleLinkClick} className="navbar-brand-link">
                    <img src="/logo.svg" alt="Task Manager" className="navbar-logo" />
                    <span>Task Manager</span>
                </Link>
            </div>
            <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <>
                                <Link to="/dashboard" onClick={handleLinkClick}>Dashboard</Link>
                                <Link to="/users" onClick={handleLinkClick}>Users</Link>
                            </>
                        )}
                        {user.role === 'user' && (
                            <Link to="/tasks" onClick={handleLinkClick}>My Tasks</Link>
                        )}
                        <Link to="/profile" onClick={handleLinkClick}>Profile</Link>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" onClick={handleLinkClick}>Login</Link>
                        <Link to="/register" onClick={handleLinkClick}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
