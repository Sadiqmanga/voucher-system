# 🚨 Quick Fix for "Failed to fetch" on Railway

## Your Frontend URL:
`voucher-system-frontend-production.up.railway.app`

## Step-by-Step Fix:

### 1. Find Your Backend URL
1. Go to Railway Dashboard
2. Click on your **Backend** service
3. Go to **Settings** → **Networking** or **Settings** → **Domains**
4. Copy your backend URL (should look like: `voucher-system-backend-production.up.railway.app`)

### 2. Set Frontend Environment Variable
1. In Railway Dashboard, click on your **Frontend** service
2. Go to **Variables** tab
3. Click **+ New Variable**
4. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.railway.app` (replace with your actual backend URL)
   - **Example:** `https://voucher-system-backend-production.up.railway.app`
5. Click **Add**

### 3. Set Backend Environment Variables
1. Click on your **Backend** service
2. Go to **Variables** tab
3. Make sure you have:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://voucher-system-frontend-production.up.railway.app`
   - (Add any other required variables)

### 4. Redeploy
1. Railway should auto-redeploy after adding variables
2. If not, go to **Deployments** tab and click **Redeploy**
3. Wait for deployment to complete (green checkmark)

### 5. Test Backend
Open in browser: `https://your-backend-url.railway.app/api/health`

Should show: `{"status":"ok"}`

If this doesn't work, your backend isn't running correctly.

### 6. Clear Browser Cache
- Press **Ctrl+Shift+Delete** (Windows) or **Cmd+Shift+Delete** (Mac)
- Or hard refresh: **Ctrl+F5** (Windows) or **Cmd+Shift+R** (Mac)

### 7. Try Login Again
- Email: `admin@example.com`
- Password: `password123`

---

## 🔍 Still Not Working?

### Check Browser Console:
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Try to login
4. Look for error messages
5. Share the exact error message

### Check Network Tab:
1. In DevTools, go to **Network** tab
2. Try to login
3. Look for failed requests (red)
4. Click on the failed request
5. Check the **Request URL** - is it pointing to your backend?

### Verify Environment Variable:
1. In Railway, go to Frontend service → Variables
2. Make sure `VITE_API_URL` is set correctly
3. Make sure it starts with `https://`
4. Make sure there's NO trailing slash

---

## ⚠️ Common Mistakes:

❌ Wrong: `VITE_API_URL=voucher-system-backend-production.up.railway.app` (missing https://)
❌ Wrong: `VITE_API_URL=https://voucher-system-backend-production.up.railway.app/` (trailing slash)
✅ Correct: `VITE_API_URL=https://voucher-system-backend-production.up.railway.app`

---

## 📝 What to Share if Still Not Working:

1. Your backend Railway URL
2. Screenshot of Frontend Variables in Railway
3. Browser console error message
4. Network tab showing the failed request URL


