# MongoDB Connection Fix Guide

## Error: `ECONNREFUSED _mongodb._tcp.cluster0.xbgo3nk.mongodb.net`

This means your application cannot connect to MongoDB Atlas.

## Quick Fixes

### 1. Check MongoDB Atlas Cluster Status

1. Go to https://cloud.mongodb.com
2. Sign in to your account
3. Check if your cluster `cluster0.xbgo3nk` is:
   - ✅ **Running** (green status)
   - ❌ **Paused** (needs to be resumed)
   - ❌ **Sleeping** (free tier - needs to be woken up)

**If paused/sleeping:**
- Click "Resume" or "Wake Up" button
- Wait 1-2 minutes for cluster to start

### 2. Check IP Whitelist

1. In MongoDB Atlas → **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Options:
   - **Option A (Recommended for testing):** Add `0.0.0.0/0` (allows all IPs)
   - **Option B (More secure):** Add your current IP address
4. Click **"Confirm"**
5. Wait 1-2 minutes for changes to propagate

### 3. Verify Connection String

Check your `.env.local` file has the correct connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xbgo3nk.mongodb.net/dbname?retryWrites=true&w=majority
```

**To get the correct connection string:**
1. MongoDB Atlas → **Database** → **Connect**
2. Choose **"Connect your application"**
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `<dbname>` with your database name (or remove it)

### 4. Test Connection

After fixing, restart your dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

## Common Issues

### Issue 1: Free Tier Cluster is Sleeping
- **Solution:** Wake it up in MongoDB Atlas dashboard
- **Note:** Free tier clusters sleep after 1 hour of inactivity

### Issue 2: IP Not Whitelisted
- **Solution:** Add your IP or `0.0.0.0/0` in Network Access

### Issue 3: Wrong Password
- **Solution:** Reset database user password in MongoDB Atlas
- Update `.env.local` with new password

### Issue 4: Connection String Format
- Make sure it starts with `mongodb+srv://`
- No spaces in the connection string
- Password should be URL-encoded if it has special characters

## For Vercel Deployment

This local issue won't affect Vercel if:
1. ✅ MongoDB Atlas allows connections from all IPs (`0.0.0.0/0`) OR
2. ✅ Vercel's IPs are whitelisted in MongoDB Atlas
3. ✅ `MONGODB_URI` is set correctly in Vercel environment variables

## Quick Checklist

- [ ] MongoDB Atlas cluster is running (not paused)
- [ ] IP address is whitelisted (or `0.0.0.0/0` for all)
- [ ] Connection string in `.env.local` is correct
- [ ] Password in connection string matches MongoDB Atlas user password
- [ ] Database name is correct (or removed from connection string)

---

**After fixing, restart your dev server and try signing in again.**



