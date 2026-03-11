const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash').populate('assignedBase');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Role authorization
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Role '${req.user.role}' is not authorized` });
  }
  next();
};

// Base-scoped access: admin sees all, commander sees own base
exports.scopeBase = (req, res, next) => {
  if (req.user.role === 'admin') return next();
  
  if (req.user.role === 'base_commander' || req.user.role === 'logistics_officer') {
    if (!req.user.assignedBase) {
      return res.status(403).json({ message: 'Access Denied: You are not assigned to a military base.' });
    }
    req.scopedBaseId = req.user.assignedBase._id;
    return next();
  }
  
  next();
};
