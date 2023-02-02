const fs = require('fs');
const Users = require('../models/userModel');

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

module.exports = { getUsers, postUser };
