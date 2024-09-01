// registration.js (or within server.js)
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('./userModel'); // Correct path to your UserModel.js


const registrationRouter = express.Router();



// Register a new user
registrationRouter.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, email, password: hashedPassword });

    try {
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

module.exports = registrationRouter;
