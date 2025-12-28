import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";
import FormTemplate from "@/models/FormTemplate";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { logActivity, createActivityLogData } from "@/utils/activityLogger";

/**
 * POST /api/submissions
 * Create a new submission with file uploads
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Parse multipart/form-data
    const formData = await req.formData();

    // Get form fields
    const templateId = formData.get("templateId") as string;
    const carrierId = formData.get("carrierId") as string;
    const clientName = formData.get("clientName") as string;
    const clientPhone = formData.get("clientPhone") as string;
    const clientEmail = formData.get("clientEmail") as string;
    const clientEIN = formData.get("clientEIN") as string | null;
    const clientStreet = formData.get("clientStreet") as string;
    const clientCity = formData.get("clientCity") as string;
    const clientState = formData.get("clientState") as string;
    const clientZip = formData.get("clientZip") as string;
    const ccpaConsent = formData.get("ccpaConsent") === "true";
    const isCAOperations = formData.get("isCAOperations") === "true";

    // Validate required fields
    if (
      !templateId ||
      !carrierId ||
      !clientName ||
      !clientPhone ||
      !clientEmail ||
      !clientStreet ||
      !clientCity ||
      !clientZip
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get template
    const template = await FormTemplate.findById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Extract form payload (exclude metadata fields)
    const payload: Record<string, any> = {};
    const excludeFields = [
      "templateId",
      "clientName",
      "clientPhone",
      "clientEmail",
      "clientEIN",
      "clientStreet",
      "clientCity",
      "clientState",
      "clientZip",
      "ccpaConsent",
      "isCAOperations",
      "carrierId",
      "files",
    ];

    for (const [key, value] of Array.from(formData.entries())) {
      if (!excludeFields.includes(key) && key !== "files") {
        // Handle file fields separately
        if (value instanceof File) {
          // Skip files here, handle them below
          continue;
        }
        payload[key] = value;
      }
    }

    // Handle file uploads
    const files = formData.getAll("files") as File[];
    const uploadedFiles: Array<{
      fieldKey: string;
      fileUrl: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
    }> = [];

    // Create uploads directory in public folder if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Process each file
    for (const file of files) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${timestamp}_${sanitizedName}`;
        const filepath = join(uploadDir, filename);

        // Save file
        await writeFile(filepath, buffer);

        // Store file info
        uploadedFiles.push({
          fieldKey: file.name, // You might want to track which field this file belongs to
          fileUrl: `/uploads/${filename}`, // Relative URL
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
        });
      }
    }

    // Create submission
    const submission = await Submission.create({
      agencyId: (session.user as any).agencyId,
      templateId: templateId,
      payload: payload,
      files: uploadedFiles,
      status: "SUBMITTED",
      clientContact: {
        name: clientName,
        phone: clientPhone,
        email: clientEmail,
        EIN: clientEIN || undefined,
        businessAddress: {
          street: clientStreet,
          city: clientCity,
          state: clientState || (isCAOperations ? "CA" : ""),
          zip: clientZip,
        },
      },
      ccpaConsent: ccpaConsent,
      state: isCAOperations ? "CA" : payload.state || "",
    });

    // Log activity: Submission created
    await logActivity(
      createActivityLogData(
        "SUBMISSION_CREATED",
        `Submission created for ${clientName}`,
        {
          submissionId: submission._id.toString(),
          user: {
            id: (session.user as any).id,
            name: (session.user as any).name || (session.user as any).email,
            email: (session.user as any).email,
            role: (session.user as any).role || "agency",
          },
          details: {
            templateId: templateId,
            clientName: clientName,
            state: submission.state,
            fileCount: uploadedFiles.length,
          },
        }
      )
    );

    // Route submission to single carrier (new workflow)
    try {
      const Carrier = (await import("@/models/Carrier")).default;
      const RoutingLog = (await import("@/models/RoutingLog")).default;
      const EmailService = (await import("@/services/EmailService")).default;
      
      const carrier = await Carrier.findById(carrierId);
      if (!carrier) {
        console.error("Selected carrier not found:", carrierId);
      } else {
        // Send email to carrier using EmailService
        const emailResult = await EmailService.sendSubmissionToCarrier(
          {
            _id: submission._id.toString(),
            clientContact: {
              name: clientName,
              email: clientEmail,
              phone: clientPhone,
            },
            state: submission.state,
          },
          {
            _id: carrier._id.toString(),
            name: carrier.name,
            email: carrier.email,
          },
          {
            industry: template.industry,
            subtype: template.subtype,
            title: template.title,
          },
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/submissions/${submission._id.toString()}`
        );
        
        // Create routing log entry
        await RoutingLog.create({
          submissionId: submission._id,
          carrierId: carrierId,
          status: emailResult.success ? "SENT" : "FAILED",
          emailSent: emailResult.success,
          notes: emailResult.success 
            ? `Email sent to ${carrier.name} at ${carrier.email}` 
            : `Email failed: ${emailResult.error}`,
          errorMessage: emailResult.error || undefined,
          createdAt: new Date(),
        });
        
        // Update submission status to ROUTED
        submission.status = "ROUTED";
        await submission.save();
        
        // Log activity: Submission routed
        await logActivity(
          createActivityLogData(
            "SUBMISSION_ROUTED",
            `Submission routed to ${carrier.name}`,
            {
              submissionId: submission._id.toString(),
              user: {
                id: (session.user as any).id,
                name: (session.user as any).name || (session.user as any).email,
                email: (session.user as any).email,
                role: (session.user as any).role || "agency",
              },
              details: {
                carrierId: carrier._id.toString(),
                carrierName: carrier.name,
                routingStatus: emailResult.success ? "SENT" : "FAILED",
              },
            }
          )
        );
        
        console.log(`✅ Submission routed to carrier: ${carrier.name}`);
      }
    } catch (routingError: any) {
      console.error("Routing error (non-fatal):", routingError);
      // Don't fail the submission if routing fails - log it but continue
    }

    return NextResponse.json({
      success: true,
      submissionId: submission._id.toString(),
      status: submission.status,
    });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create submission" },
      { status: 500 }
    );
  }
}

