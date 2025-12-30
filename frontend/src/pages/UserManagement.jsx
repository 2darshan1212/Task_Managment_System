import { useState, useEffect } from 'react';
import api from '../api';
import { useSocket } from '../context/SocketContext';

const UserManagement = () => {
    const socket = useSocket();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    // Socket listeners for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleUserCreated = (newUser) => {
            setUsers(prev => [...prev, newUser]);
        };

        const handleUserDeleted = (data) => {
            setUsers(prev => prev.filter(user => (user._id || user.id) !== data._id));
        };

        socket.on('userCreated', handleUserCreated);
        socket.on('userDeleted', handleUserDeleted);

        return () => {
            socket.off('userCreated', handleUserCreated);
            socket.off('userDeleted', handleUserDeleted);
        };
    }, [socket]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('/users', formData);
            setSuccess('User created successfully');
            setShowForm(false);
            setFormData({ name: '', email: '', password: '', role: 'user' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.delete(`/users/${id}`);
                setSuccess('User deleted successfully');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="user-management">
            <div className="user-management-header">
                <h2>User Management</h2>
                <button onClick={() => setShowForm(!showForm)} className="create-btn">
                    {showForm ? 'Cancel' : '+ Add User'}
                </button>
            </div>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            {showForm && (
                <div className="user-form">
                    <h3>Create New User</h3>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength="6"
                            />
                        </div>
                        <div>
                            <label>Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="form-buttons">
                            <button type="submit">Create User</button>
                            <button type="button" onClick={() => {
                                setShowForm(false);
                                setFormData({ name: '', email: '', password: '', role: 'user' });
                                setError('');
                            }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="users-table table-container">
                <table className="users-table-desktop">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center' }}>
                                    No users found. Click "+ Add User" to create one.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id || user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${user.role}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(user._id || user.id)}
                                            className="delete-btn"
                                            title="Delete user"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="users-grid">
                {users.length === 0 ? (
                    <div className="empty-state">
                        <p>No users found. Click "+ Add User" to create one.</p>
                    </div>
                ) : (
                    users.map((user) => (
                        <div key={user._id || user.id} className="user-card">
                            <div className="user-card-header">
                                <h3>{user.name}</h3>
                                <span className={`role-badge ${user.role}`}>
                                    {user.role.toUpperCase()}
                                </span>
                            </div>
                            <div className="user-card-body">
                                <div className="user-card-row">
                                    <span className="user-label">Email:</span>
                                    <span>{user.email}</span>
                                </div>
                            </div>
                            <div className="user-card-actions">
                                <button
                                    onClick={() => handleDelete(user._id || user.id)}
                                    className="delete-btn"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserManagement;
