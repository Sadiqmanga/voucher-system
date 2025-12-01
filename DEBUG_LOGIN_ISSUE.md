# Debug Login Issue - Step by Step

## What to Check in Browser DevTools

---

## Step 1: Check Console Tab

1. **Open DevTools (F12)**
2. **Go to "Console" tab**
3. **Clear the console** (click the clear icon or press `Ctrl+L`)
4. **Try to login** with:
   - Email: `admin@example.com`
   - Password: `password123`
5. **Look for these messages:**

### Expected Messages:
```
🔗 API Request: {
  endpoint: "/api/auth/login",
  cleanEndpoint: "/api/auth/login",
  baseUrl: "https://voucher-system-production.up.railway.app",
  fullUrl: "https://voucher-system-production.up.railway.app/api/auth/login",
  apiBaseUrl: "https://voucher-system-production.up.railway.app",
  env: "production"
}
Login attempt to: https://voucher-system-production.up.railway.app/api/auth/login
```

### If you see errors:
- ❌ `Failed to fetch` → Backend not reachable
- ❌ `CORS error` → Backend CORS not configured
- ❌ `401 Unauthorized` → Wrong credentials
- ❌ `404 Not Found` → Wrong API endpoint

---

## Step 2: Check Network Tab

1. **Go to "Network" tab**
2. **Clear network log** (click the clear icon)
3. **Try to login**
4. **Look for a request named `login` or to `/api/auth/login`**

### Click on the request and check:

#### Request Tab:
- **Request URL:** Should be `https://voucher-system-production.up.railway.app/api/auth/login`
- **Request Method:** Should be `POST`
- **Request Headers:** Should include `Content-Type: application/json`

#### Payload Tab:
- Should show:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```

#### Response Tab:
- **Status Code:**
  - ✅ `200 OK` → Success! Check response body for token
  - ❌ `401` → Wrong credentials
  - ❌ `404` → Endpoint not found
  - ❌ `500` → Server error
  - ❌ `(failed)` → Network error

- **Response Body:**
  - Success should show: `{"token": "...", "user": {...}}`
  - Error should show: `{"error": "..."}`

---

## Step 3: Common Issues and Fixes

### Issue 1: No Request Appears in Network Tab
**Cause:** Form validation is blocking submission
**Fix:** 
- Clear email and password fields
- Type credentials fresh (don't use autofill)
- Make sure both fields are filled

### Issue 2: Request Shows "Failed" or "CORS Error"
**Cause:** Backend not accessible or CORS not configured
**Fix:**
- Check backend is running: `https://voucher-system-production.up.railway.app/api/health`
- Check `FRONTEND_URL` is set in backend variables
- Redeploy backend

### Issue 3: Request Shows 401 Unauthorized
**Cause:** Wrong credentials
**Fix:**
- Use: `admin@example.com` / `password123`
- Check backend logs for authentication errors

### Issue 4: Request URL is Wrong
**Cause:** `VITE_API_URL` not set or wrong
**Fix:**
- Check `VITE_API_URL` in frontend service variables
- Should be: `https://voucher-system-production.up.railway.app`
- Redeploy frontend after setting

---

## Step 4: Verify Backend is Working

Test backend directly:

1. **Open new tab**
2. **Go to:** `https://voucher-system-production.up.railway.app/api/health`
3. **Should show:** `{"status":"ok"}`

If this doesn't work, backend isn't running correctly.

---

## What to Share:

Please share:

1. **Console Tab:**
   - What messages do you see? (Copy/paste them)
   - Especially the "🔗 API Request:" message

2. **Network Tab:**
   - Do you see a request to `/api/auth/login`? (Yes/No)
   - What is the status code? (200, 401, 404, failed?)
   - What does the response show?

3. **Backend Health:**
   - Does `https://voucher-system-production.up.railway.app/api/health` work? (Yes/No)

---

**The most important thing is to check the Console tab for the "🔗 API Request:" message - this will show if the URL is being constructed correctly!**

