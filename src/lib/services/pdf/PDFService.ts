/**
 * Production-ready PDF generation service
 * Uses external service for HTML-to-PDF conversion
 */

import connectDB from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Submission from "@/models/Submission";
import Agency from "@/models/Agency";
import FinancePlan from "@/models/FinancePlan";
import { generateProposalHTML } from "./ProposalPDFHTML";
import { generateCarrierFormsHTML } from "./CarrierFormsPDFHTML";
import { savePDFToStorage } from "./storage";

interface PDFGenerationOptions {
  html: string;
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
}

interface GenerateDocumentOptions {
  quoteId: string;
  documentType: 'PROPOSAL' | 'FINANCE_AGREEMENT' | 'CARRIER_FORM';
}

interface GenerateDocumentResult {
  success: boolean;
  documentUrl?: string;
  documentName?: string;
  error?: string;
}

/**
 * Minify HTML to reduce size for PDFShift
 */
function minifyHTML(html: string): string {
  return html
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove whitespace between tags
    .replace(/>\s+</g, '><')
    // Remove leading/trailing whitespace
    .trim();
}

/**
 * Optimize CSS by removing unnecessary whitespace and comments
 */
function optimizeCSS(css: string): string {
  return css
    // Remove CSS comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove whitespace around colons, semicolons, braces
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    // Remove trailing semicolons before closing braces
    .replace(/;}/g, '}')
    .trim();
}

/**
 * Generate PDF using PDFShift (Primary - Cost-effective)
 * Fallback: Browserless.io or local Puppeteer for development
 */
export async function generatePDFFromHTML(options: PDFGenerationOptions): Promise<Buffer> {
  const { html, format = 'A4', margin, printBackground = true } = options;
  
  // Store original HTML for Puppeteer fallback (Puppeteer works better with unminified HTML)
  const originalHTML = html;

  // Option 1: PDFShift (Primary - Cost-effective)
  // Get API key from: https://pdfshift.io/
  const PDFSHIFT_API_KEY = process.env.PDFSHIFT_API_KEY;
  if (PDFSHIFT_API_KEY) {
    // Declare minifiedHTML outside try block so it's accessible in catch
    let minifiedHTML: string = html;
    
    try {
      console.log('[PDF Service] Using PDFShift for PDF generation');
      
      // Minify HTML to reduce size (important for PDFShift 2MB limit)
      try {
        minifiedHTML = minifyHTML(html);
      } catch (minifyError: any) {
        console.error('[PDF Service] Error minifying HTML, using original:', minifyError.message);
        minifiedHTML = html;
      }
      
      const htmlSizeKB = Buffer.byteLength(minifiedHTML, 'utf8') / 1024;
      console.log(`[PDF Service] HTML size: ${htmlSizeKB.toFixed(2)} KB`);
      
      if (htmlSizeKB > 2000) {
        console.warn(`[PDF Service] Warning: HTML size (${htmlSizeKB.toFixed(2)} KB) exceeds PDFShift free tier limit (2MB). Consider optimizing.`);
      }
      
      if (!minifiedHTML || minifiedHTML.length === 0) {
        throw new Error('Generated HTML is empty');
      }
      
      // Convert margin object to string format for PDFShift
      const marginValue = margin 
        ? typeof margin === 'string' 
          ? margin 
          : `${margin.top || '20px'} ${margin.right || '20px'} ${margin.bottom || '20px'} ${margin.left || '20px'}`
        : '20px';
      
      // PDFShift uses X-API-Key header for authentication
      const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': PDFSHIFT_API_KEY,
        },
        body: JSON.stringify({
          source: minifiedHTML,
          format: format.toLowerCase(),
          margin: marginValue,
          // Note: PDFShift doesn't support print_background parameter
          // Backgrounds are printed by default in PDFShift
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // If not JSON, use the text as-is
          errorData = { error: errorText };
        }
        console.error('[PDF Service] PDFShift API error:', response.status, errorText);
        console.error('[PDF Service] PDFShift error data:', errorData);
        
        // Create a more detailed error message
        const errorMessage = errorData.error || errorData.message || errorText || 'Unknown error';
        const error = new Error(`PDFShift API error (${response.status}): ${errorMessage}`);
        (error as any).status = response.status;
        (error as any).code = errorData.code;
        throw error;
      }

      const pdfBuffer = Buffer.from(await response.arrayBuffer());
      console.log('[PDF Service] PDFShift success - PDF generated:', pdfBuffer.length, 'bytes');
      return pdfBuffer;
    } catch (error: any) {
      console.error('[PDF Service] PDFShift failed:', error.message);
      console.error('[PDF Service] PDFShift error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
      });
      
      // Log HTML size for debugging (minifiedHTML is now accessible)
      const htmlSizeKB = Buffer.byteLength(minifiedHTML, 'utf8') / 1024;
      console.error(`[PDF Service] HTML size was: ${htmlSizeKB.toFixed(2)} KB`);
      
      // Check if it's a size limit error - be more specific to avoid false positives
      const isSizeError = (error.message.includes('Document size too big') || 
                          error.message.includes('too big') && error.message.includes('2Mb')) &&
                          htmlSizeKB > 1500; // Only consider it a size error if HTML is actually large
      
      // In production, if it's a size error, provide helpful message
      if (isSizeError) {
        console.error('[PDF Service] PDFShift size limit exceeded. HTML size:', htmlSizeKB.toFixed(2), 'KB');
        throw new Error(`PDF size too large (${htmlSizeKB.toFixed(2)} KB). The document exceeds PDFShift's 2MB limit. Please optimize the content or upgrade your PDFShift plan.`);
      }
      
      // For other errors in production, provide clear error message with actual error details
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        // Log the full error for debugging
        console.error('[PDF Service] Full PDFShift error:', JSON.stringify(error, null, 2));
        throw new Error(`PDFShift failed: ${error.message}. HTML size: ${htmlSizeKB.toFixed(2)} KB. Please check your PDFSHIFT_API_KEY and ensure it's configured correctly in Vercel environment variables.`);
      }
      
      // In development, fall through to Puppeteer/Browserless
      console.warn('[PDF Service] Falling back to alternative PDF generation method...');
      throw error; // Will be caught by fallback handlers below
    }
  }

  // Option 2: Browserless.io (Fallback)
  // Get API key from: https://www.browserless.io/
  const BROWSERLESS_API_KEY = process.env.BROWSERLESS_API_KEY;
  const BROWSERLESS_URL = process.env.BROWSERLESS_URL || 'https://chrome.browserless.io/pdf';

  if (BROWSERLESS_API_KEY) {
    try {
      const response = await fetch(BROWSERLESS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BROWSERLESS_API_KEY}`,
        },
        body: JSON.stringify({
          html,
          options: {
            format,
            margin: margin || { top: '20px', right: '20px', bottom: '20px', left: '20px' },
            printBackground,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Browserless API error: ${response.statusText}`);
      }

      const pdfBuffer = Buffer.from(await response.arrayBuffer());
      return pdfBuffer;
    } catch (error: any) {
      console.error('[PDF Service] Browserless failed:', error.message);
      throw error;
    }
  }

  // Fallback: Try local Puppeteer (ONLY in local development, NEVER in production/serverless)
  const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
  const isLocalDev = !isProduction && process.env.NODE_ENV === 'development';
  
  if (isLocalDev) {
    try {
      console.log('[PDF Service] Attempting local Puppeteer fallback (development only)');
      const { getPuppeteerBrowser } = await import('@/lib/utils/puppeteer');
      const browser = await getPuppeteerBrowser();
      const page = await browser.newPage();
      await page.setContent(originalHTML, { waitUntil: 'networkidle0' });
      const pdfUint8Array = await page.pdf({
        format,
        printBackground,
        margin: margin || {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });
      await browser.close();
      return Buffer.from(pdfUint8Array);
    } catch (error: any) {
      console.error('[PDF Service] Local Puppeteer failed:', error.message);
      throw new Error(`Local Puppeteer failed: ${error.message}. Please configure PDFSHIFT_API_KEY for production.`);
    }
  }

  // If we reach here, no PDF service is configured or all services failed
  // (isProduction is already defined above)
  
  if (isProduction) {
    console.error('[PDF Service] All PDF generation methods failed in production');
    console.error('[PDF Service] PDFShift API Key configured:', !!process.env.PDFSHIFT_API_KEY);
    console.error('[PDF Service] Browserless API Key configured:', !!process.env.BROWSERLESS_API_KEY);
    
    throw new Error(
      'PDF generation failed in production. PDFShift encountered an error. Please check: 1) PDFSHIFT_API_KEY is set in Vercel environment variables, 2) The API key is valid, 3) Your PDFShift account has sufficient credits. Alternatively, configure BROWSERLESS_API_KEY as a fallback.'
    );
  }

  throw new Error(
    'PDF generation failed. Please configure PDFSHIFT_API_KEY (or BROWSERLESS_API_KEY) in environment variables.'
  );
}

/**
 * Check if PDF service is configured
 */
export function isPDFServiceConfigured(): boolean {
  return !!(process.env.BROWSERLESS_API_KEY || process.env.PDFSHIFT_API_KEY);
}

/**
 * PDFService - High-level service for generating documents
 */
export const PDFService = {
  /**
   * Generate a document (Proposal, Finance Agreement, or Carrier Forms)
   * Fetches all necessary data and generates the PDF
   */
  async generateDocument(options: GenerateDocumentOptions): Promise<GenerateDocumentResult> {
    const { quoteId, documentType } = options;

    try {
      await connectDB();

      // Ensure models are registered
      await import("@/models/Carrier");
      await import("@/models/Agency");

      // Fetch quote with populated data
      const quote = await Quote.findById(quoteId)
        .populate("submissionId")
        .populate("carrierId", "name email")
        .lean();

      if (!quote) {
        return {
          success: false,
          error: "Quote not found",
        };
      }

      const submission = quote.submissionId as any;
      if (!submission) {
        return {
          success: false,
          error: "Submission not found",
        };
      }

      // Get agency
      const agency = await Agency.findById(submission.agencyId).lean();
      if (!agency) {
        return {
          success: false,
          error: "Agency not found",
        };
      }

      const formData = submission.payload || {};
      const carrier = quote.carrierId as any;

      let htmlContent: string;
      let documentName: string;

      // Generate HTML based on document type
      switch (documentType) {
        case "PROPOSAL": {
          const proposalData = {
            quoteNumber: quote._id.toString().substring(0, 8).toUpperCase(),
            proposalDate: new Date().toLocaleDateString(),
            companyName: formData.companyName || submission.clientContact?.name || "Unknown",
            dba: formData.dba,
            firstName: formData.firstName || "",
            lastName: formData.lastName || "",
            entityType: formData.entityType || "",
            companyFEIN: formData.companyFEIN || submission.clientContact?.EIN || "",
            phone: formData.phone || submission.clientContact?.phone || "",
            email: formData.email || submission.clientContact?.email || "",
            streetAddress: formData.streetAddress || submission.clientContact?.businessAddress?.street || "",
            city: formData.city || submission.clientContact?.businessAddress?.city || "",
            state: formData.state || submission.clientContact?.businessAddress?.state || "",
            zipCode: formData.zipCode || submission.clientContact?.businessAddress?.zip || "",
            agencyName: agency.name,
            agencyEmail: agency.email,
            agencyPhone: agency.phone,
            carrierName: carrier.name,
            carrierReference: quote.carrierReference,
            programName: submission.programName || "Advantage Contractor GL",
            effectiveDate: quote.effectiveDate ? new Date(quote.effectiveDate).toLocaleDateString() : new Date().toLocaleDateString(),
            expirationDate: quote.expirationDate ? new Date(quote.expirationDate).toLocaleDateString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            carrierQuoteUSD: quote.carrierQuoteUSD,
            premiumTaxPercent: quote.premiumTaxPercent,
            premiumTaxAmountUSD: quote.premiumTaxAmountUSD || 0,
            policyFeeUSD: quote.policyFeeUSD || 0,
            brokerFeeAmountUSD: quote.brokerFeeAmountUSD || 0,
            finalAmountUSD: quote.finalAmountUSD,
            limits: quote.limits,
            endorsements: quote.endorsements || [],
            specialNotes: quote.specialNotes,
          };
          htmlContent = generateProposalHTML(proposalData);
          documentName = `proposal-${quote._id.toString()}.pdf`;
          break;
        }

        case "FINANCE_AGREEMENT": {
          const financePlan = await FinancePlan.findOne({ quoteId: quote._id }).lean();
          if (!financePlan) {
            return {
              success: false,
              error: "Finance plan not found",
            };
          }

          // For now, use the React PDF version (FinanceAgreementPDF.tsx)
          // TODO: Create HTML version for Finance Agreement
          return {
            success: false,
            error: "Finance Agreement HTML generation not yet implemented. Please use the React PDF version.",
          };
        }

        case "CARRIER_FORM": {
          const carrierFormsData = {
            submissionId: submission._id.toString(),
            formDate: new Date().toLocaleDateString(),
            companyName: formData.companyName || submission.clientContact?.name || "Unknown",
            dba: formData.dba,
            firstName: formData.firstName || "",
            lastName: formData.lastName || "",
            entityType: formData.entityType || "",
            companyFEIN: formData.companyFEIN || submission.clientContact?.EIN || "",
            phone: formData.phone || submission.clientContact?.phone || "",
            email: formData.email || submission.clientContact?.email || "",
            streetAddress: formData.streetAddress || submission.clientContact?.businessAddress?.street || "",
            city: formData.city || submission.clientContact?.businessAddress?.city || "",
            state: formData.state || submission.clientContact?.businessAddress?.state || "",
            zipCode: formData.zipCode || submission.clientContact?.businessAddress?.zip || "",
            carrierName: carrier.name,
            carrierReference: quote.carrierReference,
            programName: submission.programName || "Advantage Contractor GL",
            applicationData: formData,
          };
          htmlContent = generateCarrierFormsHTML(carrierFormsData);
          documentName = `carrier-forms-${quote._id.toString()}.pdf`;
          break;
        }

        default:
          return {
            success: false,
            error: `Unknown document type: ${documentType}`,
          };
      }

      // Generate PDF from HTML
      const pdfBuffer = await generatePDFFromHTML({
        html: htmlContent,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      // Save PDF to storage
      const documentUrl = await savePDFToStorage(pdfBuffer, documentName);

      return {
        success: true,
        documentUrl,
        documentName,
      };
    } catch (error: any) {
      console.error("[PDFService] generateDocument error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate document",
      };
    }
  },
};
