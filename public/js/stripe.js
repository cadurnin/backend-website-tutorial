/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
     // <==== PUT THE VARIABLE HERE
     const stripe = Stripe('pk_test_51I4X2aJ0IWo6fdEFRO6UYyXgYKfz3DC6PaFn64qmw4JP1NdXJlNVkaKNR5fzXvfHXPQPAJ94ht2wB5SFEuvinhs200LzLaIjCA');
    try {
        // 1. Get checkout session from the API
        const session = await axios(
            `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
        );
        // 2. Create checkout form + charge credit card
        await stripe.redirectToCheckout({
           sessionId: session.data.session.id
        });
        console.log('This is finished');

    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};