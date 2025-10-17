const { userSignup, userSignin, userSignout, refreshToken } = require('./auth.controller');

module.exports = {
  authenticateController: {
    userSignup,
    userSignin,
    userSignout,
    refreshToken,
  },
};
