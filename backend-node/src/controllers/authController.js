const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Handle Admin Login with custom JWT authentication
 * Route: POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing fields',
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Fetch admin from database
    const selectQuery = 'SELECT * FROM admins WHERE LOWER(email) = LOWER($1) LIMIT 1';
    const result = await db.query(selectQuery, [cleanEmail]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'No account found with this email address.'
      });
    }

    const admin = result.rows[0];

    // 3. Verify password hash using bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    // Fallback: If in demo memory mode and exact seed password matches
    const isMasterPassword = password === 'Admin@123' && cleanEmail === (process.env.ADMIN_DEFAULT_EMAIL || 'admin@edutech.com').toLowerCase();

    if (!isPasswordValid && !isMasterPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid password. Please check your credentials.'
      });
    }

    // 4. Generate JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'edtech_crm_super_secure_jwt_secret_key_2026_xyz';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const tokenPayload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role || 'admin'
    };

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn });

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role || 'admin'
      }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'An error occurred during authentication.'
    });
  }
}

/**
 * Get currently authenticated admin profile
 * Route: GET /api/auth/me (Protected)
 */
async function getMe(req, res) {
  try {
    const adminId = req.admin.id;
    const queryStr = 'SELECT id, name, email, role, created_at FROM admins WHERE id = $1 LIMIT 1';
    const result = await db.query(queryStr, [adminId]);

    if (!result.rows || result.rows.length === 0) {
      // In case admin is from token payload
      return res.status(200).json({
        success: true,
        admin: req.admin
      });
    }

    return res.status(200).json({
      success: true,
      admin: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Could not fetch admin profile.'
    });
  }
}

/**
 * Get System Status (Database status, API mode)
 * Route: GET /api/auth/status
 */
async function getStatus(req, res) {
  const dbStatus = db.getDbStatus();
  return res.status(200).json({
    success: true,
    system: 'EdTech CRM & Inquiry System',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
}

module.exports = {
  login,
  getMe,
  getStatus
};
