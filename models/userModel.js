const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
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
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
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

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    // this points to the current query and not the document
    this.find({ active: { $ne: false } });

    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = (this.passwordChangedAt.getTime() / 1000);

        return JWTTimeStamp < changedTimestamp;
        // we check the above statement - if the issue time of token is 100 and changedPassword time is 200 i.e we change the password after the token is being issued, then it will return true.
        // else of the issue of token is after the password is changed then it will return false.
        // the second scenario can occuer where suppose in one session user logs in and changes the password. And logs out of the application. And again logs in later, and due to this a new Jwt token will be assigned to that user and by which we can say that the timestamp of passwordChanged is later than the issue of token
    }

    //false means password is not changed.
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // in milliseconds
    return resetToken;
}

const Users = mongoose.model('users', userSchema);

module.exports = Users;