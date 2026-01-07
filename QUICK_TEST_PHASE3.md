# 🧪 Quick Test Guide - Phase 3

## Fast Testing Steps

### 1️⃣ Submit Application
- Go to: `/agency/marketplace`
- Select program → Fill form → Submit

### 2️⃣ Enter Quote (Admin)
- Go to: `/admin/submissions`
- Find your application → Click "Enter Quote"
- Fill in:
  - Carrier Quote: `5000`
  - Premium Tax %: `5`
  - Premium Tax Amount: `250`
  - Policy Fee: `100`
  - Dates, limits, endorsements (pre-filled)
- Click "Create Quote"

### 3️⃣ Check Results

#### ✅ Terminal Logs Should Show:
```
📄 Generating Binder PDF...
✅ Binder PDF generated: /path/to/binder-{id}.pdf
📧 Email would be sent to: [agency-email]
✅ Quote email sent to broker
```

#### ✅ In Admin Dashboard:
- Go to: `/admin/submissions/[id]`
- Should see quote with **"Download Binder"** button
- Click to download PDF

#### ✅ Verify PDF Contains:
- Company info
- Premium breakdown (NO wholesale fee)
- Limits & endorsements
- Effective/Expiration dates

---

## 🐛 Troubleshooting

**PDF not generating?**
- Check terminal for errors
- Verify puppeteer is installed: `npm install puppeteer`

**Email not showing?**
- Check terminal logs (emails are mocked - logged only)
- Verify agency email is set

**Binder button not showing?**
- Check quote has `binderPdfUrl` field
- Refresh the page

---

## ✅ Success Criteria

- [ ] Quote created with status "POSTED"
- [ ] Binder PDF file exists
- [ ] "Download Binder" button appears
- [ ] PDF opens and shows all data
- [ ] Email logged in terminal
- [ ] No wholesale fee in PDF or calculations

---

**Ready? Start testing!** 🚀











