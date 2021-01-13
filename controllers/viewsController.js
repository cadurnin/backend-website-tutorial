const Tour = require('../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');

exports.getOverview =  catchAsync(async (req, res, next) => {
    //1) Get tour data from collection.
    const tours = await Tour.find();
    //2) Build template
    //3) Render template
    res.status(200).render('overview', {
    title: 'All tours', 
    tours
})
});

exports.getTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if(!tour) {
        return next(new AppError('There is no tour with that name', 404));
    }

    res.status(200)
    .render('tour', {
        title:`${tour.name} Tour`,
        tour
    });
    });

    exports.getLogin = (req, res) => {
        res.status(200)
        .set(
            'Content-Security-Policy',
            "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.0/axios.js 'unsafe-inline' 'unsafe-eval';"
          )
        .render('login', {
            title: 'login'
        })

    }

    exports.getSignup = (req, res) => {
        res.status(200).render('signup', {
            title: 'Sign Up'
        });
    };

    exports.getAccount = (req, res) => {
        res.status(200).render('account', {
            title: 'Your Account'
        });
    }

    exports.updateUserData = catchAsync( async (req, res, next) => {
        const updatedUser = await User.findByIdAndUpdate(req.user.id, {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        });

        res.status(200).render('account',  {
            title: 'Your account',
            user: updatedUser
        })
    });

exports.getMyTours =  catchAsync(async (req,res,next) => {
    const bookings = await Booking.find({
        user: req.user.id
    })

    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: {$in: tourIDs}});

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    })
}
);

exports.getReviewPage = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({user: req.user.id});

    res.status(200).render('review', {
        title: 'Reviews',
        bookings
    })
    next();
});


