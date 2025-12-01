# Railway Environment Variables Guide

## What Each Service Needs:

---

## 🎨 Frontend Service (`voucher-system-frontend`)

### Required Variables:
```
VITE_API_URL=https://voucher-system-production.up.railway.app
```
- ⚠️ **This tells the frontend where the backend is**
- Replace with your actual backend URL
- No trailing slash
- Must start with `https://`

### Optional Variables:
- None needed for basic setup

---

## 🔧 Backend Service (`voucher-system`)

### Required Variables:
```
NODE_ENV=production
JWT_SECRET=your-random-secret-key-here-min-32-characters
```

### Important for CORS (to allow frontend to connect):
```
FRONTEND_URL=https://voucher-system-production-3a2d.up.railway.app
```
- ⚠️ **This tells the backend which frontend URLs to allow**
- Replace with your actual frontend URL
- No trailing slash
- Must start with `https://`

### Optional but Recommended:
```
PORT=3001
TZ=Africa/Lagos
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=AMU Multi Services <your-email@gmail.com>
```

---

## 📋 Quick Checklist:

### Frontend Service:
- [ ] `VITE_API_URL` is set to backend URL
- [ ] Frontend redeployed after setting variable

### Backend Service:
- [ ] `NODE_ENV=production` is set
- [ ] `JWT_SECRET` is set (any random string, at least 32 characters)
- [ ] `FRONTEND_URL` is set to frontend URL (for CORS)
- [ ] Backend deployed

---

## 🔄 Step-by-Step:

### 1. Backend Service (`voucher-system`):
1. Click on `voucher-system` service
2. Go to "Variables" tab
3. Check/Add:
   - `NODE_ENV=production`
   - `JWT_SECRET=some-random-secret-key-here`
   - `FRONTEND_URL=https://voucher-system-production-3a2d.up.railway.app`
4. Deploy backend (if you see "1 Change")

### 2. Frontend Service (`voucher-system-frontend`):
1. Click on `voucher-system-frontend` service
2. Go to "Variables" tab
3. Check/Add:
   - `VITE_API_URL=https://voucher-system-production.up.railway.app`
   - (Use your actual backend URL)
4. Redeploy frontend

---

## ❌ Common Mistakes:

1. **Setting `VITE_API_URL` in backend** ❌
   - Backend doesn't need this - it's frontend-only!

2. **Not setting `FRONTEND_URL` in backend** ❌
   - This causes CORS errors - frontend can't connect!

3. **Not redeploying after setting variables** ❌
   - Frontend must be rebuilt for `VITE_API_URL` to take effect!

---

**Summary:**
- **Frontend** needs `VITE_API_URL` (where to find backend)
- **Backend** needs `FRONTEND_URL` (which frontend to allow)

