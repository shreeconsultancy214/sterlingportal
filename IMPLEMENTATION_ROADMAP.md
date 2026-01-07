# 🗺️ Implementation Roadmap - Remaining Phases

## 📊 Current Status

✅ **Phase 1:** Application Submission  
✅ **Phase 2:** Admin Quote Entry  
✅ **Phase 3:** Binder Generation & Email  

---

## 🎯 Remaining Phases (In Order)

### **PHASE 4: Quote Posting & Broker Fee Management** ⏭️ **NEXT**

**Goal:** Agency can view quotes and edit their broker fee

**Tasks:**
1. ✅ Update agency dashboard to show new quotes notification
2. ✅ Create/update agency quote detail page (`/agency/quotes/[id]`)
3. ✅ Add "Edit Broker Fee" functionality
4. ✅ Recalculate total when broker fee changes
5. ✅ Show quote breakdown (Carrier + Tax + Policy Fee + Broker Fee)

**Files to Create/Update:**
- `src/app/agency/quotes/[id]/page.tsx` (update)
- `src/app/api/agency/quotes/[id]/broker-fee/route.ts` (new)
- `src/app/agency/dashboard/page.tsx` (update - add quote notifications)

**Estimated Time:** 2-3 days

---

### **PHASE 5: E-Signature Documents Generation**

**Goal:** Generate Proposal and Carrier Forms PDFs, send for e-signature

**Tasks:**
1. ✅ Create Proposal PDF generator
2. ✅ Create Carrier Forms PDF generator
3. ✅ Add download buttons on quote page
4. ✅ Integrate e-signature service (DocuSign/HelloSign)
5. ✅ Add "Send for E-Signature" button
6. ✅ Track e-signature status
7. ⏸️ **SKIP:** Finance Agreement PDF (add later)

**Files to Create:**
- `src/lib/services/pdf/ProposalPDF.ts` (new)
- `src/lib/services/pdf/CarrierFormsPDF.ts` (new)
- `src/app/api/agency/quotes/[id]/send-esign/route.ts` (new)
- `src/app/agency/quotes/[id]/page.tsx` (update - add document section)

**Estimated Time:** 3-4 days

---

### **PHASE 6: Payment Processing**

**Goal:** Agency can pay invoice using Credit Card, ACH, Apple Pay

**Tasks:**
1. ✅ Set up payment processor (Stripe recommended)
2. ✅ Create payment service
3. ✅ Add payment form (Credit Card, ACH, Apple Pay)
4. ✅ Process payments
5. ✅ Generate receipts
6. ✅ Update payment status
7. ✅ Send payment confirmation emails

**Files to Create:**
- `src/lib/services/payment/PaymentService.ts` (new)
- `src/app/api/agency/quotes/[id]/payment/route.ts` (new)
- `src/components/agency/quotes/PaymentForm.tsx` (new)
- `src/app/agency/quotes/[id]/payment/page.tsx` (new)

**Estimated Time:** 4-5 days

---

### **PHASE 7: Bind Request**

**Goal:** Agency can request bind, system emails carrier with signed docs

**Tasks:**
1. ✅ Add "Request Bind" button (after payment)
2. ✅ Create bind request API
3. ✅ Collect all signed documents
4. ✅ Get carrier underwriter email
5. ✅ Generate bind request email
6. ✅ Attach signed documents
7. ✅ Send to carrier underwriter

**Files to Create:**
- `src/app/api/agency/quotes/[id]/bind-request/route.ts` (new)
- `src/lib/services/email/BindRequestEmail.ts` (new)
- `src/app/agency/quotes/[id]/page.tsx` (update - add bind button)

**Estimated Time:** 2-3 days

---

### **PHASE 8: Policy Issuance**

**Goal:** Admin uploads policy docs, policy appears in Bound Policies

**Tasks:**
1. ✅ Add file upload in admin quote detail page
2. ✅ Add "Bind Policy" button
3. ✅ Enter policy number and dates
4. ✅ Update status to "BOUND"
5. ✅ Create Bound Policies pages (agency & admin)
6. ✅ Send policy notification emails

**Files to Create:**
- `src/app/admin/quotes/[id]/bind/route.ts` (new)
- `src/app/agency/policies/page.tsx` (new)
- `src/app/admin/bound-policies/page.tsx` (new)
- `src/app/api/admin/quotes/[id]/upload-policy/route.ts` (new)

**Estimated Time:** 2-3 days

---

### **PHASE 9: Extra Tools** (Lower Priority)

**Goal:** Request Loss Runs, Request BOR, Pull Reports

**Tasks:**
1. ✅ Request Loss Runs feature
2. ✅ Request BOR feature
3. ✅ Reports page with filters
4. ✅ Export to CSV/PDF

**Estimated Time:** 3-4 days

---

## 🔄 Complete Workflow Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Agency Submits Application                           │
│    → PDF Generated → Emailed to Carrier                 │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Admin Enters Quote                                   │
│    → Binder PDF Generated → Email to Agency             │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Agency Views Quote (PHASE 4)                         │
│    → Can Edit Broker Fee                                 │
│    → Views Quote Breakdown                               │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Generate Documents (PHASE 5)                          │
│    → Proposal PDF                                        │
│    → Carrier Forms PDF                                   │
│    → Send for E-Signature                                │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Insured Signs Documents                               │
│    → E-Signature Complete                                │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Agency Pays Invoice (PHASE 6)                        │
│    → Credit Card / ACH / Apple Pay                       │
│    → Payment Confirmed                                   │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 7. Agency Requests Bind (PHASE 7)                       │
│    → System Emails Carrier with Signed Docs             │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 8. Carrier Issues Policy                                 │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 9. Admin Uploads Policy (PHASE 8)                       │
│    → Policy Appears in Bound Policies                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Quick Reference: What's Skipped

- ❌ **Finance Option** - Skip for now, add later
- ❌ **Finance Agreement PDF** - Skip for now, add later
- ✅ **Proposal PDF** - Include in Phase 5
- ✅ **Carrier Forms PDF** - Include in Phase 5
- ✅ **E-Signature** - Include in Phase 5

---

## 🎯 Next Immediate Steps

### **Start with Phase 4:**

1. **Update Agency Dashboard**
   - Add quote notification badge
   - Show "New Quote Ready" alerts

2. **Create/Update Quote Detail Page**
   - Show full quote details
   - Show binder PDF download
   - Add "Edit Broker Fee" section

3. **Broker Fee Editing API**
   - Allow agency to update broker fee
   - Recalculate total
   - Update quote in database

---

## 📝 Notes

- **E-Signature Service:** Need to choose (DocuSign, HelloSign, SignNow, etc.)
- **Payment Processor:** Recommend Stripe (supports Credit Card, ACH, Apple Pay)
- **Carrier Forms:** May need different templates per program/carrier
- **File Storage:** Already have PDF storage, need to add policy document storage

---

**Ready to start Phase 4?** 🚀











