# How to Add NEXTAUTH_URL in Vercel (When It's Not in the List)

## If NEXTAUTH_URL is Missing

If you don't see `NEXTAUTH_URL` in your environment variables list, you need to **add it manually**.

---

## Step-by-Step Guide

### Step 1: Find Your Deployment URL

**Option A: From Project Overview**
1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Click on your project
3. Look at the top of the page - you'll see your deployment URL
   - Example: `https://sterling-portal-app.vercel.app`
   - Or: `https://sterling-portal-app-xyz123.vercel.app`

**Option B: From Settings → Domains**
1. Go to **Settings** → **Domains**
2. You'll see all your deployment URLs listed there
3. Copy the main production URL

**Option C: From Deployments**
1. Go to **Deployments** tab
2. Click on the latest (production) deployment
3. The URL is shown at the top of the deployment page

---

### Step 2: Add NEXTAUTH_URL Environment Variable

1. In your Vercel project, click **"Settings"** (top menu)

2. Click **"Environment Variables"** (left sidebar)

3. Click the **"Add New"** button (or **"Add"** button)
   - Usually at the top right or bottom of the list

4. Fill in the form:
   - **Key**: `NEXTAUTH_URL`
     - Type exactly: `NEXTAUTH_URL` (case-sensitive)
   - **Value**: Your deployment URL
     - Example: `https://sterling-portal-app.vercel.app`
     - **Important**: 
       - Use `https://` (not `http://`)
       - No trailing slash at the end
       - Use the exact URL from Step 1

5. Select Environments:
   - ✅ Check **"Production"** (required)
   - ✅ Check **"Preview"** (recommended, for preview deployments)
   - ⬜ "Development" (optional, if you use Vercel CLI)

6. Click **"Save"**

---

### Step 3: Verify It Was Added

1. You should now see `NEXTAUTH_URL` in your environment variables list
2. Verify:
   - ✅ Key is `NEXTAUTH_URL`
   - ✅ Value is your deployment URL
   - ✅ Production is checked

---

### Step 4: Redeploy

After adding the environment variable, you need to redeploy:

**Option A: Automatic**
- Vercel may automatically trigger a redeploy
- Wait a few minutes

**Option B: Manual Redeploy**
1. Go to **"Deployments"** tab
2. Click the **three dots (⋯)** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

---

## Visual Guide

```
Vercel Dashboard
  └─ Your Project
      └─ Settings
          └─ Environment Variables
              └─ [Add New Button]
                  └─ Key: NEXTAUTH_URL
                  └─ Value: https://your-app.vercel.app
                  └─ ☑ Production
                  └─ ☑ Preview
                  └─ [Save]
```

---

## Example

If your deployment URL is:
```
https://sterling-portal-app-abc123.vercel.app
```

Then add:
- **Key**: `NEXTAUTH_URL`
- **Value**: `https://sterling-portal-app-abc123.vercel.app`

**NOT:**
- ❌ `https://sterling-portal-app-abc123.vercel.app/` (trailing slash)
- ❌ `http://sterling-portal-app-abc123.vercel.app` (http instead of https)
- ❌ `sterling-portal-app-abc123.vercel.app` (missing https://)

---

## Troubleshooting

### Can't Find "Add New" Button
- Make sure you're in **Settings** → **Environment Variables**
- The button might be labeled "Add" or have a "+" icon
- Try refreshing the page

### Not Sure of Your URL
1. Go to **Settings** → **Domains**
2. You'll see all your deployment URLs
3. Use the one marked as "Production" or the main one

### Multiple URLs
- If you have multiple domains, use the main Vercel URL (the `.vercel.app` one)
- Or use your custom domain if you have one configured

### After Adding, Sign-In Still Doesn't Work
1. Make sure you **redeployed** after adding the variable
2. Wait for deployment to complete
3. Clear browser cache and try again
4. Check Vercel function logs for errors

---

## Quick Checklist

- [ ] Found my deployment URL
- [ ] Added `NEXTAUTH_URL` environment variable
- [ ] Set value to my deployment URL (with https://, no trailing slash)
- [ ] Checked "Production" environment
- [ ] Saved the variable
- [ ] Redeployed the application
- [ ] Tested sign-in functionality

---

**That's it! Once you add NEXTAUTH_URL and redeploy, NextAuth will work correctly.** 🎉



