const Reviews = require('../models/reviewModel');
const AppError = require('../utils/error');

const getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Reviews.find();

        res.status(200).json({
            status: 'Success',
            results: reviews.length,
            data: {
                reviews
            }
        })

    } catch (error) {
        res.status(400).json({
            status: 'Failed',
            message: error.message,
            error: error
        })
    }
}

const postReview = async (req, res, next) => {
    try {
        const review = await Reviews.create(req.body);

        res.status(201).json({
            status: 'Success',
            data: {
                review: review
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'Failed',
            message: error.message,
            error: error
        })
    }
}

module.exports = { getAllReviews, postReview }