# Railway Deployment Troubleshooting
## Common Issues and Solutions

---

## ❌ Issue: "Failed to fetch" Error

### Symptoms:
- Login page shows "Failed to fetch"
- Cannot connect to backend API
- Network errors in browser console

### Solution:

1. **Check Frontend Environment Variable:**
   - Go to Railway → Frontend Service → Variables
   - Verify `VITE_API_URL` is set
   - Format: `https://your-backend-url.railway.app` (no trailing slash)
   - **Redeploy frontend** after setting/updating

2. **Check Backend Environment Variable:**
   - Go to Railway → Backend Service → Variables
   - Verify `FRONTEND_URL` is set
   - Format: `https://your-frontend-url.railway.app` (no trailing slash)
   - **Redeploy backend** after setting/updating

3. **Test Backend Health:**
   - Open: `https://your-backend-url.railway.app/api/health`
   - Should return: `{"status":"ok"}`
   - If not working, check backend logs

4. **Clear Browser Cache:**
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache completely

---

## ❌ Issue: CORS Errors

### Symptoms:
- Browser console shows CORS errors
- "Access-Control-Allow-Origin" errors

### Solution:

1. **Verify `FRONTEND_URL` in Backend:**
   - Must match your frontend URL exactly
   - Include `https://`
   - No trailing slash

2. **Check Backend CORS Configuration:**
   - In `backend/server.js`, CORS should allow your frontend URL
   - Verify `NODE_ENV=production` is set

3. **Redeploy Backend:**
   - After updating `FRONTEND_URL`, redeploy backend service

---

## ❌ Issue: Backend Not Starting

### Symptoms:
- Backend service shows "Failed" in Railway
- No response from `/api/health`

### Solution:

1. **Check Railway Logs:**
   - Go to Backend Service → Deployments
   - Click on latest deployment
   - Check logs for errors

2. **Common Issues:**
   - Missing environment variables
   - Database initialization errors
   - Port configuration issues

3. **Verify Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001 (or Railway's assigned port)
   JWT_SECRET=set-this-value
   ```

4. **Check Database:**
   - SQLite should work, but check file permissions
   - Consider using Railway's PostgreSQL for production

---

## ❌ Issue: Frontend Build Fails

### Symptoms:
- Frontend deployment fails
- Build errors in Railway logs

### Solution:

1. **Check Build Command:**
   - Should be: `npm run build`
   - Verify `package.json` has build script

2. **Check Node Version:**
   - Railway should auto-detect Node version
   - Can specify in `package.json`: `"engines": { "node": "18.x" }`

3. **Check Dependencies:**
   - All dependencies should be in `package.json`
   - No missing packages

---

## ❌ Issue: Environment Variables Not Working

### Symptoms:
- Frontend still tries to connect to localhost
- `VITE_API_URL` not being used

### Solution:

1. **Verify Variable Name:**
   - Must be `VITE_API_URL` (not `API_URL`)
   - Vite only exposes variables starting with `VITE_`

2. **Redeploy After Setting:**
   - Environment variables are baked into build
   - Must rebuild/redeploy after changing

3. **Check Build Output:**
   - Look for `VITE_API_URL` in build logs
   - Should show the value being used

---

## ❌ Issue: Database Errors

### Symptoms:
- "Database locked" errors
- SQLite errors in logs

### Solution:

1. **For Production, Use PostgreSQL:**
   - Railway provides PostgreSQL
   - Add PostgreSQL service in Railway
   - Update backend to use PostgreSQL connection string

2. **For SQLite (Development):**
   - Check file permissions
   - Ensure database directory is writable
   - Consider using Railway's volume for persistence

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Backend health check works: `/api/health`
- [ ] `VITE_API_URL` is set in frontend (with full URL)
- [ ] `FRONTEND_URL` is set in backend (with full URL)
- [ ] Both services are "Active" in Railway
- [ ] No errors in Railway deployment logs
- [ ] Browser console shows no CORS errors
- [ ] URLs are correct (https://, no trailing slashes)
- [ ] Services have been redeployed after setting variables

---

## 🔍 Debugging Steps

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console for errors
   - Check Network tab for failed requests

2. **Check Railway Logs:**
   - Backend Service → Deployments → Latest → Logs
   - Frontend Service → Deployments → Latest → Logs

3. **Test Backend Directly:**
   - Try: `https://your-backend-url.railway.app/api/health`
   - Should return JSON: `{"status":"ok"}`

4. **Test Frontend:**
   - Open: `https://your-frontend-url.railway.app`
   - Should show login page
   - Check browser console for errors

5. **Verify Environment Variables:**
   - Railway → Service → Variables
   - Check all required variables are set
   - Check for typos

---

## 📞 Getting Help

If issues persist:

1. Share Railway deployment logs
2. Share browser console errors
3. Share your environment variable names (not values)
4. Share your service URLs
5. Describe exact steps to reproduce

---

**Remember:** After changing environment variables, you MUST redeploy the service for changes to take effect!


