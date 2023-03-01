const Tour = require('../models/toursModel');
const AppError = require('../utils/error');
const Stripe = require('stripe');
const Booking = require('../models/bookingsModel');

const getCheckoutSession = async (req, res, next) => {
    try {
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

        // 1. Get the currently booked tour
        const tour = await Tour.findById(req.params.tourId);

        // 2. Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: `${req.protocol}://${req.get('host')}?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
            cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
            customer_email: req.user.email,
            client_reference_id: req.params.tourId,
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: 'usd',
                        unit_amount: tour.price * 100,
                        product_data: {
                            name: `${tour.name} Tour`,
                            description: tour.summary,
                            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                        },
                    },
                },
            ],
            mode: 'payment',
        })

        // 3. Create session as response
        res.status(200).json({
            status: 'Success',
            session
        })

    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            error: error
        })
    }
}

const createBookingCheckout = async (req, res, next) => {
    try {
        const { tour, user, price } = req.query;
        if (!tour && !user && !price) return next();

        await Booking.create({ tour, user, price });

        res.redirect(req.originalUrl.split('?')[0]);
    } catch (error) {
        res.status(400).json({
            status: 'Fail',
            error: error
        })
    }
}

module.exports = { getCheckoutSession, createBookingCheckout }
