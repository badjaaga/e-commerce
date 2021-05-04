const {check} = require('express-validator');

const usersRepo = require('../../repositories/users');

module.exports = {
    requireEmail: check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Must be a valid email')
        .custom(async email => {
            const userFromRepository = await usersRepo.getOneBy({email});
            if (userFromRepository) {
                throw new Error('User with such email already exists')
            }
        }),
    requirePassword: check('password')
        .trim()
        .isLength({min: 4, max: 20})
        .withMessage('Must be between 4 and 20 characters'),
    requirePasswordConfirmation: check('passwordConfirmation')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Must be between 4 and 20 characters')
        .custom(async (passwordConfirmation, { req }) => {
            if (passwordConfirmation !== req.body.password) {
                throw new Error('Passwords must match');
            }
        }),
    requireValidEmail: check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Must provide a valid email')
        .custom(async email => {
            const user = await usersRepo.getOneBy({email});
            if(!user){
                throw new Error('Email not found');
            }
        }),
    requireValidPassword: check('password')
        .trim()
        .custom(async (password, {req}) => {
            const user = await usersRepo.getOneBy({email: req.body.email});
            if(!user){
                throw new Error('Invalid password');
            }
            const validPassword = await usersRepo.comparePasswords(
                user.password,
                password
            );
            if (!validPassword) {
                throw new Error('Invalid password');
            }
        })
}