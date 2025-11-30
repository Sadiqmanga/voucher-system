# Deployment Guide
## Voucher Management System - AMU Multi Services Ltd

This guide covers multiple deployment options for hosting your application online.

---

## 🚀 Quick Deployment Options

### Option 1: **Render.com** (Recommended - Free Tier Available)
- Easy setup
- Free tier for both frontend and backend
- Automatic SSL certificates
- Good for small to medium projects

### Option 2: **Railway.app** (Recommended - Easy Setup)
- Very simple deployment
- Free tier available
- Automatic deployments
- Built-in database options

### Option 3: **Vercel (Frontend) + Railway/Render (Backend)**
- Best performance for frontend
- Easy backend deployment
- Free tiers available

### Option 4: **DigitalOcean / AWS / Azure**
- More control
- Better for production
- Requires more setup

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are set
- [ ] Database is ready (SQLite for small projects, PostgreSQL for production)
- [ ] Email SMTP credentials are configured
- [ ] Frontend is built (`npm run build`)
- [ ] All tests are passing
- [ ] Production-ready JWT secret is set

---

## 🎯 Option 1: Deploy to Render.com (Recommended)

### Step 1: Prepare Your Code

1. **Create a `.gitignore` file** (if not exists):
```gitignore
node_modules/
.env
*.log
.DS_Store
backend/vouchers/
backend/reports/
backend/database/*.db
backend/database/*.db-journal
```

2. **Initialize Git repository:**
```bash
cd "/Users/sadiqmanga/my-project voucher"
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Deploy Backend to Render

1. **Go to [Render.com](https://render.com)** and sign up/login

2. **Create a New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository (or use Render's Git)
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     NODE_ENV=production
     PORT=10000
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-app-password
     SMTP_FROM=AMU Multi Services <your-email@gmail.com>
     BASE_URL=https://your-backend-url.onrender.com
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```

3. **Create a PostgreSQL Database (Optional but Recommended):**
   - Click "New +" → "PostgreSQL"
   - Note the connection string
   - Update your backend to use PostgreSQL (see database migration section)

### Step 3: Deploy Frontend to Vercel

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Go to [Vercel.com](https://vercel.com)** and sign up/login

3. **Import your project:**
   - Click "Add New" → "Project"
   - Import your Git repository
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:**
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```

4. **Update frontend API calls:**
   - Update `vite.config.js` to use environment variable for API URL

---

## 🎯 Option 2: Deploy to Railway.app (Easiest)

### Step 1: Deploy Backend

1. **Go to [Railway.app](https://railway.app)** and sign up/login

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Backend Service:**
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`
   - **Environment Variables:** (Add in Railway dashboard)
     ```
     NODE_ENV=production
     PORT=3001
     JWT_SECRET=your-super-secret-jwt-key
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-app-password
     SMTP_FROM=AMU Multi Services <your-email@gmail.com>
     BASE_URL=https://your-backend.railway.app
     FRONTEND_URL=https://your-frontend.railway.app
     ```

4. **Add PostgreSQL Database (Recommended):**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will provide connection string automatically

### Step 2: Deploy Frontend

1. **Add Frontend Service:**
   - In same Railway project, click "New" → "GitHub Repo"
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npx serve -s dist -l 3000`
   - **Environment Variables:**
     ```
     VITE_API_URL=https://your-backend.railway.app
     ```

---

## 🎯 Option 3: Deploy to DigitalOcean (More Control)

### Step 1: Create Droplet

1. **Create a new Droplet:**
   - Ubuntu 22.04 LTS
   - At least 1GB RAM (2GB recommended)
   - Choose a region close to your users

### Step 2: Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install PostgreSQL (optional, for production)
apt install -y postgresql postgresql-contrib
```

### Step 3: Deploy Application

```bash
# Clone your repository
cd /var/www
git clone your-repo-url voucher-system
cd voucher-system

# Install dependencies
cd backend
npm install --production
cd ../frontend
npm install
npm run build

# Start backend with PM2
cd ../backend
pm2 start server.js --name voucher-backend
pm2 save
pm2 startup

# Configure Nginx for frontend
# (See Nginx configuration below)
```

### Step 3: Nginx Configuration

Create `/etc/nginx/sites-available/voucher-system`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/voucher-system/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/voucher-system /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 4: SSL Certificate (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## 🔧 Database Migration (SQLite to PostgreSQL)

For production, it's recommended to use PostgreSQL instead of SQLite.

### Step 1: Install PostgreSQL Driver

```bash
cd backend
npm install pg
```

### Step 2: Update Database Connection

Create `backend/database/db-postgres.js`:

```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;
```

### Step 3: Update Schema

You'll need to convert SQLite schema to PostgreSQL. The main differences:
- `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
- `TEXT` → `VARCHAR` or `TEXT`
- `DATETIME` → `TIMESTAMP`

---

## 📝 Environment Variables for Production

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=3001

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=AMU Multi Services <your-email@gmail.com>

# URLs
BASE_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (Vite Environment)

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-domain.com
```

---

## 🔄 Update Frontend for Production

### Update Vite Config

Update `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
```

### Update API Calls

Make sure all API calls use the environment variable or relative paths:

```javascript
// In your API calls, use:
const API_URL = import.meta.env.VITE_API_URL || '';
fetch(`${API_URL}/api/vouchers`, ...)
```

---

## 🚀 Quick Start: Render.com Deployment

### Backend Deployment (Render)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **On Render.com:**
   - New Web Service
   - Connect GitHub repo
   - Settings:
     - **Name:** voucher-backend
     - **Root Directory:** `backend`
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Add environment variables (see above)
   - Deploy!

3. **Get your backend URL:** `https://voucher-backend.onrender.com`

### Frontend Deployment (Vercel)

1. **On Vercel.com:**
   - Import Project
   - Connect GitHub repo
   - Settings:
     - **Root Directory:** `frontend`
     - **Framework:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
   - Add environment variable:
     - `VITE_API_URL` = your Render backend URL
   - Deploy!

2. **Get your frontend URL:** `https://your-project.vercel.app`

---

## 🔐 Security Checklist for Production

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use HTTPS (SSL certificate)
- [ ] Set secure CORS origins (not `*`)
- [ ] Use environment variables (never commit secrets)
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Use strong passwords for all accounts
- [ ] Enable rate limiting (optional but recommended)
- [ ] Regular security updates

---

## 📊 Monitoring & Maintenance

### Recommended Tools:
- **Uptime Monitoring:** UptimeRobot (free)
- **Error Tracking:** Sentry (free tier)
- **Analytics:** Google Analytics
- **Logs:** Render/Railway provide built-in logs

---

## 🆘 Troubleshooting

### Common Issues:

1. **"Failed to fetch" in production:**
   - Check CORS settings
   - Verify API URL in frontend environment variables
   - Check backend is running

2. **Database errors:**
   - Verify database connection string
   - Check database is accessible
   - Review migration scripts

3. **Email not sending:**
   - Verify SMTP credentials
   - Check firewall/security settings
   - Test with test email endpoint

4. **Build failures:**
   - Check Node.js version compatibility
   - Review build logs
   - Verify all dependencies are in package.json

---

## 📞 Support

For deployment issues:
1. Check the deployment platform's documentation
2. Review error logs in the platform dashboard
3. Verify all environment variables are set
4. Test locally first before deploying

---

**Recommended for Quick Deployment:** Render.com (Backend) + Vercel (Frontend)
**Recommended for Production:** Railway.app (Full Stack) or DigitalOcean (More Control)

