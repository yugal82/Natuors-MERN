const Tours = require('../models/toursModel');
const AppError = require('../utils/error');

const getAllTours = async (req, res, next) => {
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
}

const getTourBySlug = async (req, res) => {
    try {
        // 1. Get tour
        const tour = await Tours.findOne({ slug: req.params.slug }).populate({ path: 'reviews', fields: 'review rating author' })

        if(!tour){
            return next(new AppError('No tour with that name', 404));
        }

        // 2. Build template

        // 3. Render
        res.status(200).render('tour', {
            title: tour.name,
            tour
        })
    } catch (error) {
        // res.status(400).json({
        //     message: 'Invalid route'
        // })
        res.status(404).render('404');
    }
}

const loginForm = async (req, res, next) => {
    try {
        res.status(200).render('login', {
            title: 'Login'
        });
    } catch (error) {
        res.status(400).json({
            message: 'Invalid route'
        })
    }
}

const getAccount = async(req, res, next) => {
    try {
        res.status(200).render('accounts', {
            // user: req.user,
            title: 'My Profile'
        })
    } catch (error) {
        res.status(404).render('404');
    }
}

module.exports = { getAllTours, getTourBySlug, loginForm, getAccount }