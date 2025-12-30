const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { getUsers } = require('../controllers/userController');

router.get('/', auth, adminOnly, getUsers);

module.exports = router;
