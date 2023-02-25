const express = require('express');
const router = express.Router();

const { getAllTours, getTourBySlug, loginForm } = require('../controllers/viewsController');
const { isLoggedIn } = require('../controllers/authController');
    

router.get('/', isLoggedIn, getAllTours);
router.get('/tour/:slug', isLoggedIn, getTourBySlug);
router.get('/login', isLoggedIn, loginForm);

module.exports = router;
