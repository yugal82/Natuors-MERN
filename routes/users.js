const express = require('express');

const { getUsers, postUser, updateMe, deleteMe, getMe, getUser, uploadMiddleware, resizeUserPhoto } = require('../controllers/usersController');
const { signup, login, forgotPassword, resetPassword, updatePassword, protect, logout } = require('../controllers/authController');

const router = express.Router();

// route - 'localhost:8000/signup works perfectly fine to post(create) users. Although 'api/v1/users/signup' does not works. Check and debug.
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// from here every route will require authentication, so we use protect() middleware in every route (except for getUsers and getUser). PS - postUser middleware does not do anything. Signup route is used to create user.
router.patch('/update-password', protect, updatePassword);

router.get('/api/v1/users/my-profile', protect, getMe, getUser);
router.get('/api/v1/users/:id', getUser)
router.get('/api/v1/users', getUsers);
router.post('/api/v1/users', postUser);
router.patch('/api/v1/users/update', protect, uploadMiddleware, resizeUserPhoto, updateMe);
router.delete('/api/v1/users/delete', protect, deleteMe);


module.exports = router;
