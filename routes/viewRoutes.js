const express = require('express');
const viewsController = require('../controllers/viewsController');

const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/',bookingController.createBookingCheckout ,authController.isLoggedIn, viewsController.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLogin);
router.get('/signup', viewsController.getSignup);
router.get('/me', authController.protect ,viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.get('/activate/:activatecode', authController.activateAccount);

router.post('/submit-user-data', authController.protect ,viewsController.updateUserData);

router.get('/my-reviews', authController.protect, viewsController.getReviewPage);

module.exports = router;