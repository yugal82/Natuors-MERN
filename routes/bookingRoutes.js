const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const { getCheckoutSession, getAllBookings, getBooking } = require('../controllers/bookingController');

const router = express.Router();

router.get('/checkout-session/:tourId', protect, getCheckoutSession);

router.get('/', protect, restrictTo('admin', 'lead-guide'), getAllBookings);
router.get('/:bookingID', protect, restrictTo('admin', 'lead-guide'), getBooking);

module.exports = router;
