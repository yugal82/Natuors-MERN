const express = require('express');
const router = express.Router();

const { getAllTours, getTourBySlug, loginForm, getAccount, getMyTours } = require('../controllers/viewsController');
const { isLoggedIn, protect } = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');


router.get('/', createBookingCheckout, isLoggedIn, getAllTours);
router.get('/tour/:slug', isLoggedIn, getTourBySlug);
router.get('/login', isLoggedIn, loginForm);
router.get('/my-profile', protect, getAccount);
router.get('/my-tours', protect, getMyTours);

module.exports = router;
