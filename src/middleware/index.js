module.exports = {
  authToken: require('./auth.middleware'),
  uploadMedia: require('./upload.middleware'),
  authValid: require('./validate.middleware'),
};
