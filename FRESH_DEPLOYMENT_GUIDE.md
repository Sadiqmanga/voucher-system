# Fresh Deployment Guide - Start from Scratch

## Step 1: Delete Existing Services in Railway

1. **Go to Railway Dashboard**
2. **For each service** (`voucher-system` and `voucher-system-frontend`):
   - Click on the service
   - Go to **"Settings"** tab
   - Scroll down to **"Danger Zone"** or **"Delete Service"**
   - Click **"Delete"** or **"Remove Service"**
   - Confirm deletion

3. **Or delete the entire project:**
   - Go to project settings
   - Delete the entire project
   - Create a new project

---

## Step 2: Verify Your Code is Ready

Make sure your code is pushed to GitHub:

```bash
cd "/Users/sadiqmanga/my-project voucher"
git status
git add .
git commit -m "Ready for fresh deployment"
git push
```

---

## Step 3: Create New Backend Service

1. **Go to Railway Dashboard**
2. **Click "New Project"** (or use existing project)
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository**

5. **Configure Backend Service:**
   - **Name:** `voucher-system-backend` (or `backend`)
   - **Root Directory:** `backend`
   - **Build Command:** (leave empty or `npm install`)
   - **Start Command:** `npm start`
   - **Service Type:** Make sure it's "Web Service" (not Worker)

6. **Add Environment Variables** (in "Variables" tab):
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-random-secret-key-min-32-characters-long
   FRONTEND_URL=https://your-frontend-url.railway.app
   TZ=Africa/Lagos
   ```
   - ⚠️ **Don't set `FRONTEND_URL` yet** - we'll set it after frontend is deployed
   - ⚠️ **Set `JWT_SECRET`** to any random string (at least 32 characters)

7. **Wait for deployment to complete**
8. **Note the backend URL** - it will be shown at the top of the service page
   - Example: `voucher-system-backend-production.up.railway.app`

---

## Step 4: Test Backend

1. **Open in browser:**
   ```
   https://your-backend-url.railway.app/api/health
   ```
   - Should show: `{"status":"ok"}`

2. **If it works, proceed to Step 5**
3. **If it doesn't work, check:**
   - Service type is "Web Service"
   - Deployment completed successfully
   - Check logs for errors

---

## Step 5: Create New Frontend Service

1. **In same Railway project, click "New" or "+"**
2. **Select "GitHub Repo"** (same repository)
3. **Configure Frontend Service:**
   - **Name:** `voucher-system-frontend` (or `frontend`)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** (leave empty OR `npx serve -s dist -l 3000`)
   - **Service Type:** Make sure it's "Web Service"

4. **Add Environment Variable** (in "Variables" tab):
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   - ⚠️ **Replace with your actual backend URL from Step 3**
   - ⚠️ **No trailing slash!**
   - ⚠️ **Must start with `https://`**

5. **Wait for deployment to complete**
6. **Note the frontend URL** - it will be shown at the top of the service page
   - Example: `voucher-system-frontend-production.up.railway.app`

---

## Step 6: Update Backend CORS

1. **Go back to Backend service**
2. **Go to "Variables" tab**
3. **Update `FRONTEND_URL`:**
   ```
   FRONTEND_URL=https://your-frontend-url.railway.app
   ```
   - Replace with your actual frontend URL from Step 5
   - No trailing slash!

4. **Redeploy backend** (go to Deployments → Redeploy)

---

## Step 7: Test Everything

1. **Test Backend:**
   ```
   https://your-backend-url.railway.app/api/health
   ```
   - Should show: `{"status":"ok"}`

2. **Test Frontend:**
   ```
   https://your-frontend-url.railway.app
   ```
   - Should show login page

3. **Test Login:**
   - Email: `admin@example.com`
   - Password: `password123`
   - Should work!

---

## Step 8: Verify Configuration

### Backend Service Should Have:
- ✅ Root Directory: `backend`
- ✅ Start Command: `npm start`
- ✅ Service Type: Web Service
- ✅ Environment Variables:
  - `NODE_ENV=production`
  - `JWT_SECRET=...`
  - `FRONTEND_URL=https://your-frontend-url.railway.app`

### Frontend Service Should Have:
- ✅ Root Directory: `frontend`
- ✅ Build Command: `npm install && npm run build`
- ✅ Service Type: Web Service
- ✅ Environment Variable:
  - `VITE_API_URL=https://your-backend-url.railway.app`

---

## Troubleshooting

### Backend Returns 404:
- Check service type is "Web Service"
- Check Root Directory is `backend`
- Check Start Command is `npm start`
- Check deployment completed successfully

### Frontend Shows "Failed to fetch":
- Check `VITE_API_URL` is set correctly
- Check frontend was redeployed after setting variable
- Check backend is accessible: `/api/health`

### CORS Errors:
- Check `FRONTEND_URL` is set in backend
- Check backend was redeployed after setting variable
- Check URLs match exactly (no trailing slashes)

---

## Quick Checklist:

- [ ] Deleted old services
- [ ] Created new backend service
- [ ] Backend `/api/health` works
- [ ] Created new frontend service
- [ ] Set `VITE_API_URL` in frontend
- [ ] Frontend deployed successfully
- [ ] Set `FRONTEND_URL` in backend
- [ ] Backend redeployed
- [ ] Login works!

---

**Take it step by step, and test after each step!**

