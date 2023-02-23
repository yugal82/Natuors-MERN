const express = require('express');
const router = express.Router();

const Tours = require('../models/toursModel');

router.get('/', async(req, res, next) => {

    // 1. Get tours from the collection
    const tours = await Tours.find();
    // 2. Build the template (this step will be performed in views folder)

    // 3. Render the template
    res.status(200).render('overview', {
        title: 'Overview',
        tours: tours
    })
})

router.get('/tour', (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker'
    })
})

module.exports = router;