# Vercel Deployment Guide - Step by Step

Follow these steps to deploy your Sterling Portal Backend to Vercel.

## Prerequisites

1. ✅ GitHub account
2. ✅ Vercel account (free at https://vercel.com)
3. ✅ MongoDB database (MongoDB Atlas recommended)
4. ✅ Your project code ready

## Step 1: Push Code to GitHub

If your code is not already on GitHub:

1. **Initialize Git (if not done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Create a new repository (e.g., `sterling-portal-backend`)
   - **DO NOT** initialize with README, .gitignore, or license

3. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/sterling-portal-backend.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Create Vercel Account

1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended for easy integration)
3. Authorize Vercel to access your GitHub repositories

## Step 3: Import Project to Vercel

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/new
   - Or click "Add New..." → "Project" in your dashboard

2. **Import Git Repository:**
   - Select your GitHub account
   - Find and select `sterling-portal-backend` repository
   - Click "Import"

## Step 4: Configure Project Settings

Vercel will auto-detect Next.js. Configure these settings:

### Framework Preset:
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Environment Variables:
Click "Environment Variables" and add these:

#### Required Variables:

```
MONGODB_URI
```
- **Value:** Your MongoDB connection string
- **Example:** `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
- **Environments:** Production, Preview, Development (select all)

```
NEXTAUTH_SECRET
```
- **Value:** A random secret string (generate one)
- **How to generate:** Run `openssl rand -base64 32` or use https://generate-secret.vercel.app/32
- **Environments:** Production, Preview, Development (select all)

```
NEXTAUTH_URL
```
- **Value:** Your Vercel deployment URL (will be provided after first deploy)
- **Initial:** Leave empty for first deploy, then update with your actual URL
- **Example:** `https://sterling-portal-backend.vercel.app`
- **Environments:** Production, Preview, Development (select all)

#### Optional Variables (if you use these features):

```
STRIPE_SECRET_KEY
```
- **Value:** Your Stripe secret key (if using Stripe)
- **Environments:** Production, Preview, Development

```
STRIPE_ENABLED
```
- **Value:** `true` or `false`
- **Environments:** Production, Preview, Development

```
SMTP_HOST
```
- **Value:** Your SMTP server hostname
- **Environments:** Production, Preview, Development

```
SMTP_PORT
```
- **Value:** `587` or `465`
- **Environments:** Production, Preview, Development

```
SMTP_USER
```
- **Value:** Your SMTP username/email
- **Environments:** Production, Preview, Development

```
SMTP_PASS
```
- **Value:** Your SMTP password
- **Environments:** Production, Preview, Development

```
NODE_ENV
```
- **Value:** `production`
- **Environments:** Production only

## Step 5: Deploy

1. **Click "Deploy" button**
2. **Wait for build to complete** (usually 2-5 minutes)
3. **Monitor the build logs** for any errors

## Step 6: Update NEXTAUTH_URL

After the first deployment:

1. **Copy your deployment URL** (e.g., `https://sterling-portal-backend.vercel.app`)
2. **Go to Project Settings → Environment Variables**
3. **Update `NEXTAUTH_URL`** with your actual deployment URL
4. **Redeploy** (go to Deployments → Click "..." → Redeploy)

## Step 7: Configure Custom Domain (Optional)

1. **Go to Project Settings → Domains**
2. **Add your custom domain** (e.g., `app.yourdomain.com`)
3. **Follow DNS configuration instructions**
4. **Update `NEXTAUTH_URL`** to match your custom domain

## Step 8: Verify Deployment

1. **Visit your deployment URL**
2. **Test the application:**
   - Try logging in
   - Test key features
   - Check API endpoints

## Important Notes

### File Storage Limitations:
⚠️ **Vercel has limitations for file uploads:**
- Serverless functions have a 50MB limit
- Files are stored in `/tmp` which is ephemeral
- **Recommendation:** Use cloud storage (AWS S3, Cloudinary) for production file uploads

### MongoDB Atlas Setup:
1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Whitelist Vercel IPs (or use `0.0.0.0/0` for all IPs - less secure)
3. Get connection string from Atlas dashboard

### Puppeteer Considerations:
⚠️ **Puppeteer may not work on Vercel's serverless functions:**
- Vercel functions don't support headless Chrome
- Consider using an external service for PDF generation
- Or use `@react-pdf/renderer` (already in your dependencies) instead

## Troubleshooting

### Build Fails:
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `package.json` has correct build script

### Runtime Errors:
- Check function logs in Vercel dashboard
- Verify MongoDB connection string is correct
- Ensure `NEXTAUTH_URL` matches your deployment URL

### 404 Errors:
- Check that routes are in `app/` directory (not `pages/`)
- Verify API routes are in `app/api/` directory

### Database Connection Issues:
- Verify MongoDB Atlas IP whitelist includes Vercel IPs
- Check connection string format
- Ensure database user has correct permissions

## Next Steps After Deployment

1. ✅ Set up monitoring (Vercel Analytics)
2. ✅ Configure backups for MongoDB
3. ✅ Set up error tracking (Sentry, etc.)
4. ✅ Configure file storage (S3, Cloudinary)
5. ✅ Set up CI/CD for automatic deployments

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Support: https://vercel.com/support

---

**Ready to deploy?** Go to https://vercel.com/new and follow the steps above!



