# Frontend Configuration Check

## Your Railway Dashboard Shows:

✅ **Frontend Service:** `voucher-system-frontend` - Deployed 13 minutes ago
⚠️ **Backend Service:** `voucher-system` - Has 1 pending change (needs deployment)

---

## Step 1: Deploy Backend First

Before configuring frontend, deploy the backend changes:

1. **Click on the `voucher-system` service** (backend)
2. **Click the "Deploy" button** (or "Apply 1 change")
3. **Wait for deployment to complete** (2-5 minutes)
4. **Note the backend URL** - it will be shown at the top of the service page

---

## Step 2: Check Frontend Configuration

1. **Click on `voucher-system-frontend` service**
2. **Go to "Variables" tab**
3. **Check if `VITE_API_URL` exists:**
   - ✅ **If it exists:** Check the value
   - ❌ **If it doesn't exist:** You need to add it

---

## Step 3: Set/Update VITE_API_URL

### If VITE_API_URL doesn't exist:

1. **Click "+ New Variable"**
2. **Set:**
   - **Name:** `VITE_API_URL`
   - **Value:** `https://voucher-system-production.up.railway.app`
     - ⚠️ **IMPORTANT:** Replace with your actual backend URL from Step 1
   - **No trailing slash!**
3. **Click "Add"**

### If VITE_API_URL exists but is wrong:

1. **Click on the variable to edit**
2. **Update the value** to your backend URL
3. **Save**

---

## Step 4: Redeploy Frontend

**CRITICAL:** After setting/updating `VITE_API_URL`:

1. **Go to "Deployments" tab** in frontend service
2. **Click "Redeploy"** on the latest deployment
3. **Wait for build to complete** (3-5 minutes)

---

## What Your Frontend Service Should Have:

### In "Variables" tab:
```
VITE_API_URL=https://voucher-system-production.up.railway.app
```
(Use your actual backend URL)

### In "Settings" tab:
- **Root Directory:** `frontend` (if your repo has frontend/ folder)
- **Build Command:** `npm install && npm run build`
- **Start Command:** (empty or `npx serve -s dist -l 3000`)

---

## Quick Checklist:

- [ ] Backend deployed (no "1 Change" showing)
- [ ] Backend URL noted
- [ ] `VITE_API_URL` set in frontend service
- [ ] Frontend redeployed after setting `VITE_API_URL`
- [ ] Tested login after redeploy

---

**First, deploy the backend, then configure the frontend!**

