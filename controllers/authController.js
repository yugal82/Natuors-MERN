const Users = require('../models/userModel');

const signup = async (req, res, next) => {
    try {
        const user = new Users(req.body);
        const createUser = await user.save();
        res.status(201).json({
            status: 'Success',
            message: 'User created successfully.',
            data: {
                createUser
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

module.exports = { signup }