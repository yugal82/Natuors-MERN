const mongoose = require('mongoose');

// to make a schema for a model in mongodb, mongoose provides us with mongoose.Schema() method which takes in a object to define a schema.
const tours = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    duration: {
        type: Number,
        required: true,
    },
    difficulty: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    ratingsAverage: {
        type: Number,
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    maxGroupSize: {
        type: Number,
        required: true,
    },
    summary: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: true,
    },
    images: [String],
    createdAt : {
        type: Date,
        default: Date.now()
    },
    startDates : [Date]
});

//Document middleware i.e middleware in mongoose:
// .pre() -> this runs BEFORE .save() or .create()
// every middleware function has access to the 'next' function in the middleware stack and when called i.e next(), the next middleware function will be executed.
tours.pre('save', function(next) {
    console.log('This is before saving the document: ',this);
    next();
})

// .post() -> this runs AFTER .save() or .create()
// every middleware function has access to the 'next' function in the middleware stack and when called i.e next(), the next middleware function will be executed.
tours.post('save', function(doc, next){
    console.log('This is after saving the document: ',doc);
    next();
})

// to make a model out of the above defined schema we use .model() method to create a collection in the database.
// the first argument is the name of the collection and the second argument is the schema against which we want to create a collection.
const Tours = new mongoose.model('tours', tours);

module.exports = Tours;