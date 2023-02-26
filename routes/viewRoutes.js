const express = require('express');
const router = express.Router();

const { getAllTours, getTourBySlug, loginForm, getAccount } = require('../controllers/viewsController');
const { isLoggedIn, protect } = require('../controllers/authController');
    

router.get('/', isLoggedIn, getAllTours);
router.get('/tour/:slug', isLoggedIn, getTourBySlug);
router.get('/login', isLoggedIn, loginForm);
router.get('/my-profile', protect, getAccount);

module.exports = router;
