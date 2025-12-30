const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const {
    createTask,
    getAllTasks,
    getMyTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus
} = require('../controllers/taskController');

router.post('/', auth, adminOnly, createTask);
router.get('/', auth, adminOnly, getAllTasks);
router.get('/my-tasks', auth, getMyTasks);
router.get('/:id', auth, getTaskById);
router.put('/:id', auth, adminOnly, updateTask);
router.delete('/:id', auth, adminOnly, deleteTask);
router.patch('/:id/status', auth, updateTaskStatus);

module.exports = router;
