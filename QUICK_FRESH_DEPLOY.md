# Quick Fresh Deployment - Step by Step

## 🗑️ Step 1: Delete Old Services (2 minutes)

1. **Go to Railway Dashboard**
2. **For each service:**
   - Click service → Settings → Scroll down → Delete/Remove
   - OR delete entire project and create new one

---

## 🔧 Step 2: Deploy Backend First (5 minutes)

1. **New Project** → **Deploy from GitHub** → Select your repo

2. **Backend Service Settings:**
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`
   - **Service Type:** Web Service (important!)

3. **Add Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=change-this-to-random-secret-key-32-chars-minimum
   PORT=3001
   TZ=Africa/Lagos
   ```

4. **Wait for deployment** (2-3 minutes)

5. **Test:** `https://your-backend-url.railway.app/api/health`
   - Should show: `{"status":"ok"}` ✅

6. **Copy backend URL** - you'll need it for frontend!

---

## 🎨 Step 3: Deploy Frontend (5 minutes)

1. **In same project, click "+" → GitHub Repo** (same repo)

2. **Frontend Service Settings:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** (leave empty)
   - **Service Type:** Web Service

3. **Add Variable:**
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   ⚠️ Use the EXACT backend URL from Step 2!

4. **Wait for deployment** (3-5 minutes)

5. **Copy frontend URL**

---

## 🔗 Step 4: Connect Frontend to Backend (2 minutes)

1. **Go to Backend service → Variables**
2. **Add/Update:**
   ```
   FRONTEND_URL=https://your-frontend-url.railway.app
   ```
   ⚠️ Use the EXACT frontend URL from Step 3!

3. **Redeploy backend** (Deployments → Redeploy)

---

## ✅ Step 5: Test (1 minute)

1. **Open frontend URL**
2. **Login with:**
   - Email: `admin@example.com`
   - Password: `password123`

3. **Should work!** ✅

---

## 📋 Quick Reference

### Backend Needs:
- Root: `backend`
- Start: `npm start`
- Type: Web Service
- Vars: `NODE_ENV`, `JWT_SECRET`, `FRONTEND_URL`

### Frontend Needs:
- Root: `frontend`
- Build: `npm install && npm run build`
- Type: Web Service
- Var: `VITE_API_URL` (backend URL)

---

**Total time: ~15 minutes**

**Most important:** 
1. Service Type must be "Web Service" (not Worker)
2. Set `VITE_API_URL` in frontend BEFORE deploying
3. Set `FRONTEND_URL` in backend AFTER frontend is deployed
4. Test `/api/health` before proceeding

