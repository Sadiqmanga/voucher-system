# Frontend Railway Setup - Fix "Failed to fetch"

## Problem
Backend is running ✅, but frontend can't connect. This is because the frontend needs to know the backend URL.

---

## Step 1: Check if Frontend Service Exists

In Railway Dashboard:

1. **Do you see TWO services?**
   - `voucher-system` (backend) ✅ - This exists and is running
   - `voucher-system-frontend` or similar (frontend) ❓ - Does this exist?

**If you DON'T have a frontend service:**
- You need to create one (see Step 2)

**If you DO have a frontend service:**
- Go to Step 3

---

## Step 2: Create Frontend Service (If Missing)

1. **In Railway Dashboard:**
   - Click "New" or "+"
   - Select "GitHub Repo"
   - Choose your repository

2. **Configure Service:**
   - **Name:** `voucher-system-frontend` or `frontend`
   - **Root Directory:** `frontend` (if your repo has `frontend/` folder)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** Leave empty OR `npx serve -s dist -l 3000`
   - **OR use Vercel/Netlify** for frontend (easier for React apps)

3. **Add Environment Variable:**
   - **Variable Name:** `VITE_API_URL`
   - **Value:** `https://voucher-system-production.up.railway.app`
   - ⚠️ **IMPORTANT:** No trailing slash!

4. **Deploy**

---

## Step 3: Configure Frontend Service (If Exists)

1. **Click on your frontend service**
2. **Go to "Variables" tab**
3. **Add/Update this variable:**

   ```
   VITE_API_URL=https://voucher-system-production.up.railway.app
   ```

   ⚠️ **CRITICAL:**
   - Must start with `https://`
   - Must NOT have trailing slash
   - Must match your backend URL exactly

4. **Go to "Settings" tab**
5. **Verify:**
   - **Root Directory:** `frontend` (if applicable)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** Leave empty OR `npx serve -s dist -l 3000`

6. **Redeploy** the frontend service (after adding the variable)

---

## Step 4: Verify Backend CORS

1. **Go to backend service** (`voucher-system`)
2. **Go to "Variables" tab**
3. **Check/Add:**

   ```
   FRONTEND_URL=https://your-frontend-url.railway.app
   ```

   Replace `your-frontend-url.railway.app` with your actual frontend URL.

4. **Redeploy backend** (if you added/updated `FRONTEND_URL`)

---

## Step 5: Test Backend Directly

Open in browser:
```
https://voucher-system-production.up.railway.app/api/health
```

**Expected:** `{"status":"ok"}`

If this works, backend is fine ✅

---

## Step 6: Test Frontend

1. **Open your frontend URL** in browser
2. **Open Browser DevTools** (F12)
3. **Go to Console tab**
4. **Try to login**
5. **Check for errors:**
   - Look for the URL it's trying to connect to
   - Should be: `https://voucher-system-production.up.railway.app/api/auth/login`

---

## Common Issues

### Issue 1: VITE_API_URL Not Set
**Symptom:** Frontend tries to connect to relative path `/api/...` which fails
**Fix:** Add `VITE_API_URL` environment variable in frontend service

### Issue 2: Wrong VITE_API_URL Format
**Symptom:** Still "Failed to fetch"
**Fix:** 
- Must be: `https://voucher-system-production.up.railway.app`
- NOT: `https://voucher-system-production.up.railway.app/` (no trailing slash)
- NOT: `voucher-system-production.up.railway.app` (missing https://)

### Issue 3: Frontend Not Redeployed After Adding Variable
**Symptom:** Variable added but still not working
**Fix:** **Redeploy frontend service** after adding `VITE_API_URL`

### Issue 4: CORS Error
**Symptom:** Browser console shows CORS error
**Fix:** 
- Add `FRONTEND_URL` in backend service
- Redeploy backend

---

## Quick Checklist

- [ ] Frontend service exists in Railway
- [ ] `VITE_API_URL=https://voucher-system-production.up.railway.app` is set in frontend
- [ ] Frontend service was redeployed after adding variable
- [ ] `FRONTEND_URL` is set in backend (optional but recommended)
- [ ] Backend health check works: `https://voucher-system-production.up.railway.app/api/health`
- [ ] Tested frontend login

---

## Alternative: Use Vercel for Frontend

Railway is better for backends. For frontend, consider:

1. **Deploy frontend to Vercel:**
   - Connect GitHub repo
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
   - Add Environment Variable: `VITE_API_URL=https://voucher-system-production.up.railway.app`

2. **Benefits:**
   - Better for static sites
   - Free tier
   - Automatic HTTPS
   - Easy environment variables

---

## What to Check Now

1. **Do you have a frontend service in Railway?** (Yes/No)
2. **If yes, is `VITE_API_URL` set?** (Yes/No)
3. **What is the frontend service URL?** (Share it)

The most common issue is: **Frontend doesn't have `VITE_API_URL` environment variable set!**

