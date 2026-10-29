const db = require('../config/db');

// Allowed enums per specification
const VALID_USER_TYPES = ['Parent', 'Student', 'School'];
const VALID_CATEGORIES = ['Scholarship', 'Concert', 'Admission', 'General Query'];
const VALID_STATUSES = ['Pending', 'In Progress', 'Contacted', 'Resolved'];

/**
 * Submit Public Inquiry Form
 * Route: POST /api/inquiries
 * Public route
 */
async function createInquiry(req, res) {
  try {
    const { user_type, category, name, email, phone, message } = req.body;

    const errors = [];

    // Validation
    if (!user_type || !VALID_USER_TYPES.includes(user_type)) {
      errors.push(`User Type must be one of: ${VALID_USER_TYPES.join(', ')}`);
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    if (!name || name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      errors.push('A valid email address is required.');
    }

    if (!phone || phone.trim().length < 5) {
      errors.push('A valid phone number is required (min 5 digits).');
    }

    if (!message || message.trim().length < 5) {
      errors.push('Message / Query must be at least 5 characters long.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: errors[0],
        errors
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanMessage = message.trim();

    const insertSql = `
      INSERT INTO inquiries (user_type, category, name, email, phone, message, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
      RETURNING *
    `;

    const result = await db.query(insertSql, [
      user_type,
      category,
      cleanName,
      cleanEmail,
      cleanPhone,
      cleanMessage
    ]);

    const createdInquiry = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! Our EdTech team will reach out to you shortly.',
      data: createdInquiry
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Failed to record inquiry. Please try again later.'
    });
  }
}

/**
 * Get all inquiries with advanced Filtering, Search, and Stats
 * Route: GET /api/inquiries
 * Protected (Admin only)
 */
async function getAllInquiries(req, res) {
  try {
    const { category, user_type, status, search, sort = 'newest' } = req.query;

    const dbStatus = db.getDbStatus();

    // If connected to Supabase PostgreSQL, build dynamic SQL query
    if (dbStatus.mode === 'supabase-postgres') {
      const conditions = [];
      const values = [];

      if (category && category !== 'All') {
        values.push(category);
        conditions.push(`category = $${values.length}`);
      }

      if (user_type && user_type !== 'All') {
        values.push(user_type);
        conditions.push(`user_type = $${values.length}`);
      }

      if (status && status !== 'All') {
        values.push(status);
        conditions.push(`status = $${values.length}`);
      }

      if (search && search.trim() !== '') {
        const searchTerm = `%${search.trim()}%`;
        values.push(searchTerm);
        const idx = values.length;
        conditions.push(`(name ILIKE $${idx} OR phone ILIKE $${idx} OR email ILIKE $${idx})`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const orderClause = sort === 'oldest' ? 'ORDER BY created_at ASC' : 'ORDER BY created_at DESC';

      const selectSql = `SELECT * FROM inquiries ${whereClause} ${orderClause}`;
      const result = await db.query(selectSql, values);

      // Also get overall metrics
      const statsSql = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'Pending') as pending,
          COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress,
          COUNT(*) FILTER (WHERE status = 'Contacted') as contacted,
          COUNT(*) FILTER (WHERE status = 'Resolved') as resolved,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today
        FROM inquiries
      `;
      const statsRes = await db.query(statsSql);
      const metrics = statsRes.rows[0] || {
        total: result.rows.length,
        pending: 0,
        in_progress: 0,
        contacted: 0,
        resolved: 0,
        today: 0
      };

      return res.status(200).json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        metrics: {
          total: parseInt(metrics.total || 0, 10),
          pending: parseInt(metrics.pending || 0, 10),
          in_progress: parseInt(metrics.in_progress || 0, 10),
          contacted: parseInt(metrics.contacted || 0, 10),
          resolved: parseInt(metrics.resolved || 0, 10),
          today: parseInt(metrics.today || 0, 10)
        },
        database: dbStatus
      });
    }

    // Interactive Demo / Fallback memory mode filtering
    let items = [...db.memoryStore.inquiries];

    if (category && category !== 'All') {
      items = items.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    if (user_type && user_type !== 'All') {
      items = items.filter(item => item.user_type.toLowerCase() === user_type.toLowerCase());
    }

    if (status && status !== 'All') {
      items = items.filter(item => item.status.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q)
      );
    }

    if (sort === 'oldest') {
      items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else {
      items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Compute metrics
    const allStoreItems = db.memoryStore.inquiries;
    const now = new Date();
    const todayStr = now.toDateString();

    const metrics = {
      total: allStoreItems.length,
      pending: allStoreItems.filter(i => i.status === 'Pending').length,
      in_progress: allStoreItems.filter(i => i.status === 'In Progress').length,
      contacted: allStoreItems.filter(i => i.status === 'Contacted').length,
      resolved: allStoreItems.filter(i => i.status === 'Resolved').length,
      today: allStoreItems.filter(i => new Date(i.created_at).toDateString() === todayStr).length
    };

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      metrics,
      database: dbStatus
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return res.status(500).json({
      success: false,
      error: 'Query error',
      message: 'Failed to retrieve inquiries.'
    });
  }
}

/**
 * Update Inquiry Status
 * Route: PATCH /api/inquiries/:id/status
 * Protected (Admin only)
 */
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const updateSql = 'UPDATE inquiries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    const result = await db.query(updateSql, [status, id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Inquiry record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Inquiry status updated to ${status}`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({
      success: false,
      error: 'Database update error',
      message: 'Could not update status.'
    });
  }
}

/**
 * Update Admin Notes on an Inquiry
 * Route: PATCH /api/inquiries/:id/notes
 * Protected (Admin only)
 */
async function updateNotes(req, res) {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const updateSql = 'UPDATE inquiries SET notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    const result = await db.query(updateSql, [notes || '', id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Inquiry record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inquiry notes saved successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating notes:', error);
    return res.status(500).json({
      success: false,
      error: 'Database update error',
      message: 'Could not update notes.'
    });
  }
}

/**
 * Delete an Inquiry
 * Route: DELETE /api/inquiries/:id
 * Protected (Admin only)
 */
async function deleteInquiry(req, res) {
  try {
    const { id } = req.params;
    const deleteSql = 'DELETE FROM inquiries WHERE id = $1 RETURNING id';
    const result = await db.query(deleteSql, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Inquiry not found or already deleted.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully.',
      id
    });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return res.status(500).json({
      success: false,
      error: 'Delete error',
      message: 'Could not delete inquiry.'
    });
  }
}

module.exports = {
  createInquiry,
  getAllInquiries,
  updateStatus,
  updateNotes,
  deleteInquiry,
  VALID_USER_TYPES,
  VALID_CATEGORIES,
  VALID_STATUSES
};
