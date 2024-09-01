const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { collection: 'users' }); // Explicitly specify the collection name

// Check if the User model already exists
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
