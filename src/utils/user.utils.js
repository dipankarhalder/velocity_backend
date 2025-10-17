const User = require('../models/user.model');
const { notFoundItem } = require('./core.utils');

const getUserOrRespondNotFound = async (id, res) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    notFoundItem(res, 'The user is not found.');
    return null;
  }
  return user;
};

module.exports = getUserOrRespondNotFound;
