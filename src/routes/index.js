const express = require('express');
const router = express.Router();

const { userRole } = require('../constant');
const { userLoginSchema, userInfoSchema, passwordSchema } = require('../validation/auth.validate');

const { userSignup, userSignin, userSignout, refreshToken } = require('../controllers/auth.controller');
const { userProfile, userProfiles, userImageUpdate, userUpdateStatus, userUpdatePassword } = require('../controllers/profile.controller');

const verifyToken = require('../middleware/auth.middleware');
const authRole = require('../middleware/role.middleware');
const uploadMedia = require('../middleware/upload.middleware');
const fieldValid = require('../middleware/validate.middleware');
const { SUPER, ADMIN, STAFF } = userRole;

/* Authentication */
router.post('/auth/signin', fieldValid(userLoginSchema), userSignin);
router.post('/auth/signup', uploadMedia.single('profileImage'), fieldValid(userInfoSchema), userSignup);
router.post('/auth/signout', userSignout);
router.post('/auth/refresh-token', refreshToken);

/* Profile */
router.get('/profile/me', verifyToken, userProfile);
router.get('/profile/list', verifyToken, authRole([SUPER, ADMIN]), userProfiles);
router.patch('/profile/update-image', verifyToken, authRole([SUPER, ADMIN, STAFF]), uploadMedia.single('profileImage'), userImageUpdate);
router.patch('/profile/update-status', verifyToken, authRole([SUPER, ADMIN]), userUpdateStatus);
router.patch('/:id/profile/update-password', verifyToken, authRole([SUPER, ADMIN, STAFF]), fieldValid(passwordSchema), userUpdatePassword);

module.exports = router;
