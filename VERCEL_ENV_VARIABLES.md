# Vercel Environment Variables Guide

## ✅ Required Variables

### 1. **MONGODB_URI** ✅
```
mongodb+srv://divyamsaini101_db_user:Z9SJWsmrxZ49UA5y@cluster0.xbgo3nk.mongodb.net/sterling_portal?retryWrites=true&w=majority
```
**Status**: ✅ Correct

### 2. **NEXTAUTH_SECRET** ✅
```
8a0bc48874c1e0aaf7c7045a3c868e50
```
**Status**: ✅ Set (good length)

### 3. **NEXTAUTH_URL** ❌ MISSING!
```
https://your-app-name.vercel.app
```
**Status**: ❌ **MUST ADD THIS**
- Leave empty for first deployment
- After deployment, update with your actual Vercel URL
- Format: `https://your-app.vercel.app` (no trailing slash)

---

## ⚠️ Optional/Recommended Variables

### 4. **NODE_ENV** ⚠️
```
production
```
**Status**: ⚠️ Change from `development` to `production`
- Or remove it - Vercel sets this automatically to `production`

### 5. **JWT_SECRET** ⚠️
```
8a0bc48874c1e0aaf7c7045a3c868e50
```
**Status**: ⚠️ May be redundant
- Check if your code uses `JWT_SECRET` or just `NEXTAUTH_SECRET`
- If not used, you can remove it

### 6. **UPLOAD_DIR** ✅
```
./uploads
```
**Status**: ✅ OK (optional)

### 7. **MAX_FILE_SIZE** ✅
```
10485760
```
**Status**: ✅ OK (optional, 10MB)

---

## ❌ Remove These

### **EXAMPLE_NAME** ❌
- Remove this - it's a test variable

---

## 📋 Final Vercel Environment Variables

### Required (Must Have):
```
MONGODB_URI=mongodb+srv://divyamsaini101_db_user:Z9SJWsmrxZ49UA5y@cluster0.xbgo3nk.mongodb.net/sterling_portal?retryWrites=true&w=majority
NEXTAUTH_SECRET=8a0bc48874c1e0aaf7c7045a3c868e50
NEXTAUTH_URL= (leave empty for first deploy, then update)
```

### Recommended:
```
NODE_ENV=production
```

### Optional (Keep if your code uses them):
```
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
JWT_SECRET=8a0bc48874c1e0aaf7c7045a3c868e50 (only if code uses it)
```

### Remove:
```
EXAMPLE_NAME (delete this)
```

---

## 🚀 Deployment Steps

1. **Before First Deploy:**
   - Remove `EXAMPLE_NAME`
   - Change `NODE_ENV` to `production` (or remove it)
   - Add `NEXTAUTH_URL` (leave empty for now)

2. **After First Deploy:**
   - Copy your Vercel URL (e.g., `https://sterling-portal-app.vercel.app`)
   - Update `NEXTAUTH_URL` with your actual URL
   - Redeploy (Vercel will auto-redeploy or trigger manually)

---

## ⚠️ Important Notes

- **NEXTAUTH_URL**: Must match your actual deployment URL exactly
- **MONGODB_URI**: Make sure MongoDB Atlas allows connections from Vercel IPs (should be `0.0.0.0/0`)
- **Secrets**: Never commit these to Git (you haven't, which is good!)



