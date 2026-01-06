# Sterling Portal - Client Review Documentation

## 📋 Overview

This document provides a comprehensive guide for reviewing the Sterling Insurance Portal, including what features are currently using mock integrations vs real services, and step-by-step testing instructions.

---

## 🎯 Current Status

### ✅ **Fully Functional Features**
- User authentication (NextAuth)
- Agency registration and management
- Submission creation and management
- Quote generation and management
- Document generation (PDFs)
- Admin dashboard and workflows
- Agency dashboard and workflows
- Routing logs and activity tracking
- File uploads and document storage
- Search and filtering
- Admin notes on submissions and quotes

### 🔄 **Mock Integrations** (Ready for Real Integration)
- **E-Signature Service** - Currently using mock flow
- **Payment Processing** - Currently using mock flow
- **Stripe Integration** - Configured but using mock payments

---

## 🔌 Integration Status

### Real Integrations ✅

#### 1. **MongoDB Database**
- **Status**: ✅ Fully Integrated
- **Purpose**: All data storage (users, agencies, submissions, quotes, etc.)
- **Location**: MongoDB Atlas Cloud
- **Working**: Yes

#### 2. **NextAuth Authentication**
- **Status**: ✅ Fully Integrated
- **Purpose**: User authentication and session management
- **Working**: Yes

#### 3. **PDF Generation (Puppeteer)**
- **Status**: ✅ Fully Integrated
- **Purpose**: Generate Binder, Proposal, Carrier Forms, Finance Agreement PDFs
- **Working**: Yes

#### 4. **File Storage**
- **Status**: ✅ Fully Integrated
- **Purpose**: Store uploaded files and generated documents
- **Location**: Local file system (`public/documents`, `public/uploads`)
- **Working**: Yes

### Mock Integrations 🔄

#### 1. **E-Signature Service**
- **Status**: 🔄 Mock Implementation
- **Current Behavior**: 
  - Simulates document sending
  - Simulates signing process
  - Updates status in database
- **Real Integration Needed**: 
  - DocuSign, HelloSign, or similar service
  - API integration for actual document signing
- **Files to Update**: 
  - `src/app/api/esign/send/route.ts`
  - `src/app/api/esign/sign/route.ts`

#### 2. **Payment Processing**
- **Status**: 🔄 Mock Implementation
- **Current Behavior**: 
  - Simulates payment processing
  - Generates mock receipts
  - Updates payment status
- **Real Integration Needed**: 
  - Stripe (already configured, just needs activation)
  - Or other payment gateway
- **Files to Update**: 
  - `src/services/PaymentService.ts`
  - `src/app/api/payment/pay/route.ts`

---

## 🧪 Step-by-Step Testing Guide

### Prerequisites

1. **Access the Application**
   - URL: `https://sterling-insurance.vercel.app`
   - Or your custom domain if configured

2. **Test Accounts** (Create these if needed)
   - Admin Account: `admin@sterling.com` / `password`
   - Agency Account: `agency@test.com` / `password`

---

## 📝 Testing Scenarios

### Scenario 1: Agency Registration & Login

#### Step 1: Agency Registration
1. Go to `/signin` page
2. Click "Register as Agency" or similar link
3. Fill in agency details:
   - Agency name
   - Email
   - Password
   - Contact information
4. Submit the form
5. **Expected**: Agency account created, redirected to agency dashboard

#### Step 2: Agency Login
1. Go to `/signin` page
2. Enter agency email and password
3. Click "Sign In"
4. **Expected**: Redirected to `/agency/dashboard`

---

### Scenario 2: Create New Submission

#### Step 1: Navigate to Submission Form
1. Log in as agency user
2. Click "New Submission" or "Submit Application" in dashboard
3. **Expected**: Form page loads

#### Step 2: Fill Submission Form
1. Select program/template
2. Fill in client information:
   - Client name
   - Email
   - Phone
   - Business address
3. Fill in application details (varies by template)
4. Upload required documents (if any)
5. Accept CCPA consent
6. Submit form
7. **Expected**: 
   - Submission created
   - Status: "SUBMITTED"
   - Redirected to submissions list or dashboard

#### Step 3: View Submission
1. Go to "Submissions" section
2. Find your newly created submission
3. Click to view details
4. **Expected**: 
   - All submission details visible
   - Status shown
   - Uploaded files listed
   - Timeline/history visible

---

### Scenario 3: Admin Quote Creation

#### Step 1: Admin Login
1. Go to `/signin` page
2. Enter admin credentials
3. **Expected**: Redirected to `/admin/dashboard`

#### Step 2: View Submissions
1. Click "Submissions" in admin dashboard
2. Find a "SUBMITTED" or "ROUTED" submission
3. Click to view details
4. **Expected**: Full submission details visible

#### Step 3: Create Quote
1. In submission detail page, click "Create Quote" or "Enter Quote"
2. Fill in quote details:
   - Carrier selection
   - Premium amounts
   - Fees (broker fee, policy fee, tax)
   - Effective dates
   - Limits and coverage
3. Submit quote
4. **Expected**: 
   - Quote created
   - Binder PDF generated
   - Quote status: "POSTED"
   - Email sent to agency (mock)

#### Step 4: View Generated Documents
1. In quote detail page, check "Documents" section
2. **Expected**: 
   - Binder PDF available
   - Can download/view PDF

---

### Scenario 4: Agency Quote Approval

#### Step 1: View Quotes
1. Log in as agency user
2. Go to "Quotes" section
3. **Expected**: List of quotes for your agency

#### Step 2: View Quote Details
1. Click on a "POSTED" quote
2. **Expected**: 
   - Full quote details
   - Breakdown of costs
   - Documents available
   - Action buttons visible

#### Step 3: Approve Quote
1. Review quote details
2. Click "Approve Quote" button
3. **Expected**: 
   - Quote status changes to "APPROVED"
   - Success message shown
   - Workflow actions become available

---

### Scenario 5: E-Signature Flow (Mock)

#### Step 1: Generate Proposal PDF
1. In approved quote detail page
2. Click "Generate Proposal PDF"
3. **Expected**: 
   - PDF generated
   - Download link available
   - Document listed in documents section

#### Step 2: Send for E-Signature
1. Click "Send for E-Signature" button
2. Fill in signer information (if prompted)
3. Submit
4. **Expected**: 
   - Success message: "Documents sent for e-signature"
   - Status updates to "E_SIGN_PENDING"
   - Signing link generated (mock)

#### Step 3: Sign Documents (Mock)
1. Click on signing link or "Sign Documents" button
2. Fill in signer details:
   - First Name
   - Last Name
   - Email
3. Click "Sign Documents"
4. **Expected**: 
   - Success message: "Documents signed successfully"
   - Status updates to "E_SIGN_COMPLETED"
   - Redirected to success page

**Note**: This is currently a mock flow. In production, this would integrate with a real e-signature service.

---

### Scenario 6: Payment Processing (Mock)

#### Step 1: Initiate Payment
1. After e-signature is completed
2. Click "Process Payment" or "Pay Now" button
3. **Expected**: Payment form or modal appears

#### Step 2: Enter Payment Details
1. Fill in payment information:
   - Amount (pre-filled from quote)
   - Payment method (mock)
   - Card details (mock - any values work)
2. Submit payment
3. **Expected**: 
   - Success message: "Payment processed successfully"
   - Status updates to "PAYMENT_COMPLETED"
   - Receipt PDF generated (mock)

**Note**: This is currently a mock flow. In production, this would integrate with Stripe or another payment gateway.

---

### Scenario 7: Bind Request

#### Step 1: Request Bind
1. After payment is completed (or directly from approved quote)
2. Click "Request Bind" button
3. Fill in any required information
4. Submit
5. **Expected**: 
   - Success message
   - Status updates to "BIND_REQUESTED"
   - Notification sent to admin

#### Step 2: Admin Approval
1. Log in as admin
2. Go to "Bind Requests" section
3. Find the pending bind request
4. Review details
5. Click "Approve Bind" button
6. **Expected**: 
   - Bind request approved
   - Policy created
   - Status updates to "BOUND"
   - Final policy documents available

---

### Scenario 8: View Bound Policies

#### Step 1: Agency View
1. Log in as agency user
2. Go to "Bound Policies" section
3. **Expected**: List of all bound policies for your agency

#### Step 2: View Policy Details
1. Click on a bound policy
2. **Expected**: 
   - Policy details
   - Policy number
   - Effective dates
   - Coverage details
   - Download final policy documents

#### Step 3: Admin Upload Final Documents
1. Log in as admin
2. Go to "Bound Policies" section
3. Click on a policy
4. Click "Upload Final Documents"
5. Upload policy documents
6. **Expected**: 
   - Documents uploaded
   - Available for agency to download

---

### Scenario 9: Tools (Loss Runs, BOR, Reports)

#### Step 1: Request Loss Runs
1. Log in as agency user
2. Go to "Tools" → "Loss Runs"
3. Fill in request form:
   - Client information
   - Date range
   - Additional details
4. Submit request
5. **Expected**: 
   - Request created
   - Status: "PENDING"
   - Visible in "Request History"

#### Step 2: Admin Process Request
1. Log in as admin
2. Go to "Tool Requests" section
3. Find the pending request
4. Process and upload result document
5. **Expected**: 
   - Status updates to "COMPLETED"
   - Result document available for download

#### Step 3: Agency View Results
1. Log in as agency user
2. Go to "Tools" → "History"
3. Find completed request
4. Download result document
5. **Expected**: Document downloads successfully

---

### Scenario 10: Search and Filter

#### Step 1: Search Submissions
1. Go to "Submissions" page
2. Use search bar to search by:
   - Client name
   - Submission ID
   - Status
3. **Expected**: Results filter in real-time

#### Step 2: Filter Quotes
1. Go to "Quotes" page
2. Use filter tabs:
   - All
   - Pending
   - Approved
   - Posted
3. **Expected**: Quotes filtered by status

---

## 🔍 Feature Checklist

### Agency Features
- [ ] Agency registration
- [ ] Agency login
- [ ] Create new submission
- [ ] View submissions list
- [ ] View submission details
- [ ] Edit submission (if status allows)
- [ ] View quotes
- [ ] View quote details
- [ ] Approve quote
- [ ] Generate proposal PDF
- [ ] Generate carrier forms PDF
- [ ] Send for e-signature (mock)
- [ ] Sign documents (mock)
- [ ] Process payment (mock)
- [ ] Request bind
- [ ] View bound policies
- [ ] Download policy documents
- [ ] Request Loss Runs
- [ ] Request BOR
- [ ] Pull Reports
- [ ] View request history
- [ ] Search and filter submissions/quotes
- [ ] View activity logs
- [ ] View admin notes

### Admin Features
- [ ] Admin login
- [ ] View all submissions
- [ ] View submission details
- [ ] Create quote for submission
- [ ] Post quote
- [ ] View all quotes
- [ ] View bind requests
- [ ] Approve bind requests
- [ ] View bound policies
- [ ] Upload final policy documents
- [ ] View tool requests
- [ ] Process tool requests
- [ ] Upload tool results
- [ ] Add admin notes
- [ ] View routing logs
- [ ] Search and filter

---

## 📊 System Workflow

### Complete Submission to Policy Flow

```
1. Agency Creates Submission
   ↓
2. Submission Status: "SUBMITTED"
   ↓
3. Admin Routes to Carriers
   ↓
4. Submission Status: "ROUTED"
   ↓
5. Admin Creates Quote
   ↓
6. Quote Status: "POSTED"
   ↓
7. Agency Reviews Quote
   ↓
8. Agency Approves Quote
   ↓
9. Quote Status: "APPROVED"
   ↓
10. Agency Generates Documents
    ↓
11. Agency Sends for E-Signature (Mock)
    ↓
12. E-Signature Status: "E_SIGN_COMPLETED"
    ↓
13. Agency Processes Payment (Mock)
    ↓
14. Payment Status: "PAYMENT_COMPLETED"
    ↓
15. Agency Requests Bind
    ↓
16. Bind Status: "BIND_REQUESTED"
    ↓
17. Admin Approves Bind
    ↓
18. Policy Status: "BOUND"
    ↓
19. Admin Uploads Final Documents
    ↓
20. Agency Downloads Final Policy
```

---

## ⚠️ Important Notes for Client

### Mock Integrations

1. **E-Signature**
   - Currently simulates the signing process
   - No actual legal signatures are being collected
   - Ready for real integration (DocuSign, HelloSign, etc.)

2. **Payment Processing**
   - Currently simulates payment processing
   - No actual payments are being processed
   - Stripe is configured but using mock mode
   - Ready for real integration

### What Works Now

✅ All core functionality is working:
- User management
- Submission workflow
- Quote management
- Document generation
- File storage
- Search and filtering
- Activity logging
- Admin workflows
- Agency workflows

### Next Steps for Production

1. **Integrate Real E-Signature Service**
   - Choose provider (DocuSign, HelloSign, etc.)
   - Update API routes
   - Test integration

2. **Activate Real Payment Processing**
   - Configure Stripe production keys
   - Update PaymentService
   - Test payment flow

3. **Additional Testing**
   - Load testing
   - Security audit
   - Performance optimization

---

## 🐛 Known Limitations

1. **File Storage**: Currently using local file system. For production, consider cloud storage (AWS S3, etc.)

2. **Email Notifications**: Email sending is configured but may need production email service

3. **Rate Limiting**: Not currently implemented (consider adding for production)

---

## 📞 Support & Questions

If you encounter any issues during testing:
1. Check browser console for errors
2. Check network tab for failed requests
3. Review activity logs in the application
4. Contact development team with specific error messages

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Application URL**: https://sterling-insurance.vercel.app



