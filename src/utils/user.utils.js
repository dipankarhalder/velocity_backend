const User = require('../models/admin/user.model');
const { notFoundItem } = require('./core.utils');

const getUserOrRespondNotFound = async (id, res) => {
  const user = await User.findById(id).populate('labLocation').select('-password');
  if (!user) {
    notFoundItem(res, 'The user is not found.');
    return null;
  }
  return user;
};

module.exports = {
  getUserOrRespondNotFound,
};
