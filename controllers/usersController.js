const fs = require('fs');
const Users = require('../models/userModel');
const AppError = require('../utils/error');

const users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8'));

const getUsers = async (req, res, next) => {
    try {
        const users = await Users.find();
        res.status(200).json({
            status: 'Success',
            results: users.length,
            data: {
                users
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: 'Bad request'
        })
    }
}

const postUser = (req, res) => {
    const user = Object.assign(req.body);
    users.push(user);

    fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(users), (err) => {
        res.status(201).json({
            status: 'success',
            user: user,
        });
    });
}

const updateMe = async (req, res, next) => {
    try {
        // 1. Create error if user posts password in request
        if (req.body.password || req.body.confirmPassword) {
            return next(new AppError('This route is not for password change.', 400))
        }
        if (req.body.role) {
            return next(new AppError('You cannot change the role.', 400));
        }

        // 2. Update user document
        const bodyObject = {
            name: req.body.name,
            email: req.body.email
        }
        const updatedUser = await Users.findByIdAndUpdate(req.user._id, bodyObject, { new: true, runValidators: true });

        res.status(200).json({
            status: 'Success',
            message: 'Data updated successfully',
            data: {
                user: updatedUser
            }
        })
    } catch (error) {
        res.status().json({
            status: 'Fail',
            message: error.message,
            error: error
        })
    }
}

const deleteMe = async (req, res, next) => {
    try {
        await Users.findByIdAndUpdate(req.user._id, { active: false });

        res.status(204).json({
            status: 'Success',
            message: 'The account has been deleted. If you want to not delete your account, log back in'
        })
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: error.message,
            error: error
        })
    }
}

module.exports = { getUsers, postUser, updateMe, deleteMe };
