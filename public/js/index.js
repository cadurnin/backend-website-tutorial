/* eslint-disable */

import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { signup } from './signup';
import { doc } from 'prettier';
import { checkBooking } from './review';


// DOM 
const logOutBtn = document.querySelector('.nav__el--logout');
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const userInfo = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const signUpForm = document.querySelector('.form--signup');
const bookBtn = document.getElementById('book-tour');
const reviewBtn = document.getElementById('create-review');

// VALUES 

if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}


if(loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        //console.log('logging in');
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener('click',  logout);
} 

if(userInfo) {
    userInfo.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        //console.log('This is the form');
        updateSettings(form, 'data');
    })
};

if(userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');

        document.querySelector('.btn--save-password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    })
};

if(bookBtn) {
    bookBtn.addEventListener('click', e => {

        e.target.textContent = 'Processing...';
        const {tourId} = e.target.dataset;
        bookTour(tourId);
    })
}

if(signUpForm) {
    //console.log('this works');

    signUpForm.addEventListener('submit', e => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordconfirm').value;
        
        signup(name, email, password, passwordConfirm);
    })
};

if(reviewBtn) {
    reviewBtn.addEventListener('click', e => {
        const tourId = e.target.dataset.tourId;
        const tourUser = e.target.dataset.tourUser;

        //console.log(tourId, tourUser);

        checkBooking(tourUser, tourId);
        
    })
}