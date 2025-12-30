import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const EditTask = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('pending');
    const [assignedTo, setAssignedTo] = useState('');
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchUsers();
        fetchTask();
    }, [id]);

    const fetchTask = async () => {
        try {
            const res = await api.get(`/tasks/${id}`);
            const task = res.data;
            setTitle(task.title);
            setDescription(task.description || '');
            setDueDate(task.dueDate?.split('T')[0] || '');
            setPriority(task.priority);
            setStatus(task.status);
            setAssignedTo(task.assignedTo?._id || '');
        } catch (err) {
            setError('Task not found');
        } finally {
            setFetching(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.put(`/tasks/${id}`, {
                title,
                description,
                dueDate,
                priority,
                status,
                assignedTo
            });
            navigate(`/task/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update task');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <p>Loading...</p>;

    return (
        <div className="edit-task-page">
            <div className="task-details-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    ← Back
                </button>
                <h2>Edit Task</h2>
            </div>

            <div className="task-form">
                <form onSubmit={handleSubmit}>
                    {error && <p className="error">{error}</p>}

                    <div>
                        <label>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                        />
                    </div>

                    <div>
                        <label>Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label>Priority</label>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div>
                        <label>Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label>Assign To</label>
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            required
                        >
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name} ({user.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Update Task'}
                        </button>
                        <button type="button" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTask;
