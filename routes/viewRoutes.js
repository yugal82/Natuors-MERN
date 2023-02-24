const express = require('express');
const router = express.Router();

const Tours = require('../models/toursModel');

router.get('/', async (req, res, next) => {
    try {
        // 1. Get tours from the collection
        const tours = await Tours.find();
        // 2. Build the template (this step will be performed in views folder)

        // 3. Render the template
        res.status(200).render('overview', {
            title: 'Overview',
            tours: tours
        })
    } catch (error) {
        res.status(400).json({
            message: 'Invalid route'
        })
    }
})

router.get('/tour/:slug', async(req, res) => {
    try {
        // 1. Get tour
        const tour = await Tours.findOne({slug: req.params.slug}).populate({ path: 'reviews', fields: 'review rating author' })
        
        // 2. Build template

        // 3. Render
        res.status(200).render('tour', {
            title: 'The Forest Hiker',
            tour
        })
    } catch (error) {
        res.status(400).json({
            message: 'Invalid route'
        })
    }
})

module.exports = router;
