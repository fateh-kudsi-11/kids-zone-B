const jwt = require('jsonwebtoken');
const ErrRes = require('../utils/errRes');
const asyncHandler = require('./async');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new ErrRes('Not authorize to access this route', 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return next(new ErrRes('Not authorize to access this route', 401));
  }
});
