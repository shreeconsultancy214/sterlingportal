import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";
import FormTemplate from "@/models/FormTemplate";
import RoutingLog from "@/models/RoutingLog";
import Quote from "@/models/Quote";
import { logActivity, createActivityLogData } from "@/utils/activityLogger";

/**
 * GET /api/agency/submissions/[id]
 * Get a single submission with full details (routing logs, quotes, timeline)
 */
export async function GET(
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

    await connectDB();

    // Ensure models are registered before populate
    await import("@/models/FormTemplate");
    await import("@/models/Carrier");

    // Find submission and verify it belongs to the agency
    const submission = await Submission.findOne({
      _id: params.id,
      agencyId: (session.user as any).agencyId,
    })
      .populate("templateId")
      .lean();

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Get routing logs
    const routingLogs = await RoutingLog.find({
      submissionId: params.id,
    })
      .populate("carrierId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Get quotes for this submission
    const quotes = await Quote.find({
      submissionId: params.id,
    })
      .populate("carrierId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      submission: {
        ...submission,
        _id: submission._id.toString(),
        agencyId: submission.agencyId.toString(),
        templateId: submission.templateId
          ? {
              ...submission.templateId,
              _id: (submission.templateId as any)._id.toString(),
            }
          : null,
        programId: (submission as any).programId || null,
        programName: (submission as any).programName || null,
        adminNotes: (submission as any).adminNotes || null,
      },
      routingLogs: routingLogs.map((log: any) => ({
        ...log,
        _id: log._id.toString(),
        submissionId: log.submissionId.toString(),
        carrierId: log.carrierId
          ? {
              _id: (log.carrierId as any)._id.toString(),
              name: (log.carrierId as any).name,
              email: (log.carrierId as any).email,
            }
          : null,
      })),
      quotes: quotes.map((quote: any) => ({
        ...quote,
        _id: quote._id.toString(),
        submissionId: quote.submissionId.toString(),
        carrierId: quote.carrierId
          ? {
              _id: (quote.carrierId as any)._id.toString(),
              name: (quote.carrierId as any).name,
              email: (quote.carrierId as any).email,
            }
          : null,
      })),
    });
  } catch (error: any) {
    console.error("Submission details API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/agency/submissions/[id]
 * Update a submission (only allowed for ENTERED or DRAFT status)
 */
export async function PATCH(
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

    // Only agency users can update submissions
    const userRole = (session.user as any).role;
    if (userRole !== "agency_admin" && userRole !== "agency_user") {
      return NextResponse.json(
        { error: "Forbidden - Agency access required" },
        { status: 403 }
      );
    }

    await connectDB();

    // Find submission and verify it belongs to the agency
    const submission = await Submission.findOne({
      _id: params.id,
      agencyId: (session.user as any).agencyId,
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Check if submission can be edited (only DRAFT or SUBMITTED status) 
    const status = submission.status as string;
    if (status !== "DRAFT" && status !== "SUBMITTED") {
      return NextResponse.json(
        { error: "Submission cannot be edited. Only ENTERED or DRAFT submissions can be modified." },
        { status: 400 }
      );
    }

    // Check if submission has been routed (has routing logs)
    const routingLogsCount = await RoutingLog.countDocuments({
      submissionId: params.id,
    });

    if (routingLogsCount > 0) {
      return NextResponse.json(
        { error: "Submission cannot be edited. It has already been routed to carriers." },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await req.formData();

    // Update client contact information
    if (formData.get("clientName")) {
      submission.clientContact.name = formData.get("clientName") as string;
    }
    if (formData.get("clientPhone")) {
      submission.clientContact.phone = formData.get("clientPhone") as string;
    }
    if (formData.get("clientEmail")) {
      submission.clientContact.email = formData.get("clientEmail") as string;
    }
    if (formData.get("clientEIN")) {
      submission.clientContact.EIN = formData.get("clientEIN") as string;
    }
    if (formData.get("clientStreet")) {
      submission.clientContact.businessAddress.street = formData.get("clientStreet") as string;
    }
    if (formData.get("clientCity")) {
      submission.clientContact.businessAddress.city = formData.get("clientCity") as string;
    }
    if (formData.get("clientState")) {
      submission.clientContact.businessAddress.state = formData.get("clientState") as string;
      submission.state = formData.get("clientState") as string;
    }
    if (formData.get("clientZip")) {
      submission.clientContact.businessAddress.zip = formData.get("clientZip") as string;
    }

    // Update CCPA consent
    if (formData.get("ccpaConsent")) {
      submission.ccpaConsent = formData.get("ccpaConsent") === "true";
    }

    // Update payload (form data)
    const payload: Record<string, any> = {};
    formData.forEach((value, key) => {
      // Skip known fields that are not part of payload
      if (!["clientName", "clientPhone", "clientEmail", "clientEIN", 
            "clientStreet", "clientCity", "clientState", "clientZip",
            "ccpaConsent", "templateId", "carrierId", "files", "isCAOperations"].includes(key)) {
        payload[key] = value.toString();
      }
    });
    
    if (Object.keys(payload).length > 0) {
      submission.payload = { ...submission.payload, ...payload };
    }

    // Handle file updates (if new files are provided)
    // Note: File handling would need to be implemented similar to the create submission route
    // For now, we'll skip file updates in edit mode to keep it simple
    // Files can be managed separately if needed

    await submission.save();

    // Log activity: Submission updated
    await logActivity(
      createActivityLogData(
        "SUBMISSION_UPDATED",
        `Submission updated by agency`,
        {
          submissionId: submission._id.toString(),
          user: {
            id: (session.user as any).id,
            name: (session.user as any).name || (session.user as any).email,
            email: (session.user as any).email,
            role: (session.user as any).role || "agency",
          },
          details: {
            updatedFields: Object.keys(payload).length > 0 ? "payload" : "clientContact",
          },
        }
      )
    );

    return NextResponse.json({
      success: true,
      submission: {
        _id: submission._id.toString(),
        status: submission.status,
        updatedAt: submission.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Update submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update submission" },
      { status: 500 }
    );
  }
}


