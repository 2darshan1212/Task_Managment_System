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
            priority,
            assignedTo,
            createdBy: req.user._id
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const tasks = await Task.find()
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Task.countDocuments();

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
        const { title, description, dueDate, priority, assignedTo } = req.body;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, dueDate, priority, assignedTo },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['pending', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Valid status is required' });
        }

        const task = await Task.findOne({
            _id: req.params.id,
            assignedTo: req.user._id
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.status = status;
        await task.save();

        res.json(task);
    } catch (error) {
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
