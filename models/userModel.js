const mongoose = require('mongoose');
const validator = require('validator');

const user = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is a mandatory field'],
    },
    email: {
        type: String,
        required: [true, 'Email is a mandatory field'],
        unique: [true, 'Email already resgistered!'],
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email.']
    },
    photo: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Password is a mandatory field'],
        minLength: 6,
    },
    confirmPassword: {
        type: String,
        required: true,
        minLength: 6,
    }
});

const Users = mongoose.model('users', user);

module.exports = Users;