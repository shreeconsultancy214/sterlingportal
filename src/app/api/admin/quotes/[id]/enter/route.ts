import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Submission from "@/models/Submission";
import Carrier from "@/models/Carrier";
import Agency from "@/models/Agency";
import { generateBinderHTML } from "@/lib/services/pdf/BinderPDF";
import { savePDFToStorage } from "@/lib/services/pdf/storage";
import { logActivity, createActivityLogData } from "@/utils/activityLogger";

/**
 * POST /api/admin/quotes/[id]/enter
 * Admin enters a quote for a submission (from carrier's external response)
 * [id] represents the submissionId
 * Body: { carrierId, carrierQuoteUSD, basePremium?, fees?, taxes?, effectiveDate?, expirationDate?, carrierReference? }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only system_admin can access admin APIs
    const userRole = (session.user as any).role;
    if (userRole !== "system_admin") {
      return NextResponse.json(
        { error: "Forbidden - System admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const submissionId = params.id; // In this endpoint, [id] represents submissionId
    const body = await req.json();
    const { 
      carrierId, 
      carrierQuoteUSD,
      premiumTaxPercent,
      premiumTaxAmountUSD,
      policyFeeUSD,
      brokerFeeAmountUSD,
      limits,
      endorsements,
      effectiveDate,
      expirationDate,
      policyNumber,
      carrierReference,
      specialNotes
    } = body;

    // Validate input
    if (!carrierId || !carrierQuoteUSD) {
      return NextResponse.json(
        { error: "Missing required fields: carrierId, carrierQuoteUSD" },
        { status: 400 }
      );
    }

    if (carrierQuoteUSD <= 0) {
      return NextResponse.json(
        { error: "carrierQuoteUSD must be greater than 0" },
        { status: 400 }
      );
    }

    // Get submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Get carrier
    const carrier = await Carrier.findById(carrierId);
    if (!carrier) {
      return NextResponse.json(
        { error: "Carrier not found" },
        { status: 404 }
      );
    }

    // Check if quote already exists for this submission and carrier
    const existingQuote = await Quote.findOne({
      submissionId,
      carrierId,
    });

    if (existingQuote) {
      return NextResponse.json(
        { error: "Quote already exists for this submission and carrier" },
        { status: 400 }
      );
    }

    // Calculate final amount (no wholesale fee - removed per user request)
    const brokerFee = parseFloat(brokerFeeAmountUSD) || 0;
    const taxAmount = parseFloat(premiumTaxAmountUSD) || 0;
    const policyFee = parseFloat(policyFeeUSD) || 0;
    const finalAmountUSD = carrierQuoteUSD + brokerFee + taxAmount + policyFee;

    // Create quote (admin enters carrier quote)
    const quote = await Quote.create({
      submissionId,
      carrierId,
      carrierQuoteUSD,
      // No wholesale fee - removed per user request
      brokerFeeAmountUSD: brokerFee,
      premiumTaxPercent: premiumTaxPercent ? parseFloat(premiumTaxPercent) : undefined,
      premiumTaxAmountUSD: taxAmount > 0 ? taxAmount : undefined,
      policyFeeUSD: policyFee > 0 ? policyFee : undefined,
      finalAmountUSD,
      limits: limits || undefined,
      endorsements: endorsements || [],
      effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      policyNumber: policyNumber || undefined,
      carrierReference: carrierReference || undefined,
      specialNotes: specialNotes || undefined,
        status: "POSTED", // Posted to broker
        enteredByAdminId: (session.user as any).id,
        enteredAt: new Date(),
        postedAt: new Date(),
    });

    // Update submission status to QUOTED
    await Submission.findByIdAndUpdate(submissionId, {
      status: "QUOTED",
    });

    // Log activity: Quote created
    await logActivity(
      createActivityLogData(
        "QUOTE_CREATED",
        `Quote created and posted by admin for ${submission.clientContact?.name || "client"}`,
        {
          submissionId: submissionId,
          quoteId: quote._id.toString(),
          user: {
            id: (session.user as any).id,
            name: (session.user as any).name || (session.user as any).email,
            email: (session.user as any).email,
            role: (session.user as any).role || "system_admin",
          },
          details: {
            carrierName: carrier.name,
            carrierQuoteUSD: carrierQuoteUSD,
            finalAmountUSD: finalAmountUSD,
            status: "POSTED",
          },
        }
      )
    );

    // Get agency for binder and email
    const agency = await Agency.findById(submission.agencyId);
    const formData = submission.payload || {};

    // Generate Binder PDF
    let binderPdfUrl = "";
    try {
      console.log("📄 Generating Binder PDF...");
      const binderData = {
        quoteNumber: quote._id.toString().substring(0, 8).toUpperCase(),
        binderDate: new Date().toLocaleDateString(),
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
        agencyName: agency?.name || "Unknown Agency",
        agencyEmail: agency?.email,
        carrierName: carrier.name,
        carrierReference: carrierReference || undefined,
        policyNumber: policyNumber || undefined,
        effectiveDate: effectiveDate ? new Date(effectiveDate).toLocaleDateString() : new Date().toLocaleDateString(),
        expirationDate: expirationDate ? new Date(expirationDate).toLocaleDateString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        programName: (submission as any).programName || "Advantage Contractor GL",
        carrierQuoteUSD,
        // No wholesale fee - removed per user request
        premiumTaxPercent: premiumTaxPercent ? parseFloat(premiumTaxPercent) : undefined,
        premiumTaxAmountUSD: taxAmount > 0 ? taxAmount : undefined,
        policyFeeUSD: policyFee > 0 ? policyFee : undefined,
        brokerFeeAmountUSD: brokerFee > 0 ? brokerFee : undefined,
        finalAmountUSD,
        limits: limits || undefined,
        endorsements: endorsements || undefined,
        specialNotes: specialNotes || undefined,
      };

      const htmlContent = generateBinderHTML(binderData);

      // Generate PDF using production service (PDFShift)
      const { generatePDFFromHTML } = await import('@/lib/services/pdf/PDFService');
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
      const fileName = `binder-${quote._id.toString()}.pdf`;
      binderPdfUrl = await savePDFToStorage(pdfBuffer, fileName);

      // Update quote with binder URL
      await Quote.findByIdAndUpdate(quote._id, {
        binderPdfUrl,
      });

      // Log activity: Document generated
      await logActivity(
        createActivityLogData(
          "DOCUMENT_GENERATED",
          `Binder PDF generated for quote`,
          {
            submissionId: submissionId,
            quoteId: quote._id.toString(),
            user: {
              id: (session.user as any).id,
              name: (session.user as any).name || (session.user as any).email,
              email: (session.user as any).email,
              role: (session.user as any).role || "system_admin",
            },
            details: {
              documentType: "BINDER",
              documentUrl: binderPdfUrl,
            },
          }
        )
      );

      console.log(`✅ Binder PDF generated: ${binderPdfUrl}`);
    } catch (pdfError: any) {
      console.error("❌ Binder PDF generation error:", pdfError);
      // Continue even if PDF fails - we can regenerate later
    }

    // Send email to broker
    try {
      const { sendQuoteToBroker } = await import("@/lib/services/email/EmailService");
      
      await sendQuoteToBroker({
        brokerEmail: agency?.email || submission.clientContact?.email || "",
        brokerName: agency?.name || "Broker",
        companyName: formData.companyName || submission.clientContact?.name || "Unknown Company",
        quoteNumber: quote._id.toString().substring(0, 8).toUpperCase(),
        finalAmount: finalAmountUSD,
        effectiveDate: effectiveDate ? new Date(effectiveDate).toLocaleDateString() : new Date().toLocaleDateString(),
        expirationDate: expirationDate ? new Date(expirationDate).toLocaleDateString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        carrierName: carrier.name,
        programName: (submission as any).programName || "Advantage Contractor GL",
        pdfBuffer: undefined, // We'll include the URL instead
        binderPdfUrl,
      });

      console.log(`✅ Quote email sent to broker: ${agency?.email}`);
    } catch (emailError: any) {
      console.error("❌ Email send error:", emailError);
      // Continue even if email fails - admin can manually send
    }

    // Populate for response
    const populatedQuote = await Quote.findById(quote._id)
      .populate("carrierId", "name email")
      .populate("submissionId", "clientContact")
      .lean();

    // Update with binder URL in response
    (populatedQuote as any).binderPdfUrl = binderPdfUrl;

    console.log(`✅ Quote entered by admin for submission ${submissionId}`);

    return NextResponse.json({
      success: true,
      quote: populatedQuote,
    });
  } catch (error: any) {
    console.error("Quote entry error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enter quote" },
      { status: 500 }
    );
  }
}



