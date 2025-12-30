import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const TaskDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const socket = useSocket();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTask();
    }, [id]);

    const fetchTask = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/tasks/${id}`);
            setTask(res.data);
        } catch (err) {
            setError('Task not found');
        } finally {
            setLoading(false);
        }
    };

    // Socket listeners for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleTaskUpdated = (updatedTask) => {
            if (updatedTask._id === id) {
                setTask(updatedTask);
            }
        };

        const handleTaskDeleted = (data) => {
            if (data._id === id) {
                navigate(-1);
            }
        };

        socket.on('taskUpdated', handleTaskUpdated);
        socket.on('taskDeleted', handleTaskDeleted);

        return () => {
            socket.off('taskUpdated', handleTaskUpdated);
            socket.off('taskDeleted', handleTaskDeleted);
        };
    }, [socket, id, navigate]);

    const handleStatusToggle = async () => {
        const newStatus = task.status === 'pending' ? 'completed' : 'pending';
        try {
            await api.patch(`/tasks/${id}/status`, { status: newStatus });
        } catch (err) {
            console.log(err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await api.delete(`/tasks/${id}`);
                navigate('/dashboard');
            } catch (err) {
                console.log(err);
            }
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getPriorityColor = (priority) => {
        if (priority === 'high') return '#e74c3c';
        if (priority === 'medium') return '#f39c12';
        return '#27ae60';
    };

    const getStatusStyle = (status) => {
        if (status === 'completed') {
            return { backgroundColor: '#d4edda', color: '#155724' };
        }
        return { backgroundColor: '#fff3cd', color: '#856404' };
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!task) return <p>Task not found</p>;

    return (
        <div className="task-details">
            <div className="task-details-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    Back
                </button>
                <h2>Task Details</h2>
            </div>

            <div className="task-details-card">
                <div className="task-details-title">
                    <h3>{task.title}</h3>
                    <span
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                        {task.priority} priority
                    </span>
                </div>

                <div className="task-details-info">
                    <div className="info-row">
                        <label>Description:</label>
                        <p>{task.description || 'No description provided'}</p>
                    </div>

                    <div className="info-row">
                        <label>Due Date:</label>
                        <p>{formatDate(task.dueDate)}</p>
                    </div>

                    <div className="info-row">
                        <label>Status:</label>
                        <span
                            style={{
                                ...getStatusStyle(task.status),
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                textTransform: 'capitalize'
                            }}
                        >
                            {task.status}
                        </span>
                    </div>

                    <div className="info-row">
                        <label>Assigned To:</label>
                        <p>{task.assignedTo?.name || 'Unassigned'} ({task.assignedTo?.email})</p>
                    </div>

                    <div className="info-row">
                        <label>Created By:</label>
                        <p>{task.createdBy?.name || 'Unknown'}</p>
                    </div>

                    <div className="info-row">
                        <label>Created At:</label>
                        <p>{formatDate(task.createdAt)}</p>
                    </div>
                </div>

                <div className="task-details-actions">
                    <button onClick={handleStatusToggle} className="status-btn">
                        Mark as {task.status === 'pending' ? 'Completed' : 'Pending'}
                    </button>
                    {user?.role === 'admin' && (
                        <>
                            <button onClick={() => navigate(`/edit-task/${task._id}`)} className="edit-btn">
                                Edit Task
                            </button>
                            <button onClick={handleDelete} className="delete-btn">
                                Delete Task
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
