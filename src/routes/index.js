const express = require('express');
const router = express.Router();

// const { role } = require('../constant');
const { userLoginSchema, userInfoSchema } = require('../validation/auth.validate');

const { userSignup, userSignin, userSignout, refreshToken } = require('../controllers/auth.controller');

const uploadMedia = require('../middleware/upload.middleware');
const fieldValid = require('../middleware/validate.middleware');
// const { SUPER, ADMIN, STAFF } = role.userRole;

/* Authentication */
router.post('/auth/signin', fieldValid(userLoginSchema), userSignin);
router.post('/auth/signup', uploadMedia.single('profileImage'), fieldValid(userInfoSchema), userSignup);
router.post('/auth/signout', userSignout);
router.post('/auth/refresh-token', refreshToken);

module.exports = router;
