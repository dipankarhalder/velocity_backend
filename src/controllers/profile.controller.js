const path = require('path');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/user.model');
const getUserOrRespondNotFound = require('../utils/user.utils');
const { sendErrorResponse, validateFields, deleteUploadedFile } = require('../utils/core.utils');

const userProfile = async (req, res) => {
  try {
    const decoded = req.user;
    const user = await getUserOrRespondNotFound(decoded.id, res);
    if (!user) return;

    const userInformation = { ...user._doc };
    delete userInformation.password;
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: userInformation,
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

const userImageUpdate = async (req, res) => {
  try {
    const decoded = req.user;
    if (!req.file) {
      return validateFields(res, 'No image file uploaded.');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      deleteUploadedFile(req.file);
      return validateFields(res, 'User not found.');
    }
    if (user.profileImage) {
      const oldImagePath = path.join('src', user.profileImage);
      deleteUploadedFile({ path: oldImagePath });
    }

    const newImagePath = path.join('uploads', req.file.filename);
    user.profileImage = newImagePath;
    await user.save();
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Profile image updated successfully.',
      data: {
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    deleteUploadedFile(req.file);
    return sendErrorResponse(res, error);
  }
};

module.exports = {
  userProfile,
  userImageUpdate,
};
