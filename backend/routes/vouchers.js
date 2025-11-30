import express from 'express';
import db from '../database/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { sendEmail, generateVoucherNotificationEmail } from '../services/emailService.js';
import { generatePaymentVoucherPDF } from '../services/voucherPdfService.js';
import { logActivity } from '../services/logService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Generate next voucher number
function generateNextVoucherNumber() {
  // Get the last voucher number
  const lastVoucher = db.prepare(`
    SELECT voucher_number 
    FROM vouchers 
    ORDER BY CAST(SUBSTR(voucher_number, -6) AS INTEGER) DESC, id DESC 
    LIMIT 1
  `).get();

  if (!lastVoucher) {
    // Start from 000098 if no vouchers exist
    return '000098';
  }

  // Extract numeric part and increment
  const lastNumber = parseInt(lastVoucher.voucher_number.replace(/\D/g, '')) || 97;
  const nextNumber = lastNumber + 1;
  
  // Format as 6-digit number with leading zeros
  return String(nextNumber).padStart(6, '0');
}

// Get all vouchers (role-based filtering)
router.get('/', authenticateToken, (req, res) => {
  try {
    let query = `
      SELECT 
        v.*,
        a.name as accountant_name,
        a.email as accountant_email,
        u.name as uploader_name,
        u.email as uploader_email
      FROM vouchers v
      LEFT JOIN users a ON v.accountant_id = a.id
      LEFT JOIN users u ON v.uploader_id = u.id
    `;
    const params = [];

    // Role-based filtering
    if (req.user.role === 'accountant') {
      query += ' WHERE v.accountant_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'gm') {
      query += ' WHERE v.gm_status IN (?, ?)';
      params.push('pending', 'verified');
    } else if (req.user.role === 'uploader1' || req.user.role === 'uploader2') {
      query += ' WHERE v.gm_status = ? AND (v.uploader_id = ? OR v.uploader_id IS NULL)';
      params.push('verified', req.user.id);
    }

    query += ' ORDER BY v.created_at DESC';

    const vouchers = db.prepare(query).all(...params);
    res.json(vouchers);
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get list of uploaders (for GM to select) - MUST come before /:id route
router.get('/uploaders', authenticateToken, requireRole('gm'), (req, res) => {
  try {
    const uploaders = db.prepare('SELECT id, name, email, role FROM users WHERE role IN (?, ?) ORDER BY role')
      .all('uploader1', 'uploader2');
    res.json(uploaders);
  } catch (error) {
    console.error('Error fetching uploaders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get next voucher number (for preview) - MUST come before /:id route
router.get('/next-number', authenticateToken, requireRole('accountant'), (req, res) => {
  try {
    const nextNumber = generateNextVoucherNumber();
    res.json({ voucher_number: nextNumber });
  } catch (error) {
    console.error('Error generating voucher number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single voucher - MUST come after specific routes
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const voucher = db.prepare(`
      SELECT 
        v.*,
        a.name as accountant_name,
        a.email as accountant_email,
        u.name as uploader_name,
        u.email as uploader_email
      FROM vouchers v
      LEFT JOIN users a ON v.accountant_id = a.id
      LEFT JOIN users u ON v.uploader_id = u.id
      WHERE v.id = ?
    `).get(req.params.id);

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    res.json(voucher);
  } catch (error) {
    console.error('Error fetching voucher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create voucher (Accountant only)
router.post('/', authenticateToken, requireRole('accountant'), (req, res) => {
  try {
    const { voucher_number, voucher_data } = req.body;

    if (!voucher_number || !voucher_data) {
      return res.status(400).json({ error: 'Voucher number and data are required' });
    }

    // Check if voucher number already exists
    const existing = db.prepare('SELECT id FROM vouchers WHERE voucher_number = ?').get(voucher_number);
    if (existing) {
      return res.status(400).json({ error: 'Voucher number already exists' });
    }

    const result = db.prepare(`
      INSERT INTO vouchers (voucher_number, accountant_id, voucher_data)
      VALUES (?, ?, ?)
    `).run(voucher_number, req.user.id, JSON.stringify(voucher_data));

    const voucherId = result.lastInsertRowid;

    // Log activity
    logActivity(
      voucherId,
      req.user.id,
      req.user.name,
      req.user.role,
      'voucher_created',
      `Voucher ${voucher_number} created`,
      null,
      'pending'
    );

    // Get GM email
    const gm = db.prepare('SELECT email FROM users WHERE role = ?').get('gm');
    
    // Send email to GM
    if (gm) {
      console.log(`📧 Attempting to send email notification to GM: ${gm.email}`);
      const emailContent = generateVoucherNotificationEmail(voucher_number, 'submitted', 'accountant', BASE_URL);
      sendEmail(gm.email, emailContent.subject, emailContent.html)
        .then((result) => {
          if (result) {
            console.log(`✅ Email notification sent successfully to GM: ${gm.email}`);
          } else {
            console.warn(`⚠️  Email notification skipped - SMTP not configured`);
          }
        })
        .catch(err => {
          console.error('❌ Failed to send email to GM:', err.message || err);
        });
    } else {
      console.warn('⚠️  GM user not found in database - cannot send email notification');
    }

    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(voucherId);
    res.status(201).json(voucher);
  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GM verify/reject voucher
router.patch('/:id/gm-action', authenticateToken, requireRole('gm'), async (req, res) => {
  try {
    const { action, uploader_id } = req.body; // 'verified' or 'rejected', and optional uploader_id
    const { id } = req.params;

    if (!['verified', 'rejected'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "verified" or "rejected"' });
    }

    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    // If verifying, uploader_id is required
    if (action === 'verified' && !uploader_id) {
      return res.status(400).json({ error: 'Uploader must be selected when verifying a voucher' });
    }

    // Validate uploader_id if provided
    if (uploader_id) {
      const uploader = db.prepare('SELECT id, role FROM users WHERE id = ? AND role IN (?, ?)').get(uploader_id, 'uploader1', 'uploader2');
      if (!uploader) {
        return res.status(400).json({ error: 'Invalid uploader selected' });
      }
    }

    // Get old status for logging
    const oldStatus = voucher.gm_status;

    // Update voucher status
    if (action === 'verified' && uploader_id) {
      db.prepare(`
        UPDATE vouchers 
        SET gm_status = ?, gm_verified_at = CURRENT_TIMESTAMP, uploader_id = ?
        WHERE id = ?
      `).run(action, uploader_id, id);
      
      // Log activity
      const uploader = db.prepare('SELECT name FROM users WHERE id = ?').get(uploader_id);
      logActivity(
        id,
        req.user.id,
        req.user.name,
        req.user.role,
        'voucher_verified',
        `Voucher verified and assigned to ${uploader?.name || 'uploader'}`,
        oldStatus,
        action
      );
    } else {
      db.prepare(`
        UPDATE vouchers 
        SET gm_status = ?, gm_verified_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(action, id);
      
      // Log activity
      logActivity(
        id,
        req.user.id,
        req.user.name,
        req.user.role,
        'voucher_rejected',
        `Voucher rejected by GM`,
        oldStatus,
        action
      );
    }

    // Get accountant email
    const accountant = db.prepare('SELECT email FROM users WHERE id = ?').get(voucher.accountant_id);
    
    // Send email to accountant
    if (accountant) {
      console.log(`📧 Attempting to send email notification to Accountant: ${accountant.email}`);
      const emailContent = generateVoucherNotificationEmail(voucher.voucher_number, action, 'gm', BASE_URL);
      sendEmail(accountant.email, emailContent.subject, emailContent.html)
        .then((result) => {
          if (result) {
            console.log(`✅ Email notification sent successfully to Accountant: ${accountant.email}`);
          } else {
            console.warn(`⚠️  Email notification skipped - SMTP not configured`);
          }
        })
        .catch(err => {
          console.error('❌ Failed to send email to accountant:', err.message || err);
        });
    }

      // If verified, send email to assigned uploader
      if (action === 'verified' && uploader_id) {
        const uploaderUser = db.prepare('SELECT email FROM users WHERE id = ?').get(uploader_id);
        if (uploaderUser) {
          console.log(`📧 Attempting to send email notification to Uploader: ${uploaderUser.email}`);
          const emailContent = generateVoucherNotificationEmail(voucher.voucher_number, 'assigned', 'gm', BASE_URL);
          sendEmail(uploaderUser.email, emailContent.subject, emailContent.html)
            .then((result) => {
              if (result) {
                console.log(`✅ Email notification sent successfully to Uploader: ${uploaderUser.email}`);
              } else {
                console.warn(`⚠️  Email notification skipped - SMTP not configured`);
              }
            })
            .catch(err => {
              console.error('❌ Failed to send email to uploader:', err.message || err);
            });
        }
      }

    const updatedVoucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
    res.json(updatedVoucher);
  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Uploader approve/reject voucher
router.patch('/:id/uploader-action', authenticateToken, requireRole('uploader1', 'uploader2'), async (req, res) => {
  try {
    const { action } = req.body; // 'approved' or 'rejected'
    const { id } = req.params;

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "approved" or "rejected"' });
    }

    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    if (voucher.gm_status !== 'verified') {
      return res.status(400).json({ error: 'Voucher must be verified by GM first' });
    }

    const oldStatus = voucher.uploader_status;

    db.prepare(`
      UPDATE vouchers 
      SET uploader_status = ?, uploader_verified_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(action, id);

    // Get GM email
    const gm = db.prepare('SELECT email FROM users WHERE role = ?').get('gm');
    
    // Send email to GM
    if (gm) {
      console.log(`📧 Attempting to send email notification to GM: ${gm.email}`);
      const emailContent = generateVoucherNotificationEmail(voucher.voucher_number, action, req.user.role, BASE_URL);
      sendEmail(gm.email, emailContent.subject, emailContent.html)
        .then((result) => {
          if (result) {
            console.log(`✅ Email notification sent successfully to GM: ${gm.email}`);
          } else {
            console.warn(`⚠️  Email notification skipped - SMTP not configured`);
          }
        })
        .catch(err => {
          console.error('❌ Failed to send email to GM:', err.message || err);
        });
    } else {
      console.warn('⚠️  GM user not found in database - cannot send email notification');
    }

    const updatedVoucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
    res.json(updatedVoucher);
  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download individual voucher PDF
router.get('/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const voucher = db.prepare(`
      SELECT v.*, a.name as accountant_name
      FROM vouchers v
      LEFT JOIN users a ON v.accountant_id = a.id
      WHERE v.id = ?
    `).get(id);

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    const voucherData = JSON.parse(voucher.voucher_data || '{}');
    voucherData.voucher_number = voucher.voucher_number;

    // Generate PDF
    const vouchersDir = path.join(__dirname, '../vouchers');
    if (!fs.existsSync(vouchersDir)) {
      fs.mkdirSync(vouchersDir, { recursive: true });
    }

    const filename = `voucher_${voucher.voucher_number}_${Date.now()}.pdf`;
    const filepath = path.join(vouchersDir, filename);

    await generatePaymentVoucherPDF(voucherData, filepath);

    // Set headers for viewing in browser
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // Send file for viewing
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      // Clean up file after sending
      setTimeout(() => {
        fs.unlink(filepath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }, 5000);
    });

    fileStream.on('error', (err) => {
      console.error('Error sending file:', err);
      res.status(500).json({ error: 'Error generating voucher PDF' });
    });
  } catch (error) {
    console.error('Error generating voucher PDF:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

