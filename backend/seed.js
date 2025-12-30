const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        await User.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        });

        console.log('Admin created successfully');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.log('Error:', error.message);
        process.exit(1);
    }
};

seedAdmin();
