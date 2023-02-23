const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

const AppError = require('./utils/error');
const errorHandler = require('./controllers/errorController');
const tourRoutes = require('./routes/tours');
const usersRoutes = require('./routes/users');
const reviewRoutes = require('./routes/review');
const viewRoutes = require('./routes/viewRoutes');

// 1) Middlewares
// Set security HTTP headers.
app.use(helmet());

// Middleware to set the rate of the API call
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, try again after an hour.'
});
app.use('/api', limiter)

// Body parser, reading data from the body into req.body
app.use(express.json());

// Data sanitization against NoSQL Injection. (NoSQL Injection is a type of an attack).
app.use(mongoSanitize());

// Data sanitization against XSS attacks
app.use(xss());


// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.requestTime)

    // console.log(req.headers);
    next();
})

// 2) Routes
app.use('/', viewRoutes);
app.use(tourRoutes);
app.use(usersRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// handling requests to routes that are not defined
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'Fail',
    //     message: `Cannot find ${req.originalUrl}`
    // });


    // ----------------------------
    // to demonstate the global error handling middleware we define a new Error
    // const err = new Error(`Cannot find ${req.originalUrl}`);
    // err.statusCode = 404;
    // err.status = 'Fail';

    // to call the global error handling middleware, we need to call the next() middleware in the stack
    // by specfying the err as the parameter in the next() function, Node.js automatically understands that it is a error handling middleware.
    // next(err)

    next(new AppError(`Cannot find ${req.originalUrl}`, 404));
});

// error handling middleware which handles errors globally in the node application
app.use(errorHandler);

module.exports = app;
