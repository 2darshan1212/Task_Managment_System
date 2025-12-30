const Task = require('../models/Task');

const createTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority, assignedTo } = req.body;

        if (!title || !dueDate || !assignedTo) {
            return res.status(400).json({ message: 'Title, dueDate and assignedTo are required' });
        }

        const task = await Task.create({
            title,
            description,
            dueDate,
            priority: priority || 'medium',
            assignedTo,
            createdBy: req.user._id
        });

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        // Broadcast to all clients
        const io = req.app.get('io');
        console.log('Emitting taskCreated event:', populatedTask._id);
        io.emit('taskCreated', populatedTask);

        res.status(201).json(populatedTask);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.priority && req.query.priority !== 'all') {
            filter.priority = req.query.priority;
        }
        if (req.query.status && req.query.status !== 'all') {
            filter.status = req.query.status;
        }

        const tasks = await Task.find(filter)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Task.countDocuments(filter);

        res.json({
            tasks,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalTasks: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const tasks = await Task.find({ assignedTo: req.user._id })
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Task.countDocuments({ assignedTo: req.user._id });

        res.json({
            tasks,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalTasks: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority, status, assignedTo } = req.body;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, dueDate, priority, status, assignedTo },
            { new: true }
        ).populate('assignedTo', 'name email').populate('createdBy', 'name email');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Broadcast to all clients
        const io = req.app.get('io');
        console.log('Emitting taskUpdated event:', task._id);
        io.emit('taskUpdated', task);

        res.json(task);
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Broadcast to all clients
        const io = req.app.get('io');
        console.log('Emitting taskDeleted event:', req.params.id);
        io.emit('taskDeleted', { _id: req.params.id });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['pending', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Valid status is required' });
        }

        let task;
        if (req.user.role === 'admin') {
            task = await Task.findById(req.params.id);
        } else {
            task = await Task.findOne({
                _id: req.params.id,
                assignedTo: req.user._id
            });
        }

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.status = status;
        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        // Broadcast to all clients
        const io = req.app.get('io');
        console.log('Emitting taskUpdated event (status change):', populatedTask._id);
        io.emit('taskUpdated', populatedTask);

        res.json(populatedTask);
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getMyTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus
};
