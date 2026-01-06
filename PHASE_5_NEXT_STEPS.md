# Phase 5: Next Steps - E-Signature Integration

## ✅ What We've Completed

1. **Proposal PDF Generator** ✅
   - Created `ProposalPDFHTML.ts`
   - Professional HTML template
   - API endpoint: `/api/agency/quotes/[id]/proposal-pdf`
   - Download button on quote page

2. **Carrier Forms PDF Generator** ✅
   - Created `CarrierFormsPDFHTML.ts`
   - Professional HTML template
   - API endpoint: `/api/agency/quotes/[id]/carrier-forms-pdf`
   - Download button on quote page

3. **Download Buttons** ✅
   - Added to quote detail page
   - Direct download functionality

---

## 🎯 Remaining Tasks for Phase 5

### **Task 1: Integrate E-Signature Service**

**What to do:**
- Choose e-signature provider (DocuSign, HelloSign, SignNow, etc.)
- Set up API credentials
- Configure webhook endpoints
- Test connection

**Files to update:**
- `src/lib/services/esign/ESignService.ts` (if exists, update it)
- `.env.local` (add API keys)

**Estimated Time:** 1-2 hours

---

### **Task 2: Update "Send for E-Signature" Button**

**What to do:**
- Update the existing "Send for E-Signature" handler in quote detail page
- Make it send Proposal + Carrier Forms PDFs
- Get recipient email from submission/quote data
- Send documents via e-signature service

**Files to update:**
- `src/app/agency/quotes/[id]/page.tsx` (update `handleSendForEsign`)
- `src/app/api/esign/send/route.ts` (update to handle multiple documents)

**Estimated Time:** 2-3 hours

---

### **Task 3: Document Status Tracking**

**What to do:**
- Track which documents are generated
- Store document URLs in database
- Show document status (Generated, Sent, Signed)
- Update status when e-signature completes

**Database updates needed:**
- Add `documents` array to Quote or Submission model
- Track: document type, URL, status, sent date, signed date

**Files to create/update:**
- Update `Quote` or `Submission` model
- Create document tracking API
- Update quote detail page to show document status

**Estimated Time:** 2-3 hours

---

### **Task 4: E-Signature Webhook Handler**

**What to do:**
- Handle webhook from e-signature service
- Update document status when signed
- Store signed document URLs
- Update submission/quote status

**Files to update:**
- `src/app/api/esign/webhook/route.ts` (if exists)
- Update status tracking logic

**Estimated Time:** 1-2 hours

---

### **Task 5: Document Management UI**

**What to do:**
- Show list of documents on quote page
- Display status for each document:
  - ✅ Generated
  - 📧 Sent for Signature
  - ✍️ Signed
- Show download links for signed documents

**Files to update:**
- `src/app/agency/quotes/[id]/page.tsx`
- Add document list component

**Estimated Time:** 1-2 hours

---

## 📋 Implementation Order

### **Step 1: Choose E-Signature Provider**

**Options:**
1. **DocuSign** (Most popular, robust)
   - Pros: Industry standard, great API, good documentation
   - Cons: More expensive
   - Setup: https://developers.docusign.com/

2. **HelloSign** (Good balance)
   - Pros: Good API, reasonable pricing
   - Cons: Less features than DocuSign
   - Setup: https://app.hellosign.com/api

3. **SignNow** (Cost-effective)
   - Pros: Affordable, good API
   - Cons: Smaller market share
   - Setup: https://www.signnow.com/api

4. **PandaDoc** (All-in-one)
   - Pros: Document + e-signature
   - Cons: More complex
   - Setup: https://developers.pandadoc.com/

**Recommendation:** Start with **HelloSign** (good balance of features and cost)

---

### **Step 2: Set Up E-Signature Service**

1. Create account with chosen provider
2. Get API credentials (API Key, Client ID, Client Secret)
3. Add to `.env.local`:
   ```
   HELLOSIGN_API_KEY=your_api_key
   # OR
   DOCUSIGN_INTEGRATION_KEY=your_key
   DOCUSIGN_USER_ID=your_user_id
   DOCUSIGN_ACCOUNT_ID=your_account_id
   ```

---

### **Step 3: Update E-Signature Service**

**What to implement:**
- Send documents for signature
- Get signing URL
- Track signature status
- Handle webhooks

**Example structure:**
```typescript
// src/lib/services/esign/ESignService.ts
export async function sendDocumentsForSignature(
  documents: Array<{ type: string; url: string; name: string }>,
  recipientEmail: string,
  recipientName: string
): Promise<{ signingUrl: string; envelopeId: string }> {
  // Implementation using chosen provider
}
```

---

### **Step 4: Update Quote Page**

**Add to quote detail page:**
1. Document list section showing:
   - Proposal PDF (Generated/Sent/Signed)
   - Carrier Forms PDF (Generated/Sent/Signed)
   - Binder PDF (Available)

2. "Send for E-Signature" button that:
   - Generates both PDFs if not generated
   - Sends to e-signature service
   - Updates document status

3. Status indicators for each document

---

### **Step 5: Database Schema Updates**

**Add to Quote or Submission model:**
```typescript
documents: [{
  type: String, // "PROPOSAL" | "CARRIER_FORMS" | "BINDER"
  documentUrl: String,
  status: String, // "GENERATED" | "SENT" | "SIGNED"
  sentForSignatureAt: Date,
  signedAt: Date,
  signedDocumentUrl: String,
  envelopeId: String, // From e-signature service
}]
```

---

## 🚀 Quick Start Guide

### **Option 1: Use Existing E-Signature Service**

If there's already an e-signature service implemented:
1. Check `src/lib/services/esign/ESignService.ts`
2. Update it to work with Proposal + Carrier Forms
3. Test the integration

### **Option 2: Implement New E-Signature Service**

1. Choose provider (HelloSign recommended)
2. Install SDK: `npm install hellosign-sdk` (or DocuSign equivalent)
3. Create service file
4. Implement send/receive functions
5. Set up webhooks

---

## 📝 Next Immediate Steps

**I recommend starting with:**

1. **Check existing e-signature implementation**
   - See what's already there
   - Determine if we can use it or need to update it

2. **Update "Send for E-Signature" button**
   - Make it send Proposal + Carrier Forms
   - Get recipient email from quote/submission

3. **Add document tracking**
   - Store document URLs in database
   - Show document status on UI

---

**Would you like me to:**
- **A)** Check and update the existing e-signature service?
- **B)** Implement a new e-signature integration (which provider)?
- **C)** Start with document tracking first?

Let me know which approach you prefer! 🚀










