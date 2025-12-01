# Frontend API URL Configuration Fix

## Problem
Frontend is deployed but API requests are failing with `net::ERR...` errors.

---

## Step 1: Check What URL Frontend is Trying to Use

1. **Open your frontend in browser:**
   - `https://voucher-system-production-3a2d.up.railway.app`

2. **Open Browser Console (F12)**
3. **Go to "Console" tab**
4. **Try to login**
5. **Look for this log message:**
   ```
   Login attempt to: [SOME URL]
   ```
   
   **What URL does it show?**
   - If it shows `/api/auth/login` → Frontend doesn't have `VITE_API_URL` set
   - If it shows a full URL → Check if it's correct

---

## Step 2: Get Your Backend URL

1. **Go to Railway Dashboard**
2. **Click on your BACKEND service** (not frontend)
3. **Look at the top of the page - what URL does it show?**
   - Should be something like: `voucher-system-production.up.railway.app`
   - Or: `voucher-system-xxxxx.up.railway.app`
   
4. **Copy this EXACT URL**

---

## Step 3: Set Frontend Environment Variable

1. **In Railway Dashboard:**
   - Click on your **FRONTEND** service
   - Go to **"Variables"** tab
   - Look for `VITE_API_URL`
   
2. **If `VITE_API_URL` is NOT set or is wrong:**
   - Click **"+ New Variable"** or edit existing
   - **Name:** `VITE_API_URL`
   - **Value:** `https://YOUR-BACKEND-URL.railway.app`
     - Replace `YOUR-BACKEND-URL` with the URL from Step 2
     - Example: `https://voucher-system-production.up.railway.app`
   - **IMPORTANT:**
     - Must start with `https://`
     - NO trailing slash
     - Use the EXACT backend URL from Railway
   
3. **Click "Add" or "Save"**

---

## Step 4: Redeploy Frontend

**CRITICAL:** After setting `VITE_API_URL`, you MUST redeploy the frontend!

1. **Go to "Deployments" tab** in your frontend service
2. **Click "Redeploy"** on the latest deployment
3. **Wait for deployment to complete** (2-5 minutes)

**Why?** Vite environment variables are baked into the build at build time. Changing the variable won't affect the already-built app - you need to rebuild!

---

## Step 5: Verify Backend is Accessible

Before testing frontend, verify backend works:

1. **Open in browser:**
   ```
   https://YOUR-BACKEND-URL.railway.app/api/health
   ```
   
2. **Should show:** `{"status":"ok"}`

3. **If it doesn't work:**
   - Backend isn't running correctly
   - Check backend logs in Railway
   - Fix backend first before testing frontend

---

## Step 6: Test Frontend Again

1. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Or hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

2. **Try login again:**
   - Email: `admin@example.com`
   - Password: `password123`

3. **Check Console:**
   - Should now show: `Login attempt to: https://YOUR-BACKEND-URL.railway.app/api/auth/login`
   - Should NOT show errors

---

## Step 7: Set Backend CORS (If Still Failing)

If you still get CORS errors:

1. **Go to Backend service → Variables**
2. **Add/Update:**
   ```
   FRONTEND_URL=https://voucher-system-production-3a2d.up.railway.app
   ```
   (Use your actual frontend URL)

3. **Redeploy backend**

---

## Quick Checklist:

- [ ] Got backend URL from Railway backend service
- [ ] Set `VITE_API_URL` in frontend service variables
- [ ] Redeployed frontend (IMPORTANT!)
- [ ] Tested backend health endpoint directly
- [ ] Cleared browser cache
- [ ] Checked console for correct API URL

---

## Most Common Mistakes:

1. **Not redeploying frontend after setting `VITE_API_URL`**
   - Fix: Must redeploy!

2. **Wrong backend URL**
   - Fix: Use the EXACT URL from Railway backend service

3. **Trailing slash in `VITE_API_URL`**
   - Fix: Should be `https://url.railway.app` NOT `https://url.railway.app/`

4. **Missing `https://`**
   - Fix: Must start with `https://`

---

**The most important step is Step 4 - you MUST redeploy the frontend after setting `VITE_API_URL`!**

