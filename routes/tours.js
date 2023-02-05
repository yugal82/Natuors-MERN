const express = require('express');
const router = express.Router();

const { getAllTours, getTourByID, postTours, updateTourByID, deleteTourByID, getTourStats } = require('../controllers/toursController');
const { protect, restrictTo } = require('../controllers/authController');

router.get('/api/v1/tours', protect, getAllTours);
router.get('/api/v1/tours/tour-stats', getTourStats);
router.get('/api/v1/tours/:id', getTourByID);
router.post('/api/v1/tours', postTours);
router.patch('/api/v1/tours/:id', updateTourByID);
router.delete('/api/v1/tours/:id', protect, restrictTo('admin', 'lead-guide'), deleteTourByID);

module.exports = router;
