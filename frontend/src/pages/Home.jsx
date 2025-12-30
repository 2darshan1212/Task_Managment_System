import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const socket = useSocket();
    const [stats, setStats] = useState({
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0
    });
    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/tasks/my-tasks?page=1&limit=5');
            const tasks = res.data.tasks || [];
            setRecentTasks(tasks);
            setStats({
                totalTasks: res.data.totalTasks || 0,
                pendingTasks: tasks.filter(t => t.status === 'pending').length,
                completedTasks: tasks.filter(t => t.status === 'completed').length
            });
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Socket listeners for real-time updates
    useEffect(() => {
        if (!socket || !user) return;

        const userId = user._id || user.id;

        const handleTaskCreated = (newTask) => {
            const assignedId = newTask.assignedTo?._id || newTask.assignedTo;
            if (assignedId === userId) {
                console.log('Home: New task assigned to me:', newTask);
                setRecentTasks(prev => [newTask, ...prev.slice(0, 4)]);
                setStats(prev => ({
                    ...prev,
                    totalTasks: prev.totalTasks + 1,
                    pendingTasks: newTask.status === 'pending' ? prev.pendingTasks + 1 : prev.pendingTasks,
                    completedTasks: newTask.status === 'completed' ? prev.completedTasks + 1 : prev.completedTasks
                }));
            }
        };

        const handleTaskUpdated = (updatedTask) => {
            console.log('Home: Task updated:', updatedTask);
            setRecentTasks(prev => {
                const updated = prev.map(task =>
                    task._id === updatedTask._id ? updatedTask : task
                );
                // Recalculate stats from updated tasks
                const pending = updated.filter(t => t.status === 'pending').length;
                const completed = updated.filter(t => t.status === 'completed').length;
                setStats(s => ({ ...s, pendingTasks: pending, completedTasks: completed }));
                return updated;
            });
        };

        const handleTaskDeleted = (data) => {
            console.log('Home: Task deleted:', data);
            setRecentTasks(prev => {
                const task = prev.find(t => t._id === data._id);
                if (task) {
                    setStats(s => ({
                        ...s,
                        totalTasks: Math.max(0, s.totalTasks - 1),
                        pendingTasks: task.status === 'pending' ? Math.max(0, s.pendingTasks - 1) : s.pendingTasks,
                        completedTasks: task.status === 'completed' ? Math.max(0, s.completedTasks - 1) : s.completedTasks
                    }));
                }
                return prev.filter(t => t._id !== data._id);
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

    const getPriorityColor = (priority) => {
        if (priority === 'high') return '#e74c3c';
        if (priority === 'medium') return '#f39c12';
        return '#27ae60';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="home-page">
            <h2>Welcome, {user?.name}!</h2>
            
            <div className="home-stats">
                <div className="stat-card">
                    <h4>Total Tasks</h4>
                    <p>{stats.totalTasks}</p>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #fff3cd' }}>
                    <h4>Pending</h4>
                    <p>{stats.pendingTasks}</p>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #d4edda' }}>
                    <h4>Completed</h4>
                    <p>{stats.completedTasks}</p>
                </div>
            </div>

            <div className="home-section">
                <div className="section-header">
                    <h3>Recent Tasks</h3>
                    <button onClick={() => navigate('/tasks')} className="view-all-btn">
                        View All Tasks
                    </button>
                </div>

                {recentTasks.length === 0 ? (
                    <div className="empty-state">
                        <p>No tasks assigned to you yet.</p>
                    </div>
                ) : (
                    <div className="tasks-grid">
                        {recentTasks.map((task) => (
                            <div 
                                key={task._id} 
                                className="task-card-item" 
                                style={{ borderLeft: `4px solid ${getPriorityColor(task.priority)}` }}
                                onClick={() => navigate(`/task/${task._id}`)}
                            >
                                <div className="task-card-header">
                                    <h3>{task.title}</h3>
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
                                        <span className="task-label">Status:</span>
                                        <span style={{
                                            backgroundColor: task.status === 'completed' ? '#d4edda' : '#fff3cd',
                                            color: task.status === 'completed' ? '#155724' : '#856404',
                                            padding: '4px 8px',
                                            borderRadius: '4px'
                                        }}>
                                            {task.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;

