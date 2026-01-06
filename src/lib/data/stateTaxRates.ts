/**
 * Insurance Premium Tax Rates by State
 * 
 * These are general insurance premium tax rates for property and casualty insurance.
 * Rates may vary by insurance type and can change annually.
 * 
 * Source: Research based on state insurance department regulations
 * Last Updated: 2024
 * 
 * Note: These are standard rates. Some states have different rates for:
 * - Different insurance types (life, health, P&C)
 * - Different premium amounts
 * - Surplus lines vs admitted carriers
 * 
 * For production use, verify rates with state insurance departments.
 */

export interface StateTaxRate {
  state: string;
  stateName: string;
  taxRate: number; // Percentage (e.g., 2.35 = 2.35%)
  notes?: string;
}

export const STATE_TAX_RATES: Record<string, StateTaxRate> = {
  // Alabama
  AL: { state: "AL", stateName: "Alabama", taxRate: 2.25 },
  
  // Alaska
  AK: { state: "AK", stateName: "Alaska", taxRate: 2.70 },
  
  // Arizona
  AZ: { state: "AZ", stateName: "Arizona", taxRate: 2.00 },
  
  // Arkansas
  AR: { state: "AR", stateName: "Arkansas", taxRate: 2.50 },
  
  // California
  CA: { state: "CA", stateName: "California", taxRate: 2.35 },
  
  // Colorado
  CO: { state: "CO", stateName: "Colorado", taxRate: 2.00 },
  
  // Connecticut
  CT: { state: "CT", stateName: "Connecticut", taxRate: 1.75 },
  
  // Delaware
  DE: { state: "DE", stateName: "Delaware", taxRate: 2.00 },
  
  // Florida
  FL: { state: "FL", stateName: "Florida", taxRate: 1.75 },
  
  // Georgia
  GA: { state: "GA", stateName: "Georgia", taxRate: 2.25 },
  
  // Hawaii
  HI: { state: "HI", stateName: "Hawaii", taxRate: 4.265, notes: "Higher rate includes additional fees" },
  
  // Idaho
  ID: { state: "ID", stateName: "Idaho", taxRate: 2.25 },
  
  // Illinois
  IL: { state: "IL", stateName: "Illinois", taxRate: 0.50, notes: "Low rate for P&C insurance" },
  
  // Indiana
  IN: { state: "IN", stateName: "Indiana", taxRate: 1.30 },
  
  // Iowa
  IA: { state: "IA", stateName: "Iowa", taxRate: 1.00 },
  
  // Kansas
  KS: { state: "KS", stateName: "Kansas", taxRate: 2.00 },
  
  // Kentucky
  KY: { state: "KY", stateName: "Kentucky", taxRate: 2.00 },
  
  // Louisiana
  LA: { state: "LA", stateName: "Louisiana", taxRate: 2.50 },
  
  // Maine
  ME: { state: "ME", stateName: "Maine", taxRate: 2.00 },
  
  // Maryland
  MD: { state: "MD", stateName: "Maryland", taxRate: 2.00 },
  
  // Massachusetts
  MA: { state: "MA", stateName: "Massachusetts", taxRate: 2.00 },
  
  // Michigan
  MI: { state: "MI", stateName: "Michigan", taxRate: 1.25 },
  
  // Minnesota
  MN: { state: "MN", stateName: "Minnesota", taxRate: 2.00 },
  
  // Mississippi
  MS: { state: "MS", stateName: "Mississippi", taxRate: 2.00 },
  
  // Missouri
  MO: { state: "MO", stateName: "Missouri", taxRate: 2.00 },
  
  // Montana
  MT: { state: "MT", stateName: "Montana", taxRate: 2.00 },
  
  // Nebraska
  NE: { state: "NE", stateName: "Nebraska", taxRate: 1.00 },
  
  // Nevada
  NV: { state: "NV", stateName: "Nevada", taxRate: 3.50, notes: "Higher rate state" },
  
  // New Hampshire
  NH: { state: "NH", stateName: "New Hampshire", taxRate: 2.00 },
  
  // New Jersey
  NJ: { state: "NJ", stateName: "New Jersey", taxRate: 2.00 },
  
  // New Mexico
  NM: { state: "NM", stateName: "New Mexico", taxRate: 3.00 },
  
  // New York
  NY: { state: "NY", stateName: "New York", taxRate: 2.00 },
  
  // North Carolina
  NC: { state: "NC", stateName: "North Carolina", taxRate: 1.90 },
  
  // North Dakota
  ND: { state: "ND", stateName: "North Dakota", taxRate: 1.75 },
  
  // Ohio
  OH: { state: "OH", stateName: "Ohio", taxRate: 1.00 },
  
  // Oklahoma
  OK: { state: "OK", stateName: "Oklahoma", taxRate: 3.00 },
  
  // Oregon
  OR: { state: "OR", stateName: "Oregon", taxRate: 2.00 },
  
  // Pennsylvania
  PA: { state: "PA", stateName: "Pennsylvania", taxRate: 2.00 },
  
  // Rhode Island
  RI: { state: "RI", stateName: "Rhode Island", taxRate: 2.00 },
  
  // South Carolina
  SC: { state: "SC", stateName: "South Carolina", taxRate: 2.25 },
  
  // South Dakota
  SD: { state: "SD", stateName: "South Dakota", taxRate: 1.25 },
  
  // Tennessee
  TN: { state: "TN", stateName: "Tennessee", taxRate: 2.25 },
  
  // Texas
  TX: { state: "TX", stateName: "Texas", taxRate: 1.75 },
  
  // Utah
  UT: { state: "UT", stateName: "Utah", taxRate: 2.00 },
  
  // Vermont
  VT: { state: "VT", stateName: "Vermont", taxRate: 2.00 },
  
  // Virginia
  VA: { state: "VA", stateName: "Virginia", taxRate: 2.25 },
  
  // Washington
  WA: { state: "WA", stateName: "Washington", taxRate: 2.00 },
  
  // West Virginia
  WV: { state: "WV", stateName: "West Virginia", taxRate: 2.50 },
  
  // Wisconsin
  WI: { state: "WI", stateName: "Wisconsin", taxRate: 2.00 },
  
  // Wyoming
  WY: { state: "WY", stateName: "Wyoming", taxRate: 1.00 },
  
  // District of Columbia
  DC: { state: "DC", stateName: "District of Columbia", taxRate: 2.00 },
};

/**
 * Get tax rate for a state
 * @param state - Two-letter state code (e.g., "CA", "TX")
 * @returns Tax rate percentage, or default 2.0% if state not found
 */
export function getStateTaxRate(state: string): number {
  const stateCode = state.toUpperCase();
  const stateData = STATE_TAX_RATES[stateCode];
  
  if (stateData) {
    return stateData.taxRate;
  }
  
  // Default to 2.0% if state not found
  console.warn(`Tax rate not found for state: ${state}, using default 2.0%`);
  return 2.0;
}

/**
 * Get full state tax data
 * @param state - Two-letter state code
 * @returns StateTaxRate object or null
 */
export function getStateTaxData(state: string): StateTaxRate | null {
  const stateCode = state.toUpperCase();
  return STATE_TAX_RATES[stateCode] || null;
}

/**
 * Calculate tax amount for a premium
 * @param premium - Premium amount in USD
 * @param state - Two-letter state code
 * @returns Object with taxRate and taxAmount
 */
export function calculatePremiumTax(premium: number, state: string): {
  taxRate: number;
  taxAmount: number;
  stateName: string;
} {
  const taxRate = getStateTaxRate(state);
  const taxAmount = (premium * taxRate) / 100;
  const stateData = getStateTaxData(state);
  
  return {
    taxRate,
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    stateName: stateData?.stateName || state,
  };
}

