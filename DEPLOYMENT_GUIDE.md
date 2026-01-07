# Deployment Guide - Sterling Portal

## 🚀 Pre-Deployment Checklist

### ✅ Code Quality
- [x] All features implemented and tested
- [x] Activity logging complete
- [x] Admin notes working
- [x] Search & filter functional
- [ ] No console errors in browser
- [ ] No TypeScript errors
- [ ] All API routes working

### ✅ Environment Variables
Ensure these are set in your production environment:

```env
# Database
MONGODB_URI=your_production_mongodb_uri

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret_key_here

# Email (if using)
EMAIL_SERVICE_API_KEY=your_email_service_key

# Other
NODE_ENV=production
```

### ✅ Security
- [ ] All API routes have proper authentication
- [ ] Role-based access control working
- [ ] No sensitive data in client-side code
- [ ] Environment variables secured
- [ ] CORS configured properly

### ✅ Database
- [ ] MongoDB connection string configured
- [ ] Database indexes created (if needed)
- [ ] Test data cleaned up (optional)
- [ ] Backup strategy in place

### ✅ File Storage
- [ ] Upload directories exist (`public/uploads`, `public/documents`)
- [ ] File permissions set correctly
- [ ] Storage limits configured

### ✅ Performance
- [ ] Images optimized
- [ ] Code minified
- [ ] Caching configured
- [ ] Build size optimized

---

## 📦 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

#### Steps:
1. **Install Vercel CLI** (if not installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts:
   - Link to existing project or create new
   - Set environment variables
   - Deploy

4. **Set Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all required variables

5. **Production Deployment**:
   ```bash
   vercel --prod
   ```

#### Vercel Configuration:
Create `vercel.json` (optional):
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

### Option 2: AWS (EC2/Elastic Beanstalk)

#### Steps:
1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Create PM2 ecosystem file** (`ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'sterling-portal',
       script: 'node_modules/next/dist/bin/next',
       args: 'start',
       instances: 1,
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

3. **Deploy to EC2**:
   ```bash
   # On your EC2 instance
   git clone your-repo
   cd sterling-portal-backend
   npm install
   npm run build
   pm2 start ecosystem.config.js
   pm2 save
   ```

4. **Set up Nginx** (reverse proxy):
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

---

### Option 3: Docker Deployment

#### Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NODE_ENV=production
    volumes:
      - ./public/uploads:/app/public/uploads
      - ./public/documents:/app/public/documents
    restart: unless-stopped
```

#### Deploy:
```bash
docker-compose up -d
```

---

### Option 4: Railway/Render/Fly.io

These platforms are great for quick deployments:

#### Railway:
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

#### Render:
1. Create new Web Service
2. Connect GitHub repo
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Set environment variables

---

## 🔧 Pre-Deployment Commands

### 1. Build the Project:
```bash
npm run build
```

### 2. Test the Build Locally:
```bash
npm start
```
Visit `http://localhost:3000` and test all features

### 3. Check for Errors:
```bash
# TypeScript check
npx tsc --noEmit

# Lint check
npm run lint
```

### 4. Optimize:
```bash
# Analyze bundle size
npm run build
# Check .next/analyze for bundle analysis
```

---

## 📋 Production Checklist

### Before Going Live:
- [ ] All environment variables set
- [ ] Database connection tested
- [ ] File uploads working
- [ ] Authentication working
- [ ] All API routes tested
- [ ] Email service configured (if using)
- [ ] SSL certificate installed (HTTPS)
- [ ] Domain configured
- [ ] Error logging set up
- [ ] Monitoring configured

### After Deployment:
- [ ] Test login/logout
- [ ] Test submission creation
- [ ] Test quote workflow
- [ ] Test document generation
- [ ] Test e-signature flow
- [ ] Test payment flow
- [ ] Test bind request
- [ ] Test admin features
- [ ] Test agency features
- [ ] Check activity logs
- [ ] Check file uploads
- [ ] Test on mobile devices

---

## 🐛 Common Deployment Issues

### Issue: Build Fails
**Solution:**
- Check Node.js version (should be 18+)
- Clear `.next` folder: `rm -rf .next`
- Clear `node_modules`: `rm -rf node_modules && npm install`
- Check for TypeScript errors

### Issue: Environment Variables Not Working
**Solution:**
- Verify variables are set in deployment platform
- Restart the application after setting variables
- Check variable names match exactly

### Issue: MongoDB Connection Fails
**Solution:**
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Verify network access settings

### Issue: File Uploads Not Working
**Solution:**
- Check directory permissions
- Verify upload directories exist
- Check file size limits

### Issue: Authentication Not Working
**Solution:**
- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set
- Verify callback URLs in auth provider

---

## 📊 Monitoring & Maintenance

### Set Up:
1. **Error Tracking**: Consider Sentry or similar
2. **Analytics**: Google Analytics or similar
3. **Uptime Monitoring**: UptimeRobot or similar
4. **Log Aggregation**: Logtail, Papertrail, or similar

### Regular Maintenance:
- Monitor error logs
- Check database performance
- Review user feedback
- Update dependencies regularly
- Backup database regularly

---

## 🚨 Quick Deployment Commands

### For Vercel:
```bash
vercel --prod
```

### For Docker:
```bash
docker-compose up -d --build
```

### For PM2:
```bash
pm2 restart sterling-portal
```

### For Manual:
```bash
npm run build
npm start
```

---

## 📝 Post-Deployment

### Create a Demo Account:
- Admin account for client review
- Test agency account
- Sample data (submissions, quotes)

### Document Access:
- Provide login credentials
- Create user guide
- Document features

---

## ✅ Final Checklist

- [ ] Project builds successfully
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Database connected
- [ ] SSL/HTTPS enabled
- [ ] Domain configured
- [ ] All features tested
- [ ] Error handling working
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

## 🎯 Client Review Preparation

### What to Show:
1. **Agency Dashboard** - Overview of submissions and quotes
2. **Submission Workflow** - Create, view, edit submissions
3. **Quote Management** - View quotes, approve, workflow
4. **Document Generation** - Generate PDFs
5. **E-Signature Flow** - Send and sign documents
6. **Payment Processing** - Mock payment flow
7. **Bind Request** - Request and approve bind
8. **Admin Features** - Admin dashboard, notes, tool requests
9. **Activity Logs** - Show transparency
10. **Search & Filter** - Demonstrate findability

### Demo Script:
1. Login as agency user
2. Create a new submission
3. Show submission detail page
4. Show quote approval workflow
5. Generate documents
6. Complete e-signature
7. Process payment
8. Request bind
9. Login as admin
10. Show admin features
11. Show activity logs

---

Good luck with your deployment! 🚀




