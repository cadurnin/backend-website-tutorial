const express = require('express');
const bookingController = require("../controllers/bookingController");
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/checkout-session/:tourId', 
authController.protect,
bookingController.checkIfBookedOut,
bookingController.getCheckoutSession);

router.route('/stats')
      .get(authController.protect, 
           authController.restrictTo('admin'), 
           bookingController.getBookingStats)

router.use(authController.protect);
router.use(authController.restrictTo('admin'))

router.route('/')
      .get( bookingController.getAllBookings)
      .post(bookingController.checkIfBookedOut, bookingController.postBooking)

router.route('/:id')
      .get( bookingController.getBooking)
      .patch(
      bookingController.updateBooking
      )
      .delete( bookingController.deleteBooking);

module.exports = router;