import db from '../database/db.js';

export function logActivity(voucherId, userId, userName, userRole, action, description = null, oldStatus = null, newStatus = null) {
  try {
    db.prepare(`
      INSERT INTO activity_logs (voucher_id, user_id, user_name, user_role, action, description, old_status, new_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(voucherId, userId, userName, userRole, action, description, oldStatus, newStatus);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging should not break the main flow
  }
}

export function getWeeklyLogs(startDate, endDate) {
  try {
    const logs = db.prepare(`
      SELECT 
        al.*,
        v.voucher_number,
        v.gm_status,
        v.uploader_status
      FROM activity_logs al
      LEFT JOIN vouchers v ON al.voucher_id = v.id
      WHERE al.created_at >= ? AND al.created_at <= ?
      ORDER BY al.created_at DESC
    `).all(startDate, endDate);
    
    return logs;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
}

export function getAllLogs(limit = 100) {
  try {
    const logs = db.prepare(`
      SELECT 
        al.*,
        v.voucher_number,
        v.gm_status,
        v.uploader_status
      FROM activity_logs al
      LEFT JOIN vouchers v ON al.voucher_id = v.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(limit);
    
    return logs;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
}

