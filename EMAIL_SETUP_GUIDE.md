# 📧 Email Service Setup Guide

## Current Status
The email system is **fully implemented** but currently using **mock mode** (logs to console instead of sending real emails).

To enable **real email sending**, follow one of the options below:

---

## 🚀 Quick Start (Recommended: Resend)

### Why Resend?
- ✅ Simple API
- ✅ Great developer experience
- ✅ Generous free tier (3,000 emails/month)
- ✅ No credit card required
- ✅ Modern, reliable
- ✅ Great documentation

### Setup Steps:

#### 1. Install Resend
```bash
npm install resend
```

#### 2. Get API Key
1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Get your API key from dashboard
4. Copy it

#### 3. Add Environment Variable
Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=quotes@yourdomain.com
```

#### 4. Enable in Code
Edit `src/lib/services/email/EmailService.ts`:

**Find this block:**
```typescript
// Example with Resend:
/*
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: process.env.FROM_EMAIL,
  to: options.to,
  subject: options.subject,
  html: options.html,
});
*/
```

**Replace with:**
```typescript
// Resend Email Service
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const result = await resend.emails.send({
  from: process.env.FROM_EMAIL || 'quotes@sterlingwholesale.com',
  to: options.to,
  subject: options.subject,
  html: options.html,
});
console.log("✅ Email sent via Resend:", result.id);
return true;
```

#### 5. Restart Server
```bash
npm run dev
```

#### 6. Test
- Go to quote form
- Complete and submit
- Click "Email Quote to Client"
- Check recipient's inbox

---

## Option 2: SendGrid

### Setup Steps:

#### 1. Install SendGrid
```bash
npm install @sendgrid/mail
```

#### 2. Get API Key
1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up (free tier: 100 emails/day)
3. Create API key in settings
4. Copy it

#### 3. Add Environment Variable
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=quotes@yourdomain.com
```

#### 4. Enable in Code
Edit `src/lib/services/email/EmailService.ts`:

```typescript
// SendGrid Email Service
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
await sgMail.send({
  to: options.to,
  from: process.env.FROM_EMAIL || 'quotes@sterlingwholesale.com',
  subject: options.subject,
  html: options.html,
  text: options.text,
});
console.log("✅ Email sent via SendGrid");
return true;
```

#### 5. Verify Sender
- Go to SendGrid dashboard
- Settings → Sender Authentication
- Verify your email address
- This is required before sending

---

## Option 3: AWS SES (Enterprise)

### Setup Steps:

#### 1. Install AWS SDK
```bash
npm install @aws-sdk/client-ses
```

#### 2. Configure AWS
1. Log in to AWS Console
2. Go to Amazon SES
3. Verify email addresses or domain
4. Create IAM user with SES permissions
5. Get access key and secret

#### 3. Add Environment Variables
```env
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
FROM_EMAIL=quotes@yourdomain.com
```

#### 4. Enable in Code
```typescript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ 
  region: process.env.AWS_REGION || "us-east-1" 
});

const command = new SendEmailCommand({
  Source: process.env.FROM_EMAIL,
  Destination: { ToAddresses: [options.to] },
  Message: {
    Subject: { Data: options.subject },
    Body: {
      Html: { Data: options.html },
      Text: { Data: options.text || "" },
    },
  },
});

await sesClient.send(command);
console.log("✅ Email sent via AWS SES");
return true;
```

---

## Option 4: Mailgun

#### 1. Install Mailgun
```bash
npm install mailgun-js
```

#### 2. Get API Key
- Sign up at [mailgun.com](https://mailgun.com)
- Get API key and domain

#### 3. Environment Variables
```env
MAILGUN_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=sandboxxxxxxxxxx.mailgun.org
FROM_EMAIL=quotes@yourdomain.com
```

#### 4. Enable in Code
```typescript
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

await mailgun.messages().send({
  from: process.env.FROM_EMAIL,
  to: options.to,
  subject: options.subject,
  html: options.html,
  text: options.text,
});
console.log("✅ Email sent via Mailgun");
return true;
```

---

## 📊 Service Comparison

| Service | Free Tier | Setup Difficulty | Best For |
|---------|-----------|------------------|----------|
| **Resend** | 3,000/month | ⭐ Easy | Startups, Quick setup |
| **SendGrid** | 100/day | ⭐⭐ Medium | Small businesses |
| **AWS SES** | 62,000/month* | ⭐⭐⭐ Hard | Enterprise |
| **Mailgun** | 5,000/month | ⭐⭐ Medium | Mid-size apps |

*AWS SES free tier applies to emails sent from EC2

---

## 🔍 Testing Email Service

### 1. Test with Real Email
```javascript
// In browser console or test file
fetch('/api/agency/quotes/QUOTE_ID/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: 'your-email@example.com'
  })
});
```

### 2. Check Logs
```bash
# Terminal running npm run dev
# Should see:
✅ Email sent via [Service Name]
📧 Quote Q12345 emailed to client@example.com
```

### 3. Check Inbox
- Check recipient's inbox
- Check spam folder (first time)
- Verify all content appears correctly
- Test links (PDF download)

---

## 🛠️ Troubleshooting

### Email Not Sending?

#### 1. Check Environment Variables
```bash
# Verify .env.local exists and has correct values
cat .env.local | grep EMAIL
cat .env.local | grep RESEND
```

#### 2. Check API Key
- Make sure no extra spaces
- Verify it's not expired
- Check permissions/scopes

#### 3. Check Sender Email
- Must be verified in service dashboard
- Can't use @gmail.com, @yahoo.com in production
- Use your own domain

#### 4. Check Server Logs
```bash
# Look for error messages in terminal
# Common errors:
# - Invalid API key
# - Unverified sender
# - Rate limit exceeded
```

### Email Goes to Spam?

#### 1. Verify Domain
- Add SPF record to DNS
- Add DKIM record to DNS
- Add DMARC record to DNS

#### 2. Use Professional "From" Address
- Use your domain (not Gmail)
- Example: quotes@sterlingwholesale.com

#### 3. Warm Up IP
- Start with small volume
- Gradually increase over days
- Service provider will guide you

---

## 📧 Email Templates

### Current Email Template

Located in: `src/lib/services/email/EmailService.ts`

**Features:**
- ✅ HTML + Plain Text versions
- ✅ Responsive design
- ✅ Sterling branding
- ✅ Professional layout
- ✅ Call-to-action buttons
- ✅ Quote details table
- ✅ Next steps section
- ✅ Contact information

### Customizing Templates

To customize, edit `generateQuoteEmailHTML()` in `EmailService.ts`:

```typescript
export function generateQuoteEmailHTML(data: QuoteEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <!-- Edit HTML here -->
      <!-- Change colors, text, layout, etc. -->
    </html>
  `;
}
```

### Testing Templates

1. Open quote in system
2. Click "Email Quote"
3. Check your inbox
4. Verify design on:
   - Desktop email client
   - Mobile email client
   - Webmail (Gmail, Outlook, etc.)

---

## 🚀 Production Checklist

Before going live:

- [ ] Choose email service (Resend recommended)
- [ ] Sign up and get API key
- [ ] Add environment variables
- [ ] Enable in code
- [ ] Test with real email
- [ ] Verify sender domain
- [ ] Set up DNS records (SPF, DKIM, DMARC)
- [ ] Test on multiple email clients
- [ ] Monitor delivery rates
- [ ] Set up bounce handling
- [ ] Configure unsubscribe (if needed)
- [ ] Add to monitoring/alerts

---

## 💡 Pro Tips

### 1. Use Transaction Email Service
Don't use SMTP or personal Gmail. Use dedicated transactional email service.

### 2. Monitor Deliverability
Check bounce rates, open rates, spam complaints.

### 3. Test Before Launch
Send test emails to multiple email providers (Gmail, Outlook, Yahoo).

### 4. Have Fallback
If primary service fails, have backup service ready.

### 5. Rate Limiting
Implement rate limiting to avoid hitting service limits.

### 6. Email Queue
For high volume, use a queue system (Redis, Bull, etc.).

---

## 📞 Support

### Service Support:
- **Resend:** [resend.com/docs](https://resend.com/docs)
- **SendGrid:** [sendgrid.com/docs](https://sendgrid.com/docs)
- **AWS SES:** [aws.amazon.com/ses/](https://aws.amazon.com/ses/)
- **Mailgun:** [documentation.mailgun.com](https://documentation.mailgun.com)

### Code Issues:
Check `src/lib/services/email/EmailService.ts` for implementation details.

---

**Ready to send real emails! 📧✨**










