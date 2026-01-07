# Pre-Deployment Checklist

Use this checklist before deploying to Vercel to ensure everything is ready.

## ✅ Code Status

- [x] All code is committed to Git
- [x] All code is pushed to GitHub (commit `03084a9`)
- [x] Build errors are fixed (authOptions, Stripe imports)
- [x] No sensitive files in repository (.env is in .gitignore)

## 🔐 Environment Variables to Set in Vercel

Before deploying, make sure these are set in **Vercel Dashboard → Project Settings → Environment Variables**:

### Required Variables:

- [ ] **MONGODB_URI**
  - Your MongoDB Atlas connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
  - Environments: Production, Preview, Development

- [ ] **NEXTAUTH_SECRET**
  - A random secret string (32+ characters)
  - Generate with: `openssl rand -base64 32`
  - Or use: https://generate-secret.vercel.app/32
  - Environments: Production, Preview, Development

- [ ] **NEXTAUTH_URL**
  - Your Vercel deployment URL
  - **Initial value:** Leave empty for first deploy, then update after deployment
  - **After first deploy:** `https://sterling-portal-app.vercel.app` (or your custom domain)
  - Environments: Production, Preview, Development

- [ ] **NODE_ENV**
  - Value: `production`
  - Environments: Production only

### Optional Variables (if using these features):

- [ ] **STRIPE_SECRET_KEY** (if using Stripe payments)
- [ ] **STRIPE_ENABLED** (set to `true` or `false`)
- [ ] **SMTP_HOST** (if using email)
- [ ] **SMTP_PORT** (usually `587` or `465`)
- [ ] **SMTP_USER** (SMTP username)
- [ ] **SMTP_PASS** (SMTP password)

## 📋 MongoDB Setup

- [ ] MongoDB Atlas cluster is created and running
- [ ] Database connection string is ready
- [ ] IP whitelist includes Vercel IPs (or use `0.0.0.0/0` for all - less secure)
- [ ] Database user has correct permissions

## 🔍 Final Checks

- [ ] All build errors are resolved
- [ ] No TypeScript errors
- [ ] No linting errors (optional, won't block deployment)
- [ ] Environment variables are prepared (values ready to paste)
- [ ] MongoDB is accessible from external IPs

## 🚀 Ready to Deploy?

Once all items above are checked:

1. Go to Vercel Dashboard
2. Create new deployment or enable auto-deploy
3. Monitor build logs
4. After deployment, update `NEXTAUTH_URL` with actual deployment URL
5. Redeploy after updating `NEXTAUTH_URL`

## 📝 Notes

- **File Storage:** Vercel has limitations. Consider using cloud storage (S3, Cloudinary) for production file uploads.
- **Puppeteer:** May not work on Vercel serverless. Your app uses `@react-pdf/renderer` which should work.
- **Build Time:** First build takes 2-5 minutes. Subsequent builds are faster with cache.

---

**Status:** Ready to deploy! ✅




