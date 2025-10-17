const { StatusCodes } = require('http-status-codes');

const authRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusCodes.FORBIDDEN,
        message: 'You are not authorized to access this resource.',
      });
    }
    next();
  };
};

module.exports = authRole;
