const mongoose = require('mongoose');
// const Users = require('./userModel');

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
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    startLocation: {
        //GeoJSON
        type: {
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    location: [
        {
            type: {
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    // guides: Array  --> For embedding user documents
    guides: [
        { 
            type: mongoose.Schema.ObjectId,
            ref: 'users'
        }
    ]
},
{
    toJSON: { virtual: true },
    toObject: { virtual: true }
});

//Document middleware i.e middleware in mongoose:
// .pre() -> this runs BEFORE .save() or .create()
// every middleware function has access to the 'next' function in the middleware stack and when called i.e next(), the next middleware function will be executed.
// tours.pre('save', function (next) {
//     console.log('This is before saving the document: ', this);
//     next();
// })

// .post() -> this runs AFTER .save() or .create()
// every middleware function has access to the 'next' function in the middleware stack and when called i.e next(), the next middleware function will be executed.
// tours.post('save', function (doc, next) {
//     console.log('This is after saving the document: ', doc);
//     next();
// })


// this pre document middleware is called to embed documents from other collection.
// here we are embedding users document in tours collection with document embedding conept.
// the guides field in schema takes in the ID of the users and we map it over it to retrive collection referencing to that ID. This step returns promises as findById returns a promise. To handle this we store all the promises in a const, and we call Promise.all() to resolve all the promises.
// there are some drawbacks in this approach and hence we do not make use of this approach much often. Instead we make use of REFERENCING.
// tours.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async (id) => await Users.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// })

// this is a query middleware, which is used to populate the referenced documents in the tours collection.
// i.e since we are referencing the users documents in guides field in the tours schema, we need to poulate it when quering i.e find(), findById(), findOne(), etc. 
tours.pre(/^find/, async function(next) {
    this.populate({ 
        path: 'guides', 
        select: '-__v -passwordChangedAt' 
    });
    
    next();
})

// to make a model out of the above defined schema we use .model() method to create a collection in the database.
// the first argument is the name of the collection and the second argument is the schema against which we want to create a collection.
const Tours = new mongoose.model('tours', tours);

module.exports = Tours;