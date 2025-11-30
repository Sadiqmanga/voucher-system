import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { sendEmail, generateVoucherNotificationEmail, isEmailConfigured } from '../services/emailService.js';
import db from '../database/db.js';

const router = express.Router();

// Test email endpoint (Admin only)
router.post('/send', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    // Check if email is configured first
    if (!isEmailConfigured()) {
      return res.status(500).json({ 
        error: 'Email service is not configured',
        details: 'SMTP credentials are missing. Please set SMTP_USER and SMTP_PASS in backend/.env file',
        hint: 'Create a .env file in the backend folder with your SMTP credentials'
      });
    }

    const testEmailContent = {
      subject: 'Test Email - AMU Multi Services Voucher System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">AMU MULTI SERVICES LTD</h2>
          <h3>Test Email</h3>
          <p>Hello,</p>
          <p>This is a test email from the Voucher Management System.</p>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            This is an automated test notification.
          </p>
        </div>
      `
    };

    const result = await sendEmail(to, testEmailContent.subject, testEmailContent.html);

    // Check if email was actually sent (sendEmail returns null if not configured)
    if (!result) {
      return res.status(500).json({ 
        error: 'Failed to send test email',
        details: 'Email service returned null. Check server logs for details.',
        hint: 'Verify your SMTP configuration in the .env file and restart the server'
      });
    }

    res.json({ 
      success: true, 
      message: 'Test email sent successfully. Please check your inbox (and spam folder).',
      sentTo: to,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error.message,
      hint: 'Check your SMTP configuration in the .env file. Common issues: incorrect password, 2FA not enabled for Gmail, or firewall blocking SMTP port.'
    });
  }
});

// Get email configuration status (Admin only)
router.get('/status', authenticateToken, requireRole('admin'), (req, res) => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const isConfigured = smtpUser && smtpPass && 
                       smtpUser !== 'your-email@gmail.com' && 
                       smtpPass !== 'your-app-password';

  res.json({
    configured: isConfigured,
    host: smtpHost,
    port: smtpPort,
    user: smtpUser ? (smtpUser.substring(0, 3) + '***') : 'Not set',
    hasPassword: !!smtpPass && smtpPass !== 'your-app-password',
    message: isConfigured 
      ? 'Email is configured and ready to send' 
      : 'Email is not configured. Please set SMTP_USER and SMTP_PASS in backend/.env file'
  });
});

export default router;

