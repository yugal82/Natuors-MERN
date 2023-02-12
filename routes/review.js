const express = require('express');
const router = express.Router();

const { getAllReviews, postReview } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

router.get('/api/v1/reviews', getAllReviews);
router.post('/api/v1/reviews', protect, restrictTo('user'), postReview);

module.exports = router;