# ISC Form Layout Pattern

## Key Differences:

### ISC Layout:
```
┌────────────────────────────────────────┐
│ Label (Left)          [Field] (Right) │
└────────────────────────────────────────┘
```

### Our Old Layout:
```
┌───────────────────┐
│ Label (Top)       │
│ [Field] (Below)   │
└───────────────────┘
```

## Grid Structure:

```css
grid-cols-[200px_1fr]  /* Label: 200px fixed, Field: remaining space */
gap-x-6                /* 24px horizontal gap between label and field */
items-center           /* Vertically center label with field */
```

## For ALL Fields Apply:

```tsx
<div className="grid grid-cols-[200px_1fr] gap-x-6 items-center">
  <label className="text-sm font-medium text-gray-900">Label Text</label>
  <input
    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
    ...
  />
</div>
```

## Apply to sections:
- ✅ Lead Source
- ✅ Company Name  
- ✅ Zip/State
- ✅ Estimated Gross Receipts
- ✅ Estimated Subcontracting Costs
- ✅ Estimated Material Costs
- ⏳ # of Active Owners
- ⏳ # of Field Employees
- ⏳ Total Payroll
- ⏳ Years in Business
- ⏳ Years of Experience
- ⏳ ALL remaining fields in ALL sections










