const path = require('path');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/user.model');
const isValidObjectId = require('../utils/mongo.utils');
const getUserOrRespondNotFound = require('../utils/user.utils');
const { sendErrorResponse, validateFields, deleteUploadedFile, notFoundItem } = require('../utils/core.utils');

/*
 * endpoint: /:id/profile/me
 * method: POST
 */
const userProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId, res, 'profile ID')) return;

    const user = await getUserOrRespondNotFound(userId, res);
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

/*
 * endpoint: /:id/profile/update-image
 * method: PATCH
 */
const userImageUpdate = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId, res, 'profile ID')) return;

    if (!req.file) {
      return validateFields(res, 'No image file uploaded.');
    }

    const user = await User.findById(userId);
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

/*
 * endpoint: /:id/profile/update-status
 * method: PATCH
 */
const userUpdateStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isApproved } = req.body;

    if (!isValidObjectId(userId, res, 'profile ID')) return;
    if (typeof isApproved !== 'boolean') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: 'Approved status must be a boolean.',
      });
    }

    const updatedStatus = await User.findByIdAndUpdate(userId, { isApproved }, { new: true, runValidators: true }).select('isApproved');
    if (!updatedStatus) {
      return notFoundItem(res, 'Requested user ID not found.');
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'User status updated successfully.',
      isApproved: updatedStatus.isApproved,
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

module.exports = {
  userProfile,
  userImageUpdate,
  userUpdateStatus,
};
