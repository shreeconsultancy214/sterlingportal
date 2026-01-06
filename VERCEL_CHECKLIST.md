# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment.

## Pre-Deployment

- [ ] Code is pushed to GitHub
- [ ] All local changes are committed
- [ ] `.env.local` is NOT committed (should be in `.gitignore`)
- [ ] MongoDB Atlas cluster is created and accessible
- [ ] MongoDB connection string is ready

## Vercel Setup

- [ ] Vercel account created (https://vercel.com/signup)
- [ ] GitHub account connected to Vercel
- [ ] Project imported from GitHub repository

## Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `NEXTAUTH_SECRET` - Random secret (generate with: `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` - Will be your Vercel URL (update after first deploy)
- [ ] `NODE_ENV` - Set to `production` (for production environment only)

### Optional (if using):

- [ ] `STRIPE_SECRET_KEY` - If using Stripe payments
- [ ] `STRIPE_ENABLED` - `true` or `false`
- [ ] `SMTP_HOST` - If using email
- [ ] `SMTP_PORT` - Usually `587` or `465`
- [ ] `SMTP_USER` - SMTP username
- [ ] `SMTP_PASS` - SMTP password

## Deployment Steps

- [ ] Click "Deploy" button in Vercel
- [ ] Monitor build logs for errors
- [ ] Wait for deployment to complete (2-5 minutes)
- [ ] Copy deployment URL from Vercel dashboard

## Post-Deployment

- [ ] Update `NEXTAUTH_URL` with actual Vercel deployment URL
- [ ] Redeploy after updating `NEXTAUTH_URL`
- [ ] Test login functionality
- [ ] Test API endpoints
- [ ] Verify MongoDB connection works
- [ ] Check file upload functionality (may need cloud storage)

## Important Reminders

⚠️ **File Storage:** Vercel serverless functions have limitations. Consider using:
- AWS S3
- Cloudinary
- Google Cloud Storage

⚠️ **Puppeteer:** May not work on Vercel. Consider alternatives:
- `@react-pdf/renderer` (already in dependencies)
- External PDF service

⚠️ **MongoDB Atlas:** 
- Whitelist Vercel IPs or use `0.0.0.0/0` (less secure)
- Ensure connection string is correct

## Quick Commands Reference

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use online generator
# https://generate-secret.vercel.app/32
```

## Deployment URL Format

Your deployment URL will be:
- `https://your-project-name.vercel.app`
- Or custom domain if configured

Update `NEXTAUTH_URL` to match this exactly!

---

**Ready?** Follow the detailed guide in `VERCEL_DEPLOYMENT_GUIDE.md`



