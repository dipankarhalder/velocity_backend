const fs = require('fs');
const { StatusCodes } = require('http-status-codes');

const globalError = (res, error) => {
  res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR);
  res.json({
    error: { message: error.message },
  });
};

const missingRoutes = (req, res, next) => {
  const error = new Error('The API url not found.');
  error.status = StatusCodes.NOT_FOUND;
  next(error);
};

const sendErrorResponse = (res, error) => {
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Something went wrong, please try again later.',
    error: error.message,
  });
};

const validateFields = (res, messages) => {
  return res.status(StatusCodes.BAD_REQUEST).json({
    status: StatusCodes.BAD_REQUEST,
    message: messages,
  });
};

const notFoundItem = (res, messages) => {
  return res.status(StatusCodes.NOT_FOUND).json({
    status: StatusCodes.NOT_FOUND,
    message: messages,
  });
};

const deleteUploadedFile = (file) => {
  if (file && file.path) {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error('Failed to delete uploaded file:', err.message);
    }
  }
};

module.exports = {
  globalError,
  missingRoutes,
  sendErrorResponse,
  validateFields,
  notFoundItem,
  deleteUploadedFile,
};
