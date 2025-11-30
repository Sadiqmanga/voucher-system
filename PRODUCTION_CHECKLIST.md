# Production Deployment Checklist

## ✅ Completed Features
- [x] User authentication (JWT)
- [x] Role-based access control (Admin, GM, Accountant, Uploaders)
- [x] Voucher management workflow
- [x] Email notifications
- [x] PDF generation for vouchers
- [x] Excel reports with date range filtering
- [x] Activity logging
- [x] User management (Admin)

## 🔧 Before Hosting - Required Changes

### 1. Security Configuration

#### Update CORS for Production
- Currently allows all origins (`app.use(cors())`)
- Should restrict to your production domain only

#### Update JWT_SECRET
- Currently using default: `your-secret-key-change-in-production`
- Generate a strong random secret for production

#### Environment Variables
- Set `NODE_ENV=production` in production `.env`
- Update `BASE_URL` to your production domain
- Ensure all sensitive data is in `.env` (not hardcoded)

### 2. Frontend Build

#### Build for Production
```bash
cd frontend
npm run build
```
- Creates optimized production build in `frontend/dist/`
- Serve these static files from your backend or a CDN

### 3. Database Considerations

#### Current: SQLite
- ✅ Works fine for small to medium scale
- ⚠️ Consider PostgreSQL/MySQL for larger scale or better backup options
- ⚠️ Set up regular database backups

### 4. Server Configuration

#### Static File Serving
- Configure backend to serve frontend build files
- Or use a separate web server (Nginx, Apache) for frontend

#### Process Management
- Use PM2 or similar for process management
- Set up auto-restart on crashes
- Configure logging

### 5. Additional Security

- [ ] Add rate limiting (prevent brute force attacks)
- [ ] Add request validation middleware
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up proper error handling (don't expose stack traces)
- [ ] Change all default passwords

## 📋 Deployment Steps

1. **Update `.env` file for production:**
   ```env
   NODE_ENV=production
   PORT=3001
   BASE_URL=https://yourdomain.com
   JWT_SECRET=your-strong-random-secret-here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=AMU Multi Services <your-email@gmail.com>
   ```

2. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Update user emails:**
   - Go to Admin Dashboard → User Management
   - Update all user emails from `@example.com` to real emails

4. **Change default passwords:**
   - Update all default user passwords in the system

5. **Deploy backend:**
   - Upload backend folder to server
   - Install dependencies: `npm install --production`
   - Start with PM2: `pm2 start server.js --name voucher-api`

6. **Deploy frontend:**
   - Option A: Serve from backend (configure static file serving)
   - Option B: Serve from separate web server (Nginx/Apache)
   - Option C: Deploy to CDN (Vercel, Netlify, etc.)

## 🚀 Recommended Hosting Options

### Backend:
- **Heroku** - Easy deployment, free tier available
- **DigitalOcean** - VPS with full control
- **AWS EC2** - Scalable cloud hosting
- **Railway** - Simple Node.js hosting
- **Render** - Free tier available

### Frontend:
- **Vercel** - Excellent for React apps, free tier
- **Netlify** - Great for static sites, free tier
- **Same server as backend** - Serve from Express

## ⚠️ Important Notes

1. **Never commit `.env` file to Git** - It contains sensitive data
2. **Set up database backups** - SQLite files should be backed up regularly
3. **Monitor server logs** - Set up logging and monitoring
4. **Test email in production** - Verify SMTP works on production server
5. **HTTPS is essential** - Use Let's Encrypt for free SSL certificate

## 🔍 Testing Before Launch

- [ ] Test all user roles (Admin, GM, Accountant, Uploaders)
- [ ] Test voucher creation workflow
- [ ] Test email notifications
- [ ] Test PDF generation
- [ ] Test Excel report downloads
- [ ] Test user management
- [ ] Test on different browsers
- [ ] Test on mobile devices

