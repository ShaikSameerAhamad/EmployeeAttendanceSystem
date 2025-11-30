# Deployment Guide

## ⚠️ IMPORTANT: MongoDB Atlas IP Whitelist (Required for Deployment)

**For deployment to work from ANY IP address (including evaluators), you MUST configure MongoDB Atlas:**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster
3. Click **"Network Access"** (Security section in left sidebar)
4. Click **"Add IP Address"**
5. Click **"Allow Access from Anywhere"** (this adds `0.0.0.0/0`)
   - OR manually enter: `0.0.0.0/0`
   - Add comment: "Deployment - Allow all IPs"
6. Click **"Confirm"**
7. Wait 1-2 minutes for changes to take effect

**⚠️ Security Note:** Allowing `0.0.0.0/0` is fine for demo/evaluation projects but ensure your database has strong credentials!

---

## Quick Deploy to Vercel (Frontend) + Render (Backend)

### Step 1: Prepare MongoDB Atlas

1. Sign up: https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0 Sandbox - Free)
3. Create database user:
   - Go to "Database Access"
   - Add New Database User
   - Choose Password authentication
   - Save username and password
4. Get connection string:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your actual password
5. **Configure IP Whitelist** (see IMPORTANT section above)
6. Run seed script locally (optional):
   ```bash
   cd backend
   npm install
   # Create .env with MONGODB_URI
   npm run seed
   ```

### Step 2: Deploy Backend to Render

1. Push your code to GitHub (if not already)
2. Go to https://render.com and sign up/login
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure settings:
   - **Name:** `attendance-system-backend` (or any name)
   - **Region:** Choose closest to your users
   - **Branch:** `main` or `master`
   - **Root Directory:** Leave blank (or `backend` if backend is in subfolder)
   - **Runtime:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free (or paid if needed)

6. **Environment Variables** (click "Advanced"):
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_system?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://your-app.vercel.app
   ```
   ⚠️ Replace with your actual values!

7. Click **"Create Web Service"**
8. Wait for deployment (takes 2-3 minutes)
9. **Copy your backend URL** (looks like: `https://attendance-system-backend.onrender.com`)

### Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (or `employee-time-tracker` if in subfolder)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   ⚠️ Replace with your actual Render backend URL!

6. Click **"Deploy"**
7. Wait for deployment
8. **Copy your frontend URL** (looks like: `https://attendance-system.vercel.app`)

### Step 4: Update Backend CORS

1. Go back to Render dashboard
2. Click on your backend service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Save changes (this will trigger a redeploy)

### Step 5: Verify Deployment

1. Visit your Vercel frontend URL
2. Try logging in with demo credentials:
   - Employee: `john@company.com` / `password123`
   - Manager: `sarah@company.com` / `password123`
3. Check browser console for any errors
4. Test all features (check-in, check-out, etc.)

---

## Alternative: Deploy to Railway

### Backend on Railway:

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo
4. Add environment variables (same as Render)
5. Railway auto-detects Node.js - deploy!

### Frontend on Railway:

1. Same project → New Service → GitHub Repo
2. Settings:
   - Build Command: `npm run build`
   - Start Command: `npm run preview` (or use static hosting)
   - Output Directory: `dist`

---

## Environment Variables Summary

### Backend (.env or Render/Railway):
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/attendance_system
JWT_SECRET=your-random-secret-key-min-32-characters
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend (.env or Vercel):
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## Troubleshooting

### MongoDB Connection Error:
- ✅ Check IP whitelist includes `0.0.0.0/0`
- ✅ Verify connection string has correct password
- ✅ Ensure database user has read/write permissions

### CORS Errors:
- ✅ Verify `FRONTEND_URL` in backend matches exact frontend URL (including https://)
- ✅ Check browser console for specific CORS error

### API Not Working:
- ✅ Verify `VITE_API_URL` in frontend includes `/api` at the end
- ✅ Check Render/Railway logs for backend errors
- ✅ Test backend health endpoint: `https://your-backend-url.onrender.com/api/health`

### 401 Unauthorized:
- ✅ Check if JWT_SECRET is set in backend
- ✅ Clear browser localStorage and try again

---

## Demo Credentials

- **Employee:** `john@company.com` / `password123`
- **Manager:** `sarah@company.com` / `password123`

Make sure to run `npm run seed` after first deployment to create these users!

---

## Quick Deploy Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] IP whitelist set to `0.0.0.0/0` (allows all IPs)
- [ ] Connection string copied
- [ ] Backend deployed to Render/Railway
- [ ] Backend environment variables configured
- [ ] Backend URL copied
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variable `VITE_API_URL` set
- [ ] Backend `FRONTEND_URL` updated with Vercel URL
- [ ] Seed script run (creates demo users)
- [ ] Test login with demo credentials
- [ ] Share frontend URL with evaluators! 🎉

