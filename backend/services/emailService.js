import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure email transporter
// For production, use actual SMTP credentials
// For development, you can use Gmail, SendGrid, or other services
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

// Check if SMTP is configured
export function isEmailConfigured() {
  return smtpUser && smtpPass && 
         smtpUser !== 'your-email@gmail.com' && 
         smtpPass !== 'your-app-password' &&
         smtpPass !== 'your-app-password-here' &&
         smtpPass.length > 10; // App passwords are usually 16 characters
}

const transporter = isEmailConfigured() ? nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
}) : null;

export async function sendEmail(to, subject, html, text) {
  // Check if email is configured
  if (!isEmailConfigured()) {
    console.warn('⚠️  Email not configured. SMTP credentials missing in .env file.');
    console.warn('   To enable emails, add SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to backend/.env');
    return null;
  }

  if (!transporter) {
    console.error('Email transporter not initialized. Check SMTP configuration.');
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `AMU Multi Services <${smtpUser}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    });
    console.log('✅ Email sent successfully to:', to);
    console.log('   Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email to', to, ':', error.message);
    if (error.response) {
      console.error('   SMTP Response:', error.response);
    }
    if (error.code) {
      console.error('   Error Code:', error.code);
    }
    throw error;
  }
}

export function generateVoucherNotificationEmail(voucherNumber, action, role, baseUrl) {
  const actionText = action === 'verified' ? 'verified' : action === 'rejected' ? 'rejected' : 'submitted';
  const roleText = role === 'gm' ? 'General Manager' : role === 'accountant' ? 'Accountant' : 'Uploader';
  
  return {
    subject: `Voucher ${voucherNumber} - ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Voucher Management System</h2>
        <p>Hello,</p>
        <p>A voucher <strong>${voucherNumber}</strong> has been ${actionText} by the ${roleText}.</p>
        <p>Please review the voucher in the system.</p>
        <a href="${baseUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          View Voucher
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated notification from the Voucher Management System.
        </p>
      </div>
    `
  };
}

