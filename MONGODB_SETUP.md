# MongoDB Atlas Setup for Deployment

## Quick Setup to Allow Connections from Any IP

This guide ensures your MongoDB Atlas database can be accessed from anywhere, including your deployment platforms and evaluators.

---

## Step-by-Step Instructions

### 1. Configure IP Whitelist (Network Access)

1. **Log into MongoDB Atlas:**
   - Go to https://cloud.mongodb.com/
   - Sign in with your account

2. **Navigate to Network Access:**
   - In the left sidebar, click **"Security"** → **"Network Access"**
   - Or go directly to: https://cloud.mongodb.com/v2#/security/network/whitelist

3. **Add IP Address:**
   - Click the green **"Add IP Address"** button
   - A modal will appear

4. **Allow All IPs (Recommended for Demo/Evaluation):**
   - Click **"Allow Access from Anywhere"** button
   - This automatically adds `0.0.0.0/0` to your whitelist
   - **OR** manually enter: `0.0.0.0/0`
   
5. **Add Comment (Optional):**
   - Add a comment: "Deployment - Allow all IPs for evaluation"
   
6. **Confirm:**
   - Click **"Confirm"**
   - Wait 1-2 minutes for changes to take effect

### 2. Verify Connection String

1. **Get Connection String:**
   - Go to **"Database"** → Click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Copy the connection string
   - Example: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

2. **Update Connection String:**
   - Replace `<password>` with your actual database user password
   - Optionally add database name: `...mongodb.net/attendance_system?retryWrites...`
   - Final example: `mongodb+srv://admin:MyPassword123@cluster0.xxxxx.mongodb.net/attendance_system?retryWrites=true&w=majority`

### 3. Test Connection Locally

```bash
# In your backend directory
cd backend

# Create .env file with:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance_system?retryWrites=true&w=majority
JWT_SECRET=your-secret-key

# Test connection
npm run seed
```

If seed runs successfully, your MongoDB is configured correctly! ✅

---

## Security Considerations

### For Demo/Evaluation (Current Setup):
- ✅ **`0.0.0.0/0` is acceptable** - Allows connections from anywhere
- ✅ Use strong database password (12+ characters, mix of letters, numbers, symbols)
- ✅ Keep connection string secure (never commit to GitHub)
- ✅ Use environment variables for all sensitive data

### For Production (Future):
- ⚠️ **Restrict IP whitelist** to specific IPs/ranges:
  - Your deployment platform's IP ranges (Render, Railway, etc.)
  - Your office/home IP addresses
- ⚠️ Use MongoDB Atlas VPC Peering for better security
- ⚠️ Enable MongoDB Atlas Encryption at Rest
- ⚠️ Set up proper database user roles (read-only for some operations)

---

## Troubleshooting

### "Could not connect to any servers" Error

**Problem:** Your IP is not whitelisted or changed.

**Solution:**
1. Check current IP: https://www.whatismyip.com/
2. Add your current IP to MongoDB Atlas Network Access
3. OR use `0.0.0.0/0` for demo purposes

### "Authentication failed" Error

**Problem:** Wrong username or password in connection string.

**Solution:**
1. Go to Database Access in MongoDB Atlas
2. Verify username is correct
3. Reset password if needed
4. Update connection string with new password

### "Server selection timed out" Error

**Problem:** Network/firewall blocking connection.

**Solution:**
1. Verify IP whitelist includes `0.0.0.0/0` or your current IP
2. Check if corporate firewall blocks MongoDB ports
3. Wait 2-3 minutes after IP whitelist changes

---

## Quick Checklist

Before deploying, ensure:
- [ ] MongoDB Atlas cluster created (Free M0 tier)
- [ ] Database user created with secure password
- [ ] IP whitelist includes `0.0.0.0/0` (or specific IPs)
- [ ] Connection string copied and password updated
- [ ] Connection tested locally with `npm run seed`
- [ ] Environment variable `MONGODB_URI` set in deployment platform
- [ ] Seed script run on deployed backend (or run locally pointing to production DB)

---

## Need Help?

- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- Network Access Guide: https://docs.atlas.mongodb.com/security/ip-access-list/
- MongoDB Community: https://www.mongodb.com/community/forums/

