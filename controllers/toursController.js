const Tours = require('../models/toursModel');
const AppError = require('../utils/error');

const getAllTours = async (req, res) => {
    try {

        // we use req.query to access the queries which the request holds. With the help of req.query, we can filter the results and send the data as per the query. We exculde some queries, because we handle them independently such as sort, limit, pagination(page), etc.
        const queryObj = { ...req.query };
        const exlcudeFields = ['sort', 'page', 'limit', 'fields'];
        exlcudeFields.forEach(q => delete queryObj[q]);

        // the Tours.find() method sends back a query object i.e the result we have to find, so that means we can chain other mongoose methods such as sort(), limit(), etc. So for the sole reason we dont use await on line 14, so that we can save the query in 'query' variable and can chain other methods on the 'query' variable before exeuting the query which is line before sending the response.

        // filtering feature: we filter the results by using the req.query object.
        let query = Tours.find(queryObj);

        // sorting feature
        if (req.query.sort) {
            query = query.sort(req.query.sort);
        }

        // limiting the results to a specified limit and displaying w.r.t page value. That is we implement the pagination feature together with limiting in order to make pagination working.
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;  // --> req.query.limit * 1 will convert the string to a number data type (since queries in request are in string data type)
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);


        // after filtering and sorting and limiting-paging (as per the req.query object) the query, we finally execute the query below and save the results sent back in the variable called 'tours'.
        const tours = await query;
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: tours,
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message,
        })
    }
}

const getTourByID = async (req, res, next) => {
    try {
        const tour = await Tours.findById(req.params.id).populate('reviews');

        // this commented code is related to the concept of referencing between 2 schemas. This is a 2 step process.
        // 1. Create a reference to the other schema. (in this case we created the reference in toursModel w.r.t userModel schema)
        // 2. The second step is to populate the documents of user(i.e users wtih role guides or admins) to the tours models and this is accomplished by using the populate() method.
        // const tour = await Tours.findById(req.params.id).populate({ 
        //     path: 'guides', 
        //     select: '-__v -passwordChangedAt' 
        // });

        // since we have to write the same code for getTourById and getTours again and again, its optimal to write the populate() method in a query middleware in the models folder itself. And hence we migrate this peice of code in models and write it as a query middleware.

        if (!tour) {
            return next(new AppError(`No tours available for ${req.params.id} id`, 404));
        }

        res.status(200).json({
            status: 'Success',
            data: tour,
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message,
        })
    }
}

const postTours = async (req, res) => {
    try {
        const tour = new Tours(req.body);
        const createTour = await tour.save();
        res.status(201).json({
            status: 'success',
            data: createTour,
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        })
    }
}

const updateTourByID = async (req, res, next) => {
    try {
        const tour = await Tours.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidator: true
        });
        if (!tour) {
            return next(`Cannot update tour. Invalid ID`, 404);
        }
        res.status(200).json({
            status: 'success',
            data: tour,
        })
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: error.message,
        })
    }
}

const deleteTourByID = async (req, res, next) => {
    try {
        const tour = await Tours.findByIdAndDelete(req.params.id);

        if (!tour) {
            return next(`Cannot delete tour. Invalid ID`, 404);
        }

        res.status(200).json({
            status: 'success',
            message: 'Deleted successfully!'
        })
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            message: error.message,
        })
    }
}

// MongoDB AGGREGATION PIPELINE
const getTourStats = async (req, res) => {
    try {
        const stats = await Tours.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: '$difficulty',
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);
        res.json({
            status: 'Success',
            data: {
                stats
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        })
    }
}

const getTourWithin = async (req, res, next) => {
    try {
        const { dist, latlng, unit } = req.params;
        const [lat, lng] = latlng.split(',');

        const radius = unit == "mi" ? dist / 3963.2 : dist / 6378.1;

        if (!lat || !lng) {
            next(new AppError('Please specify the latitude and longitude in the format lat,lng', 400));
        }

        // here when querying the find method to find the tours that are within a certain radius, we pass in the query parameter in the find() method as a geo spatial query parameter. Mongoose supports geospatial queries and are defined as $geoWithin to search for tours which are within a specific radius.
        // the radius variable that is passed in the query parameter is to search for documents within a 'radius' which is in radians and therefore we convert the dist params to radians by multiplying it with the radius of the earth.
        const tours = await Tours.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } })

        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        })
    }
}

const getDistances = async (req, res, next) => {
    try {
        const { latlng, unit } = req.params;
        const [lat, lng] = latlng.split(',');

        const multiplier = unit == 'mi' ? 0.000621371 : 0.001;

        if (!lat || !lng) {
            next(new AppError('Please specify the latitude and longitude in the format lat,lng', 400));
        }

        const distances = await Tours.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [lng * 1, lat * 1]
                    },
                    distanceField: 'distance',
                    distanceMultiplier: multiplier
                }
            },
            {
                $project: {
                    distance: 1,
                    name: 1
                }
            }
        ]);

        res.status(200).json({
            status: 'Success',
            data: {
                data: distances
            }
        })

    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        })
    }
}

module.exports = { getAllTours, getTourByID, postTours, updateTourByID, deleteTourByID, getTourStats, getTourWithin, getDistances };
