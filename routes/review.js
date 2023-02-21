const express = require('express');
const router = express.Router({ mergeParams: true });
// we use mergeParams to get access to the :tourId param which is not accessible directly in review routes and is present on tour routes. So to get access to the :tourId param, we use mergeParams which 'MERGES' the parma of the 'Nested' routes.

const { getAllReviews, postReview, deleteReview, updateReview, getReview } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

// so even if we get routes like:
// 1. /api/v1/tours/:tourId/reviews/
// 2. /api/v1/reviews
// the route will end up in this routes folder which is postReview route.

router.get('/', protect, getAllReviews);
router.post('/', protect, restrictTo('user'), postReview);
router.get('/:id', protect, getReview);
router.patch('/:id', protect, restrictTo('user', 'admin'), updateReview);
router.delete('/:id', protect, restrictTo('user', 'admin'), deleteReview);

// to create a review for a tour, we need to create a nested route, i.e the route will look like 
// /api/v1/tours/:tourId/review. So first it will go to tour routes to execute the request since it goes to tour routes folder. So for this reason we will implement this route in tour folder.

module.exports = router;