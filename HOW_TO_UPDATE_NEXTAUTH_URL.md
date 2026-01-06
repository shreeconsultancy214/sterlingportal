# How to Update NEXTAUTH_URL in Vercel

## Step-by-Step Guide

### Step 1: Get Your Vercel Deployment URL
1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Click on your project (sterling-portal-app)
3. Look at the top of the page - you'll see your deployment URL
   - Example: `https://sterling-portal-app.vercel.app`
   - Or your custom domain if you have one

### Step 2: Update Environment Variable
1. In your Vercel project, click on **"Settings"** (top menu)
2. Click on **"Environment Variables"** (left sidebar)
3. Find `NEXTAUTH_URL` in the list
4. Click the **three dots (⋯)** next to it
5. Click **"Edit"**
6. Update the **Value** field with your deployment URL:
   ```
   https://your-app-name.vercel.app
   ```
   **Important**: 
   - Use `https://` (not `http://`)
   - No trailing slash at the end
   - Use the exact URL from Step 1
7. Make sure **"Production"** is checked (and "Preview" if you want)
8. Click **"Save"**

### Step 3: Redeploy
After updating the environment variable, you need to redeploy:

**Option A: Automatic Redeploy**
- Vercel may automatically redeploy
- Wait a few minutes and check

**Option B: Manual Redeploy**
1. Go to **"Deployments"** tab (top menu)
2. Click the **three dots (⋯)** on the latest deployment
3. Click **"Redeploy"**
4. Confirm the redeploy

---

## Quick Method (Alternative)

### Using Vercel CLI (if you have it installed)
```bash
vercel env add NEXTAUTH_URL production
# When prompted, enter: https://your-app-name.vercel.app
```

Then redeploy:
```bash
vercel --prod
```

---

## Verify It's Set Correctly

1. Go to **Settings** → **Environment Variables**
2. Check that `NEXTAUTH_URL` shows your deployment URL
3. Make sure it's available for **Production** environment
4. After redeploy, test sign-in functionality

---

## Common Issues

### Issue: Sign-in redirects to wrong URL
**Solution**: Make sure `NEXTAUTH_URL` matches your actual deployment URL exactly

### Issue: "Invalid callback URL" error
**Solution**: 
- Check `NEXTAUTH_URL` is set correctly
- Make sure there's no trailing slash
- Use `https://` not `http://`

### Issue: Environment variable not updating
**Solution**: 
- Make sure you saved the changes
- Redeploy after updating
- Check that it's set for the correct environment (Production)

---

## Example

If your deployment URL is:
```
https://sterling-portal-app.vercel.app
```

Then `NEXTAUTH_URL` should be:
```
https://sterling-portal-app.vercel.app
```

**NOT:**
- ❌ `https://sterling-portal-app.vercel.app/` (trailing slash)
- ❌ `http://sterling-portal-app.vercel.app` (http instead of https)
- ❌ `sterling-portal-app.vercel.app` (missing https://)

---

## After Updating

1. ✅ Wait for redeploy to complete
2. ✅ Test sign-in functionality
3. ✅ Verify redirects work correctly
4. ✅ Check that sessions persist

---

**That's it! Your NEXTAUTH_URL is now updated.** 🎉



