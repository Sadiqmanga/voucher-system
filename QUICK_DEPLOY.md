# 🚀 Quick Deployment Guide
## Step-by-Step Instructions for Hosting Online

---

## Option 1: Render.com (Easiest - Recommended for Beginners)

### Step 1: Prepare Your Code

1. **Initialize Git (if not done):**
```bash
cd "/Users/sadiqmanga/my-project voucher"
git init
git add .
git commit -m "Initial commit"
```

2. **Create GitHub Repository:**
   - Go to [GitHub.com](https://github.com)
   - Create a new repository
   - Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/voucher-system.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy Backend to Render

1. **Go to [Render.com](https://render.com)** and sign up (free)

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Backend:**
   - **Name:** `voucher-backend` (or any name)
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid for better performance)

4. **Add Environment Variables:**
   Click "Environment" tab and add:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=change-this-to-a-random-32-character-string
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   SMTP_FROM=AMU Multi Services <your-email@gmail.com>
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL: `https://voucher-backend.onrender.com`

### Step 3: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign up (free)

2. **Import Project:**
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Frontend:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variable:**
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://voucher-backend.onrender.com` (your backend URL from Step 2)

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Copy your frontend URL: `https://your-project.vercel.app`

### Step 4: Update Backend CORS

1. **Go back to Render dashboard**
2. **Edit Environment Variables:**
   - Update `FRONTEND_URL` to your Vercel URL
3. **Redeploy** (automatic or manual)

### ✅ Done! Your app is live!

- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://voucher-backend.onrender.com`

---

## Option 2: Railway.app (All-in-One - Even Easier)

### Step 1: Prepare Code (Same as above)

### Step 2: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)** and sign up (free)

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Backend Service:**
   - Click "New" → "GitHub Repo"
   - Select your repo
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`

4. **Add Environment Variables:**
   Click on the service → "Variables" tab:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=change-this-to-a-random-32-character-string
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   SMTP_FROM=AMU Multi Services <your-email@gmail.com>
   FRONTEND_URL=https://your-frontend.railway.app
   ```

5. **Generate Domain:**
   - Click "Settings" → "Generate Domain"
   - Copy the URL: `https://your-backend.railway.app`

6. **Add Frontend Service:**
   - In same project, click "New" → "GitHub Repo"
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npx serve -s dist -l 3000`

7. **Add Frontend Environment Variable:**
   - Click on frontend service → "Variables"
   - Add: `VITE_API_URL` = your backend Railway URL
   - **Example:** `VITE_API_URL=https://voucher-backend-production.up.railway.app`
   - **Important:** Must include `https://` and NO trailing slash

8. **Generate Frontend Domain:**
   - Click "Settings" → "Generate Domain"

### ✅ Done! Both services on Railway!

---

## 🔐 Important: Update JWT Secret

**Before going live, change the JWT_SECRET:**

1. Generate a secure random string:
   ```bash
   # On Mac/Linux:
   openssl rand -base64 32
   
   # Or use an online generator
   ```

2. Update in your deployment platform's environment variables

---

## 📧 Email Configuration

Make sure your Gmail App Password is set correctly:
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password
4. Use it in `SMTP_PASS` environment variable

---

## 🧪 Test Your Deployment

1. **Visit your frontend URL**
2. **Try logging in** with:
   - Email: `admin@example.com`
   - Password: `password123`
3. **Test creating a voucher**
4. **Check email notifications** (if configured)

---

## 🐛 Troubleshooting

### "Failed to fetch" error:
- Check `VITE_API_URL` is set correctly in frontend
- Verify backend is running (check Render/Railway logs)
- Check CORS settings in backend

### Can't login:
- Verify JWT_SECRET is set
- Check backend logs for errors
- Ensure database is initialized

### Email not working:
- Verify SMTP credentials
- Check spam folder
- Review backend logs

---

## 📊 Monitoring

- **Render:** Built-in logs and metrics
- **Railway:** Built-in logs and metrics
- **Vercel:** Built-in analytics

---

## 💰 Cost Estimate

**Free Tier (Good for testing):**
- Render: Free (with limitations)
- Railway: $5/month free credit
- Vercel: Free for personal projects

**Production (Recommended):**
- Render: $7/month per service
- Railway: Pay-as-you-go (~$5-20/month)
- Vercel: Free (with Pro for $20/month)

---

## 🎯 Recommended Setup

**For Production:**
- **Backend:** Railway ($5-10/month)
- **Frontend:** Vercel (Free)
- **Database:** Railway PostgreSQL (included)

**For Testing:**
- **Backend:** Render (Free)
- **Frontend:** Vercel (Free)

---

## 📝 Next Steps After Deployment

1. ✅ Update default passwords
2. ✅ Add real user accounts
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring
5. ✅ Enable backups
6. ✅ Test all features

---

**Need Help?** Check the full `DEPLOYMENT_GUIDE.md` for more details!

