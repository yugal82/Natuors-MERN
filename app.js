const dotenv = require('dotenv');
dotenv.config({path : './config.env'});

const express = require('express');
const app = express();

const AppError = require('./utils/error');
const errorHandler = require('./controllers/errorController');
const tourRoutes = require('./routes/tours');
const usersRoutes = require('./routes/users');

app.get('/', (req, res) => {
    res.send('The natours server is live!');
})

// 1) Middlewares
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.requestTime)
    
    // console.log(req.headers);
    next();
})

// 2) Routes
app.use(tourRoutes);
app.use(usersRoutes);

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
