import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logActivity } from '../services/logService.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, email, name, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `).all();
    
    // Remove password from response
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single user (Admin only)
router.get('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user (Admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Email, password, name, and role are required' });
    }

    // Validate role
    const validRoles = ['admin', 'gm', 'accountant', 'uploader1', 'uploader2'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = db.prepare(`
      INSERT INTO users (email, password, name, role)
      VALUES (?, ?, ?, ?)
    `).run(email, hashedPassword, name, role);

    // Log activity
    logActivity(
      null,
      req.user.id,
      req.user.name,
      req.user.role,
      'user_created',
      `User ${email} created with role ${role}`,
      null,
      null
    );

    const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (Admin only)
router.patch('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, name, role } = req.body;

    // Check if user exists
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['admin', 'gm', 'accountant', 'uploader1', 'uploader2'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
    }

    // Check if email is being changed and if new email already exists
    if (email && email !== existing.email) {
      const emailExists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);

    // Log activity
    logActivity(
      null,
      req.user.id,
      req.user.name,
      req.user.role,
      'user_updated',
      `User ${existing.email} updated`,
      null,
      null
    );

    const updatedUser = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(id);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Prevent deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has vouchers as accountant
    const accountantVouchers = db.prepare('SELECT COUNT(*) as count FROM vouchers WHERE accountant_id = ?').get(userId);
    if (accountantVouchers.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete user. This user has ${accountantVouchers.count} voucher(s) associated as accountant.` 
      });
    }

    // Check if user has vouchers as uploader
    const uploaderVouchers = db.prepare('SELECT COUNT(*) as count FROM vouchers WHERE uploader_id = ?').get(userId);
    if (uploaderVouchers.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete user. This user has ${uploaderVouchers.count} voucher(s) associated as uploader.` 
      });
    }

    // Delete user (activity logs will be automatically deleted due to CASCADE)
    const deleteResult = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    
    if (deleteResult.changes === 0) {
      return res.status(404).json({ error: 'User not found or already deleted' });
    }

    // Log activity (only if logging doesn't fail)
    try {
      logActivity(
        null,
        req.user.id,
        req.user.name,
        req.user.role,
        'user_deleted',
        `User ${user.email} deleted`,
        null,
        null
      );
    } catch (logError) {
      console.error('Error logging user deletion:', logError);
      // Don't fail the deletion if logging fails
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

export default router;

