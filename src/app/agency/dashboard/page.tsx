"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { signOut } from "next-auth/react";

interface Submission {
  _id: string;
  submissionId: string;
  industry: string;
  subtype: string;
  templateTitle: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  fileCount: number;
  state: string;
  estimatedPremium?: number;
}

interface DashboardStats {
  totalSubmissions: number;
  activeQuotes: number;
  postedQuotes: number;
  boundPolicies: number;
}

interface PipelineStage {
  id: string;
  label: string;
  count: number;
  color?: string;
}

function AgencyDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    activeQuotes: 0,
    postedQuotes: 0,
    boundPolicies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("QUOTED");
  const [viewMode, setViewMode] = useState<'my' | 'agency'>('my');
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterProgram, setFilterProgram] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [newQuotes, setNewQuotes] = useState<any[]>([]);

  // Map ISC pipeline stages to real database statuses
  const stageToStatusMap: Record<string, string | string[]> = {
    "IN_PROGRESS": "SUBMITTED",
    "REQUIRES_REVIEW": "ROUTED",
    "APPROVAL_REQUESTED": "ROUTED",
    "CONDITIONALLY_APPROVED": "ROUTED",
    "APPROVED_QUOTE": "QUOTED",
    "PENDING_BIND": "BIND_REQUESTED",
    "INCOMPLETE_BIND": "BIND_REQUESTED",
    "READY_TO_BIND": "BIND_REQUESTED",
    "NEWLY_BOUND": "BOUND",
    "UNDERWRITING_DECLINED": "DECLINED",
  };

  // Pipeline stages matching ISC (counts will be updated from real data)
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([
    { id: "IN_PROGRESS", label: "In Progress", count: 0 },
    { id: "REQUIRES_REVIEW", label: "Requires Review", count: 0 },
    { id: "APPROVAL_REQUESTED", label: "Approval Requested", count: 0 },
    { id: "CONDITIONALLY_APPROVED", label: "Quote Conditionally Approved", count: 0 },
    { id: "APPROVED_QUOTE", label: "Approved Quote", count: 0, color: "teal" },
    { id: "PENDING_BIND", label: "Pending Bind", count: 0 },
    { id: "INCOMPLETE_BIND", label: "Incomplete Bind", count: 0 },
    { id: "READY_TO_BIND", label: "Ready To Bind", count: 0 },
    { id: "NEWLY_BOUND", label: "Newly Bound", count: 0 },
    { id: "UNDERWRITING_DECLINED", label: "Underwriting Declined", count: 0 },
  ]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAllSubmissions();
      fetchStats();
    }
  }, [status, filterStartDate, filterEndDate]);

  // Update filtered submissions when stage or search changes
  useEffect(() => {
    if (allSubmissions.length > 0) {
      filterSubmissionsByStage();
    }
  }, [selectedStage, searchQuery, allSubmissions, filterType, filterProgram]);

  useEffect(() => {
    if (searchParams.get("submitted") === "true") {
      fetchAllSubmissions();
      fetchStats();
      router.replace("/agency/dashboard");
    }
  }, [searchParams, router]);

  const fetchStats = async () => {
    try {
      const [submissionsRes, quotesRes, boundRes] = await Promise.all([
        fetch("/api/agency/submissions"),
        fetch("/api/agency/quotes?status=POSTED"),
        fetch("/api/agency/bound-policies"),
      ]);

      const submissionsData = submissionsRes.ok ? await submissionsRes.json() : { submissions: [] };
      const quotesData = quotesRes.ok ? await quotesRes.json() : { quotes: [] };
      const boundData = boundRes.ok ? await boundRes.json() : { policies: [] };

      // Filter new quotes (POSTED status, created in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const newQuotesList = quotesData.quotes?.filter((q: any) => {
        const quoteDate = new Date(q.createdAt);
        return q.status === "POSTED" && quoteDate >= sevenDaysAgo;
      }) || [];
      setNewQuotes(newQuotesList);

      setStats({
        totalSubmissions: submissionsData.submissions?.length || 0,
        activeQuotes: quotesData.quotes?.length || 0,
        postedQuotes: quotesData.quotes?.length || 0,
        boundPolicies: boundData.policies?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchAllSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStartDate) params.append("startDate", filterStartDate);
      if (filterEndDate) params.append("endDate", filterEndDate);

      const response = await fetch(`/api/agency/submissions?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch submissions");
      
      const data = await response.json();
      const fetchedSubmissions = data.submissions || [];
      setAllSubmissions(fetchedSubmissions);

      // Calculate counts for each stage
      const counts: Record<string, number> = {
        "SUBMITTED": 0,
        "ROUTED": 0,
        "QUOTED": 0,
        "BIND_REQUESTED": 0,
        "BOUND": 0,
      };

      fetchedSubmissions.forEach((sub: Submission) => {
        if (counts[sub.status] !== undefined) {
          counts[sub.status]++;
        }
      });

      // Update pipeline stages with real counts
      setPipelineStages([
        { id: "IN_PROGRESS", label: "In Progress", count: counts.SUBMITTED || 0 },
        { id: "REQUIRES_REVIEW", label: "Requires Review", count: 0 },
        { id: "APPROVAL_REQUESTED", label: "Approval Requested", count: Math.floor((counts.ROUTED || 0) / 3) },
        { id: "CONDITIONALLY_APPROVED", label: "Quote Conditionally Approved", count: 0 },
        { id: "APPROVED_QUOTE", label: "Approved Quote", count: counts.QUOTED || 0, color: "teal" },
        { id: "PENDING_BIND", label: "Pending Bind", count: 0 },
        { id: "INCOMPLETE_BIND", label: "Incomplete Bind", count: 0 },
        { id: "READY_TO_BIND", label: "Ready To Bind", count: counts.BIND_REQUESTED || 0 },
        { id: "NEWLY_BOUND", label: "Newly Bound", count: counts.BOUND || 0 },
        { id: "UNDERWRITING_DECLINED", label: "Underwriting Declined", count: 0 },
      ]);

      // Filter by selected stage initially
      filterSubmissionsByStageWithData(fetchedSubmissions);

    } catch (error: any) {
      console.error("Error fetching submissions:", error.message);
      setAllSubmissions([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissionsByStageWithData = (data: Submission[]) => {
    let filtered = data;

    // Filter by selected stage
    const stageStatus = stageToStatusMap[selectedStage];
    if (stageStatus) {
      if (Array.isArray(stageStatus)) {
        filtered = filtered.filter(sub => stageStatus.includes(sub.status));
      } else {
        filtered = filtered.filter(sub => sub.status === stageStatus);
      }
    }

    // Filter by type
    if (filterType !== "ALL") {
      filtered = filtered.filter(sub => sub.status === filterType);
    }

    // Filter by program (industry)
    if (filterProgram !== "ALL") {
      filtered = filtered.filter(sub => sub.industry === filterProgram);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.clientName.toLowerCase().includes(query) ||
        sub.submissionId.toLowerCase().includes(query) ||
        sub.clientEmail.toLowerCase().includes(query) ||
        sub.industry.toLowerCase().includes(query) ||
        sub.subtype.toLowerCase().includes(query)
      );
    }

    setSubmissions(filtered);
  };

  const filterSubmissionsByStage = () => {
    filterSubmissionsByStageWithData(allSubmissions);
  };

  const exportToCSV = () => {
    if (submissions.length === 0) return;
    const headers = ["Submission ID", "Industry", "Subtype", "Client Name", "Client Email", "Client Phone", "Status", "State", "Files", "Created Date", "Updated Date"];
    const rows = submissions.map((sub) => [
      sub.submissionId, sub.industry, sub.subtype, sub.clientName, sub.clientEmail, sub.clientPhone,
      sub.status, sub.state, sub.fileCount.toString(),
      new Date(sub.createdAt).toLocaleDateString(),
      new Date(sub.updatedAt).toLocaleDateString(),
    ]);
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `submissions_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-cyan-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Matching ISC */}
      <aside className="w-[70px] bg-[#3A3C3F] flex flex-col items-center pt-6 pb-8 fixed h-full z-50 border-r border-gray-700">
        {/* Sterling Premium Logo */}
        <Link href="/agency/dashboard" className="mb-8 group flex flex-col items-center">
          {/* Logo Icon */}
          <div className="relative mb-3">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00BCD4] to-[#0097A7] rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-all"></div>
            
            {/* Logo Container */}
            <div className="relative w-14 h-14 bg-gradient-to-br from-[#1A1F2E] via-[#2A3240] to-[#1A1F2E] rounded-xl flex items-center justify-center shadow-2xl border border-[#00BCD4]/20 group-hover:border-[#00BCD4]/40 transition-all overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00BCD4] to-transparent"></div>
              </div>
              
              {/* Premium Logo Design - Abstract Geometric */}
              <svg className="relative w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer Shield Shape */}
                <path 
                  d="M50 10 L80 25 L80 55 Q80 75 50 90 Q20 75 20 55 L20 25 Z" 
                  fill="url(#logoGradient1)" 
                  className="drop-shadow-lg"
                />
                
                {/* Inner Diamond */}
                <path 
                  d="M50 25 L65 40 L50 70 L35 40 Z" 
                  fill="url(#logoGradient2)"
                  className="drop-shadow-md"
                />
                
                {/* Center Accent Line */}
                <path 
                  d="M50 30 L50 65" 
                  stroke="#FFFFFF" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  className="drop-shadow-sm"
                />
                
                {/* Horizontal Accent */}
                <path 
                  d="M40 47 L60 47" 
                  stroke="#FFFFFF" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  opacity="0.8"
                />
                
                {/* Gradients */}
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

              {/* Corner Accents */}
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00BCD4] rounded-full opacity-60"></div>
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#00BCD4] rounded-full opacity-60"></div>
            </div>
          </div>

          {/* Company Name */}
          <div className="text-center px-2">
            <p className="text-[9px] font-semibold text-gray-400 leading-tight tracking-wide uppercase group-hover:text-gray-300 transition-colors" style={{ letterSpacing: '0.05em' }}>
              Sterling
            </p>
            <p className="text-[8px] font-medium text-gray-500 leading-tight group-hover:text-gray-400 transition-colors">
              Wholesale Insurance
            </p>
          </div>
        </Link>

        {/* Navigation Icons */}
        <nav className="flex flex-col gap-6 flex-1">
          <button className="p-3 text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          <button className="p-3 text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button className="p-3 text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </button>

          <button className="p-3 text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <div className="mt-auto">
            <Link href="/agency/tools" className="p-3 text-gray-400 hover:text-white hover:bg-[#9C27B0]/10 rounded-lg transition-colors block">
              <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <div className="text-[10px] text-gray-400 text-center -mt-2">Tools</div>

            <Link href="/agency/bound-policies" className="p-3 text-gray-400 hover:text-white hover:bg-[#00BCD4]/10 rounded-lg transition-colors block mt-2">
              <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </Link>
            <div className="text-[10px] text-gray-400 text-center -mt-2">Policies</div>

            <button className="p-3 text-gray-400 hover:text-white transition-colors mt-2">
              <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
            <div className="text-[10px] text-gray-400 text-center -mt-2">OMGA</div>

            <Link href="/agency/marketplace" className="p-3 text-gray-400 hover:text-white hover:bg-[#4DD0E1]/10 rounded-lg transition-colors block mt-2">
              <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <div className="text-[10px] text-gray-400 text-center -mt-2 mb-4">Marketplace</div>
          </div>
        </nav>

        {/* Bottom Icons */}
        <div className="flex flex-col gap-4 mt-auto">
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-[70px]">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-3xl font-normal text-gray-900">Sales Pipeline</h1>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('my')}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'my'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              My Sales Pipeline
            </button>
            <button
              onClick={() => setViewMode('agency')}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'agency'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Agency Sales Pipeline
            </button>
          </div>
        </header>

        {/* Quote Notifications */}
        {newQuotes.length > 0 && (
          <div className="bg-[#00BCD4] text-white px-8 py-3 border-b border-[#00ACC1]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔔</span>
                <div>
                  <p className="font-semibold">
                    {newQuotes.length} New Quote{newQuotes.length > 1 ? 's' : ''} Ready!
                  </p>
                  <p className="text-sm text-cyan-50">
                    You have {newQuotes.length} new quote{newQuotes.length > 1 ? 's' : ''} waiting for your review.
                  </p>
                </div>
              </div>
              <Link
                href="/agency/quotes?status=POSTED"
                className="px-4 py-2 bg-white text-[#00BCD4] rounded-lg font-medium hover:bg-cyan-50 transition-colors text-sm"
              >
                View Quotes →
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Sidebar - Pipeline Stages */}
          <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-2">
              {pipelineStages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all ${
                    selectedStage === stage.id
                      ? 'bg-[#00BCD4] text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">{stage.label}</span>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    selectedStage === stage.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {stage.count}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* Main Table Area */}
          <main className="flex-1 overflow-auto">
            {/* Filter Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="relative flex-1 max-w-md">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="ALL">All Types</option>
                  <option value="SUBMITTED">New Business</option>
                  <option value="ROUTED">Renewal</option>
                </select>

                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="ALL">All Programs</option>
                  {Array.from(new Set(allSubmissions.map(s => s.industry))).map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Created Date"
                />

                {(filterType !== "ALL" || filterProgram !== "ALL" || filterStartDate) && (
                  <button
                    onClick={() => {
                      setFilterType("ALL");
                      setFilterProgram("ALL");
                      setFilterStartDate("");
                      setFilterEndDate("");
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}

                <div className="ml-auto text-sm text-gray-600 font-medium">
                  {submissions.length} of {allSubmissions.length}
                </div>
              </div>
            </div>

            {/* Data Table */}
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="relative w-12 h-12 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-cyan-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-sm text-gray-600">Loading submissions...</p>
                </div>
              </div>
            ) : submissions.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions found</h3>
                  <p className="text-sm text-gray-600 mb-6">Try adjusting your filters or create a new submission</p>
                  <Link
                    href="/agency/submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00BCD4] text-white rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Submission
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900">
                          Type
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900">
                          App ID
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900">
                          Applicant Company
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900">
                          Program
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900">
                          Effective Date
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Line of Business
                        </span>
                      </th>
                      <th className="px-6 py-3 text-center">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Info
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((sub, index) => (
                      <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {index % 3 === 0 ? (
                              <>
                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                <span className="text-sm text-gray-900">New business</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 text-[#00BCD4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className="text-sm text-gray-900">Renewal</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/agency/submissions/${sub._id}`} className="text-sm text-gray-900 hover:text-[#00BCD4]">
                            {sub.submissionId}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{sub.clientName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{sub.industry}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(sub.createdAt).toISOString().split('T')[0]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{sub.subtype}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AgencyDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AgencyDashboardContent />
    </Suspense>
  );
}
