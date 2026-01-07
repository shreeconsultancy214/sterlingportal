# Phase 3 Testing Guide: Binder Generation & Email

## 🎯 What Phase 3 Does

1. **Binder PDF Generation** - After admin enters a quote, system generates a professional binder PDF
2. **Email Notification** - System sends email to broker with quote details and binder PDF link

---

## ✅ Pre-Testing Checklist

### 1. Ensure You Have:
- [ ] A submitted application (from agency form)
- [ ] Admin access to enter quotes
- [ ] Agency email configured (for testing email)
- [ ] Terminal/console access (to see logs)

### 2. Check Environment:
- [ ] MongoDB connection working
- [ ] Puppeteer installed (for PDF generation)
- [ ] Server running (`npm run dev`)

---

## 🧪 Testing Steps

### **Step 1: Submit an Application (if not already done)**

1. Go to: `http://localhost:3000/agency/marketplace`
2. Select a program (e.g., "Advantage Contractor GL")
3. Fill out the application form completely
4. Click **"Submit Application"**
5. Verify you're redirected to dashboard
6. Note the application ID from the URL or dashboard

---

### **Step 2: Admin Enters Quote**

1. Go to: `http://localhost:3000/admin/submissions`
2. Find the application you just submitted
3. Click **"Enter Quote"** button
4. Fill in the quote form:
   - Select a carrier
   - Enter **Carrier Quote** (e.g., `5000`)
   - Enter **Premium Tax %** (e.g., `5`)
   - Enter **Premium Tax Amount** (e.g., `250`)
   - Enter **Policy Fee** (e.g., `100`)
   - Fill in policy limits (should be pre-filled from application)
   - Select endorsements (should be pre-checked from application)
   - Enter **Effective Date** and **Expiration Date**
   - Add any **Special Notes** (optional)
5. Review the **Quote Summary** at the bottom:
   - Should show: Carrier Quote, Tax, Policy Fee, Broker Fee (from form), Total
   - **Should NOT show wholesale fee**
6. Click **"Create Quote"**

---

### **Step 3: Verify Binder PDF Generation**

#### **Check Terminal Logs:**
Look for these log messages:
```
📄 Generating Binder PDF...
✅ Binder PDF generated: /path/to/binder-{quoteId}.pdf
```

#### **Check Database:**
The quote should have `binderPdfUrl` field populated.

#### **Download Binder PDF:**
1. Go to: `http://localhost:3000/admin/submissions/[submissionId]`
2. Look for a **"Download Binder PDF"** button (if implemented)
   OR
3. Check the quote object - it should have `binderPdfUrl`

#### **Verify PDF Content:**
The binder PDF should include:
- ✅ Quote number
- ✅ Company information
- ✅ Premium breakdown (Carrier Quote, Tax, Policy Fee, Broker Fee, Total)
- ✅ Policy limits
- ✅ Endorsements
- ✅ Effective/Expiration dates
- ✅ **NO wholesale fee**

---

### **Step 4: Verify Email Notification**

#### **Check Terminal Logs:**
Look for these log messages:
```
📧 Email would be sent to: [agency-email]
📧 Subject: Quote Ready: [Company Name] - $[Amount]
📧 Mock email sent successfully
✅ Quote email sent to broker: [agency-email]
```

#### **Note:**
Currently, emails are **mocked** (logged to console only). To enable real emails:
1. Set up email service (Resend, SendGrid, etc.)
2. Add API key to `.env.local`
3. Uncomment email service code in `src/lib/services/email/EmailService.ts`

---

### **Step 5: Verify Quote Status**

1. Go to: `http://localhost:3000/admin/submissions`
2. Find your application
3. Status should be: **"QUOTED"**
4. Click to view details
5. Should show quote information

---

## 🐛 Common Issues & Solutions

### **Issue 1: PDF Generation Fails**

**Error:** `puppeteer` not found or PDF generation error

**Solution:**
```bash
npm install puppeteer
```

If still failing, check:
- Puppeteer is installed correctly
- No file permission issues
- Storage directory exists

---

### **Issue 2: Email Not Sending**

**Error:** No email logs in console

**Solution:**
- Check that agency email is set in the Agency model
- Check terminal for error messages
- Verify email service is being called (check API route)

---

### **Issue 3: Binder PDF Missing Fields**

**Error:** PDF generated but missing data

**Solution:**
- Check that application form data is complete
- Verify all required fields are in `submission.payload`
- Check `BinderPDF.ts` for field mappings

---

### **Issue 4: Wholesale Fee Still Showing**

**Error:** Wholesale fee appears in PDF or calculations

**Solution:**
- Verify `BinderPDF.ts` doesn't reference wholesale fee
- Check API route doesn't calculate wholesale fee
- Clear browser cache and rebuild

---

## 📊 Expected Results

### **After Successful Test:**

1. ✅ Quote created in database with status "POSTED"
2. ✅ Application status updated to "QUOTED"
3. ✅ Binder PDF file created in storage
4. ✅ `binderPdfUrl` saved to quote document
5. ✅ Email notification logged (or sent if configured)
6. ✅ Quote visible in admin submissions list
7. ✅ No wholesale fee in any calculations or displays

---

## 🔍 Verification Checklist

After completing the test, verify:

- [ ] Quote created successfully
- [ ] Binder PDF generated and saved
- [ ] PDF contains all required information
- [ ] PDF does NOT contain wholesale fee
- [ ] Email notification logged/sent
- [ ] Quote status is "POSTED"
- [ ] Application status is "QUOTED"
- [ ] Broker fee from application form is included
- [ ] Limits and endorsements from application are included
- [ ] Total calculation is correct (Carrier + Tax + Policy Fee + Broker Fee)

---

## 🚀 Next Steps After Testing

Once Phase 3 is verified working:

1. **Phase 4:** Update Agency Dashboard to show quotes
2. **Phase 5:** Add quote approval/rejection flow
3. **Phase 6:** Payment processing
4. **Phase 7:** Policy binding

---

## 📝 Test Report Template

```
Test Date: ___________
Tester: ___________

Application ID: ___________
Quote ID: ___________

✅ Binder PDF Generated: Yes/No
✅ PDF Contains All Data: Yes/No
✅ Email Notification Sent: Yes/No
✅ No Wholesale Fee: Yes/No
✅ Broker Fee from Form: Yes/No
✅ Limits/Endorsements Pre-filled: Yes/No

Issues Found:
- 

Notes:
- 
```

---

**Ready to test? Start with Step 1!** 🚀











