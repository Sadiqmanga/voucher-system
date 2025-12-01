# Backend Troubleshooting Guide
## Backend Health Check Not Working

If `https://voucher-system-production.up.railway.app/api/health` doesn't return `{"status":"ok"}`, follow these steps:

---

## Step 1: Check Railway Backend Logs

1. **Go to Railway Dashboard**
2. **Click on your Backend service** (`voucher-system`)
3. **Go to "Logs" tab**
4. **Look for:**
   - Server startup messages
   - Error messages
   - "Server is running on..." message

### What to look for:

✅ **Good signs:**
- "Server is running on http://localhost:3001"
- "Database initialized successfully"
- No red error messages

❌ **Bad signs:**
- "Error: Cannot find module..."
- "Port already in use"
- Database errors
- Syntax errors

---

## Step 2: Check Backend Service Status

1. **In Railway Dashboard**
2. **Check if backend service shows "Active"** (green status)
3. **If it shows "Failed" or "Building":**
   - Check the latest deployment
   - Look at deployment logs
   - Check for build errors

---

## Step 3: Verify Environment Variables

Make sure these are set in your backend service:

### Required Variables:
```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secret-here
```

### Optional but Recommended:
```
FRONTEND_URL=https://voucher-system-production-3a2d.up.railway.app
TZ=Africa/Lagos
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=AMU Multi Services <your-email@gmail.com>
```

---

## Step 4: Check Railway Port Configuration

Railway automatically assigns a port. Your code should use:

```javascript
const PORT = process.env.PORT || 3001;
```

This is already correct in your `server.js`.

---

## Step 5: Check Build and Start Commands

In Railway, verify your backend service settings:

1. **Root Directory:** Should be `backend` (if your repo has frontend/backend folders)
2. **Build Command:** `npm install` (or leave empty if Railway auto-detects)
3. **Start Command:** `npm start`

### Verify package.json has:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

---

## Step 6: Common Issues and Fixes

### Issue 1: "Cannot find module" errors
**Fix:** Make sure `package.json` has all dependencies listed

### Issue 2: Database errors
**Fix:** 
- Check if database file is accessible
- For production, consider using Railway's PostgreSQL instead of SQLite

### Issue 3: Port conflicts
**Fix:** Railway handles ports automatically, but make sure you're using `process.env.PORT`

### Issue 4: Build fails
**Fix:**
- Check Node.js version compatibility
- Verify all dependencies install correctly
- Check for syntax errors in code

---

## Step 7: Test Backend Locally First

If possible, test the backend locally:

```bash
cd backend
npm install
npm start
```

Then test: `http://localhost:3001/api/health`

If this works locally but not on Railway, it's a deployment issue.

---

## Step 8: Check Railway Deployment

1. **Go to Backend Service → Deployments**
2. **Click on the latest deployment**
3. **Check:**
   - Build logs
   - Runtime logs
   - Any error messages

---

## Step 9: Restart Backend Service

1. **In Railway Dashboard**
2. **Go to Backend Service**
3. **Click "Redeploy"** or **"Restart"**
4. **Wait for deployment to complete**
5. **Check logs again**

---

## Step 10: Verify Backend URL

Make sure you're using the correct backend URL:

1. **In Railway Dashboard**
2. **Go to Backend Service → Settings**
3. **Check "Networking" or "Domains" section**
4. **Copy the exact URL Railway provides**

It might be:
- `voucher-system-production.up.railway.app`
- Or something like `voucher-system-production-xxxx.up.railway.app`

---

## What to Share:

1. **Railway Backend Logs** (screenshot or copy/paste)
2. **Backend Service Status** (Active/Failed/Building)
3. **Latest Deployment Status** (Success/Failed)
4. **Any error messages** from logs
5. **Backend URL** from Railway settings

---

## Quick Fixes to Try:

1. **Redeploy Backend:**
   - Go to Deployments → Click "Redeploy"

2. **Check Environment Variables:**
   - Make sure `NODE_ENV=production` is set
   - Make sure `PORT` is set (or let Railway handle it)

3. **Verify Start Command:**
   - Should be: `npm start`
   - Or: `node server.js`

4. **Check Root Directory:**
   - If your repo has `backend/` folder, set root directory to `backend`
   - If backend files are in root, leave root directory empty

---

**Most Common Issue:** Backend service isn't running or crashed. Check the logs first!


