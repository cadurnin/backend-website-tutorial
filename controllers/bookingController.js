const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get  the currently booked tourModel
    const tour = await Tour.findById(req.params.tourId);


    // if(tour.maxGroupSize < tour.numberConfirmedBookings) {
    //     await Tour.findByIdAndUpdate(req.params.tourId, {isFull: true});
    //     return next(new AppError('Tour is full and you cannot book', 403))
    // }
    // 2 Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`, 
        cancel_url:  `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [{
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}.jpg`],
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1
        }]
    })
    // Create session

    res.status(200).json({
        status: 'success',
        session
    })
})

exports.createBookingCheckout = catchAsync( async (req, res, next) => {
    //temporary solution because its unsecure
    const {tour, user, price} = req.query;
    if(!tour && !user  && !price) return next();
    const Newbooking = await Booking.create({ tour, user, price });

    //console.log(`New Booking ID: ${Newbooking._id}`);

    res.redirect(req.originalUrl.split('?')[0]);
});

exports.updateBooking = factory.updateOne(Booking);

exports.getAllBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking);

exports.postBooking = factory.createOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);

exports.getBookingStats = catchAsync( async (req, res, next) => {
    data = await Booking.aggregate([

        {
            $lookup: {
                "from": "tours",
                "foreignField":"_id",
                "localField": "tour",
                "as":"tour"
            }
        },
        {
            
            $group: {
                _id: '$tour',
                sales: {$sum: 1},
                revenue: {$sum: '$price'}
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data
    })
});

exports.checkIfBookedOut = catchAsync( async (req, res, next) => {

    const tourId = !req.params.tourId ? req.body.tour: req.params.tourId;
    
    const tourDetails = await Tour.findById(tourId);

    if(tourDetails.maxGroupSize < tourDetails.numberConfirmedBookings) {
        await Tour.findByIdAndUpdate(tourId, {isFull: true});
        return next(new AppError('Tour is full and you cannot book', 403))
    }
    //if(tourDetails.maxGroupSize < tourDetails.numberConfirmedBookings) {
     //   Tour.findByIdAndUpdate(req.body.tour, {tourIsFull: true});
        //return next(new AppError('Bookings for this tour are full', 403))
   // }
    next()
})