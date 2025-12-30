const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { getUsers, createUser, deleteUser, updateProfile } = require('../controllers/userController');

router.get('/', auth, adminOnly, getUsers);
router.post('/', auth, adminOnly, createUser);
router.put('/profile', auth, updateProfile);
router.delete('/:id', auth, adminOnly, deleteUser);

module.exports = router;
