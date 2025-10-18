const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env.config');
const { userRole } = require('../constant');

const saltNum = 10;
const roles = [userRole.SUPER, userRole.ADMIN, userRole.STAFF];

const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  device: { type: String },
  browser: { type: String },
  os: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: roles,
      default: userRole.ADMIN,
    },
    profileImage: {
      type: String,
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    refreshTokens: {
      type: [RefreshTokenSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(saltNum);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

UserSchema.methods.generateTokens = function () {
  const payload = {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    role: this.role,
    isApproved: this.isApproved,
  };
  const accessToken = jwt.sign(payload, env.JWTSECRET, {
    expiresIn: env.ACCESSTOKENEXPIRY || '4h',
  });
  const refreshToken = jwt.sign(payload, env.JWTRSECRET, {
    expiresIn: env.REFRESHTOKENEXPIRY || '7d',
  });
  return { accessToken, refreshToken };
};

UserSchema.statics.verifyRefreshToken = function (token) {
  try {
    const decoded = jwt.verify(token, env.JWTRSECRET);
    return decoded;
  } catch (err) {
    const error = new Error('Invalid or expired refresh token.');
    error.details = err;
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema);
