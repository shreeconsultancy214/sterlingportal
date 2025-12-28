import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";
import Agency from "@/models/Agency";
import { generateApplicationHTML } from "@/lib/services/pdf/ApplicationPDF";
import puppeteer from "puppeteer";

/**
 * GET /api/admin/submissions/[id]/pdf
 * Generate and download application PDF (admin only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const userRole = user.role;

    // Only system_admin can access admin APIs
    if (userRole !== "system_admin") {
      return NextResponse.json(
        { error: "Forbidden - System admin access required" },
        { status: 403 }
      );
    }

    const applicationId = params.id;

    await connectDB();

    // Get application (admin can access any application)
    const submission = await Submission.findById(applicationId);

    if (!submission) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Get agency details
    const agency = await Agency.findById(submission.agencyId);

    // Prepare application data
    const formData = submission.payload || {};
    const applicationData = {
      ...formData,
      submittedDate: submission.createdAt.toLocaleDateString(),
      agencyName: agency?.name || "Unknown Agency",
      programName: (submission as any).programName || "Advantage Contractor GL",
    } as any;

    // Generate HTML
    const htmlContent = generateApplicationHTML(applicationData);

    // Generate PDF using puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 30000,
    });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      const pdfUint8Array = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });
      await browser.close();

      // Convert Uint8Array to Buffer
      const pdfBuffer = Buffer.from(pdfUint8Array);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="application-${submission._id.toString()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}








