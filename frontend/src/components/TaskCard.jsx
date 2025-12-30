const TaskCard = ({ task, onStatusChange }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    const getPriorityColor = (priority) => {
        if (priority === 'high') return '#e74c3c';
        if (priority === 'medium') return '#f39c12';
        return '#27ae60';
    };

    return (
        <div className="task-card">
            <div className="task-header">
                <h3>{task.title}</h3>
                <span
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                >
                    {task.priority}
                </span>
            </div>
            <p className="task-description">{task.description}</p>
            <div className="task-meta">
                <span>Due: {formatDate(task.dueDate)}</span>
                <span className={`status ${task.status}`}>{task.status}</span>
            </div>
            {onStatusChange && (
                <div className="task-actions">
                    {task.status === 'pending' ? (
                        <button onClick={() => onStatusChange(task._id, 'completed')}>
                            Mark Complete
                        </button>
                    ) : (
                        <button onClick={() => onStatusChange(task._id, 'pending')}>
                            Mark Pending
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskCard;
