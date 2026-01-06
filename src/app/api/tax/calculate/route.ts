import { NextRequest, NextResponse } from "next/server";
import { calculatePremiumTax } from "@/lib/data/stateTaxRates";

/**
 * Tax Calculator API
 * GET /api/tax/calculate?state=CA&premium=10000
 * 
 * Returns tax percentage and amount for a given state and premium
 * Uses real state tax rates from our database
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get("state");
    const premium = parseFloat(searchParams.get("premium") || "0");

    if (!state) {
      return NextResponse.json(
        { error: "State is required" },
        { status: 400 }
      );
    }

    if (!premium || premium <= 0) {
      return NextResponse.json(
        { error: "Premium amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Calculate tax using real state tax rates
    const result = calculatePremiumTax(premium, state);
    
    // Debug logging
    console.log(`[Tax Calculator] State received: "${state}", Rate: ${result.taxRate}%, Amount: $${result.taxAmount}`);

    return NextResponse.json({
      state: state.toUpperCase(),
      stateName: result.stateName,
      premium,
      taxRate: result.taxRate,
      taxAmount: result.taxAmount,
      success: true,
    });
  } catch (error: any) {
    console.error("Tax calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate tax", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tax/calculate
 * Alternative endpoint for POST requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, premium } = body;

    if (!state) {
      return NextResponse.json(
        { error: "State is required" },
        { status: 400 }
      );
    }

    const premiumAmount = parseFloat(premium || "0");
    if (!premiumAmount || premiumAmount <= 0) {
      return NextResponse.json(
        { error: "Premium amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Calculate tax using real state tax rates
    const result = calculatePremiumTax(premiumAmount, state);

    return NextResponse.json({
      state: state.toUpperCase(),
      stateName: result.stateName,
      premium: premiumAmount,
      taxRate: result.taxRate,
      taxAmount: result.taxAmount,
      success: true,
    });
  } catch (error: any) {
    console.error("Tax calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate tax", details: error.message },
      { status: 500 }
    );
  }
}

