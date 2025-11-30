import express from 'express';
import db from '../database/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { generateVoucherExcelReport } from '../services/excelService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Download report (GM, Accountant, Uploaders)
router.get('/download/:status', authenticateToken, requireRole('gm', 'accountant', 'uploader1', 'uploader2'), async (req, res) => {
  try {
    const { status } = req.params; // 'approved', 'rejected', 'pending', 'verified', 'all'
    const { start_date, end_date } = req.query;

    // Validate status based on role
    const validStatuses = ['approved', 'rejected', 'pending', 'verified', 'all'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    // Build query based on role and status
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
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (req.user.role === 'accountant') {
      query += ' AND v.accountant_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'uploader1' || req.user.role === 'uploader2') {
      // Uploaders can only see vouchers assigned to them
      query += ' AND (v.uploader_id = ? OR v.uploader_id IS NULL)';
      params.push(req.user.id);
    }
    // GM can see all vouchers

    // Status filtering
    if (status === 'approved') {
      query += ' AND v.uploader_status = ?';
      params.push('approved');
    } else if (status === 'rejected') {
      query += ' AND (v.uploader_status = ? OR v.gm_status = ?)';
      params.push('rejected', 'rejected');
    } else if (status === 'pending') {
      query += ' AND v.gm_status = ?';
      params.push('pending');
    } else if (status === 'verified') {
      query += ' AND v.gm_status = ? AND v.uploader_status = ?';
      params.push('verified', 'pending');
    }
    // 'all' status doesn't add additional status filter

    // Date range filtering
    if (start_date && end_date) {
      query += ' AND DATE(v.created_at) >= ? AND DATE(v.created_at) <= ?';
      params.push(start_date, end_date);
    }

    query += ' ORDER BY v.created_at DESC';

    const vouchers = db.prepare(query).all(...params);

    if (vouchers.length === 0) {
      return res.status(404).json({ error: `No vouchers found for the selected criteria` });
    }

    // Generate Excel
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const dateRange = start_date && end_date ? `_${start_date}_to_${end_date}` : '';
    const filename = `vouchers_${status}${dateRange}_${Date.now()}.xlsx`;
    const filepath = path.join(reportsDir, filename);

    await generateVoucherExcelReport(vouchers, status, filepath);

    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
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
      res.status(500).json({ error: 'Error generating report' });
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

