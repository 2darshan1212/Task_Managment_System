import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, login } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!editing) {
            return;
        }

        setError('');
        setSuccess('');

        if (password && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password && password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const updateData = { name, email };
            if (password) {
                updateData.password = password;
            }

            const res = await api.put('/users/profile', updateData);
            
            if (res.data && res.data.user) {
                const updatedUser = {
                    id: res.data.user._id || res.data.user.id || user.id,
                    _id: res.data.user._id || res.data.user.id || user._id,
                    name: res.data.user.name,
                    email: res.data.user.email,
                    role: res.data.user.role || user.role
                };

                const token = localStorage.getItem('token');
                login(updatedUser, token);
                setSuccess('Profile updated successfully');
                setPassword('');
                setConfirmPassword('');
                setEditing(false);
            } else {
                setError('Invalid response from server');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setName(user.name || '');
        setEmail(user.email || '');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
        setEditing(false);
    };

    return (
        <div className="profile-page">
            <h2>My Profile</h2>
            
            {success && <p className="success">{success}</p>}
            {error && <p className="error">{error}</p>}

            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="profile-info">
                        <h3>{user?.name || 'User'}</h3>
                        <p>{user?.email || ''}</p>
                        <span className="role-badge">{user?.role || 'user'}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div>
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!editing}
                            required={editing}
                        />
                    </div>

                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!editing}
                            required={editing}
                        />
                    </div>

                    {editing && (
                        <>
                            <div>
                                <label>New Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>

                            {password && (
                                <div>
                                    <label>Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {editing && (
                        <div className="profile-actions">
                            <button type="submit" disabled={loading} className="save-btn">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" onClick={handleCancel} className="cancel-btn">
                                Cancel
                            </button>
                        </div>
                    )}
                </form>

                {!editing && (
                    <div className="profile-actions">
                        <button type="button" onClick={() => setEditing(true)} className="edit-btn">
                            Edit Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;

