const Joi = require('joi');
const { role } = require('../constant');
const { valid } = require('../utils');

const userLoginSchema = Joi.object({
  email: valid.email,
  password: valid.password,
});

const userInfoSchema = Joi.object({
  firstName: valid.requiredString('First Name should not be blank.'),
  lastName: valid.requiredString('Last Name should not be blank.'),
  email: valid.email,
  password: valid.password,
  phone: valid.phone,
  labLocation: valid.requiredString('Lab Location should not be blank.'),
  role: Joi.string().valid(role.userRole.SUPER, role.userRole.ADMIN, role.userRole.STAFF).required().messages({
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
