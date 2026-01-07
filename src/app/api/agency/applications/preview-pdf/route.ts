import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Agency from "@/models/Agency";
import { generateApplicationHTML } from "@/lib/services/pdf/ApplicationPDF";

/**
 * POST /api/agency/applications/preview-pdf
 * Generate PDF from form data (preview/download before submission)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { programId, programName, formData } = await req.json();

    if (!formData) {
      return NextResponse.json(
        { error: "Missing form data" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get agency details
    const agency = await Agency.findById(user.agencyId);

    // Prepare application data
    const applicationData = {
      ...formData,
      submittedDate: new Date().toLocaleDateString(),
      agencyName: agency?.name || "Unknown Agency",
      programName: programName || "Advantage Contractor GL",
    };

    // Generate HTML
    const htmlContent = generateApplicationHTML(applicationData);

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

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="application-preview-${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF preview generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}








