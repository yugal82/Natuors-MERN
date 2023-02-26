const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Users = require('../models/userModel');
const AppError = require('../utils/error');
const sendEmail = require('../utils/email');

const createToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createAndSendToken = (user, statusCode, message, res) => {
    const token = createToken(user._id);

    res.cookie('jwt', token, {
        expiresIn: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)),
        // secure: true,  we keep secure in production only since development environment is not secure(encypted) to send cookies.
        httpOnly: true
    })

    res.status(statusCode).json({
        status: 'Success',
        message: message,
        token: token,
        data: {
            user
        }
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
        createAndSendToken(createUser, 201, 'User created successfully.', res);
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
        createAndSendToken(user, 200, '', res);
    } catch (error) {
        res.status(401).json({
            status: 'Fail',
            message: error.message,
            error: error
        })
    }
}

const logout = (req, res, next) => {
    res.cookie('jwt', 'loggedout', {
        expiresIn: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'Success',
    })
}

// this function is to check whether the user is logged in or not to perform certain operations.
const protect = async (req, res, next) => {
    try {
        let token;
        // 1. Getting token and check if its there
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
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
        res.locals.user = userExists
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

const forgotPassword = async (req, res, next) => {
    // 1. GET user from DB using the POSTed email in request header
    const user = await Users.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('The user does not exists', 404));
    }

    // 2. Generate a random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3. Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }

}

const resetPassword = async (req, res, next) => {
    try {
        // 1. Get user based on token
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await Users.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

        // 2. If token has not expired, and there is user, set new password.
        if (!user) {
            return next(new AppError('Token is invalid or expired', 400));
        }
        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // 3. Update changedPasswordAt field in database
        // this is step is done is models since it is close to data and we maintain the fat models, thin controllers concept

        // 4. Log the user in, send JWT token
        createAndSendToken(user, 200, '', res);

    } catch (error) {
        res.status(401).json({
            status: 'Fail',
            message: error.message,
            error: error
        })
    }
}

const updatePassword = async (req, res, next) => {
    try {
        // 1. Get user from database
        const user = await Users.findById(req.user._id).select('+password');

        // 2. Check if password sent through the request matches the password in database
        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            return next(new AppError('Your current password is not matching.', 401))
        }

        // 3. If password matches, update password
        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        await user.save();

        // 4. Log user in and send JWT token
        createAndSendToken(user, 200, 'Password has been changed', res);
    } catch (error) {
        res.status(401).json({
            status: 'Fail',
            message: error.message,
            error: error
        })
    }
}

const isLoggedIn = async (req, res, next) => {
    try {
        if (req.cookies.jwt) {
            // 1. Verification of token
            const decodedPayload = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET_KEY);

            // 2. Check if user still exists
            // i.e if the user has been deleted or the user has changed its password before the JWT token expires, in that case then it will still be authorized. To avoid this we make sure to check this step.
            const userExists = await Users.findById(decodedPayload.id);
            if (!userExists) {
                return next();
            }

            // 3. Check if user has changed password after the JWT token was issued.
            if (userExists.changedPasswordAfter(decodedPayload.iat)) {
                return next();
            }

            // only if all the checks are done, then only the next middleware in the stack will be called.
            res.locals.user = userExists;
            return next();
        }
        next();
    } catch (error) {
        return next();
    }
}

module.exports = { signup, login, protect, restrictTo, forgotPassword, resetPassword, updatePassword, isLoggedIn, logout }