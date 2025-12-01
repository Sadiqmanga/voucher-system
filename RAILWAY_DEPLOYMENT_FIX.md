# Railway Deployment Fix Guide
## Fixing "Failed to fetch" Error

If you're getting "Failed to fetch" after deploying to Railway, follow these steps:

---

## 🔧 Step 1: Update Frontend Environment Variable

### In Railway Dashboard:

1. **Go to your Frontend service**
2. **Click on "Variables" tab**
3. **Add/Update this environment variable:**

```
VITE_API_URL=https://your-backend-service.railway.app
```

**Important:** 
- Replace `your-backend-service.railway.app` with your actual Railway backend URL
- Get your backend URL from Railway dashboard (it should look like: `voucher-backend-production.up.railway.app`)
- **DO NOT** include a trailing slash
- Make sure it starts with `https://`

**Example:**
```
VITE_API_URL=https://voucher-backend-production.up.railway.app
```

---

## 🔧 Step 2: Update Backend CORS Settings

### In Railway Dashboard:

1. **Go to your Backend service**
2. **Click on "Variables" tab**
3. **Add/Update these environment variables:**

```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-service.railway.app
```

**Important:**
- Replace `your-frontend-service.railway.app` with your actual Railway frontend URL
- Get your frontend URL from Railway dashboard

**Example:**
```
NODE_ENV=production
FRONTEND_URL=https://voucher-frontend-production.up.railway.app
```

---

## 🔧 Step 3: Verify Backend Environment Variables

Make sure your backend has all required variables:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secure-random-string-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=AMU Multi Services <your-email@gmail.com>
FRONTEND_URL=https://your-frontend-service.railway.app
TZ=Africa/Lagos
```

---

## 🔧 Step 4: Redeploy Services

After updating environment variables:

1. **Redeploy Frontend:**
   - Go to your frontend service
   - Click "Deploy" or wait for automatic redeploy
   - Railway will rebuild with new environment variables

2. **Redeploy Backend:**
   - Go to your backend service
   - Click "Deploy" or wait for automatic redeploy

---

## 🔍 Step 5: Verify URLs

### Check Backend Health:

Open in browser: `https://your-backend-url.railway.app/api/health`

You should see: `{"status":"ok"}`

### Check Frontend:

Open in browser: `https://your-frontend-url.railway.app`

You should see the login page.

---

## 🐛 Troubleshooting

### Still getting "Failed to fetch"?

1. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for error messages
   - Check Network tab to see what URL is being called

2. **Verify Environment Variables:**
   - Make sure `VITE_API_URL` is set in frontend
   - Make sure `FRONTEND_URL` is set in backend
   - Check for typos in URLs
   - Make sure URLs start with `https://`

3. **Check Railway Logs:**
   - Go to Railway dashboard
   - Click on your service
   - Check "Deployments" tab
   - Look for errors in logs

4. **Test Backend Directly:**
   - Try accessing: `https://your-backend-url.railway.app/api/health`
   - If this doesn't work, your backend isn't running correctly

5. **Check CORS:**
   - Open browser DevTools → Network tab
   - Try to login
   - Look for CORS errors in console
   - If you see CORS errors, verify `FRONTEND_URL` in backend matches your frontend URL exactly

---

## 📝 Quick Checklist

- [ ] `VITE_API_URL` is set in frontend service (with full backend URL)
- [ ] `FRONTEND_URL` is set in backend service (with full frontend URL)
- [ ] `NODE_ENV=production` is set in backend
- [ ] Both services have been redeployed after setting variables
- [ ] Backend health check works: `/api/health`
- [ ] URLs don't have trailing slashes
- [ ] URLs start with `https://`

---

## 🔄 After Fixing

Once you've updated the environment variables and redeployed:

1. **Clear your browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Hard refresh** the page (Ctrl+F5 or Cmd+Shift+R)
3. **Try logging in again**

---

## 📞 Still Having Issues?

If you're still getting errors:

1. Share the exact error message from browser console
2. Share your Railway service URLs (backend and frontend)
3. Check Railway deployment logs for any errors
4. Verify that both services show "Active" status in Railway

---

**Note:** Environment variables in Vite (frontend) must start with `VITE_` to be accessible in the browser. That's why we use `VITE_API_URL` instead of just `API_URL`.


