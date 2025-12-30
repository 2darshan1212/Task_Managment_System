import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
    const navigate = useNavigate();
    const socket = useSocket();
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTasks, setTotalTasks] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchMyTasks = useCallback(async (page) => {
        setLoading(true);
        try {
            const res = await api.get(`/tasks/my-tasks?page=${page}&limit=10`);
            setTasks(res.data.tasks || []);
            setTotalPages(res.data.totalPages || 1);
            setCurrentPage(res.data.currentPage || 1);
            setTotalTasks(res.data.totalTasks || 0);
        } catch (err) {
            console.log(err);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyTasks(currentPage);
    }, [currentPage, fetchMyTasks]);

    // Socket listeners for real-time updates
    useEffect(() => {
        if (!socket || !user) return;

        const userId = user._id || user.id;

        const handleTaskCreated = (newTask) => {
            const assignedId = newTask.assignedTo?._id || newTask.assignedTo;
            if (assignedId === userId) {
                console.log('New task assigned to me:', newTask);
                setTasks(prev => [newTask, ...prev.slice(0, 9)]);
                setTotalTasks(prev => prev + 1);
            }
        };

        const handleTaskUpdated = (updatedTask) => {
            console.log('Task updated:', updatedTask);
            setTasks(prev => prev.map(task =>
                task._id === updatedTask._id ? updatedTask : task
            ));
        };

        const handleTaskDeleted = (data) => {
            console.log('Task deleted:', data);
            setTasks(prev => {
                const filtered = prev.filter(task => task._id !== data._id);
                if (filtered.length < prev.length) {
                    setTotalTasks(t => Math.max(0, t - 1));
                }
                return filtered;
            });
        };

        socket.on('taskCreated', handleTaskCreated);
        socket.on('taskUpdated', handleTaskUpdated);
        socket.on('taskDeleted', handleTaskDeleted);

        return () => {
            socket.off('taskCreated', handleTaskCreated);
            socket.off('taskUpdated', handleTaskUpdated);
            socket.off('taskDeleted', handleTaskDeleted);
        };
    }, [socket, user]);

    const updateStatus = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
        } catch (err) {
            console.log(err);
        }
    };

    const handleViewClick = (id) => {
        navigate(`/task/${id}`);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    const getPriorityColor = (priority) => {
        if (priority === 'high') return '#e74c3c';
        if (priority === 'medium') return '#f39c12';
        return '#27ae60';
    };

    const getStatusStyle = (status) => {
        if (status === 'completed') {
            return { backgroundColor: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px' };
        }
        return { backgroundColor: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '4px' };
    };

    if (loading && tasks.length === 0) return <p>Loading...</p>;

    return (
        <div className="my-tasks">
            <h2>My Tasks ({totalTasks})</h2>
            {tasks.length === 0 ? (
                <div className="empty-state">
                    <p>No tasks assigned to you.</p>
                </div>
            ) : (
                <>
                    <div className="tasks-grid">
                        {tasks.map((task) => (
                            <div key={task._id} className="task-card-item" style={{ borderLeft: `4px solid ${getPriorityColor(task.priority)}` }}>
                                <div className="task-card-header">
                                    <h3 onClick={() => handleViewClick(task._id)}>{task.title}</h3>
                                    <span className="priority-badge-small" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                                        {task.priority}
                                    </span>
                                </div>
                                <div className="task-card-body">
                                    {task.description && (
                                        <div className="task-card-row">
                                            <span className="task-label">Description:</span>
                                            <span>{task.description}</span>
                                        </div>
                                    )}
                                    <div className="task-card-row">
                                        <span className="task-label">Due Date:</span>
                                        <span>{formatDate(task.dueDate)}</span>
                                    </div>
                                    <div className="task-card-row">
                                        <span className="task-label">Priority:</span>
                                        <span style={{ color: getPriorityColor(task.priority), fontWeight: 'bold', textTransform: 'uppercase' }}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <div className="task-card-row">
                                        <span className="task-label">Status:</span>
                                        <span
                                            style={{ ...getStatusStyle(task.status), cursor: 'pointer' }}
                                            onClick={() => updateStatus(task._id, task.status === 'pending' ? 'completed' : 'pending')}
                                        >
                                            {task.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="task-card-actions">
                                    <button onClick={() => handleViewClick(task._id)} className="view-btn">View</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || loading}>First</button>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading}>Previous</button>
                            <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages || loading}>Next</button>
                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages || loading}>Last</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Tasks;
