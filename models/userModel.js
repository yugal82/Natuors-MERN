const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
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
        select: false,
    },
    confirmPassword: {
        type: String,
        required: true,
        minLength: 6,
        validate: {
            // This only works on CREATE and SAVE method
            validator: function (el) {
                return el === this.password;
            },
            message: 'Password and Confirm Password are not matching.'
        },
        select: false
    }
});

// this middleware is to hash the password using bcryptjs package
// Note that this can be done in controller file also, but since we follow fat model and thin controller concept, we put all the data related operations in models file.
userSchema.pre('save', async function (next) {
    // only run this function only when password is modified
    if (!this.isModified('password')) return next();

    // hash the password with salt 12.
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const Users = mongoose.model('users', userSchema);

module.exports = Users;