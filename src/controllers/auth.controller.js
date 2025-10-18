const path = require('path');
const { StatusCodes } = require('http-status-codes');
const UAParser = require('ua-parser-js');
const User = require('../models/user.model');
const env = require('../config/env.config');
const { userRole } = require('../constant');
const { validateFields, sendErrorResponse, deleteUploadedFile } = require('../utils/core.utils');

/** roles define */
const roles = [userRole.SUPER, userRole.ADMIN, userRole.STAFF];

/*
 * endpoint: /auth/signin
 * method: POST
 */
const userSignin = async (req, res) => {
  try {
    const value = req.validatedBody;
    const user = await User.findOne({
      email: value.email,
    }).select('+password');
    if (!user) {
      return validateFields(res, 'Provided email address is not exist!');
    }

    const isMatch = await user.comparePassword(value.password);
    if (!isMatch) {
      return validateFields(res, 'Entered password is invalid, please try again.');
    }

    const { accessToken, refreshToken } = user.generateTokens();
    const parser = new UAParser();
    const ua = parser.setUA(req.headers['user-agent']).getResult();
    const deviceInfo = {
      token: refreshToken,
      device: ua.device.type || 'desktop',
      browser: ua.browser.name,
      os: ua.os.name,
    };
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens.shift();
    }
    user.refreshTokens.push(deviceInfo);

    await user.save();
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODEENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      accessToken,
      role: user.role,
      isApproved: user.isApproved,
      message: 'You are successfully logged-in.',
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

/*
 * endpoint: /auth/signup
 * method: POST
 */
const userSignup = async (req, res) => {
  try {
    const value = req.validatedBody;
    const existingUser = await User.findOne({
      $or: [{ email: value.email }, { phone: value.phone }],
    });
    if (existingUser) {
      deleteUploadedFile(req.file);
      const conflictField = existingUser.email === value.email ? 'email' : 'phone';
      return validateFields(res, `Provided ${conflictField} is already associated with another user.`);
    }

    const profileImagePath = req.file ? path.join('uploads', req.file.filename) : '';
    const user = new User({
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      password: value.password,
      phone: value.phone,
      role: roles.includes(value.role) ? value.role : userRole.ADMIN,
      profileImage: profileImagePath,
      isApproved: value.isApproved || false,
    });

    const { accessToken, refreshToken } = user.generateTokens();
    const parser = new UAParser();
    const ua = parser.setUA(req.headers['user-agent']).getResult();
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens.shift();
    }
    user.refreshTokens.push({
      token: refreshToken,
      device: ua.device.type || 'desktop',
      browser: ua.browser.name,
      os: ua.os.name,
    });

    await user.save();
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODEENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      accessToken,
      role: user.role,
      isApproved: user.isApproved,
      message: 'New user created successfully and logged in.',
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

/*
 * endpoint: /auth/refresh-token
 * method: POST
 */
const refreshToken = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies.refreshToken;
    if (!tokenFromCookie) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        message: 'Refresh token not provided.',
      });
    }

    let decoded;
    try {
      decoded = User.verifyRefreshToken(tokenFromCookie);
    } catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        message: err.message,
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusCodes.FORBIDDEN,
        message: 'User not found. Please log in again.',
      });
    }

    const tokenExists = user.refreshTokens.some((rt) => rt.token === tokenFromCookie);
    if (!tokenExists) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusCodes.FORBIDDEN,
        message: 'Refresh token is not recognized. Please log in again.',
      });
    }
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== tokenFromCookie);
    const { accessToken, refreshToken: newRefreshToken } = user.generateTokens();
    const parser = new UAParser();
    const ua = parser.setUA(req.headers['user-agent']).getResult();
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens.shift();
    }
    user.refreshTokens.push({
      token: newRefreshToken,
      device: ua.device.type || 'desktop',
      browser: ua.browser.name,
      os: ua.os.name,
    });
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: env.NODEENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      accessToken,
      message: 'Token refreshed successfully.',
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

/*
 * endpoint: /auth/signout
 * method: POST
 */
const userSignout = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies.refreshToken;
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODEENV === 'production',
      sameSite: 'Strict',
    });

    if (!tokenFromCookie || !req.user?.id) {
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: 'You are logged out successfully.',
      });
    }

    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== tokenFromCookie);
      await user.save();
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'You are Logged-out successfully.',
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

module.exports = {
  userSignup,
  userSignin,
  userSignout,
  refreshToken,
};
