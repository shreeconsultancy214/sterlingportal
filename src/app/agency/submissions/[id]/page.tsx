"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

interface SubmissionDetails {
  submission: {
    _id: string;
    agencyId: string;
    templateId: any;
    payload: Record<string, any>;
    files: Array<{
      fieldKey: string;
      fileUrl: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
    }>;
    status: string;
    clientContact: {
      name: string;
      phone: string;
      email: string;
      EIN?: string;
      businessAddress: {
        street: string;
        city: string;
        state: string;
        zip: string;
      };
    };
    ccpaConsent: boolean;
    state: string;
    createdAt: string;
    updatedAt: string;
    programId?: string;
    programName?: string;
    submissionId?: string;
    adminNotes?: string;
  };
  routingLogs: Array<{
    _id: string;
    submissionId: string;
    carrierId: {
      _id: string;
      name: string;
      email: string;
    } | null;
    status: string;
    notes?: string;
    createdAt: string;
  }>;
  quotes: Array<{
    _id: string;
    submissionId: string;
    carrierId: {
      _id: string;
      name: string;
      email: string;
    } | null;
    carrierQuoteUSD: number;
    brokerFeeAmountUSD: number;
    finalAmountUSD: number;
    status: string;
    createdAt: string;
    binderPdfUrl?: string;
    proposalPdfUrl?: string;
  }>;
}

function SubmissionDetailsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const submissionId = params?.id as string;

  const [data, setData] = useState<SubmissionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Check for success message from edit
  useEffect(() => {
    if (searchParams?.get("updated") === "true") {
      toast.success("Submission updated successfully!", {
        description: "Your changes have been saved.",
      });
      // Remove query param from URL
      router.replace(`/agency/submissions/${submissionId}`, { scroll: false });
    }
  }, [searchParams, router, submissionId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && submissionId) {
      fetchSubmission();
      fetchActivityLogs();
    }
  }, [status, submissionId]);

  const fetchActivityLogs = async () => {
    if (!submissionId) return;
    setLoadingActivity(true);
    try {
      const response = await fetch(`/api/agency/submissions/${submissionId}/activity`);
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error fetching activity logs:", err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchSubmission = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agency/submissions/${submissionId}`);
      const data = await response.json();

      if (data.submission) {
        setData({
          submission: data.submission,
          routingLogs: data.routingLogs || [],
          quotes: data.quotes || [],
        });
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      console.error("Error fetching submission:", err);
      setError("Failed to load submission details");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "ROUTED":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "QUOTED":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "BIND_REQUESTED":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "BOUND":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getQuoteStatusBadgeColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border border-green-200";
      case "ENTERED_BY_ADMIN":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "DECLINED":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-cyan-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-gray-600 font-medium">Loading submission details...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <aside className="w-[70px] bg-[#3A3C3F] flex flex-col items-center pt-6 pb-8 fixed h-full z-50 border-r border-gray-700">
          <Link href="/agency/dashboard" className="mb-8 group flex flex-col items-center">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00BCD4] to-[#0097A7] rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-all"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-[#1A1F2E] via-[#2A3240] to-[#1A1F2E] rounded-xl flex items-center justify-center shadow-2xl border border-[#00BCD4]/20 group-hover:border-[#00BCD4]/40 transition-all overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00BCD4] to-transparent"></div>
                </div>
                <svg className="relative w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 10 L80 25 L80 55 Q80 75 50 90 Q20 75 20 55 L20 25 Z" fill="url(#logoGradient1)" className="drop-shadow-lg" />
                  <path d="M50 25 L65 40 L50 70 L35 40 Z" fill="url(#logoGradient2)" className="drop-shadow-md" />
                  <path d="M50 30 L50 65" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" className="drop-shadow-sm" />
                  <path d="M40 47 L60 47" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <defs>
                    <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00BCD4" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#0097A7" stopOpacity="0.95" />
                    </linearGradient>
                    <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00BCD4] rounded-full opacity-60"></div>
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#00BCD4] rounded-full opacity-60"></div>
              </div>
            </div>
            <div className="text-center px-2">
              <p className="text-[9px] font-semibold text-gray-400 leading-tight tracking-wide uppercase group-hover:text-gray-300 transition-colors" style={{ letterSpacing: '0.05em' }}>Sterling</p>
              <p className="text-[8px] font-medium text-gray-500 leading-tight group-hover:text-gray-400 transition-colors">Wholesale Insurance</p>
            </div>
          </Link>
        </aside>
        <main className="flex-1 ml-[70px] p-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-red-600 mb-6">{error || "Submission not found"}</p>
            <Link href="/agency/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00BCD4] text-white rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { submission, routingLogs, quotes } = data;

  // Build timeline from submission history
  const timeline = [
    {
      date: submission.createdAt,
      title: "Submission Created",
      description: "Application submitted",
      icon: "📝",
      color: "blue",
    },
    ...routingLogs.map((log) => ({
      date: log.createdAt,
      title: `Routed to ${log.carrierId?.name || "Carrier"}`,
      description: log.status === "SENT" ? "Successfully sent" : "Failed to send",
      icon: log.status === "SENT" ? "✅" : "❌",
      color: log.status === "SENT" ? "green" : "red",
    })),
    ...quotes.map((quote) => ({
      date: quote.createdAt,
      title: `Quote Received from ${quote.carrierId?.name || "Carrier"}`,
      description: `Amount: $${quote.finalAmountUSD.toLocaleString()}`,
      icon: "💰",
      color: "purple",
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Matching Dashboard */}
      <aside className="w-[70px] bg-[#3A3C3F] flex flex-col items-center pt-6 pb-8 fixed h-full z-50 border-r border-gray-700">
        <Link href="/agency/dashboard" className="mb-8 group flex flex-col items-center">
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00BCD4] to-[#0097A7] rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-all"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-[#1A1F2E] via-[#2A3240] to-[#1A1F2E] rounded-xl flex items-center justify-center shadow-2xl border border-[#00BCD4]/20 group-hover:border-[#00BCD4]/40 transition-all overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00BCD4] to-transparent"></div>
              </div>
              <svg className="relative w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 L80 25 L80 55 Q80 75 50 90 Q20 75 20 55 L20 25 Z" fill="url(#logoGradient1)" className="drop-shadow-lg" />
                <path d="M50 25 L65 40 L50 70 L35 40 Z" fill="url(#logoGradient2)" className="drop-shadow-md" />
                <path d="M50 30 L50 65" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" className="drop-shadow-sm" />
                <path d="M40 47 L60 47" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                <defs>
                  <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00BCD4" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0097A7" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00BCD4] rounded-full opacity-60"></div>
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#00BCD4] rounded-full opacity-60"></div>
            </div>
          </div>
          <div className="text-center px-2">
            <p className="text-[9px] font-semibold text-gray-400 leading-tight tracking-wide uppercase group-hover:text-gray-300 transition-colors" style={{ letterSpacing: '0.05em' }}>Sterling</p>
            <p className="text-[8px] font-medium text-gray-500 leading-tight group-hover:text-gray-400 transition-colors">Wholesale Insurance</p>
          </div>
        </Link>

        <nav className="flex flex-col gap-6 flex-1">
          <Link href="/agency/dashboard" className="p-3 text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[70px] overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/agency/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Submission Details</h1>
                <p className="text-sm text-gray-600">
                  {submission.submissionId || submission._id.slice(-8)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusBadgeColor(submission.status)}`}>
                {submission.status.replace("_", " ")}
              </span>
              {/* Edit Button - Only show if status allows editing */}
              {(submission.status === "ENTERED" || submission.status === "DRAFT") && (
                <Link
                  href={`/agency/submit/${submission.templateId?._id}?edit=${submission._id}`}
                  className="px-4 py-2 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-colors text-sm font-semibold"
                >
                  Edit Submission
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Submission Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Industry</p>
                <p className="text-sm font-semibold text-gray-900">{submission.templateId?.industry || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Subtype</p>
                <p className="text-sm font-semibold text-gray-900">{submission.templateId?.subtype || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">State</p>
                <p className="text-sm font-semibold text-gray-900">{submission.state || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Created</p>
                <p className="text-sm font-semibold text-gray-900">{new Date(submission.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Name</p>
                <p className="text-sm font-semibold text-gray-900">{submission.clientContact.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
                <p className="text-sm font-semibold text-gray-900">{submission.clientContact.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Phone</p>
                <p className="text-sm font-semibold text-gray-900">{submission.clientContact.phone}</p>
              </div>
              {submission.clientContact.EIN && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">EIN</p>
                  <p className="text-sm font-semibold text-gray-900">{submission.clientContact.EIN}</p>
                </div>
              )}
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 font-medium mb-1">Business Address</p>
                <p className="text-sm font-semibold text-gray-900">
                  {submission.clientContact.businessAddress.street}<br />
                  {submission.clientContact.businessAddress.city}, {submission.clientContact.businessAddress.state} {submission.clientContact.businessAddress.zip}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Notes Section */}
          {submission.adminNotes && (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-[#00BCD4] rounded-lg p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-[#00BCD4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Admin Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{submission.adminNotes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        item.color === "green" ? "bg-green-100" :
                        item.color === "red" ? "bg-red-100" :
                        item.color === "purple" ? "bg-purple-100" :
                        "bg-blue-100"
                      }`}>
                        {item.icon}
                      </div>
                    </div>
                    <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Routing Logs */}
          {routingLogs.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Routing Logs</h2>
              <div className="space-y-3">
                {routingLogs.map((log) => (
                  <div key={log._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{log.carrierId?.name || "Unknown Carrier"}</p>
                        <p className="text-xs text-gray-600 mt-1">{log.carrierId?.email}</p>
                        {log.notes && (
                          <p className="text-xs text-gray-500 mt-2">{log.notes}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        log.status === "SENT" ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quotes */}
          {quotes.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quotes ({quotes.length})</h2>
              <div className="space-y-3">
                {quotes.map((quote) => (
                  <div key={quote._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{quote.carrierId?.name || "Unknown Carrier"}</p>
                        <p className="text-xs text-gray-600 mt-1">Final Amount: <span className="font-bold text-[#00BCD4]">${quote.finalAmountUSD.toLocaleString()}</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getQuoteStatusBadgeColor(quote.status)}`}>
                          {quote.status}
                        </span>
                        <Link
                          href={`/agency/quotes/${quote._id}`}
                          className="px-3 py-1.5 bg-[#00BCD4] text-white rounded-lg text-xs font-semibold hover:bg-[#00ACC1] transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-gray-500">Carrier Quote</p>
                        <p className="font-semibold text-gray-900">${quote.carrierQuoteUSD.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Broker Fee</p>
                        <p className="font-semibold text-gray-900">${quote.brokerFeeAmountUSD.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-semibold text-gray-900">{new Date(quote.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Log */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Activity Log</h2>
              {loadingActivity && (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-cyan-500 rounded-full animate-spin"></div>
              )}
            </div>
            {activityLogs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No activity recorded yet</p>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log._id} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[#00BCD4] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{log.description}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {log.performedBy.userName} ({log.performedBy.userRole}) • {new Date(log.createdAt).toLocaleString()}
                      </p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {Object.entries(log.details).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              <span className="font-medium">{key}:</span> {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Application Data */}
          {submission.payload && Object.keys(submission.payload).length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Application Data</h2>
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(submission.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Files */}
          {submission.files && submission.files.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Uploaded Files ({submission.files.length})</h2>
              <div className="space-y-2">
                {submission.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{file.fileName}</p>
                      <p className="text-xs text-gray-600">{formatFileSize(file.fileSize)} • {file.mimeType}</p>
                    </div>
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#00BCD4] text-white rounded-lg text-xs font-semibold hover:bg-[#00ACC1] transition-colors"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
            <div className="flex gap-3">
              <a
                href={`/api/admin/submissions/${submissionId}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SubmissionDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SubmissionDetailsContent />
    </Suspense>
  );
}
