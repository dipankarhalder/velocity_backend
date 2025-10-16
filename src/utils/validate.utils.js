const Joi = require('joi');

const email = Joi.string().email().required().messages({
  'string.empty': 'Email addesss should not be blank.',
  'string.email': 'Please enter a valid email address',
});

const password = Joi.string().min(6).required().messages({
  'string.empty': 'Password should not be blank.',
  'string.min': 'Password must be at least 6 characters.',
});

const phone = Joi.string().min(10).required().messages({
  'string.empty': 'Phone number should not be blank.',
  'string.min': 'Phone must be at least 10 characters.',
});

const requiredString = (fieldMsg) =>
  Joi.string().required().messages({
    'string.empty': fieldMsg,
  });

module.exports = {
  email,
  password,
  phone,
  requiredString,
};
