const express = require('express');

const { getUsers, postUser } = require('../controllers/usersController');
const { signup, login, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

// route - 'localhost:8000/signup works perfectly fine to post(create) users. Although 'api/v1/users/signup' does not works. Check and debug.
router.post('/signup', signup);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.get('/api/v1/users', getUsers);
router.post('/api/v1/users', postUser);


module.exports = router;
