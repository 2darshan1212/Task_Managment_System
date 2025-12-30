import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const { token } = useAuth();

    const fetchMyTasks = async () => {
        try {
            const res = await axios.get('/api/tasks/my-tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data.tasks);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const updateStatus = async (taskId, newStatus) => {
        try {
            await axios.patch(
                `/api/tasks/${taskId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks(tasks.map(task =>
                task._id === taskId ? { ...task, status: newStatus } : task
            ));
        } catch (err) {
            console.log(err);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="my-tasks">
            <h2>My Tasks</h2>
            {tasks.length === 0 ? (
                <p>No tasks assigned to you.</p>
            ) : (
                <div className="task-list">
                    {tasks.map((task) => (
                        <div key={task._id} className="task-item">
                            <div className="task-info">
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <p>Due: {formatDate(task.dueDate)}</p>
                                <p>Priority: {task.priority}</p>
                            </div>
                            <div className="task-status">
                                <span className={`status ${task.status}`}>
                                    {task.status}
                                </span>
                                {task.status === 'pending' ? (
                                    <button onClick={() => updateStatus(task._id, 'completed')}>
                                        Mark Complete
                                    </button>
                                ) : (
                                    <button onClick={() => updateStatus(task._id, 'pending')}>
                                        Mark Pending
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Tasks;
