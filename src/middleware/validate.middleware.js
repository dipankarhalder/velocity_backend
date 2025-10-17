const { core } = require('../utils');

const validateItems = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const messages = error.details.map((detail) => ({
      field: detail.path[0],
      message: detail.message,
    }));
    return core.validateFields(res, messages);
  }
  req.validatedBody = value;
  next();
};

module.exports = validateItems;
