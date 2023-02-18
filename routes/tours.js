const express = require('express');
const router = express.Router();

const { getAllTours, getTourByID, postTours, updateTourByID, deleteTourByID, getTourStats } = require('../controllers/toursController');
const { protect, restrictTo } = require('../controllers/authController');
const reviewRoutes = require('./review');

router.use('/api/v1/tours/:tourId/reviews', reviewRoutes);

router.get('/api/v1/tours', protect, getAllTours);
router.get('/api/v1/tours/tour-stats', getTourStats);
router.get('/api/v1/tours/:id', getTourByID);
router.post('/api/v1/tours', postTours);
router.patch('/api/v1/tours/:id', updateTourByID);
router.delete('/api/v1/tours/:id', protect, restrictTo('admin', 'lead-guide'), deleteTourByID);


// const { postReview } = require('../controllers/reviewController');
//routes to add reviews w.r.t a particular tour
// router.post('/api/v1/tours/:tourId/reviews', protect, restrictTo('user'), postReview);

// we comment this code above since there is same implementation of creating a review in review.js.
// so we do all the routing of reviews in review.js only but just 'MERGE' the routes which starts with /tours/:tourId/ review.

module.exports = router;
