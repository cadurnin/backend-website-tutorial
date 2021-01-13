// updateData
import  { showAlert} from './alerts';
import axios from 'axios';

export const updateSettings = async (data, type) => {

    //Type is either password or data
    console.log(name, email)
    try {
        const url = type === 'password' ? 'http://127.0.0.1:8000/api/v1/users/updateMyPassword' : 'http://127.0.0.1:8000/api/v1/users/updateMe'
        console.log('Trying to update');
        const res = await axios({
            method:'PATCH',
            url: url, 
            data
        });

        if(res.data.status === 'success') {
            showAlert('success', ` ${type.toUpperCase()} Updated successfully`);
            window.setTimeout(() => {
                location.assign('/me');
            }, 1000)
        }
    console.log(res);

} catch (err) {
    showAlert('error', err.response.data.message);
}
};

