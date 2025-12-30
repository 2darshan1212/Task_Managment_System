const User = require('../models/User');

const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('name email');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getUsers };
