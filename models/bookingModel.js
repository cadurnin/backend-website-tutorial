const mongoose = require('mongoose');
const Tour = require('./tourModel');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a User']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }

});

bookingSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name email'
    }).populate({
        path: 'tour',
        select: 'name id price'
    });
    next()
});

bookingSchema.statics.calcTotalBookings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        }, 
        {
            $group: {
                _id: '$tour',
                nBookings: { $sum : 1}
            }
        }
    ]);

    if(stats.length > 0) {

        await Tour.findByIdAndUpdate(tourId, {
            numberConfirmedBookings: stats[0].nBookings, 
        })
} else {
    await Tour.findByIdAndUpdate(tourId, {
        numberConfirmedBookings: 0
    })
}
}

bookingSchema.post('save', function(doc, next) {
     this.constructor.calcTotalBookings(doc.tour)
    //console.log('Complete');
    next()
})

// bookingSchema.post(/^findOneAnd/,  async function(next) {
//     await this.r.constructor.calcTotalBookings(this.r.tour)
// });

const Booking = mongoose.model('Booking',bookingSchema);

module.exports = Booking;