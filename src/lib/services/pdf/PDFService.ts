import { ProposalPDF } from "./ProposalPDF";
import { FinanceAgreementPDF } from "./FinanceAgreementPDF";
import { CarrierFormsPDF } from "./CarrierFormsPDF";
import Submission from "@/models/Submission";
import Quote from "@/models/Quote";
import FinancePlan from "@/models/FinancePlan";

export type DocumentType = "PROPOSAL" | "FINANCE_AGREEMENT" | "CARRIER_FORM";

interface IGenerateDocumentParams {
  quoteId: string;
  documentType: DocumentType;
}

interface IGenerateDocumentResult {
  success: boolean;
  documentUrl: string;
  documentName: string;
  error?: string;
}

export class PDFService {
  /**
   * Generate a document for a quote
   */
  static async generateDocument(
    params: IGenerateDocumentParams
  ): Promise<IGenerateDocumentResult> {
    try {
      console.log("📋 [PDF SERVICE] PDF GENERATION STARTED");
      console.log(`📋 [PDF SERVICE] Document Type: ${params.documentType}`);
      console.log(`📋 [PDF SERVICE] Quote ID: ${params.quoteId}`);

      // Get quote with all related data
      const quote = await Quote.findById(params.quoteId)
        .populate("submissionId")
        .populate("carrierId")
        .lean();

      if (!quote) {
        console.error("📋 [PDF SERVICE] ❌ Quote not found");
        return {
          success: false,
          documentUrl: "",
          documentName: "",
          error: "Quote not found",
        };
      }

      console.log("📋 [PDF SERVICE] ✅ Quote found");

      const submission = quote.submissionId as any;
      const carrier = quote.carrierId as any;

      console.log(`📋 [PDF SERVICE] Submission ID: ${submission._id}`);
      console.log(`📋 [PDF SERVICE] Carrier ID: ${carrier?._id || "N/A"}`);

      // Get agency data
      await import("@/models/Agency");
      const Agency = (await import("@/models/Agency")).default;
      const agency = await Agency.findById(submission.agencyId).lean();

      if (!agency) {
        console.error("📋 [PDF SERVICE] ❌ Agency not found");
        return {
          success: false,
          documentUrl: "",
          documentName: "",
          error: "Agency not found",
        };
      }

      console.log(`📋 [PDF SERVICE] ✅ Agency found: ${agency.name}`);

      let result: { url: string; buffer: Buffer };
      let documentType: DocumentType;
      let documentName: string;

      // Generate appropriate document
      console.log(`📋 [PDF SERVICE] Generating ${params.documentType} PDF...`);
      switch (params.documentType) {
        case "PROPOSAL":
          console.log("📋 [PDF SERVICE] Calling ProposalPDF.generate()...");
          result = await ProposalPDF.generate(
            submission,
            quote.toObject ? quote.toObject() : quote,
            agency,
            carrier
          );
          documentType = "PROPOSAL";
          documentName = `Proposal_${submission._id}.pdf`;
          console.log("📋 [PDF SERVICE] ✅ Proposal PDF generated");
          console.log(`📋 [PDF SERVICE] Result URL: ${result.url}`);
          console.log(`📋 [PDF SERVICE] Buffer size: ${result.buffer.length} bytes`);
          break;

        case "FINANCE_AGREEMENT":
          // Check if finance plan exists
          const financePlan = await FinancePlan.findOne({
            quoteId: params.quoteId,
          }).lean();

          if (!financePlan) {
            return {
              success: false,
              documentUrl: "",
              documentName: "",
              error: "Finance plan not found. Please set up financing first.",
            };
          }

          result = await FinanceAgreementPDF.generate(
            submission,
            quote.toObject ? quote.toObject() : quote,
            financePlan.toObject ? financePlan.toObject() : financePlan
          );
          documentType = "FINANCE_AGREEMENT";
          documentName = `Finance_Agreement_${submission._id}.pdf`;
          break;

        case "CARRIER_FORM":
          console.log("📋 [PDF SERVICE] Calling CarrierFormsPDF.generate()...");
          result = await CarrierFormsPDF.generate(submission, carrier);
          documentType = "CARRIER_FORM";
          documentName = `Carrier_Forms_${submission._id}.pdf`;
          console.log("📋 [PDF SERVICE] ✅ Carrier Forms PDF generated");
          console.log(`📋 [PDF SERVICE] Result URL: ${result.url}`);
          console.log(`📋 [PDF SERVICE] Buffer size: ${result.buffer.length} bytes`);
          break;

        default:
          return {
            success: false,
            documentUrl: "",
            documentName: "",
            error: "Invalid document type",
          };
      }

      // Update submission with document info
      console.log("📋 [PDF SERVICE] Updating submission with document metadata...");
      const submissionDoc = await Submission.findById(submission._id);
      if (!submissionDoc) {
        console.error("📋 [PDF SERVICE] ❌ Submission document not found");
        return {
          success: false,
          documentUrl: "",
          documentName: "",
          error: "Submission not found",
        };
      }

      console.log(`📋 [PDF SERVICE] Submission found: ${submissionDoc._id}`);
      console.log(`📋 [PDF SERVICE] Current signedDocuments count: ${submissionDoc.signedDocuments?.length || 0}`);

      // Initialize signedDocuments array if it doesn't exist
      if (!submissionDoc.signedDocuments) {
        console.log("📋 [PDF SERVICE] Initializing signedDocuments array...");
        submissionDoc.signedDocuments = [];
      }

      // Create document metadata
      const documentMetadata = {
        documentType,
        documentName,
        documentUrl: result.url,
        generatedAt: new Date(),
        signatureStatus: "GENERATED" as const,
      };

      console.log("📋 [PDF SERVICE] Document metadata:", {
        documentType: documentMetadata.documentType,
        documentName: documentMetadata.documentName,
        documentUrl: documentMetadata.documentUrl,
        signatureStatus: documentMetadata.signatureStatus,
      });

      // Add document to signedDocuments array
      submissionDoc.signedDocuments.push(documentMetadata);

      console.log(`📋 [PDF SERVICE] Saving submission with ${submissionDoc.signedDocuments.length} documents...`);
      await submissionDoc.save();

      // Verify the save
      const verifySubmission = await Submission.findById(submission._id).select("signedDocuments").lean();
      console.log(`📋 [PDF SERVICE] ✅ Submission saved`);
      console.log(`📋 [PDF SERVICE] SIGNED DOCUMENTS COUNT: ${verifySubmission?.signedDocuments?.length || 0}`);
      if (verifySubmission?.signedDocuments) {
        verifySubmission.signedDocuments.forEach((doc: any, idx: number) => {
          console.log(`📋 [PDF SERVICE]   Document ${idx + 1}: ${doc.documentType} - ${doc.documentName} - ${doc.signatureStatus}`);
        });
      }

      console.log(`📋 [PDF SERVICE] ✅ Document generated successfully: ${documentType} for quote ${params.quoteId}`);
      console.log(`📋 [PDF SERVICE] FINAL DOCUMENT URL: ${result.url}`);

      return {
        success: true,
        documentUrl: result.url,
        documentName,
      };
    } catch (error: any) {
      console.error("📋 [PDF SERVICE] ❌ PDF generation error:", error);
      console.error("📋 [PDF SERVICE] Error stack:", error.stack);
      return {
        success: false,
        documentUrl: "",
        documentName: "",
        error: error.message || "Failed to generate document",
      };
    }
  }

  /**
   * Get all documents for a quote
   */
  static async getDocuments(quoteId: string) {
    try {
      const quote = await Quote.findById(quoteId)
        .populate("submissionId")
        .lean();

      if (!quote) {
        return [];
      }

      const submission = quote.submissionId as any;
      return submission.signedDocuments || [];
    } catch (error: any) {
      console.error("Get documents error:", error);
      return [];
    }
  }
}

export default PDFService;

