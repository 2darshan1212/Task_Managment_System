import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import TaskForm from '../components/TaskForm';
import { useSocket } from '../context/SocketContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const socket = useSocket();
    const [tasks, setTasks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTasks, setTotalTasks] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchTasks = useCallback(async (page) => {
        setLoading(true);
        try {
            let url = `/tasks?page=${page}&limit=10`;
            if (filterPriority !== 'all') {
                url += `&priority=${filterPriority}`;
            }
            if (filterStatus !== 'all') {
                url += `&status=${filterStatus}`;
            }
            const res = await api.get(url);
            setTasks(res.data.tasks || []);
            setTotalPages(res.data.totalPages || 1);
            setCurrentPage(res.data.currentPage || 1);
            setTotalTasks(res.data.totalTasks || 0);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }, [filterPriority, filterStatus]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterPriority, filterStatus]);

    useEffect(() => {
        fetchTasks(currentPage);
    }, [currentPage, fetchTasks]);

    // Socket listeners for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleTaskCreated = (newTask) => {
            console.log('Task created:', newTask);
            setTasks(prev => [newTask, ...prev.slice(0, 9)]);
            setTotalTasks(prev => prev + 1);
        };

        const handleTaskUpdated = (updatedTask) => {
            console.log('Task updated:', updatedTask);
            setTasks(prev => prev.map(task =>
                task._id === updatedTask._id ? updatedTask : task
            ));
        };

        const handleTaskDeleted = (data) => {
            console.log('Task deleted:', data);
            setTasks(prev => prev.filter(task => task._id !== data._id));
            setTotalTasks(prev => Math.max(0, prev - 1));
        };

        socket.on('taskCreated', handleTaskCreated);
        socket.on('taskUpdated', handleTaskUpdated);
        socket.on('taskDeleted', handleTaskDeleted);

        return () => {
            socket.off('taskCreated', handleTaskCreated);
            socket.off('taskUpdated', handleTaskUpdated);
            socket.off('taskDeleted', handleTaskDeleted);
        };
    }, [socket]);

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

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await api.delete(`/tasks/${id}`);
            } catch (err) {
                alert('Failed to delete task');
            }
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
        try {
            await api.patch(`/tasks/${id}/status`, { status: newStatus });
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handlePriorityChange = async (id, newPriority) => {
        try {
            const task = tasks.find(t => t._id === id);
            if (!task) return;

            await api.put(`/tasks/${id}`, {
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                priority: newPriority,
                status: task.status,
                assignedTo: task.assignedTo?._id || task.assignedTo
            });
        } catch (err) {
            alert('Failed to update priority');
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditTask(null);
    };

    const handleCreateClick = () => {
        setEditTask(null);
        setShowForm(true);
    };

    const handleEditClick = (task) => {
        navigate(`/edit-task/${task._id}`);
    };

    const handleViewClick = (id) => {
        navigate(`/task/${id}`);
    };

    if (loading && tasks.length === 0) return <p>Loading...</p>;

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Admin Dashboard</h2>
                <button onClick={handleCreateClick}>+ Create Task</button>
            </div>

            {showForm && (
                <TaskForm
                    task={editTask}
                    onSuccess={handleFormSuccess}
                    onCancel={() => { setShowForm(false); setEditTask(null); }}
                />
            )}

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h4>Total Tasks</h4>
                    <p>{totalTasks}</p>
                </div>
                <div className="stat-card high">
                    <h4>High Priority</h4>
                    <p>{tasks.filter(t => t.priority === 'high').length}</p>
                </div>
                <div className="stat-card medium">
                    <h4>Medium Priority</h4>
                    <p>{tasks.filter(t => t.priority === 'medium').length}</p>
                </div>
                <div className="stat-card low">
                    <h4>Low Priority</h4>
                    <p>{tasks.filter(t => t.priority === 'low').length}</p>
                </div>
            </div>

            <div className="dashboard-filters">
                <div className="filter-group">
                    <label>Filter by Priority:</label>
                    <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Filter by Status:</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {tasks.length === 0 ? (
                <div className="empty-state">
                    <p>No tasks found. Click "+ Create Task" to add your first task.</p>
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
                                    <div className="task-card-row">
                                        <span className="task-label">Due Date:</span>
                                        <span>{formatDate(task.dueDate)}</span>
                                    </div>
                                    <div className="task-card-row">
                                        <span className="task-label">Assigned To:</span>
                                        <span>{task.assignedTo?.name || 'Unassigned'}</span>
                                    </div>
                                    <div className="task-card-row">
                                        <span className="task-label">Priority:</span>
                                        <select
                                            value={task.priority}
                                            onChange={(e) => handlePriorityChange(task._id, e.target.value)}
                                            className="priority-select"
                                            style={{ borderColor: getPriorityColor(task.priority) }}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="task-card-row">
                                        <span className="task-label">Status:</span>
                                        <span
                                            style={{ ...getStatusStyle(task.status), cursor: 'pointer' }}
                                            onClick={() => handleStatusToggle(task._id, task.status)}
                                        >
                                            {task.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="task-card-actions">
                                    <button onClick={() => handleViewClick(task._id)} className="view-btn">View</button>
                                    <button onClick={() => handleEditClick(task)} className="edit-btn">Edit</button>
                                    <button onClick={() => handleDelete(task._id)} className="delete-btn">Delete</button>
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

export default Dashboard;
