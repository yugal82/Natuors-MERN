const express = require('express');

const { getUsers, postUser, updateMe, deleteMe } = require('../controllers/usersController');
const { signup, login, forgotPassword, resetPassword, updatePassword, protect } = require('../controllers/authController');

const router = express.Router();

// route - 'localhost:8000/signup works perfectly fine to post(create) users. Although 'api/v1/users/signup' does not works. Check and debug.
router.post('/signup', signup);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.patch('/update-password', protect, updatePassword);

router.get('/api/v1/users', getUsers);
router.post('/api/v1/users', postUser);
router.patch('/api/v1/users/update', protect, updateMe);
router.delete('/api/v1/users/delete', protect, deleteMe);


module.exports = router;
