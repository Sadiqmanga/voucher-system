# Backend 404 Error - Fix Guide

## Problem
Backend is returning 404 for `/api/health` endpoint, meaning API routes aren't being served.

---

## Possible Causes:

### 1. Deployment Not Complete
- The fix hasn't been deployed yet
- Railway is still building/deploying

### 2. Wrong Service URL
- You might be testing the wrong backend service
- Frontend and backend might be on different services

### 3. Backend Not Running
- Backend service might have crashed
- Check Railway logs

---

## Step 1: Check Deployment Status

1. **Go to Railway Dashboard**
2. **Click on `voucher-system` service (backend)**
3. **Go to "Deployments" tab**
4. **Check latest deployment:**
   - Is it still "Building" or "Deploying"?
   - Or does it show "Success"?
   - When was it deployed? (should be recent, after the fix)

---

## Step 2: Check Backend Logs

1. **Go to "Logs" tab** (or "Deploy Logs")
2. **Look for:**
   - `✅ Server is running on http://0.0.0.0:3001`
   - `✅ Database initialized successfully`
   - Any error messages

---

## Step 3: Verify Backend Service URL

1. **In Railway Dashboard:**
   - Click on `voucher-system` service
   - Look at the top of the page
   - **What URL does it show?**
     - Should be: `voucher-system-production-3a2d.up.railway.app`
     - Or: `voucher-system-production.up.railway.app`
     - Or something else?

2. **Make sure you're testing the CORRECT backend URL**

---

## Step 4: Check if Backend Has Frontend Dist Folder

The backend might be trying to serve static files that don't exist.

1. **Check Railway backend logs:**
   - Look for errors about missing files
   - Look for "Cannot GET /api/health" errors

2. **The backend should work even without frontend dist folder**
   - API routes should work independently

---

## Step 5: Manual Redeploy

If deployment shows "Success" but still 404:

1. **Go to "Deployments" tab**
2. **Click "Redeploy"** on latest deployment
3. **Wait for it to complete**
4. **Test again**

---

## Step 6: Verify Service Type

1. **Go to "Settings" tab**
2. **Check "Service Type":**
   - Should be "Web Service" or "Web"
   - NOT "Worker" or "Cron Job"

---

## Quick Test Commands

Test these URLs (replace with your actual backend URL):

```bash
# Health check
curl https://voucher-system-production-3a2d.up.railway.app/api/health

# Should return: {"status":"ok"}

# Test login endpoint (should return error, not 404)
curl -X POST https://voucher-system-production-3a2d.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}'

# Should return: {"error":"Email and password are required"} or similar
# NOT 404!
```

---

## What to Check:

1. **Latest deployment status:** (Building/Success/Failed)
2. **Backend service URL:** (What does Railway show?)
3. **Backend logs:** (Any errors?)
4. **Service type:** (Web Service or Worker?)

---

**Most likely issue:** The deployment hasn't completed yet, or you're testing the wrong URL. Check Railway dashboard first!

