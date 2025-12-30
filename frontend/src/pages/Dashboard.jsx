import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const { token } = useAuth();

    const fetchTasks = async (page) => {
        try {
            const res = await axios.get(`/api/tasks?page=${page}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data.tasks);
            setTotalPages(res.data.totalPages);
            setCurrentPage(res.data.currentPage);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks(currentPage);
    }, [currentPage]);

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
        <div className="dashboard">
            <h2>Admin Dashboard</h2>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Due Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr key={task._id}>
                            <td>{task.title}</td>
                            <td>{formatDate(task.dueDate)}</td>
                            <td>
                                <span style={{
                                    color: getPriorityColor(task.priority),
                                    fontWeight: 'bold'
                                }}>
                                    {task.priority}
                                </span>
                            </td>
                            <td>{task.status}</td>
                            <td>{task.assignedTo?.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
