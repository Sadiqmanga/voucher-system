# Railway Backend - No Logs Issue Fix

## Problem
Your backend service shows "ACTIVE" deployment but no logs appear. This usually means the service is crashing immediately after starting.

---

## Step 1: Check Deployment Build Logs (NOT Runtime Logs)

The "Logs" tab shows runtime logs. We need to check **build logs**:

1. **In Railway Dashboard:**
   - Click on your `voucher-system` service
   - Go to **"Deployments"** tab (you're already there)
   - Click on the **"View logs"** button next to the ACTIVE deployment
   - OR click on any of the FAILED deployments to see error messages

**What to look for:**
- Build errors
- Missing dependencies
- Syntax errors
- Database initialization errors

---

## Step 2: Check Service Settings

1. **Click on "Settings" tab** in your service
2. **Verify these settings:**

### Root Directory
- Should be: `backend` (if your repo structure is `repo/backend/`)
- Or: leave **empty** if backend files are in root

### Build Command
- Should be: `npm install`
- Or: leave **empty** (Railway auto-detects)

### Start Command
- **MUST BE:** `npm start`
- Or: `node server.js`

### Healthcheck Path (if available)
- Leave empty or set to: `/api/health`

---

## Step 3: Check Environment Variables

1. **Go to "Variables" tab**
2. **Verify these are set:**

**Required:**
```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secret-key-here
```

**Optional but recommended:**
```
FRONTEND_URL=https://your-frontend-url.railway.app
TZ=Africa/Lagos
```

**If JWT_SECRET is missing or empty, the service will crash!**

---

## Step 4: Check Metrics Tab

1. **Go to "Metrics" tab**
2. **Check:**
   - **CPU Usage** - should show activity if service is running
   - **Memory Usage** - should show usage if service is running
   - **Network** - should show traffic if service is receiving requests

**If all metrics are at 0, the service is NOT running.**

---

## Step 5: Common Issues & Fixes

### Issue 1: Wrong Root Directory
**Symptom:** Build fails, can't find `package.json`
**Fix:** 
- If your repo structure is:
  ```
  repo/
    backend/
      server.js
      package.json
    frontend/
      ...
  ```
- Set **Root Directory** to: `backend`

### Issue 2: Missing Start Command
**Symptom:** Service starts but immediately stops
**Fix:** Set **Start Command** to: `npm start`

### Issue 3: Missing JWT_SECRET
**Symptom:** Service crashes on startup
**Fix:** Add `JWT_SECRET` environment variable with any random string

### Issue 4: Database Path Issue
**Symptom:** Service crashes when initializing database
**Fix:** Railway should handle this automatically, but check build logs

### Issue 5: Port Configuration
**Symptom:** Service can't bind to port
**Fix:** Railway automatically sets `PORT` environment variable, but ensure your code uses `process.env.PORT || 3001`

---

## Step 6: Force a New Deployment

1. **Go to Deployments tab**
2. **Click "Redeploy"** or **"Deploy"**
3. **Watch the build logs** as it deploys
4. **Check for errors** during build

---

## Step 7: Test Locally First

Before deploying, test locally:

```bash
cd backend
npm install
npm start
```

If it works locally but not on Railway, it's a configuration issue.

---

## What to Share

Please check and share:

1. **Deployment Build Logs:**
   - Click "View logs" on the ACTIVE deployment
   - Copy any error messages

2. **Settings Tab:**
   - Root Directory: `?`
   - Start Command: `?`
   - Build Command: `?`

3. **Variables Tab:**
   - Is `JWT_SECRET` set? (Yes/No)
   - Is `NODE_ENV` set to `production`? (Yes/No)
   - Is `PORT` set? (Yes/No)

4. **Metrics Tab:**
   - Is there any CPU/Memory activity? (Yes/No)

---

## Quick Fix Checklist

- [ ] Checked deployment build logs (not runtime logs)
- [ ] Verified Root Directory is `backend` (if applicable)
- [ ] Verified Start Command is `npm start`
- [ ] Verified `JWT_SECRET` environment variable is set
- [ ] Verified `NODE_ENV=production` is set
- [ ] Checked Metrics tab for activity
- [ ] Redeployed the service
- [ ] Tested locally first

---

**Most Important:** Click "View logs" on the ACTIVE deployment to see build/runtime errors!

