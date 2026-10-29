const jwt = require('jsonwebtoken');

/**
 * Custom JWT Authentication Middleware
 * Validates the JWT Bearer token in the Authorization header.
 * Supabase Auth is NOT used as per assessment requirements.
 */
function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access',
        message: 'No authorization token provided. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access',
        message: 'Malformed authorization token.'
      });
    }

    const secret = process.env.JWT_SECRET || 'edtech_crm_super_secure_jwt_secret_key_2026_xyz';

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            error: 'Token expired',
            message: 'Your admin session has expired. Please log in again.'
          });
        }
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'Failed to authenticate token. Please log in again.'
        });
      }

      // Attach decoded payload to request object
      req.admin = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role || 'admin'
      };

      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: error.message
    });
  }
}

module.exports = {
  authenticateAdmin
};
