import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { getWeeklyLogs, getAllLogs } from '../services/logService.js';

const router = express.Router();

// Get weekly logs (Admin only)
router.get('/weekly', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    // Get start and end of current week (Monday to Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const logs = getWeeklyLogs(startOfWeek.toISOString(), endOfWeek.toISOString());
    res.json(logs);
  } catch (error) {
    console.error('Error fetching weekly logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get logs for a specific date range (Admin only)
router.get('/range', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required (YYYY-MM-DD format)' });
    }

    const startDate = new Date(start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end_date);
    endDate.setHours(23, 59, 59, 999);

    const logs = getWeeklyLogs(startDate.toISOString(), endDate.toISOString());
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all recent logs (Admin only)
router.get('/', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = getAllLogs(limit);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

