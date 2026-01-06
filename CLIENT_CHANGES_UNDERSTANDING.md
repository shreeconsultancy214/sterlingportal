# Client Changes - Understanding & Implementation Plan

## 📋 Changes Requested (5 changes)

### 1. **Tax Calculator API Integration**
**What:** Connect to an API tax calculator that automatically calculates taxes per state
**Current:** Premium tax is manually entered as a percentage
**Change:** 
- Get state from submission/client data
- Call tax calculator API with state and premium amount
- Auto-populate premium tax percentage and amount
- Location: `src/app/admin/submissions/[id]/quote/page.tsx` (Premium Breakdown section)

**Questions:**
- What is the tax calculator API endpoint/URL?
- What parameters does it need? (state, premium amount, etc.)
- What format does it return? (percentage, amount, etc.)

---

### 2. **Coverage Limits Dropdown**
**What:** Make General Liability Limit a dropdown with pre-filled options
**Current:** Text input field for "General Liability Limit"
**Change:**
- Convert to `<select>` dropdown
- Options: "1/1/1", "1/2/1", "1/2/2"
- Location: `src/app/admin/submissions/[id]/quote/page.tsx` (Policy Limits section)

---

### 3. **Excess Limits Tab**
**What:** Add a new field/tab for excess limits (1M-5M) if needed
**Current:** No excess limits field
**Change:**
- Add new field: "Excess Limits" (optional)
- Dropdown with options: 1M, 2M, 3M, 4M, 5M
- Location: `src/app/admin/submissions/[id]/quote/page.tsx` (Policy Limits section)

---

### 4. **Fire Medical & Deductible Dropdowns**
**What:** Convert Fire Legal Limit, Medical Expense Limit, and Deductible to dropdowns (copy options from ISC)
**Current:** Text input fields
**Change:**
- Convert Fire Legal Limit to dropdown
- Convert Medical Expense Limit to dropdown  
- Convert Deductible to dropdown
- Options: Need to check ISC website or get list from client
- Location: `src/app/admin/submissions/[id]/quote/page.tsx` (Policy Limits section)

**Questions:**
- What are the exact dropdown options from ISC for:
  - Fire Legal Limit?
  - Medical Expense Limit?
  - Deductible?

---

### 5. **Effective Date - Duration Tabs**
**What:** When clicking Effective Date, show tabs for "6 months" or "1 year" instead of expiration date field
**Current:** Two separate date pickers (Effective Date and Expiration Date)
**Change:**
- Keep Effective Date as date picker
- When Effective Date is selected, show tabs/buttons: "6 months" or "1 year"
- Auto-calculate Expiration Date based on selection
- Hide/remove separate Expiration Date field
- Location: `src/app/admin/submissions/[id]/quote/page.tsx` (Policy Details section)

---

## 📍 Files to Modify

**Primary File:**
- `src/app/admin/submissions/[id]/quote/page.tsx` - Admin quote entry page

**Potential Additional Files:**
- May need to create API route for tax calculator: `src/app/api/tax/calculate/route.ts`
- May need to check if agency quote form also needs updates: `src/app/agency/quote/[programId]/page.tsx`

---

## ❓ Questions for Client

1. **Tax Calculator API:**
   - What is the API endpoint URL?
   - What authentication/API key is needed?
   - What is the request/response format?

2. **ISC Dropdown Options:**
   - What are the exact options for Fire Legal Limit dropdown?
   - What are the exact options for Medical Expense Limit dropdown?
   - What are the exact options for Deductible dropdown?

3. **State Information:**
   - Where is the state stored? (client address, business address, etc.)
   - Should we use the state from the submission/client data?

---

## ✅ Ready to Start?

Once you confirm:
- I'll implement all 5 changes
- I'll use placeholder/default values for ISC dropdowns if not provided
- I'll create a mock tax calculator API if endpoint not provided (can be replaced later)

**Say "yes" to start implementation!**



