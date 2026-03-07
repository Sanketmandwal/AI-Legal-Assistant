// src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyToken } from '../config/jwt.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // console.log('authMiddleware - token received:', token);

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      // console.log('authMiddleware - token decoded:', decoded);
      // console.error('authMiddleware - token verification error:', err);
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    console.log('authMiddleware - decoded token payload:', decoded);


    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('authMiddleware error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
}

function requireEmailVerified(req, res, next) {
  if (!req.user?.emailVerified) {
    return res.status(403).json({ success: false, message: 'Email not verified' });
  }
  next();
}

function requirePhoneVerified(req, res, next) {
  if (!req.user?.phoneVerified) {
    return res.status(403).json({ success: false, message: 'Phone not verified' });
  }
  next();
}

function requireRoleVerified(req, res, next) {
  if (!req.user?.roleVerified) {
    return res.status(403).json({ success: false, message: 'Role not fully verified' });
  }
  next();
}

export { authMiddleware, requireRole, requireEmailVerified, requirePhoneVerified, requireRoleVerified };
