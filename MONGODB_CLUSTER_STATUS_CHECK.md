# MongoDB Cluster Status Check

## ✅ IP Whitelist is Correct
Your IP Access List shows:
- `0.0.0.0/0` (allows all IPs) - ✅ Active
- `157.48.202.73/32` (your IP) - ✅ Active

**IP whitelisting is NOT the problem.**

## 🔍 Check Cluster Status

The `ECONNREFUSED` error usually means the cluster is **paused** or **sleeping**.

### Steps to Check:

1. **Go to MongoDB Atlas Dashboard:**
   - https://cloud.mongodb.com
   - Sign in

2. **Navigate to your cluster:**
   - Click on your project: **"sterling-portal2"**
   - Look for cluster: **"cluster0"** or similar

3. **Check Cluster Status:**
   - Look for a status indicator (green/yellow/red)
   - Check if there's a **"Resume"** or **"Wake Up"** button
   - Free tier clusters sleep after 1 hour of inactivity

4. **If Cluster is Paused/Sleeping:**
   - Click **"Resume"** or **"Wake Up"**
   - Wait 1-3 minutes for cluster to start
   - Status should change to **"Running"** (green)

5. **After Resuming:**
   - Restart your dev server: `npm run dev`
   - Try signing in again

## Alternative: Check Connection String

If cluster is running, verify your connection string:

1. **In MongoDB Atlas:**
   - Click **"Connect"** button on your cluster
   - Choose **"Connect your application"**
   - Copy the connection string

2. **Check your `.env.local`:**
   - Make sure `MONGODB_URI` matches the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with your database name

## Quick Test

After checking cluster status, restart your dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

Then try signing in again.

---

**Most likely cause:** Cluster is sleeping/paused. Wake it up in MongoDB Atlas!

