const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protect routes — requires valid JWT access token.
 * Attaches user object to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Access denied. No token provided.');
  }

  // Verify token
  const decoded = verifyAccessToken(token);

  // Attach user (exclude password)
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account has been deactivated');
  }

  req.user = user;
  next();
});

/**
 * Role-based authorization middleware.
 * Must be used AFTER protect middleware.
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
};

module.exports = { protect, authorize };
