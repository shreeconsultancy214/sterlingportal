# Deployment Guide

This guide covers multiple deployment options for the Sterling Portal Backend.

## Prerequisites

- Node.js 20+ installed
- MongoDB database (local or cloud)
- Environment variables configured

## Option 1: Docker Deployment (Recommended for Flexibility)

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t sterling-portal-backend .

# Run the container
docker run -p 3000:3000 \
  -e MONGODB_URI=your_mongodb_uri \
  -e NEXTAUTH_SECRET=your_secret \
  -e NEXTAUTH_URL=http://localhost:3000 \
  sterling-portal-backend
```

### Using Docker Compose

```bash
# Update environment variables in docker-compose.yml
# Then run:
docker-compose up -d
```

### Deploy to Cloud Providers

**AWS (EC2/ECS):**
1. Build and push to ECR
2. Deploy using ECS or EC2

**DigitalOcean:**
1. Create App Platform
2. Connect GitHub repo
3. Dockerfile will be auto-detected

**Azure:**
1. Create Container Instances or App Service
2. Deploy using Azure CLI

## Option 2: Vercel Deployment (Easiest for Next.js)

### Steps:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set Environment Variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, etc.

4. **Production Deploy:**
   ```bash
   vercel --prod
   ```

**Note:** Vercel has serverless function limits. For heavy PDF generation, consider Docker deployment.

## Option 3: Traditional Server (PM2)

### Steps:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

3. **Start with PM2:**
   ```bash
   pm2 start npm --name "sterling-portal" -- start
   ```

4. **Save PM2 configuration:**
   ```bash
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx (optional):**
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

## Option 4: Railway/Render (Simple PaaS)

### Railway:
1. Connect GitHub repo
2. Railway auto-detects Next.js
3. Add environment variables
4. Deploy

### Render:
1. Create new Web Service
2. Connect GitHub repo
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables

## Environment Variables Required

Create a `.env.production` file or set these in your deployment platform:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production

# Optional (if using Stripe)
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_ENABLED=true

# Optional (if using email)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

## File Storage Considerations

For production, consider using cloud storage:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage
- Cloudinary (for images)

Update file upload handlers to use cloud storage instead of local filesystem.

## MongoDB Setup

1. **MongoDB Atlas (Cloud):**
   - Create cluster
   - Whitelist deployment IP
   - Get connection string

2. **Self-hosted:**
   - Ensure MongoDB is accessible from deployment server
   - Configure firewall rules

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB connection tested
- [ ] File upload directories created (if using local storage)
- [ ] SSL certificate configured (for production domains)
- [ ] Domain DNS configured
- [ ] Monitoring/logging set up
- [ ] Backup strategy in place

## Troubleshooting

### Build Errors:
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Runtime Errors:
- Check environment variables
- Verify MongoDB connection
- Check file permissions for upload directories

### Performance:
- Enable Next.js caching
- Use CDN for static assets
- Optimize images
- Consider database indexing




