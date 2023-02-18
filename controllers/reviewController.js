const Reviews = require('../models/reviewModel');
const AppError = require('../utils/error');

const getAllReviews = async (req, res, next) => {
    try {
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };
        const reviews = await Reviews.find(filter);

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
        if (!req.body.tour) req.body.tour = req.params.tourId;
        if (!req.body.author) req.body.author = req.user.id;

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

const deleteReview = async (req, res, next) => {
    try {
        const review = await Reviews.findByIdAndDelete(req.params.id);

        if (!review) {
            next(new AppError('No review with this ID', 404));
        }
        res.status(204).json({
            status: 'success',
            message: 'Deleted successfully!'
        })
    } catch (error) {
        res.status(400).json({
            status: 'Failed',
            message: error.message,
            error: error
        })
    }
}

const updateReview = async(req, res, next) => {
    try {
        const review = await Reviews.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if(!review){
            next(new AppError('No review with this ID', 404));
        }

        res.status(200).json({
            status: 'success',
            message: 'Updated successfully!',
            data: {
                review
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

module.exports = { getAllReviews, postReview, deleteReview, updateReview }