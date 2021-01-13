/* eslint-disable */
import axios from 'axios';
import{ showAlert} from './alerts';

export const checkBooking = async (userId, tourId) => {
    console.log('This is running in the function');
    try {
        const res = await axios({
            method:'GET',
            url:`http://127.0.0.1:8000/get-review-page/${tourId}/${userId}`
        });
} catch (err) {
    console.log(err);
}

};