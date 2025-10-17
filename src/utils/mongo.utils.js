const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');

const isValidObjectId = (id, res, label = 'ID') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      message: `Please enter a valid ${label.toLowerCase()}`,
    });
    return false;
  }
  return true;
};

module.exports = isValidObjectId;
