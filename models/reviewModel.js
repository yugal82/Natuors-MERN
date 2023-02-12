const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true, "review cannot be empty"],
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'tours',
        required: [true, 'A review must belong to a tour.']
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        required: [true, 'Review must belong to a user.']
    }
}, 
{
    toJSON: { virtual: true },
    toObject: { virtual: true }
});
// toJSON and toObject virtual properties are used to show fields which are not stored in the database but are created virtually. That means there are some fields which we need to show in the output but are not necessary to store it in the database, such fields are called virtual fields.

const Reviews = mongoose.model('reviews', reviewSchema);

module.exports = Reviews;