const Joi = require('joi');
const { userRole } = require('../constant');
const { email, password, phone, requiredString } = require('../utils/validate.utils');

const userLoginSchema = Joi.object({ email, password });
const userInfoSchema = Joi.object({
  firstName: requiredString('First Name should not be blank.'),
  lastName: requiredString('Last Name should not be blank.'),
  email,
  password,
  phone,
  role: Joi.string().valid(userRole.SUPER, userRole.ADMIN, userRole.STAFF).required().messages({
    'any.only': 'Role should be select a option.',
  }),
});

const passwordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required().messages({
    'string.empty': 'Old password should not be blank.',
    'string.min': 'Old password should be at least 6 characters.',
  }),
  newPassword: Joi.string().min(6).required().not(Joi.ref('oldPassword')).messages({
    'string.empty': 'New password should not be blank.',
    'string.min': 'New password should be at least 6 characters.',
    'any.only': 'New password should be different from old password',
  }),
});

module.exports = {
  userInfoSchema,
  userLoginSchema,
  passwordSchema,
};
