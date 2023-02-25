const express = require('express');
const router = express.Router();

const { getAllTours, getTourBySlug, loginForm } = require('../controllers/viewsController')

router.get('/', getAllTours);
router.get('/tour/:slug', getTourBySlug);
router.get('/login', loginForm);

module.exports = router;
