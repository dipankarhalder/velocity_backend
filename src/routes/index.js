const express = require('express');
const router = express.Router();

// const { role } = require('../constant');
const { authValidation } = require('../validation');
const { authenticateController } = require('../controllers');
const { authValid, uploadMedia } = require('../middleware');
// const { SUPER, ADMIN, STAFF } = role.userRole;

/* Authentication */
router.post('/auth/signin', authValid(authValidation.userLoginSchema), authenticateController.userSignin);
router.post(
  '/auth/signup',
  uploadMedia.single('profileImage'),
  authValid(authValidation.userInfoSchema),
  authenticateController.userSignup,
);
router.post('/auth/signout', authenticateController.userSignout);
router.post('/auth/refresh-token', authenticateController.refreshToken);

module.exports = {
  rootApiRouter: router,
};
