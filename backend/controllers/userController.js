const User = require('../models/User');

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('name email role');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name email role');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user'
        });

        const newUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        // Broadcast to all clients
        const io = req.app.get('io');
        console.log('Emitting userCreated event:', newUser._id);
        io.emit('userCreated', newUser);

        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last admin' });
            }
        }

        await User.findByIdAndDelete(req.params.id);

        // Broadcast to all clients
        const io = req.app.get('io');
        console.log('Emitting userDeleted event:', req.params.id);
        io.emit('userDeleted', { _id: req.params.id });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        user.name = name;
        user.email = email;
        if (password) {
            user.password = password;
        }

        await user.save();

        const updatedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

module.exports = { getUsers, getUserById, createUser, deleteUser, updateProfile };
