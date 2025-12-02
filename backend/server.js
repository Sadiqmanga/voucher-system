import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database/db.js';
import authRoutes from './routes/auth.js';
import voucherRoutes from './routes/vouchers.js';
import reportRoutes from './routes/reports.js';
import userRoutes from './routes/users.js';
import logRoutes from './routes/logs.js';
import testEmailRoutes from './routes/test-email.js';

dotenv.config();

// Set timezone to Nigerian time (Africa/Lagos, UTC+1)
process.env.TZ = 'Africa/Lagos';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
initDatabase();

// Middleware
// CORS configuration - allow all in development, restrict in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourdomain.com'  // Update with your production domain
    : true,  // Allow all origins in development
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    }
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/test-email', testEmailRoutes);

// Check email configuration on startup
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const isEmailConfigured = smtpUser && smtpPass && 
                          smtpUser !== 'your-email@gmail.com' && 
                          smtpPass !== 'your-app-password';

if (!isEmailConfigured) {
  console.log('\n⚠️  EMAIL NOTIFICATION WARNING:');
  console.log('   SMTP is not configured. Email notifications will not be sent.');
  console.log('   To enable emails, create backend/.env file with:');
  console.log('   SMTP_HOST=smtp.gmail.com');
  console.log('   SMTP_PORT=587');
  console.log('   SMTP_USER=your-email@gmail.com');
  console.log('   SMTP_PASS=your-app-password');
  console.log('   SMTP_FROM=AMU Multi Services <your-email@gmail.com>\n');
} else {
  console.log('\n✅ Email notifications are configured and ready\n');
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

