# ISC Insurance Portal Workflow - Complete Process Explained

This document explains the exact workflow of ISC's insurance portal and how quotes move through the system from agency submission to final binding.

---

## 🎯 **ISC WORKFLOW (What They Do)**

### **1. Agency Portal → Quote Form Submission**

#### **What Happens:**
- Agency user navigates to **Marketplace** → selects Industry/Program → clicks "Continue"
- Fills out the **comprehensive quote form** (Advantage Contractor GL Rater)
- Form includes all business details, class codes, limits, endorsements, etc.
- Agency clicks **"Calculate Premium"**

#### **Result:**
- System calculates premium instantly (using rating engine)
- Quote is saved with status: **"CALCULATED"**
- Agency sees:
  - ✅ Quote Number (e.g., Q123ABC)
  - ✅ Calculated Premium (e.g., $2,450/year)
  - ✅ Effective/Expiration Dates
  - ✅ Two action buttons:
    - 📥 **Download Quote PDF**
    - 📧 **Email Quote to Client**

---

### **2. Agency Dashboard → Sales Pipeline**

After quote is calculated, it appears in the **Agency Dashboard's Sales Pipeline**:

```
┌─────────────────────────────────────────────────────────┐
│  SALES PIPELINE                                          │
├─────────────────────────────────────────────────────────┤
│  📊 Quoted               (e.g., 5 quotes)                │
│  📝 App Received         (e.g., 2 quotes)                │
│  ✅ Bound                (e.g., 3 policies)              │
│  📋 Bound - Incomplete   (e.g., 1 policy)                │
│  ❌ Declined             (e.g., 0 quotes)                │
└─────────────────────────────────────────────────────────┘
```

#### **Status Progression:**

1. **QUOTED** → Quote calculated but not submitted for binding yet
   - Agency can download PDF, email to client
   - Agency shows quote to client and gets their approval
   - Client signs application

2. **APP RECEIVED** → Client signed, agency submits for binding
   - Agency uploads signed application
   - Agency clicks "Request Bind"
   - Status changes to "APP RECEIVED" or "BIND REQUESTED"
   - **This is where admin involvement begins**

3. **BOUND** → Admin/Underwriter approved and bound the policy
   - Admin reviews the bind request
   - Admin approves and binds the policy
   - Policy documents are generated
   - Status changes to "BOUND"
   - Agency and client receive policy documents

4. **BOUND - INCOMPLETE** → Policy bound but missing documents
   - Additional documents required
   - Agency needs to upload missing items

5. **DECLINED** → Underwriter declined to bind
   - Risk doesn't meet guidelines
   - Pricing issues
   - Other underwriting reasons

---

### **3. Admin/Underwriter Portal → Bind Requests**

#### **What Admin Sees:**

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD - CONTROL CENTER                        │
├─────────────────────────────────────────────────────────┤
│  📊 Total Submissions:    12                             │
│  ⏳ Pending Quotes:        3                             │
│  🔔 Bind Requests:         5  ⚠️ Action Required         │
│  ✅ Bound Policies:        8                             │
└─────────────────────────────────────────────────────────┘
```

#### **Admin Actions:**

1. **Review Bind Request**
   - View all quote details
   - Review business information
   - Check uploaded documents (signed app, loss runs, etc.)
   - Verify premium calculation

2. **Decision:**
   - ✅ **APPROVE & BIND** → Generate policy, send documents
   - 📝 **REQUEST MORE INFO** → Ask agency for additional docs
   - ❌ **DECLINE** → Provide reason, notify agency

3. **If Approved:**
   - Policy number generated (e.g., POL-2024-001)
   - Policy documents created (Declarations, Certificate, etc.)
   - Email sent to agency and insured
   - Status updated to "BOUND"

---

## 🏗️ **OUR CURRENT SYSTEM (What We Have)**

### **Two Separate Systems:**

#### **System 1: Old Submission Workflow** (Already Built)
```
Agency → Submits Form → Admin Reviews → Admin Quotes → Agency Binds
```
- Used for manual underwriting
- Goes through full admin approval process
- Status: SUBMITTED → ROUTED → QUOTED → BIND_REQUESTED → BOUND

#### **System 2: New Rater Workflow** (Just Built - Advantage Contractor)
```
Agency → Fills Rater Form → Instant Quote → Download/Email PDF
```
- Self-service instant quotes
- **Currently NOT integrated with admin workflow**
- Status: DRAFT → CALCULATED
- **Missing: Bind request and admin approval flow**

---

## 🚀 **WHAT WE NEED TO IMPLEMENT**

### **Goal:** Make our Rater Workflow match ISC exactly

### **Phase 1: Rater Quote to Bind Request Flow**

#### **1.1 - Add "Request Bind" Button to Quote Page**

After quote is calculated, show:

```typescript
┌──────────────────────────────────────────────┐
│  ✅ Quote Calculated Successfully            │
│                                              │
│  Quote #: Q1234567                           │
│  Premium: $2,450/year                        │
│                                              │
│  [📥 Download PDF]  [📧 Email Quote]         │
│                                              │
│  ─────────────────────────────────────────   │
│                                              │
│  Ready to bind this policy?                  │
│                                              │
│  [🔐 Request Bind]                           │
│                                              │
│  Upload signed application (PDF)             │
│  [Choose File] application.pdf               │
│                                              │
│  Additional Documents (optional)             │
│  [Choose File]                               │
│                                              │
│  [Submit Bind Request →]                     │
└──────────────────────────────────────────────┘
```

#### **1.2 - Update Quote Status Flow**

```typescript
// Update InsuranceQuote schema to include bind request statuses
quoteStatus: {
  type: String,
  enum: [
    "DRAFT",           // Form in progress
    "CALCULATED",      // Premium calculated, quote ready
    "BIND_REQUESTED",  // Agency requested to bind ← NEW
    "BOUND",           // Admin approved and bound ← EXISTING
    "DECLINED",        // Admin declined to bind ← EXISTING  
    "EXPIRED"          // Quote expired
  ],
  default: "DRAFT"
}
```

#### **1.3 - File Upload for Documents**

```typescript
// Add to InsuranceQuote schema
documents: [{
  type: { type: String, enum: ["APPLICATION", "LOSS_RUNS", "OTHER"] },
  filename: String,
  url: String,
  uploadedAt: Date,
  uploadedBy: ObjectId
}],
bindRequestedAt: Date,
bindRequestedBy: ObjectId
```

---

### **Phase 2: Agency Dashboard Integration**

#### **2.1 - Update Agency Dashboard**

Show rater quotes in the sales pipeline:

```typescript
// Fetch both submissions AND rater quotes
const [submissions, raterQuotes] = await Promise.all([
  fetch("/api/agency/submissions"),
  fetch("/api/agency/quotes/rater") // ← NEW
]);

// Combine and categorize by status
const pipelineData = {
  QUOTED: raterQuotes.filter(q => q.quoteStatus === "CALCULATED"),
  APP_RECEIVED: raterQuotes.filter(q => q.quoteStatus === "BIND_REQUESTED"),
  BOUND: raterQuotes.filter(q => q.quoteStatus === "BOUND"),
  DECLINED: raterQuotes.filter(q => q.quoteStatus === "DECLINED"),
};
```

#### **2.2 - Pipeline Table**

```typescript
// Show clickable rows
<table>
  <tr onClick={() => router.push(`/agency/quotes/${quote._id}`)}>
    <td>{quote.formData.companyName}</td>
    <td>{quote.quoteNumber}</td>
    <td>${quote.calculatedPremium}</td>
    <td><Badge status={quote.quoteStatus} /></td>
    <td>
      {quote.quoteStatus === "CALCULATED" && (
        <button>Request Bind</button>
      )}
    </td>
  </tr>
</table>
```

---

### **Phase 3: Admin Bind Request Management**

#### **3.1 - Admin Bind Requests Page**

Create: `/admin/bind-requests/page.tsx`

```typescript
// Show all quotes with status BIND_REQUESTED
const bindRequests = await InsuranceQuote.find({
  quoteStatus: "BIND_REQUESTED"
}).populate("agencyId userId");

// Display table with actions
<table>
  {bindRequests.map(quote => (
    <tr>
      <td>{quote.agencyName}</td>
      <td>{quote.formData.companyName}</td>
      <td>{quote.quoteNumber}</td>
      <td>${quote.calculatedPremium}</td>
      <td>
        <Link href={`/admin/bind-requests/${quote._id}`}>
          Review & Bind
        </Link>
      </td>
    </tr>
  ))}
</table>
```

#### **3.2 - Admin Bind Request Detail Page**

Create: `/admin/bind-requests/[id]/page.tsx`

```typescript
// Show all quote details
- Business Information
- Coverage Details
- Calculated Premium
- Uploaded Documents
- History/Timeline

// Admin Actions
<div className="actions">
  <button onClick={approveAndBind}>
    ✅ Approve & Bind Policy
  </button>
  <button onClick={requestMoreInfo}>
    📝 Request More Information
  </button>
  <button onClick={decline}>
    ❌ Decline to Bind
  </button>
</div>

// If admin approves:
const approveAndBind = async () => {
  // 1. Generate policy number
  const policyNumber = generatePolicyNumber();
  
  // 2. Update quote status
  await fetch(`/api/admin/bind-requests/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({
      policyNumber,
      bindDate: new Date(),
      notes: adminNotes
    })
  });
  
  // 3. Generate policy documents
  await generatePolicyDocuments(quote);
  
  // 4. Send email notifications
  await sendBindConfirmationEmail(quote);
  
  // 5. Update to BOUND status
  quote.quoteStatus = "BOUND";
};
```

---

### **Phase 4: Policy Management**

#### **4.1 - Bound Policies View**

Both Agency and Admin can view bound policies:

```typescript
// Agency: /agency/policies
// Admin: /admin/bound-policies

const boundPolicies = await InsuranceQuote.find({
  quoteStatus: "BOUND",
  agencyId: session.user.agencyId // for agency view
});

// Display
<table>
  <tr>
    <td>{policy.policyNumber}</td>
    <td>{policy.formData.companyName}</td>
    <td>${policy.calculatedPremium}</td>
    <td>{policy.effectiveDate} - {policy.expirationDate}</td>
    <td>
      <button>Download Policy Documents</button>
      <button>Download Certificate</button>
    </td>
  </tr>
</table>
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Backend (API Routes)**

- [ ] `POST /api/agency/quotes/[id]/bind-request` - Submit bind request
- [ ] `GET /api/agency/quotes/rater` - Get all rater quotes for agency
- [ ] `GET /api/admin/bind-requests` - Get all bind requests
- [ ] `GET /api/admin/bind-requests/[id]` - Get bind request details
- [ ] `POST /api/admin/bind-requests/[id]/approve` - Approve and bind
- [ ] `POST /api/admin/bind-requests/[id]/decline` - Decline bind request
- [ ] `POST /api/admin/bind-requests/[id]/request-info` - Request more info
- [ ] `POST /api/agency/quotes/[id]/upload-document` - Upload docs (S3/file system)

### **Database Schema Updates**

- [ ] Add bind request fields to InsuranceQuote model
- [ ] Add documents array to InsuranceQuote model
- [ ] Add policyNumber field
- [ ] Add bindDate field
- [ ] Update status enum

### **Frontend Pages**

- [ ] Update `/agency/quote/[programId]/page.tsx` - Add bind request section
- [ ] Update `/agency/dashboard/page.tsx` - Show rater quotes in pipeline
- [ ] Create `/agency/quotes/[id]/page.tsx` - Individual quote detail view
- [ ] Update `/admin/bind-requests/page.tsx` - List all bind requests
- [ ] Create `/admin/bind-requests/[id]/page.tsx` - Review and approve
- [ ] Create `/agency/policies/page.tsx` - View bound policies

### **Document Generation**

- [ ] Policy Declarations page PDF
- [ ] Certificate of Insurance PDF
- [ ] Binder document
- [ ] Email templates for bind confirmation

### **File Upload**

- [ ] Setup AWS S3 or local file storage
- [ ] File upload component
- [ ] File type validation (PDF, images)
- [ ] File size limits

---

## 🎨 **ISC-STYLE UI COMPONENTS**

### **Status Badges**

```typescript
const getStatusBadge = (status: string) => {
  const styles = {
    CALCULATED: "bg-blue-100 text-blue-800",
    BIND_REQUESTED: "bg-orange-100 text-orange-800 animate-pulse",
    BOUND: "bg-green-100 text-green-800",
    DECLINED: "bg-red-100 text-red-800",
    EXPIRED: "bg-gray-100 text-gray-800"
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
};
```

### **Timeline Component**

```typescript
<div className="timeline">
  <TimelineItem
    icon="📝"
    title="Quote Calculated"
    date="Dec 23, 2024 10:30 AM"
    completed
  />
  <TimelineItem
    icon="🔐"
    title="Bind Requested"
    date="Dec 23, 2024 2:45 PM"
    completed
  />
  <TimelineItem
    icon="👁️"
    title="Under Review"
    date="Pending"
    active
  />
  <TimelineItem
    icon="✅"
    title="Bound"
    date="Pending"
  />
</div>
```

---

## 📊 **DATA FLOW DIAGRAM**

```
┌─────────────┐
│   AGENCY    │
│  Dashboard  │
└──────┬──────┘
       │
       │ 1. Navigate to Marketplace
       ↓
┌─────────────┐
│ Marketplace │
│    Page     │
└──────┬──────┘
       │
       │ 2. Select Program & Click Continue
       ↓
┌─────────────┐
│ Quote Form  │
│   (Rater)   │
└──────┬──────┘
       │
       │ 3. Fill Form & Calculate
       ↓
┌─────────────┐     4. Download/Email PDF
│ Quote Ready │ ←──────────────────────────┐
│  CALCULATED │                            │
└──────┬──────┘                            │
       │                                   │
       │ 5. Upload Signed App              │
       │ 6. Click "Request Bind"           │
       ↓                                   │
┌─────────────┐     7. Appears in          │
│ BIND_       │        Pipeline            │
│ REQUESTED   │ ───────────────────────────┤
└──────┬──────┘                            │
       │                                   │
       │ 8. Shows in Admin Dashboard       │
       ↓                                   │
┌─────────────┐                            │
│    ADMIN    │     9. Review              │
│ Bind Review │                            │
└──────┬──────┘                            │
       │                                   │
       │ 10. Approve/Decline               │
       ↓                                   │
┌─────────────┐     11. Generate Docs      │
│   BOUND     │     12. Send Emails        │
│   Policy    │ ───────────────────────────┘
└─────────────┘     13. Show in Policies
```

---

## 🚀 **NEXT STEPS**

### **Immediate (Priority 1):**
1. Add Google Maps API key to enable address autocomplete
2. Test current quote calculation flow
3. Add "Request Bind" section to quote page
4. Update quote status to include BIND_REQUESTED

### **Short Term (Priority 2):**
1. Create agency quote list page
2. Integrate rater quotes into agency dashboard pipeline
3. Setup file upload (documents)
4. Create admin bind requests page

### **Medium Term (Priority 3):**
1. Build admin bind approval workflow
2. Generate policy documents
3. Email notifications
4. Bound policies management

---

## 📞 **QUESTIONS TO CLARIFY**

1. **Should rater quotes require admin approval to bind, or can agencies bind instantly?**
   - ISC: Requires admin approval (safer, more control)
   - Alternative: Auto-bind for qualifying risks (faster, but risky)

2. **What documents are required for binding?**
   - Signed application (always)
   - Loss runs (sometimes)
   - Driver license (sometimes)
   - Other?

3. **Policy document generation:**
   - Use templates?
   - Generate PDFs dynamically?
   - Use third-party service (Docusign, Adobe)?

4. **File storage:**
   - AWS S3 (recommended for production)
   - Local file system (dev only)
   - Google Cloud Storage
   - Azure Blob Storage

---

**Would you like me to start implementing any specific phase?** 🚀










