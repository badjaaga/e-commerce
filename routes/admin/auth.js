const express = require('express');
const {check, validationResult}  = require('express-validator');
const usersRepo = require('../../repositories/users');
const signUpTemplate = require('../../views/admin/auth/signup');
const signInTemplate = require('../../views/admin/auth/signin');
const { requireEmail, requirePassword } = require('../admin/validators');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(signUpTemplate({req}));
});

router.post('/signup',
    [
        requireEmail,
        requirePassword,
        check('passwordConfirmation').trim().isLength({min: 4, max: 20}).custom((passwordConfirmation, {req}) =>{
            if(passwordConfirmation !== req.body.password){
                throw new Error('Passwords must match')
            }
            return true;
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        console.log(errors);

        const { email, password, passwordConfirmation } = req.body;
        const user = await usersRepo.create({ email, password });

        req.session.userId = user.id;

        res.send('Account created!!!');
});

router.get('/signout', (req, res) => {
    req.session = null;
    res.send('You are logged out');
});

router.get('/signin', (req, res) => {
    res.send(signInTemplate());
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    const user = await usersRepo.getOneBy({ email });

    if (!user) {
        return res.send('Email not found');
    }

    const validPassword = await usersRepo.comparePasswords(
        user.password, password
    );

    if (!validPassword) {
        return res.send('Invalid password');
    }

    req.session.userId = user.id;

    res.send('You are signed in!!!');
});

module.exports = router;