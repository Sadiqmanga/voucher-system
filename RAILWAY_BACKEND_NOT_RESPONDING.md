# Railway Backend Not Responding - Fix Guide

## Problem
Backend service shows as "Active" and has logs, but doesn't respond to HTTP requests (timeout/connection errors).

---

## Root Cause
Railway requires services to listen on `0.0.0.0` (all interfaces), not just `localhost` or the default port binding.

---

## Solution Applied
Updated `server.js` to listen on `0.0.0.0`:

```javascript
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  // ...
});
```

---

## Next Steps

### 1. Commit and Push Changes
```bash
cd "/Users/sadiqmanga/my-project voucher"
git add backend/server.js
git commit -m "Fix: Listen on 0.0.0.0 for Railway deployment"
git push
```

### 2. Wait for Railway Auto-Deploy
- Railway will automatically detect the push
- Wait for deployment to complete (check Deployments tab)
- Should take 2-5 minutes

### 3. Test Backend Health
After deployment, test:
```
https://voucher-system-production.up.railway.app/api/health
```

**Expected:** `{"status":"ok"}`

---

## Verify Deployment

1. **Go to Railway Dashboard**
2. **Click on `voucher-system` service**
3. **Go to "Deployments" tab**
4. **Wait for new deployment to show "Success"**
5. **Check "Deploy Logs"** - should show:
   ```
   ✅ Server is running on http://0.0.0.0:3001
   ```

---

## If Still Not Working

### Check 1: Service URL
- In Railway Dashboard → Service → Settings
- Verify "Public Domain" is enabled
- Copy the service URL

### Check 2: Environment Variables
- Go to "Variables" tab
- Ensure `PORT` is set (Railway usually sets this automatically)
- Ensure `NODE_ENV=production`

### Check 3: Network Tab
- Railway might need a few minutes to propagate DNS
- Wait 5-10 minutes after deployment

### Check 4: Railway Status
- Check Railway status page: https://status.railway.app
- Check if there are any outages

---

## Alternative: Manual Redeploy

If auto-deploy doesn't work:

1. **Go to Deployments tab**
2. **Click "Redeploy"** on latest deployment
3. **Wait for build to complete**

---

## Test Commands

After deployment, test with:

```bash
# Health check
curl https://voucher-system-production.up.railway.app/api/health

# Should return: {"status":"ok"}
```

---

**The fix has been applied to your code. Now commit and push to trigger a new deployment!**

