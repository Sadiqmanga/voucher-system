# Voucher Management System

A full-stack voucher management application with role-based access control, email notifications, and PDF report generation.

## Project Structure

```
.
├── backend/              # Express.js backend server
│   ├── database/         # Database setup and models
│   ├── middleware/       # Authentication middleware
│   ├── routes/          # API routes
│   ├── services/        # Email and PDF services
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/            # React + Vite frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Features

### User Roles

1. **General Manager (GM)**
   - Receives email notifications when vouchers are submitted
   - Verifies or rejects vouchers submitted by accountants
   - Views status of all vouchers in the system

2. **Accountant**
   - Uploads voucher details through a structured form
   - Submits vouchers to GM for approval
   - Views status of submitted vouchers

3. **Uploaders (Uploader 1 & Uploader 2)**
   - Receives vouchers forwarded from GM after verification
   - Approves or rejects vouchers
   - Downloads PDF reports of approved/rejected vouchers

### Workflow

1. **Accountant** uploads voucher → System sends email to **GM**
2. **GM** verifies/rejects → System sends email to **Accountant** and assigns to **Uploader**
3. **Uploader** approves/rejects → System sends email to **GM**

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- Email account for SMTP configuration (optional, for email notifications)

## Installation

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` folder (or copy from `.env.example`):

```env
PORT=3001
NODE_ENV=development
BASE_URL=http://localhost:3000

JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Voucher System <noreply@vouchersystem.com>
```

**Note:** For Gmail, you need to generate an App Password:
1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password: https://support.google.com/accounts/answer/185833

## Running the Application

### Start the Backend Server

```bash
cd backend
npm start
```

The backend will start on `http://localhost:3001`

For development with auto-reload:
```bash
npm run dev
```

### Start the Frontend Development Server

Open a new terminal window:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## Default User Accounts

The system comes with pre-configured demo accounts:

| Role | Email | Password |
|------|-------|----------|
| General Manager | gm@example.com | password123 |
| Accountant | accountant@example.com | password123 |
| Uploader 1 | uploader1@example.com | password123 |
| Uploader 2 | uploader2@example.com | password123 |

**Note:** In production, change these default passwords!

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Vouchers
- `GET /api/vouchers` - Get vouchers (role-based filtering)
- `GET /api/vouchers/:id` - Get single voucher
- `POST /api/vouchers` - Create voucher (Accountant only)
- `PATCH /api/vouchers/:id/gm-action` - GM verify/reject (GM only)
- `PATCH /api/vouchers/:id/uploader-action` - Uploader approve/reject (Uploaders only)

### Reports
- `GET /api/reports/download/:status` - Download PDF report (Uploaders only)
  - Status: `approved` or `rejected`

## Database

The system uses SQLite database (`backend/database/voucher.db`). The database is automatically initialized on first server start with:

- Users table (with default demo accounts)
- Vouchers table (stores all voucher data and workflow status)

## Email Notifications

Email notifications are sent for:
- Voucher submission (to GM)
- GM verification/rejection (to Accountant and Uploader)
- Uploader approval/rejection (to GM)

**Note:** Email functionality requires proper SMTP configuration. If emails are not configured, the system will continue to work but emails won't be sent.

## PDF Reports

Uploaders can download PDF reports containing:
- All approved vouchers
- All rejected vouchers

Reports include voucher details, statuses, and timestamps.

## Development

### Backend Development
- Uses ES modules (`type: "module"`)
- Database: SQLite with better-sqlite3
- Authentication: JWT tokens
- Email: Nodemailer
- PDF: PDFKit

### Frontend Development
- React 18 with Hooks
- React Router for navigation
- Vite for fast development
- Proxy configured for API calls

## Building for Production

### Frontend

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

### Backend

```bash
cd backend
npm start
```

Make sure to:
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Configure production SMTP settings
- Use a production database (consider PostgreSQL for production)

## Troubleshooting

### Database Issues
If you encounter database errors, delete `backend/database/voucher.db` and restart the server to reinitialize.

### Email Not Working
- Verify SMTP credentials in `.env`
- Check that 2-Step Verification is enabled for Gmail
- Ensure App Password is used (not regular password)
- Check server logs for email errors

### Port Already in Use
Change the port in `backend/.env` or `frontend/vite.config.js`

## Security Notes

- Change default passwords in production
- Use strong JWT secrets
- Enable HTTPS in production
- Validate and sanitize all inputs
- Implement rate limiting
- Use environment variables for sensitive data

## License

ISC
