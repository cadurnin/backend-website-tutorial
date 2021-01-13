const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const { render } = require('pug');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN  * 24 * 60 *  60 * 1000),
    httpOnly: true
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions)

    //Remove password from output

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    const activationToken =  await crypto.randomBytes(20).toString('hex');

    await User.findByIdAndUpdate(newUser._id, {
        "activateToken.token": activationToken
    })

    const url = `${req.protocol}://${req.get('host')}/activate/${activationToken}`;

    console.log(url);

    await new Email(newUser, url).sendWelcome();

    res.status(200).json({
        status: 'success',
        newUser
    })
    
    //createSendToken(newUser, 201, res);
});

exports.activateAccount = catchAsync(async (req, res, next) => {
    const user = await User.findOne({"activateToken.token": req.params.activatecode});
    if(!user) {
        return next(new AppError('This activation does not match a user', 403));
    }

    await User.findByIdAndUpdate(user._id, {active: true});

    res.redirect('/login');

});

exports.isActive = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({email}).select('+active');

    if(user.active === false) {
        return next( new AppError('This account is not active, please activate', 403));
    }

    next();
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // check if email password exists

    if(!email || !password) {
        return next(new AppError('please provide email and password', 400));
    }

    const user = await User.findOne({email}).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // check 

    console.log(user);

    createSendToken(user, 200, res);
});

exports.isLoggedIn = async (req, res, next) => {
    console.log(req.cookies.jwt)
    if(req.cookies.jwt) {
    try {
    
    //console.log(t3oken)
   const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
   const currentUser = await User.findById(decoded.id);
   //console.log(currentUser);

   if(!currentUser) {
       return next();
   }

   if (currentUser.changedPasswordAfter(decoded.iat)) {
       return next();
   };

   // If it gets this far, it is granted to the next route.
   res.locals.user = currentUser;
   return next();
    } catch (err) {
        return next();
    }

} 
    
   next()
};

exports.logout =  (req, res) =>  {
    res.cookie('jwt', 'loggedout', {
        expired: new Date(Date.now() +  10 * 1000),
        httpOnly: true
    });
    res.status(200).json({status: 'success'});
}

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Get token & check if it exists
    let token;
    // 3) Check if user still exists
    // 4) Check if user changed password after the token was issued
     if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
         token = req.headers.authorization.split(' ')[1];
     } else if(req.cookies.jwt) {
         token = req.cookies.jwt;
     }

    if(!token) {
        return next(new AppError('You are not logged in', 401))        
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    const currentUser = await User.findById(decoded.id);
    //console.log(currentUser);

    if(!currentUser) {
        return next( new AppError('The user does not exist', 401))
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed their password', 401))
    };
    // If it gets this far, it is granted to the next route.
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is an array,

        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403))
        }
        next()
    }
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
//Get user on POSTed  email
const user = await User.findOne({ email: req.body.email});
if(!user) {
    return next(new AppError('There is no user with email address', 404))
}
// Generate random reset tokens
const resetToken = user.createPasswordResetToken();
await user.save({ validateBeforeSave: false });

// Send  to users  email

const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

const message = `Forgot your password? Submit a Patch request with your new password and passwordConfirm to ${resetURL}.\nIf you didn't forget please ignore this email`;

try {
    // await sendEmail({
    //     email: req.body.email,
    //     subject: 'Your password reset token (valid for 10 min',
    //     message
    // });
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
        status:'success',
        message: 'Token sent to email'
    })
} catch(err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
}

await user.save({ validateBeforeSave: false });

return next(new AppError('There was an error sending the email, Try again later', 500))

});

exports.resetPassword = catchAsync( async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    console.log(hashedToken);

    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now()}});

    console.log(user)

    if(!user) {
        return next( new AppError('Token is invalid or has expired', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 201, res);

})

exports.updatePassword = catchAsync(async(req, res, next) => {
    // Get the user from the collection
    const user = await (await User.findById(req.user.id).select('+password'));

    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Incorrect username or password', 401))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // Check if the posted password is correct

    // if correct, update the password 
    console.log('Updated password');
    // Log user in, send JW  
    createSendToken(user, 201, res);

});

//Only for rendered pages, no errors.

exports.checkForBooking = catchAsync(async (req, res, next) => {
    console.log('looking....')
    const bookings = await Booking.find({
    user: req.user.id
})
    
const tourIds = bookings.map(el => el.tour.id);
if(!tourIds.includes(req.body.tour)) {
    return next(new AppError('You have not booked this tour', 403))
}
next()

} );
