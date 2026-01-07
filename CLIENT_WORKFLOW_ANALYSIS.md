# Client Workflow Analysis & Implementation Plan

## 📋 Complete Client Workflow (From Client Requirements)

### **Current Flow:**
1. ✅ Agency submits application → PDF generated → Emailed to carrier
2. ✅ Admin enters quote from carrier → Binder PDF generated → Email sent to agency
3. ⏳ **Next Steps Below...**

---

## 🎯 What We Have vs What We Need

### **✅ COMPLETED:**

#### **1. Application Submission**
- ✅ Agency fills form
- ✅ PDF generated
- ✅ Emailed to carrier

#### **2. Admin Quote Entry**
- ✅ Admin enters quote details
- ✅ Binder PDF generated
- ✅ Email notification to agency

---

## 🚀 REMAINING PHASES TO IMPLEMENT

### **PHASE 4: Quote Posting & Broker Fee Management**

#### **What Client Wants:**
> "Once carrier sends quote: We enter quote numbers into portal. Agency gets notification that Quote is Ready. Agency can enter their Broker Fee."

#### **What We Have:**
- ✅ Admin enters quote
- ✅ Email sent to agency
- ✅ Broker fee from application form (pre-filled)

#### **What We Need to Add:**

**4.1 - Quote Notification Enhancement**
- [ ] Update agency dashboard to show "New Quote Ready" notification
- [ ] Add quote count badge in agency dashboard
- [ ] Make email notification more prominent

**4.2 - Broker Fee Editing (Agency Side)**
- [ ] Add "Edit Broker Fee" button on quote detail page
- [ ] Allow agency to update broker fee after quote is posted
- [ ] Recalculate total when broker fee changes
- [ ] Update quote in database with new broker fee
- [ ] Show updated total in quote display

**4.3 - Quote Detail Page for Agency**
- [ ] Create/update `/agency/quotes/[id]/page.tsx`
- [ ] Show full quote details
- [ ] Show binder PDF download
- [ ] Show broker fee (editable)
- [ ] Show total breakdown

---

### **PHASE 5: E-Signature Documents Generation**

#### **What Client Wants:**
> "System generates: Proposal, Finance Agreement, Required Carrier Forms. Agency sends to insured for e-signature."

#### **What We Need to Add:**

**5.1 - Proposal PDF Generation**
- [ ] Create `ProposalPDF.ts` service
- [ ] Generate professional proposal document
- [ ] Include quote details, coverage, pricing
- [ ] Add download button on quote page

**5.2 - Carrier Forms PDF Generation**
- [ ] Create `CarrierFormsPDF.ts` service
- [ ] Generate required carrier forms based on program
- [ ] Include application data in forms
- [ ] Add download button on quote page

**5.3 - Finance Agreement PDF (Skip for Now)**
- [ ] ⏸️ **SKIP** - Client said "for now dont want finance option"
- [ ] Will add later when finance is implemented

**5.4 - E-Signature Integration**
- [ ] Research e-signature service (DocuSign, HelloSign, etc.)
- [ ] Create API endpoint to send documents for e-signature
- [ ] Add "Send for E-Signature" button
- [ ] Track e-signature status
- [ ] Store signed documents

**5.5 - Document Management**
- [ ] Create documents list on quote page
- [ ] Show: Proposal, Binder, Carrier Forms, Signed Docs
- [ ] Download buttons for each
- [ ] Status indicators (signed/unsigned)

---

### **PHASE 6: Payment Processing**

#### **What Client Wants:**
> "After signatures: Agency can Pay Invoice inside portal using Credit Card, ACH, Apple Pay (Powered by Sterling Payment Solutions)."

#### **What We Need to Add:**

**6.1 - Payment Integration Setup**
- [ ] Choose payment processor (Stripe recommended)
- [ ] Set up payment gateway
- [ ] Add payment API keys to environment
- [ ] Create payment service

**6.2 - Payment Methods**
- [ ] Credit Card payment form
- [ ] ACH payment form
- [ ] Apple Pay integration (if using Stripe)
- [ ] Payment method selection UI

**6.3 - Payment Flow**
- [ ] "Pay Invoice" button on quote page (after e-signature)
- [ ] Payment form/modal
- [ ] Process payment
- [ ] Update payment status
- [ ] Generate receipt
- [ ] Send payment confirmation email

**6.4 - Payment Status Tracking**
- [ ] Add `paymentStatus` field to Quote model
- [ ] Track: PENDING, PROCESSING, PAID, FAILED
- [ ] Show payment status on quote page
- [ ] Payment history/logs

---

### **PHASE 7: Bind Request**

#### **What Client Wants:**
> "Agency clicks Request Bind. System auto-emails bind request and signed docs to correct Carrier Underwriter."

#### **What We Need to Add:**

**7.1 - Bind Request Button**
- [ ] Add "Request Bind" button on quote page
- [ ] Only show after: Quote approved, E-signature complete, Payment received
- [ ] Confirmation dialog before submitting

**7.2 - Bind Request Processing**
- [ ] Create bind request API endpoint
- [ ] Update quote status to "BIND_REQUESTED"
- [ ] Collect all signed documents
- [ ] Get carrier underwriter email from carrier record
- [ ] Generate bind request email

**7.3 - Email to Carrier Underwriter**
- [ ] Create email template for bind request
- [ ] Include: Quote details, Insured info, Coverage details
- [ ] Attach: Signed proposal, Signed carrier forms, Binder PDF
- [ ] Send to carrier underwriter email
- [ ] CC admin and agency

**7.4 - Bind Request Tracking**
- [ ] Add `bindRequestedAt` timestamp
- [ ] Show bind request status
- [ ] Notification to admin when bind requested

---

### **PHASE 8: Policy Issuance**

#### **What Client Wants:**
> "Once carrier issues binder/policy: We upload final docs. Policy appears under Bound Policies."

#### **What We Need to Add:**

**8.1 - Admin Policy Upload**
- [ ] Add "Upload Policy Documents" section in admin quote detail page
- [ ] File upload for: Policy PDF, Certificate, Declarations, etc.
- [ ] Store uploaded documents
- [ ] Link documents to quote

**8.2 - Policy Binding**
- [ ] Add "Bind Policy" button in admin panel
- [ ] Enter policy number
- [ ] Enter effective/expiration dates
- [ ] Upload policy documents
- [ ] Update quote status to "BOUND"
- [ ] Update application status to "BOUND"

**8.3 - Bound Policies View**
- [ ] Create `/agency/policies` page
- [ ] Create `/admin/bound-policies` page
- [ ] List all bound policies
- [ ] Show policy details
- [ ] Download policy documents
- [ ] Filter by date, carrier, agency

**8.4 - Policy Notifications**
- [ ] Email to agency when policy is bound
- [ ] Email to insured with policy documents
- [ ] Include policy number and details

---

### **PHASE 9: Extra Tools**

#### **What Client Wants:**
> "Request Loss Runs, Request BOR, Pull Reports"

#### **What We Need to Add:**

**9.1 - Request Loss Runs**
- [ ] Add "Request Loss Runs" button on quote/application page
- [ ] Create request form (insured info, date range, etc.)
- [ ] Send request to admin/carrier
- [ ] Track request status
- [ ] Upload loss runs when received

**9.2 - Request BOR (Broker of Record)**
- [ ] Add "Request BOR" button
- [ ] Create BOR request form
- [ ] Generate BOR document
- [ ] Send for e-signature
- [ ] Track BOR status

**9.3 - Pull Reports**
- [ ] Create reports page
- [ ] Sales pipeline report
- [ ] Quote conversion report
- [ ] Revenue report
- [ ] Export to CSV/PDF
- [ ] Date range filters
- [ ] Agency/carrier filters

---

## 📊 Implementation Priority

### **HIGH PRIORITY (Core Workflow):**

1. **Phase 4** - Quote Posting & Broker Fee Management
   - Essential for agency to manage quotes
   - **Estimated: 2-3 days**

2. **Phase 5** - E-Signature Documents (Proposal + Carrier Forms)
   - Required before payment
   - **Estimated: 3-4 days**

3. **Phase 6** - Payment Processing
   - Core revenue functionality
   - **Estimated: 4-5 days**

4. **Phase 7** - Bind Request
   - Completes the quote-to-policy flow
   - **Estimated: 2-3 days**

5. **Phase 8** - Policy Issuance
   - Final step in workflow
   - **Estimated: 2-3 days**

### **MEDIUM PRIORITY (Enhancements):**

6. **Phase 9** - Extra Tools
   - Nice-to-have features
   - **Estimated: 3-4 days**

---

## 🔄 Complete Workflow Diagram

```
1. Agency Submits Application
   ↓
2. PDF Generated → Emailed to Carrier
   ↓
3. Admin Enters Quote → Binder PDF → Email to Agency
   ↓
4. Agency Views Quote → Edits Broker Fee (if needed)
   ↓
5. System Generates: Proposal + Carrier Forms
   ↓
6. Agency Sends Documents for E-Signature
   ↓
7. Insured Signs Documents
   ↓
8. Agency Pays Invoice (Credit Card/ACH/Apple Pay)
   ↓
9. Agency Clicks "Request Bind"
   ↓
10. System Emails Bind Request + Signed Docs to Carrier
   ↓
11. Carrier Issues Policy
   ↓
12. Admin Uploads Policy Documents → Binds Policy
   ↓
13. Policy Appears in "Bound Policies"
```

---

## 🎯 Next Steps

### **Immediate Next Phase: Phase 4**

**Phase 4.1 - Quote Notification Enhancement**
- Update agency dashboard to highlight new quotes
- Add notification badge

**Phase 4.2 - Broker Fee Editing**
- Add edit functionality on quote detail page
- Allow agency to update broker fee
- Recalculate totals

**Phase 4.3 - Quote Detail Page**
- Create comprehensive quote view for agency
- Show all quote details
- Download buttons for documents

---

## 📝 Notes

- **Finance Option:** Skip for now, add later
- **E-Signature:** Need to choose service (DocuSign/HelloSign/etc.)
- **Payment:** Need to choose processor (Stripe recommended)
- **Carrier Forms:** May need different forms per program/carrier
- **Reports:** Can start with basic reports, expand later

---

**Ready to start Phase 4?** 🚀











