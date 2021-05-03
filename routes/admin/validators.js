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

}