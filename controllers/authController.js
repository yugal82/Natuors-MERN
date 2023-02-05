const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Users = require('../models/userModel');
const AppError = require('../utils/error')

const createToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const signup = async (req, res, next) => {
    try {
        const userBody = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            passwordChangedAt: req.body.passwordChangedAt,
            role: req.body.role
        }
        const user = new Users(userBody);
        const createUser = await user.save();

        // JWT -JsonWebToken is used for authentication and authorization of a user.
        // jwt.sign() creates a new token and assigns it to a user which has been created newly. Using this jwt token, the server verifies whether the user is authentic and authorized or not.
        // jwt.sign() takes in 2 compulsory parameter which are payload i.e the data which is to be stored in the jwt token and the second parameter is the secret key to help generate a jwt token.
        const token = createToken(createUser._id);

        res.status(201).json({
            status: 'Success',
            message: 'User created successfully.',
            token: token,
            data: {
                user: createUser
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: error.message,
            error: error
        })
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Check if email and password exists i.e the fields that are sent from frontend are not empty
        if (!email || !password) {
            return next(new AppError(`Password and email are required fields.`, 400))
        }

        // 2. Check if email and password exists in database i.e user exists already.
        const user = await Users.findOne({ email: email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError(`Email or Password is incorrect`, 401))
        }

        // 3. If everything okay, then send the JWT token back to the user.
        const token = createToken(user._id);
        res.status(200).json({
            status: 'Success',
            token,
        })
    } catch (error) {
        res.status(401).json({
            status: 'Fail',
            message: error.message,
            error: error
        })
    }
}

// this function is to check whether the user is logged in or not to perform certain operations.
const protect = async (req, res, next) => {
    try {
        let token;
        // 1. Getting token and check if its there
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError(`Unauthorized access denied`, 401));
        }

        // 2. Verification of token
        const decodedPayload = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

        // 3. Check if user still exists
        // i.e if the user has been deleted or the user has changed its password before the JWT token expires, in that case then it will still be authorized. To avoid this we make sure to check this step.
        const userExists = await Users.findById(decodedPayload.id);
        if (!userExists) {
            return next(new AppError('The user belonging to the token does not exists.', 404));
        }

        // 4. Check if user has changed password after the JWT token was issued.
        if (userExists.changedPasswordAfter(decodedPayload.iat)) {
            return next(new AppError('User recently changed the password. Please log in again', 401))
        }

        // only if all the checks are done, then only the next middleware in the stack will be called.
        req.user = userExists;
        next();
    } catch (error) {
        res.status(401).json({
            status: 'Fail',
            message: error.message,
            error: error
        })
    }
}

const restrictTo = (...roles) => {
    return (req, res, next) => {
        try {
            // the below if condition is to check if the role of the user is admin or lead-guide to perform the operation.
            // The roles array is the parameters passed from the tours.js routes file which specifies which roles are allowed to perform the operation.
            // For now the roles array is -> roles = ['admin', 'lead-guide'] and default value of role='user', so the roles.includes('user') check whether the roles arrays includes 'user' in it, if it includes return true else return false.
            if (!roles.includes(req.user.role)) {
                return next(new AppError('You do not have the permission to perform this operation', 403));
            }

            next();
        } catch (error) {
            res.status(401).json({
                status: 'Fail',
                message: error.message,
                error: error
            })
        }
    }
}

module.exports = { signup, login, protect, restrictTo }