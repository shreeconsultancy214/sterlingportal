# Vercel Build Error Troubleshooting

## How to Get the Error

1. Go to **Vercel Dashboard** → Your Project
2. Click on the **failed deployment**
3. Click **"Build Logs"** or **"View Function Logs"**
4. Scroll to find the **error message** (usually in red)
5. Copy the error and share it

---

## Common Vercel Build Errors & Fixes

### 1. **TypeScript Errors**
```
Type error: ...
```
**Fix**: We already fixed these! If you see new ones, share them.

### 2. **Module Not Found**
```
Module not found: Can't resolve '...'
```
**Fix**: 
- Check if package is in `package.json`
- May need to install missing dependencies

### 3. **Environment Variable Missing**
```
Missing required environment variable: ...
```
**Fix**: Add the missing variable in Vercel settings

### 4. **Build Timeout**
```
Build exceeded maximum time
```
**Fix**: 
- Check for infinite loops
- Optimize build process
- May need to increase build timeout in settings

### 5. **MongoDB Connection**
```
MongooseError: ...
querySrv ECONNREFUSED
```
**Fix**: 
- Check MongoDB Atlas IP whitelist (should be `0.0.0.0/0`)
- Verify `MONGODB_URI` is correct
- Check if cluster is running

### 6. **Next.js Build Error**
```
Error: Failed to compile
```
**Fix**: Share the specific error message

### 7. **File System Errors**
```
ENOENT: no such file or directory
```
**Fix**: Check file paths, may need to create directories

---

## Quick Checks

✅ **Before sharing error, check:**
1. All environment variables are set in Vercel
2. `NEXTAUTH_URL` is set (can be empty for first deploy)
3. MongoDB cluster is running
4. Code is pushed to GitHub

---

## What to Share

When sharing the error, include:
1. **Full error message** (copy from build logs)
2. **Which step failed** (Build, Install, etc.)
3. **Any warnings** before the error

---

## Quick Fixes to Try

### If build fails immediately:
- Check environment variables are set
- Verify `package.json` has all dependencies

### If build succeeds but deployment fails:
- Check runtime logs
- Verify MongoDB connection
- Check `NEXTAUTH_URL` is set correctly

---

**Share the error message and I'll help you fix it!** 🚀

