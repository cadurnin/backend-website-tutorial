/* eslint-disable */
import axios from 'axios';
import{ showAlert} from './alerts';

export const signup = async (name, email, password, passwordConfirm) => {
    //console.log('Signing up in function');
    try {
        const res = await axios({
            method:'POST',
            url:'http://127.0.0.1:8000/api/v1/users/signup', 
            data: {
                email,
                name,
                password,
                passwordConfirm
            }
        });

        if(res.data.status === 'success') {
            showAlert('success', "Signed up successfully, you should receive an email to activate your account");
            window.setTimeout(() => {
                location.assign('/');
            }, 1000)
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}