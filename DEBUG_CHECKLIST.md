# Debug Checklist for "Failed to fetch" Error

## Step 1: Check Browser Console
1. Open your frontend URL in browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Try to login
5. **Look for the log message:** `Login attempt to: [URL]`
   - This will show what URL the frontend is trying to connect to
   - Share this URL with me

## Step 2: Check Network Tab
1. In DevTools, go to **Network** tab
2. Try to login
3. Look for a request to `/api/auth/login`
4. Click on it
5. Check:
   - **Request URL** - What URL is it trying to reach?
   - **Status** - What status code? (404, 500, CORS error?)
   - **Response** - What does the response say?

## Step 3: Test Backend Directly
Open in a new browser tab:
```
https://voucher-system-production.up.railway.app/api/health
```

**Expected:** Should show `{"status":"ok"}`

**If this doesn't work:**
- Your backend isn't running
- Check Railway backend logs
- Check if backend service is "Active"

## Step 4: Verify Environment Variables

### Frontend Service (in Railway):
- [ ] `VITE_API_URL` is set
- [ ] Value is: `https://voucher-system-production.up.railway.app`
- [ ] No trailing slash
- [ ] Starts with `https://`

### Backend Service (in Railway):
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` is set to your frontend URL
- [ ] `PORT=3001` (or Railway's assigned port)

## Step 5: Check Railway Logs

### Backend Logs:
1. Go to Railway → Backend Service → **Logs** tab
2. Look for errors
3. Check if server started successfully
4. Look for CORS errors

### Frontend Logs:
1. Go to Railway → Frontend Service → **Logs** tab
2. Check build logs
3. Look for errors during build
4. Verify `VITE_API_URL` was used in build

## Step 6: Verify Deployment

### Backend:
- [ ] Service shows "Active" status
- [ ] Latest deployment has green checkmark
- [ ] No errors in deployment logs

### Frontend:
- [ ] Service shows "Active" status
- [ ] Latest deployment has green checkmark
- [ ] Build completed successfully

## Step 7: Test CORS

Open browser console and run:
```javascript
fetch('https://voucher-system-production.up.railway.app/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Expected:** Should return `{status: "ok"}`

**If CORS error:** Backend CORS configuration needs fixing

---

## Common Issues Found:

### Issue 1: VITE_API_URL not set in frontend
**Symptom:** Console shows request to `/api/auth/login` (relative URL)
**Fix:** Add `VITE_API_URL` to frontend service variables

### Issue 2: Wrong backend URL
**Symptom:** 404 errors or connection refused
**Fix:** Verify backend URL is correct in `VITE_API_URL`

### Issue 3: CORS error
**Symptom:** Browser console shows CORS error
**Fix:** Add `FRONTEND_URL` to backend and ensure it matches your frontend URL

### Issue 4: Backend not running
**Symptom:** Cannot access `/api/health`
**Fix:** Check Railway backend logs, restart service

### Issue 5: Frontend not rebuilt
**Symptom:** Old code still running
**Fix:** Redeploy frontend after setting `VITE_API_URL`

---

## What to Share:

1. **Browser Console Output:**
   - The "Login attempt to:" message
   - Any error messages

2. **Network Tab:**
   - Request URL
   - Status code
   - Response body

3. **Backend Health Check:**
   - Does `https://voucher-system-production.up.railway.app/api/health` work?

4. **Railway Status:**
   - Are both services "Active"?
   - Any errors in deployment logs?

5. **Environment Variables:**
   - What is `VITE_API_URL` set to? (just the variable name, not the value if sensitive)
   - Is `FRONTEND_URL` set in backend?


