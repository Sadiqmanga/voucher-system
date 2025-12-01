# Railway Backend Setup Guide
## Backend Service Not Running / No Logs

If you see "No logs in this time range", the backend service likely isn't running or hasn't been configured correctly.

---

## Step 1: Verify Backend Service Exists

1. **In Railway Dashboard:**
   - Do you see a service called `voucher-system` or similar?
   - Is it showing as "Active", "Failed", or "Building"?

2. **If you DON'T see a backend service:**
   - You need to create/add it first
   - See "Create Backend Service" below

---

## Step 2: Check Service Configuration

Click on your backend service and check:

### A. Root Directory
- Should be: `backend` (if your repo has frontend/backend folders)
- Or: leave empty if backend files are in root

### B. Build Command
- Should be: `npm install`
- Or: leave empty (Railway auto-detects)

### C. Start Command
- Should be: `npm start`
- Or: `node server.js`

### D. Environment Variables
Make sure these are set:
```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secret-here
```

---

## Step 3: Check Deployment Status

1. **Go to "Deployments" tab**
2. **Check the latest deployment:**
   - Does it show "Success" or "Failed"?
   - Click on it to see build logs
   - Look for any errors

---

## Step 4: Create Backend Service (If Missing)

If you don't have a backend service:

1. **In Railway Dashboard:**
   - Click "New" or "+"
   - Select "GitHub Repo" or "Empty Project"
   - Choose your repository

2. **Configure Service:**
   - **Name:** `voucher-system` or `backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

3. **Add Environment Variables:**
   - `NODE_ENV=production`
   - `PORT=3001`
   - `JWT_SECRET=your-secret-here`
   - `FRONTEND_URL=https://your-frontend-url.railway.app`

4. **Deploy:**
   - Railway should auto-deploy
   - Wait for deployment to complete
   - Check logs

---

## Step 5: Force a Deployment

1. **Go to Deployments tab**
2. **Click "Redeploy"** or **"Deploy"**
3. **Wait for build to complete**
4. **Check logs again**

---

## Step 6: Check Service Settings

1. **Go to Settings tab**
2. **Check:**
   - **Service Name** - should be clear
   - **Root Directory** - should be `backend` if you have backend/ folder
   - **Build Command** - `npm install` or empty
   - **Start Command** - `npm start` or `node server.js`

---

## Step 7: Verify Package.json

Make sure `backend/package.json` has:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

---

## Step 8: Common Issues

### Issue 1: Service Not Deployed
**Symptom:** No logs, service shows "Not Deployed"
**Fix:** Click "Deploy" or trigger a new deployment

### Issue 2: Wrong Root Directory
**Symptom:** Build fails, can't find files
**Fix:** Set Root Directory to `backend` if your repo structure is:
```
repo/
  backend/
    server.js
    package.json
  frontend/
    ...
```

### Issue 3: Missing Start Command
**Symptom:** Service starts but immediately stops
**Fix:** Set Start Command to `npm start`

### Issue 4: Build Fails
**Symptom:** Deployment shows "Failed"
**Fix:** 
- Check build logs
- Verify all dependencies in package.json
- Check for syntax errors

---

## Step 9: Manual Test

If possible, test locally first:

```bash
cd backend
npm install
npm start
```

Then test: `http://localhost:3001/api/health`

If this works locally, the issue is Railway configuration.

---

## What to Check Now:

1. **Do you have a backend service in Railway?**
   - Yes → Check its status and configuration
   - No → Create one following Step 4

2. **What does the service status show?**
   - Active → Should have logs, check Step 2
   - Failed → Check deployment logs
   - Building → Wait for it to complete
   - Not Deployed → Deploy it

3. **Check Deployments tab:**
   - Any deployments?
   - Status of latest deployment?
   - Any errors in build logs?

---

## Quick Checklist:

- [ ] Backend service exists in Railway
- [ ] Service shows "Active" status
- [ ] Root Directory is set correctly (`backend` or empty)
- [ ] Start Command is set (`npm start`)
- [ ] Environment variables are set
- [ ] Latest deployment shows "Success"
- [ ] Logs tab shows server startup messages

---

**Most Likely Issue:** The backend service either:
1. Hasn't been created yet
2. Hasn't been deployed
3. Is configured incorrectly (wrong root directory or start command)

Share what you see in Railway - do you have a backend service? What's its status?


