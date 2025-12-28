"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGooglePlacesAutocomplete } from "@/hooks/useGooglePlacesAutocomplete";

// Helper component for Yes/No radio buttons
const YesNoRadio = ({ 
  label, 
  value, 
  onChange, 
  required = false,
  onInteraction
}: { 
  label: string; 
  value: boolean; 
  onChange: (val: boolean) => void;
  required?: boolean;
  onInteraction?: () => void;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex items-center gap-6">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={value === true}
          onChange={() => {
            onChange(true);
            onInteraction?.();
          }}
          className="w-4 h-4 text-[#00BCD4] border-gray-300 focus:ring-[#00BCD4]"
        />
        <span className="text-sm text-gray-700">Yes</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={value === false}
          onChange={() => {
            onChange(false);
            onInteraction?.();
          }}
          className="w-4 h-4 text-[#00BCD4] border-gray-300 focus:ring-[#00BCD4]"
        />
        <span className="text-sm text-gray-700">No</span>
      </label>
    </div>
  </div>
);

export default function QuoteFormPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const programId = params.programId as string;

  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({
    fein: '',
    phone: '',
    fax: ''
  });

  // Google Places Autocomplete for address
  const { inputRef: addressInputRef, isLoaded: isGoogleLoaded } = useGooglePlacesAutocomplete(
    (addressComponents) => {
      setFormData((prev: any) => ({
        ...prev,
        streetAddress: addressComponents.streetAddress,
        city: addressComponents.city,
        state: addressComponents.state,
        zip: addressComponents.zip,
      }));
    }
  );
  const [formData, setFormData] = useState<any>({
    // Indication Information
    leadSource: "",
    companyName: "",
    zip: "",
    state: "California",
    estimatedGrossReceipts: "",
    estimatedSubcontractingCosts: "",
    estimatedMaterialCosts: "",
    activeOwners: "0",
    fieldEmployees: "0",
    totalPayroll: "",
    yearsInBusiness: "",
    yearsExperience: "",
    
    // Class Codes
    classCodeWork: {},
    newConstructionPercent: "",
    remodelPercent: "",
    residentialPercent: "",
    commercialPercent: "",
    
    // Coverage
    coverageLimits: "1M / 1M / 1M",
    fireLegalLimit: "$100,000",
    medicalExpenseLimit: "$5,000",
    deductible: "$2,500",
    lossesLast5Years: "0",
    effectiveDate: "",
    selectedStates: [],
    willPerformStructuralWork: false,
    
    // Endorsements
    blanketAdditionalInsured: false,
    blanketWaiverOfSubrogation: false,
    blanketPrimaryWording: false,
    blanketPerProjectAggregate: false,
    blanketCompletedOperations: false,
    actsOfTerrorism: false,
    noticeCancellationThirdParties: false,
    
    // Payment Options
    brokerFee: "0",
    displayBrokerFee: false,
    paymentOption: "Full Pay",
    
    // Company Information
    contractorsLicense: false,
    licenseNumber: "",
    licenseClassification: "",
    dba: "",
    firstName: "",
    lastName: "",
    entityType: "Individual",
    applicantSSN: "",
    phone: "",
    fax: "",
    email: "",
    website: "",
    carrierDescriptionOk: false,
    carrierApprovedDescription: "- Constructs, maintains, services and repairs of refrigerators, refrigerated rooms, air-conditioning units, ducts, blowers, humidity and thermostatic controls.",
    
    // Address
    streetAddress: "",
    aptSuite: "",
    city: "",
    addressState: "",
    mailingAddressSame: true,
    mailingStreet: "",
    mailingAptSuite: "",
    mailingZip: "",
    mailingCity: "",
    mailingState: "",
    
    // Resume Questions
    employeesHave3YearsExp: false,
    hasConstructionSupervisionExp: false,
    hasConstructionCertifications: false,
    certificationsExplanation: "",
    
    // Type of Work
    maxInteriorStories: "",
    maxExteriorStories: "",
    workBelowGrade: false,
    belowGradeDepth: "",
    belowGradePercent: "",
    buildOnHillside: false,
    hillsideExplanation: "",
    performRoofingOps: false,
    roofingOpsExplanation: "",
    actAsGeneralContractor: false,
    generalContractorExplanation: "",
    performWaterproofing: false,
    waterproofingExplanation: "",
    useHeavyEquipment: false,
    heavyEquipmentExplanation: "",
    heavyEquipmentOperatorsCertified: false,
    heavyEquipmentYearsExpRequired: "",
    workNewTractHomes: false,
    tractHomesExplanation: "",
    workCondoConstruction: false,
    condoConstructionExplanation: "",
    condoUnits15OrMore: false,
    performCondoStructuralRepair: false,
    condoRepairExplanation: "",
    condoRepairUnits15OrMore: false,
    performOCIPWork: false,
    performHazardousWork: false,
    hazardousWorkExplanation: "",
    workOver5000SqFt: false,
    over5000SqFtExplanation: "",
    over5000SqFtPercent: "",
    
    // Additional Business Info
    performIndustrialOps: false,
    otherBusinessNames: "",
    citedForOSHAViolations: false,
    lossInfoVerifiable: false,
    licensingActionTaken: false,
    allowedLicenseUseByOthers: false,
    lawsuitsFiled: false,
    awareOfPotentialClaims: false,
    hasWrittenContracts: false,
    contractHasStartDate: false,
    contractHasScopeOfWork: false,
    contractIdentifiesSubcontractors: false,
    contractHasSetPrice: false,
    contractSignedByAllParties: false,
    
    // Excess Liability
    addExcessLiability: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [calculatedPremium, setCalculatedPremium] = useState<number | null>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const triggerAnimation = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  // Calculate form completion percentage
  const calculateCompletionPercentage = () => {
    const requiredFields = [
      'companyName', 'zip', 'estimatedGrossReceipts', 'estimatedSubcontractingCosts',
      'effectiveDate', 'licenseNumber', 'fullLegalName',
      'entityType', 'contactName', 'phoneNumber', 'email',
      'physicalAddress', 'physicalCity', 'physicalState', 'physicalZip',
      'yearsInBusiness', 'totalPayroll'
    ];
    
    const filledFields = requiredFields.filter(field => {
      const value = formData[field];
      return value && value.toString().trim() !== '' && value.toString().trim() !== '0';
    });
    
    // Also check if at least one class code is added
    const hasClassCode = Object.keys(formData.classCodeWork || {}).length > 0;
    
    const basePercentage = Math.round((filledFields.length / requiredFields.length) * 90);
    const classCodeBonus = hasClassCode ? 10 : 0;
    
    return Math.min(basePercentage + classCodeBonus, 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    triggerAnimation();
  };

  const handleClassCodeChange = (code: string, percentage: string) => {
    const newPercentage = parseFloat(percentage) || 0;
    const currentTotal = Object.entries(formData.classCodeWork)
      .filter(([c]) => c !== code)
      .reduce((sum, [, val]) => sum + (parseFloat(val as string) || 0), 0);
    
    // Don't allow total to exceed 100%
    if (currentTotal + newPercentage <= 100) {
      setFormData((prev: any) => ({
        ...prev,
        classCodeWork: { ...prev.classCodeWork, [code]: percentage }
      }));
      triggerAnimation();
    }
  };

  const calculateTotalClassCodePercent = () => {
    return Object.values(formData.classCodeWork).reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0);
  };

  const getRemainingClassCodePercent = () => {
    const total = calculateTotalClassCodePercent();
    return Math.max(0, 100 - total);
  };

  const formatFEIN = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 2) {
      return digitsOnly;
    }
    return `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 9)}`;
  };

  const validateFEIN = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length === 0) {
      setValidationErrors((prev: any) => ({ ...prev, fein: '' }));
    } else if (digitsOnly.length < 9) {
      setValidationErrors((prev: any) => ({ ...prev, fein: `Not enough numbers, expecting 9` }));
    } else if (digitsOnly.length > 9) {
      setValidationErrors((prev: any) => ({ ...prev, fein: `Too many numbers, expecting 9` }));
    } else {
      setValidationErrors((prev: any) => ({ ...prev, fein: '' }));
    }
  };

  const formatPhone = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length === 0) return '';
    if (digitsOnly.length <= 3) {
      return `(${digitsOnly}`;
    }
    if (digitsOnly.length <= 6) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    }
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
  };

  const validatePhone = (value: string, field: 'phone' | 'fax') => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length === 0) {
      setValidationErrors((prev: any) => ({ ...prev, [field]: '' }));
    } else if (digitsOnly.length < 10) {
      setValidationErrors((prev: any) => ({ ...prev, [field]: 'Phone number too short.' }));
    } else {
      setValidationErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const calculatePremium = () => {
    const grossReceipts = parseFloat(formData.estimatedGrossReceipts) || 0;
    let premium = grossReceipts * 0.015;
    
    const experience = parseInt(formData.yearsExperience) || 0;
    if (experience > 10) premium *= 0.9;
    else if (experience > 5) premium *= 0.95;
    
    const losses = parseInt(formData.lossesLast5Years) || 0;
    if (losses > 0) premium *= (1 + (losses * 0.15));
    
    if (formData.deductible === "$10,000") premium *= 0.85;
    else if (formData.deductible === "$5,000") premium *= 0.90;
    else if (formData.deductible === "$2,500") premium *= 0.95;
    
    premium = Math.max(premium, 400);
    
    return Math.round(premium);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Submit application (no premium calculation)
      const response = await fetch('/api/agency/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId,
          programName: 'Advantage Contractor GL',
          formData,
          carrierEmail: process.env.NEXT_PUBLIC_DEFAULT_CARRIER_EMAIL || 'carrier@example.com',
        }),
      });

      if (!response.ok) throw new Error('Failed to submit application');

      const data = await response.json();
      
      toast.success('Application submitted successfully! The carrier will review and provide a quote.');
      
      // Redirect to agency dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/agency/dashboard';
      }, 2000);
      
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!quoteId) return;
    window.open(`/api/agency/quotes/${quoteId}/pdf`, '_blank');
  };

  const handleDownloadApplicationPDF = async () => {
    try {
      setIsDownloadingPDF(true);
      
      const response = await fetch('/api/agency/applications/preview-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId,
          programName: 'Advantage Contractor GL',
          formData,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      // Get PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `application-${formData.companyName || 'preview'}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF downloaded successfully!');
    } catch (error: any) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleEmailQuote = async () => {
    if (!quoteId) return;
    try {
      const response = await fetch(`/api/agency/quotes/${quoteId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: formData.email }),
      });
      if (response.ok) toast.success('Quote emailed successfully!');
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const classCodeOptions = [
    "A/C & Refrigeration", "Carpentry (Framing)", "Carpentry (Interior/Woodwork/Shop)",
    "Concrete (Flat)", "Door/Window Installation", "Drywall", "Electrical", "Fencing",
    "Floor Covering Installation", "Garage Door Installation", "General Contractor (New Commercial)",
    "General Contractor (New Residential)", "General Contractor (Remodel Commercial)",
    "General Contractor (Remodel Residential)", "Glass Installation/Glazing", "HVAC",
    "Insulation", "Janitorial (Residential - No Floor Waxing)", "Landscape", "Masonry",
    "Metal Erection (Decorative)", "Painting (Exterior)", "Painting (Interior)",
    "Plastering/Stucco", "Plumbing (Commercial)", "Plumbing (Residential)",
    "Roofing (New Commercial)", "Roofing (New Residential)", "Roofing (Repair Commercial)",
    "Roofing (Repair Residential)", "Sheet Metal", "Siding and Decking",
    "Swimming Pool Cleaning", "Swimming Pool Installation", "Tile & Marble Installation",
    "Welding (Non-Structural)",
  ];

  const statesList = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
    "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
    "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
    "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee",
    "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ];

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BCD4]"></div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-[#2F3338] text-white px-6 py-3 flex items-center justify-between">
        <Link href="/agency/marketplace" className="flex items-center gap-2 text-gray-300 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Close Rater
        </Link>
        <button type="button" onClick={() => setFormData({})} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">
          Clear
        </button>
      </div>

      {/* Fixed Logo & Header Section */}
      <div className="sticky top-0 z-40 bg-gray-50 border-b border-gray-200 shadow-sm relative">
        <div className="max-w-[950px] mx-auto px-8 h-16">
          <div className="relative h-full">
            {/* Centered Logo with Premium Internal Spinner - Positioned at absolute bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
              <div className="relative">
                {/* Logo Container - Round with smooth arc spinner */}
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#1A1F2E] via-[#2A3240] to-[#1A1F2E] rounded-full flex items-center justify-center shadow-xl border-2 border-[#00BCD4]/30 overflow-visible">
                  
                  {/* Premium Arc Spinner - INSIDE the logo border with slower speed */}
                  {isProcessing && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r="25"
                        fill="none"
                        stroke="url(#innerSpinnerGradient)"
                        strokeWidth="2"
                        strokeDasharray="45 135"
                        strokeLinecap="round"
                        className="animate-spin origin-center"
                        style={{ 
                          animationDuration: '3s',
                          transformOrigin: '28px 28px'
                        }}
                      />
                      <defs>
                        <linearGradient id="innerSpinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00BCD4" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#0097A7" stopOpacity="0.9" />
                        </linearGradient>
                      </defs>
                    </svg>
                  )}

                  {/* Subtle Background Glow */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00BCD4] to-transparent rounded-full"></div>
                  </div>
                  
                  {/* Premium Logo Design */}
                  <svg className="relative w-8 h-8 z-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#00BCD4] rounded-full opacity-60"></div>
                  <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-[#00BCD4] rounded-full opacity-60"></div>
                </div>

                {/* Company Name Below Logo */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <p className="text-[10px] font-semibold text-gray-700 tracking-wide">
                    Sterling
                  </p>
                </div>
              </div>
            </div>

            {/* Program Name - Absolute positioned at bottom right like ISC */}
            <div className="absolute bottom-0 right-0">
              <h1 className="text-xl font-bold text-gray-800">Advantage</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[950px] mx-auto px-8 py-8 mt-12">

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Indication Information */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <div className="bg-[#3A3C3F] text-white px-6 py-3.5">
              <h2 className="text-lg font-semibold">Indication Information</h2>
            </div>
            <div className="px-8 pt-6 pb-7">
            
            <div className="space-y-6 mt-1">
              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Lead Source</label>
                <div></div>
                <select
                  value={formData.leadSource}
                  onChange={(e) => handleInputChange('leadSource', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm"
                >
                  <option value="">None</option>
                  <option value="capital_co">capital_co</option>
                </select>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div></div>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-start">
                <label className="text-sm font-medium text-gray-900 pt-2">Zip</label>
                <div></div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    maxLength={5}
                    className="px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm w-[100px]"
                  />
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm flex-1"
                  >
                    {statesList.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Estimated Total Gross Receipts</label>
                <div></div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.estimatedGrossReceipts}
                    onChange={(e) => handleInputChange('estimatedGrossReceipts', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Estimated Subcontracting Costs</label>
                <div></div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.estimatedSubcontractingCosts}
                    onChange={(e) => handleInputChange('estimatedSubcontractingCosts', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Estimated Material Costs</label>
                <div></div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.estimatedMaterialCosts}
                    onChange={(e) => handleInputChange('estimatedMaterialCosts', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900"># of Active Owners in the Field</label>
                <div></div>
                <select
                  value={formData.activeOwners}
                  onChange={(e) => handleInputChange('activeOwners', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm"
                >
                  {Array.from({ length: 21 }, (_, i) => (
                    <option key={i} value={i}>{i >= 19 ? '19+' : i}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-start">
                <label className="text-sm font-medium text-gray-900 pt-2"># of Field Employees</label>
                <div></div>
                <div>
                  <select
                    value={formData.fieldEmployees}
                    onChange={(e) => handleInputChange('fieldEmployees', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm"
                  >
                    {Array.from({ length: 21 }, (_, i) => (
                      <option key={i} value={i}>{i >= 19 ? '19+' : i}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Including leased workers, temporary workers, volunteer workers, and any individuals for which a 1099 is provided.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Total Payroll Amount</label>
                <div></div>
                <select
                  value={formData.totalPayroll}
                  onChange={(e) => handleInputChange('totalPayroll', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] bg-white text-sm"
                >
                  <option value="">Select Payroll Range</option>
                  <option value="Under 15k">Under 15k</option>
                  <option value="15k-30k">15k-30k</option>
                  <option value="30k-50k">30k-50k</option>
                  <option value="50k-70k">50k-70k</option>
                  <option value="70k-90k">70k-90k</option>
                  <option value="90k-110k">90k-110k</option>
                  <option value="110k-150k">110k-150k</option>
                  <option value="Over 150k">Over 150k</option>
                </select>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Years in Business</label>
                <div></div>
                <input
                  type="number"
                  value={formData.yearsInBusiness}
                  onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Years of experience in the Trades for which you are applying for insurance</label>
                <div></div>
                <input
                  type="number"
                  value={formData.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm"
                />
              </div>
            </div>
            </div>
          </div>

          {/* Class Code Section */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <div className="bg-[#3A3C3F] text-white px-6 py-3.5">
              <h2 className="text-lg font-semibold">Class Code</h2>
            </div>
            <div className="px-8 pt-6 pb-7">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">Class Code</label>
              <select
                value=""
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] bg-white"
                onChange={(e) => {
                  const selectedCode = e.target.value;
                  if (selectedCode && !formData.classCodeWork[selectedCode]) {
                    const remaining = getRemainingClassCodePercent();
                    if (remaining > 0) {
                      handleClassCodeChange(selectedCode, remaining.toString());
                    }
                  }
                }}
                disabled={getRemainingClassCodePercent() === 0}
              >
                <option value="">Select Class Code</option>
                {classCodeOptions.filter(code => !formData.classCodeWork[code]).map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            <div className="text-right mb-4">
              <span className="text-sm font-semibold text-gray-700">Total: {calculateTotalClassCodePercent()}%</span>
            </div>

            {/* Display selected class codes */}
            {Object.keys(formData.classCodeWork).length > 0 && (
              <div className="border border-gray-200 rounded p-3 max-h-48 overflow-y-auto">
                {Object.entries(formData.classCodeWork).map(([code, percentage]) => (
                  <div key={code} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700">{code}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={percentage as string}
                        onChange={(e) => handleClassCodeChange(code, e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm text-center"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm text-gray-500">%</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newClassCodes = { ...formData.classCodeWork };
                          delete newClassCodes[code];
                          handleInputChange('classCodeWork', newClassCodes);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">
                  Percentage of work performed on New Construction Projects
                </label>
                <div></div>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.newConstructionPercent}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      const numVal = parseFloat(newVal) || 0;
                      if (numVal <= 100) {
                        handleInputChange('newConstructionPercent', newVal);
                        handleInputChange('remodelPercent', (100 - numVal).toString());
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">
                  Percentage of Remodel/Service/Repair work performed
                </label>
                <div></div>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.remodelPercent}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      const numVal = parseFloat(newVal) || 0;
                      if (numVal <= 100) {
                        handleInputChange('remodelPercent', newVal);
                        handleInputChange('newConstructionPercent', (100 - numVal).toString());
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">
                  Percentage of Residential work performed
                </label>
                <div></div>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.residentialPercent}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      const numVal = parseFloat(newVal) || 0;
                      if (numVal <= 100) {
                        handleInputChange('residentialPercent', newVal);
                        handleInputChange('commercialPercent', (100 - numVal).toString());
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">
                  Percentage of Commercial work performed
                </label>
                <div></div>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.commercialPercent}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      const numVal = parseFloat(newVal) || 0;
                      if (numVal <= 100) {
                        handleInputChange('commercialPercent', newVal);
                        handleInputChange('residentialPercent', (100 - numVal).toString());
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Limits Section */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <div className="bg-[#3A3C3F] text-white px-6 py-3.5">
              <h2 className="text-lg font-semibold">Limits</h2>
            </div>
            <div className="px-8 pt-6 pb-7">
            
            <div className="space-y-6 mt-1">
              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Coverage Limits</label>
                <div></div>
                <select
                  value={formData.coverageLimits}
                  onChange={(e) => handleInputChange('coverageLimits', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                >
                  <option>1M / 1M / 1M</option>
                  <option>1M / 2M / 1M</option>
                  <option>1M / 2M / 2M</option>
                </select>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Fire Legal Limit</label>
                <div></div>
                <select
                  value={formData.fireLegalLimit}
                  onChange={(e) => handleInputChange('fireLegalLimit', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                >
                  <option>$100,000</option>
                  <option>$300,000</option>
                </select>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Medical Expense Limit</label>
                <div></div>
                <select
                  value={formData.medicalExpenseLimit}
                  onChange={(e) => handleInputChange('medicalExpenseLimit', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                >
                  <option>$5,000</option>
                  <option>$10,000</option>
                </select>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Deductible</label>
                <div></div>
                <select
                  value={formData.deductible}
                  onChange={(e) => handleInputChange('deductible', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                >
                  <option>$10,000</option>
                  <option>$5,000</option>
                  <option>$2,500</option>
                  <option>$1,000</option>
                </select>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900"># Losses in last 5 years</label>
                <div></div>
                <select
                  value={formData.lossesLast5Years}
                  onChange={(e) => handleInputChange('lossesLast5Years', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                >
                  <option>0</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Desired Effective Date</label>
                <div></div>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  States in which you do business for which you are currently applying for insurance:
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-3">
                  {statesList.map((state) => (
                    <label key={state} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.selectedStates.includes(state)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('selectedStates', [...formData.selectedStates, state]);
                          } else {
                            handleInputChange('selectedStates', formData.selectedStates.filter((s: string) => s !== state));
                          }
                        }}
                        className="w-4 h-4 text-[#00BCD4] border-gray-300 rounded"
                      />
                      <span className="text-gray-700">{state}</span>
                    </label>
                  ))}
                </div>
              </div>

              <YesNoRadio
                label="Will you perform structural work?"
                value={formData.willPerformStructuralWork}
                onChange={(val) => handleInputChange('willPerformStructuralWork', val)}
                onInteraction={triggerAnimation}
              />
            </div>
            </div>
          </div>

          {/* Endorsements */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <div className="bg-[#3A3C3F] text-white px-6 py-3.5">
              <h2 className="text-lg font-semibold">Endorsements</h2>
            </div>
            <div className="px-8 pt-6 pb-7">
            
            <div className="space-y-2">
              {[
                { key: 'blanketAdditionalInsured', label: 'Blanket Additional Insured' },
                { key: 'blanketWaiverOfSubrogation', label: 'Blanket Waiver of Subrogation' },
                { key: 'blanketPrimaryWording', label: 'Blanket Primary Wording' },
                { key: 'blanketPerProjectAggregate', label: 'Blanket Per Project Aggregate' },
                { key: 'blanketCompletedOperations', label: 'Blanket Completed Operations' },
                { key: 'actsOfTerrorism', label: 'Acts of Terrorism' },
                { key: 'noticeCancellationThirdParties', label: 'Notice of Cancellation to Third Parties' },
              ].map((endorsement) => (
                <label key={endorsement.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData[endorsement.key]}
                    onChange={(e) => handleInputChange(endorsement.key, e.target.checked)}
                    className="w-4 h-4 text-[#00BCD4] border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{endorsement.label}</span>
                </label>
              ))}
            </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <div className="bg-[#3A3C3F] text-white px-6 py-3.5">
              <h2 className="text-lg font-semibold">Payment Options</h2>
            </div>
            <div className="px-8 pt-6 pb-7">
            
            <div className="space-y-6 mt-1">
              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Broker Fee</label>
                <div></div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.brokerFee}
                    onChange={(e) => handleInputChange('brokerFee', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Display Broker Fee Line on Retail Proposal?</label>
                <div></div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.displayBrokerFee === true}
                      onChange={() => {
                        handleInputChange('displayBrokerFee', true);
                        triggerAnimation();
                      }}
                      className="w-4 h-4 text-[#00BCD4] border-gray-300 focus:ring-[#00BCD4]"
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.displayBrokerFee === false}
                      onChange={() => {
                        handleInputChange('displayBrokerFee', false);
                        triggerAnimation();
                      }}
                      className="w-4 h-4 text-[#00BCD4] border-gray-300 focus:ring-[#00BCD4]"
                    />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-start">
                <label className="text-sm font-medium text-gray-900 pt-2">Payment Options</label>
                <div></div>
                <div>
                  <select
                    value={formData.paymentOption}
                    onChange={(e) => handleInputChange('paymentOption', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  >
                    <option value="">Select payment option</option>
                    <option value="Full Pay">Full Pay</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Financing options will not be available until the zip is filled out and a product is selected.
                  </p>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <div className="bg-[#3A3C3F] text-white px-6 py-3.5">
              <h2 className="text-lg font-semibold">Company Information</h2>
            </div>
            <div className="px-8 pt-6 pb-7">
            
            <div className="space-y-6 mt-1">
              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Do you hold a contractors license?</label>
                <div></div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.contractorsLicense === true}
                      onChange={() => handleInputChange('contractorsLicense', true)}
                      className="w-4 h-4 text-[#00BCD4] border-gray-300 focus:ring-[#00BCD4]"
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.contractorsLicense === false}
                      onChange={() => handleInputChange('contractorsLicense', false)}
                      className="w-4 h-4 text-[#00BCD4] border-gray-300 focus:ring-[#00BCD4]"
                    />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {formData.contractorsLicense && (
                <>
                  <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                    <label className="text-sm font-medium text-gray-900">License #</label>
                    <div></div>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                    <label className="text-sm font-medium text-gray-900">License Classification</label>
                    <div></div>
                    <input
                      type="text"
                      value={formData.licenseClassification}
                      onChange={(e) => handleInputChange('licenseClassification', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">DBA</label>
                <div></div>
                <input
                  type="text"
                  value={formData.dba}
                  onChange={(e) => handleInputChange('dba', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  placeholder="Doing Business As"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">First Name</label>
                <div></div>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Last Name</label>
                <div></div>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Entity of Company</label>
                <div></div>
                <select
                  value={formData.entityType}
                  onChange={(e) => handleInputChange('entityType', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                >
                  <option>Individual</option>
                  <option>Corporation</option>
                  <option>Partnership</option>
                  <option>LLC</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-start">
                <label className="text-sm font-medium text-gray-900 pt-2">
                  Company FEIN
                  <span className="text-blue-500 ml-1 cursor-help" title="Federal Employer Identification Number">ⓘ</span>
                </label>
                <div></div>
                <div>
                  <input
                    type="text"
                    value={formData.applicantSSN}
                    onChange={(e) => {
                      const value = e.target.value;
                      const formatted = formatFEIN(value);
                      handleInputChange('applicantSSN', formatted);
                      validateFEIN(formatted);
                    }}
                    className={`w-full px-4 py-2.5 border rounded focus:ring-1 focus:ring-[#00BCD4] text-sm ${
                      validationErrors.fein ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="23-4453456"
                    maxLength={10}
                  />
                  {validationErrors.fein && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-red-600">⚠</span>
                      <span className="text-sm text-red-600">{validationErrors.fein}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-start">
                <label className="text-sm font-medium text-gray-900 pt-2">Applicant Phone</label>
                <div></div>
                <div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      const formatted = formatPhone(value);
                      handleInputChange('phone', formatted);
                      validatePhone(formatted, 'phone');
                    }}
                    className={`w-full px-4 py-2.5 border rounded focus:ring-1 focus:ring-[#00BCD4] text-sm ${
                      validationErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="(123) 456-7890"
                    maxLength={14}
                  />
                  {validationErrors.phone && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-red-600">⚠</span>
                      <span className="text-sm text-red-600">{validationErrors.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-start">
                <label className="text-sm font-medium text-gray-900 pt-2">Applicant Fax</label>
                <div></div>
                <div>
                  <input
                    type="tel"
                    value={formData.fax}
                    onChange={(e) => {
                      const value = e.target.value;
                      const formatted = formatPhone(value);
                      handleInputChange('fax', formatted);
                      validatePhone(formatted, 'fax');
                    }}
                    className={`w-full px-4 py-2.5 border rounded focus:ring-1 focus:ring-[#00BCD4] text-sm ${
                      validationErrors.fax ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="(123) 456-7890"
                    maxLength={14}
                  />
                  {validationErrors.fax && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-red-600">⚠</span>
                      <span className="text-sm text-red-600">{validationErrors.fax}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Applicant Email</label>
                <div></div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  placeholder="insured@example.com"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Website address</label>
                <div></div>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  placeholder="example.com"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-center">
                <label className="text-sm font-medium text-gray-900">Does the carrier approved description thoroughly describe the work you will be performing?</label>
                <div></div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.carrierDescriptionOk === true}
                      onChange={() => handleInputChange('carrierDescriptionOk', true)}
                      className="w-4 h-4 text-[#00BCD4] border-gray-300 focus:ring-[#00BCD4]"
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.carrierDescriptionOk === false}
                      onChange={() => handleInputChange('carrierDescriptionOk', false)}
                      className="w-4 h-4 text-[#00BCD4] border-gray-300 focus:ring-[#00BCD4]"
                    />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr_320px] gap-x-6 items-start">
                <label className="text-sm font-medium text-gray-900 pt-2">Carrier Approved Description</label>
                <div></div>
                <textarea
                  value={formData.carrierApprovedDescription}
                  onChange={(e) => handleInputChange('carrierApprovedDescription', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  placeholder="Describe operations for which you are currently applying for insurance"
                />
              </div>
            </div>
            </div>
          </div>

          {/* Applicant Physical Location */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <div className="bg-[#3A3C3F] text-white px-6 py-3.5">
              <h2 className="text-lg font-semibold">Applicant Physical Location</h2>
            </div>
            <div className="px-8 pt-6 pb-7">
            
            <div className="space-y-7 mt-1">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Address
                  <span className="ml-1 text-xs text-gray-500">(? icon would show help)</span>
                </label>
                <input
                  ref={addressInputRef}
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  placeholder="Start typing address..."
                  autoComplete="off"
                />
                {isGoogleLoaded && (
                  <div className="mt-1 text-xs text-gray-400 flex items-center justify-end gap-1">
                    <span>powered by</span>
                    <span className="font-semibold">Google</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Apt/Suite</label>
                  <input
                    type="text"
                    value={formData.aptSuite}
                    onChange={(e) => handleInputChange('aptSuite', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    placeholder="Apt. #24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  />
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Applicant Mailing Address */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <div className="bg-[#3A3C3F] text-white px-6 py-3.5">
              <h2 className="text-lg font-semibold">Applicant Mailing Address</h2>
            </div>
            <div className="px-8 pt-6 pb-7">
            
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={formData.mailingAddressSame}
                onChange={(e) => handleInputChange('mailingAddressSame', e.target.checked)}
                className="w-4 h-4 text-[#00BCD4] border-gray-300 rounded"
              />
              <span className="text-sm font-semibold text-gray-700">Same as physical location</span>
            </label>

            {!formData.mailingAddressSame && (
              <div className="space-y-7 mt-1">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Street Address</label>
                  <input
                    type="text"
                    value={formData.mailingStreet}
                    onChange={(e) => handleInputChange('mailingStreet', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Apt/Suite</label>
                    <input
                      type="text"
                      value={formData.mailingAptSuite}
                      onChange={(e) => handleInputChange('mailingAptSuite', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Zip</label>
                    <input
                      type="text"
                      value={formData.mailingZip}
                      onChange={(e) => handleInputChange('mailingZip', e.target.value)}
                      maxLength={5}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">City</label>
                    <input
                      type="text"
                      value={formData.mailingCity}
                      onChange={(e) => handleInputChange('mailingCity', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">State</label>
                  <select
                    value={formData.mailingState}
                    onChange={(e) => handleInputChange('mailingState', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  >
                    {statesList.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Resume Questions */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <div className="bg-[#3A3C3F] text-white px-6 py-3.5">
              <h2 className="text-lg font-semibold">Resume Questions</h2>
            </div>
            <div className="px-8 pt-6 pb-7">
            
            <div className="space-y-7 mt-1">
              <YesNoRadio
                label="If applicable, do your employees and sub contractors have at least 3 years experience in the trades they're performing?"
                value={formData.employeesHave3YearsExp}
                onChange={(val) => handleInputChange('employeesHave3YearsExp', val)}
              />

              <YesNoRadio
                label="Do you have experience in a construction-related supervisory/management role?"
                value={formData.hasConstructionSupervisionExp}
                onChange={(val) => handleInputChange('hasConstructionSupervisionExp', val)}
              />

              <YesNoRadio
                label="Do you have any education, training, or certifications pertaining to the construction industry?"
                value={formData.hasConstructionCertifications}
                onChange={(val) => handleInputChange('hasConstructionCertifications', val)}
              />

              {formData.hasConstructionCertifications && (
                <div className="pl-4 border-l-2 border-gray-200">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Please explain:</label>
                  <textarea
                    value={formData.certificationsExplanation}
                    onChange={(e) => handleInputChange('certificationsExplanation', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  />
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Type of Work Performed */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <div className="bg-[#3A3C3F] text-white px-6 py-3.5">
              <h2 className="text-lg font-semibold">Type of Work Performed</h2>
            </div>
            <div className="px-8 pt-6 pb-7">
            
            <div className="space-y-7 mt-1">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Maximum # of Interior Stories</label>
                <input
                  type="number"
                  value={formData.maxInteriorStories}
                  onChange={(e) => handleInputChange('maxInteriorStories', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Maximum # of Exterior Stories</label>
                <input
                  type="number"
                  value={formData.maxExteriorStories}
                  onChange={(e) => handleInputChange('maxExteriorStories', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm"
                  min="0"
                />
              </div>

              <YesNoRadio
                label="Will you or any subcontractor perform work below grade?"
                value={formData.workBelowGrade}
                onChange={(val) => handleInputChange('workBelowGrade', val)}
              />

              {formData.workBelowGrade && (
                <div className="grid grid-cols-2 gap-6 pl-4 border-l-2 border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">What is the Maximum Depth in feet</label>
                    <input
                      type="number"
                      value={formData.belowGradeDepth}
                      onChange={(e) => handleInputChange('belowGradeDepth', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">What is the Percentage of operations</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.belowGradePercent}
                        onChange={(e) => handleInputChange('belowGradePercent', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                        max="100"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              )}

              <YesNoRadio
                label="Have you or will you build on a hillside?"
                value={formData.buildOnHillside}
                onChange={(val) => handleInputChange('buildOnHillside', val)}
              />

              {formData.buildOnHillside && (
                <div className="pl-4 border-l-2 border-gray-200">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Please explain:</label>
                  <textarea
                    value={formData.hillsideExplanation}
                    onChange={(e) => handleInputChange('hillsideExplanation', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  />
                </div>
              )}

              <YesNoRadio
                label="Will you perform or subcontract any roofing operations, work on the roof or deck work on roofs?"
                value={formData.performRoofingOps}
                onChange={(val) => handleInputChange('performRoofingOps', val)}
              />

              {formData.performRoofingOps && (
                <div className="pl-4 border-l-2 border-gray-200">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Please explain:</label>
                  <textarea
                    value={formData.roofingOpsExplanation}
                    onChange={(e) => handleInputChange('roofingOpsExplanation', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  />
                </div>
              )}

              <YesNoRadio
                label="Will you be acting as the General Contractor on any projects?"
                value={formData.actAsGeneralContractor}
                onChange={(val) => handleInputChange('actAsGeneralContractor', val)}
              />

              {formData.actAsGeneralContractor && (
                <div className="pl-4 border-l-2 border-gray-200">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Please explain:</label>
                  <textarea
                    value={formData.generalContractorExplanation}
                    onChange={(e) => handleInputChange('generalContractorExplanation', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  />
                </div>
              )}

              <YesNoRadio
                label="Will you perform any waterproofing?"
                value={formData.performWaterproofing}
                onChange={(val) => handleInputChange('performWaterproofing', val)}
              />

              {formData.performWaterproofing && (
                <div className="pl-4 border-l-2 border-gray-200">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Please explain:</label>
                  <textarea
                    value={formData.waterproofingExplanation}
                    onChange={(e) => handleInputChange('waterproofingExplanation', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  />
                </div>
              )}

              <YesNoRadio
                label="Do you use motorized or heavy equipment in any of your operations?"
                value={formData.useHeavyEquipment}
                onChange={(val) => handleInputChange('useHeavyEquipment', val)}
              />

              {formData.useHeavyEquipment && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Please explain:</label>
                    <textarea
                      value={formData.heavyEquipmentExplanation}
                      onChange={(e) => handleInputChange('heavyEquipmentExplanation', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    />
                  </div>
                  
                  <YesNoRadio
                    label="Are you and all employees that operate heavy equipment certified to do so?"
                    value={formData.heavyEquipmentOperatorsCertified}
                    onChange={(val) => handleInputChange('heavyEquipmentOperatorsCertified', val)}
                  />

                  {!formData.heavyEquipmentOperatorsCertified && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        If no, advise on # of years experience required to operate heavy equipment
                      </label>
                      <input
                        type="number"
                        value={formData.heavyEquipmentYearsExpRequired}
                        onChange={(e) => handleInputChange('heavyEquipmentYearsExpRequired', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              <YesNoRadio
                label="Will you perform work in new tract home developments of 15 or more units?"
                value={formData.workNewTractHomes}
                onChange={(val) => handleInputChange('workNewTractHomes', val)}
              />

              {formData.workNewTractHomes && (
                <div className="pl-4 border-l-2 border-gray-200">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Please explain:</label>
                  <textarea
                    value={formData.tractHomesExplanation}
                    onChange={(e) => handleInputChange('tractHomesExplanation', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  />
                </div>
              )}

              <YesNoRadio
                label="Will any of your work involve the construction of or be for new condominiums/townhouses/multi-unit residences?"
                value={formData.workCondoConstruction}
                onChange={(val) => handleInputChange('workCondoConstruction', val)}
              />

              {formData.workCondoConstruction && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Please explain:</label>
                    <textarea
                      value={formData.condoConstructionExplanation}
                      onChange={(e) => handleInputChange('condoConstructionExplanation', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    />
                  </div>
                  
                  <YesNoRadio
                    label="Will any of the complexes contain 15 or more units?"
                    value={formData.condoUnits15OrMore}
                    onChange={(val) => handleInputChange('condoUnits15OrMore', val)}
                  />
                </div>
              )}

              <YesNoRadio
                label="Will you perform structural repair of condominiums/townhouses/multi-unit residences?"
                value={formData.performCondoStructuralRepair}
                onChange={(val) => handleInputChange('performCondoStructuralRepair', val)}
              />

              {formData.performCondoStructuralRepair && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Please explain:</label>
                    <textarea
                      value={formData.condoRepairExplanation}
                      onChange={(e) => handleInputChange('condoRepairExplanation', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    />
                  </div>
                  
                  <YesNoRadio
                    label="Will any of the complexes contain 15 or more units?"
                    value={formData.condoRepairUnits15OrMore}
                    onChange={(val) => handleInputChange('condoRepairUnits15OrMore', val)}
                  />
                </div>
              )}

              <YesNoRadio
                label="Will you perform OCIP (Wrap-up) work?"
                value={formData.performOCIPWork}
                onChange={(val) => handleInputChange('performOCIPWork', val)}
              />

              <YesNoRadio
                label="Will you or do you perform or subcontract any work involving the following: blasting operations, hazardous waste, asbestos, mold, PCBs, museums, historic buildings, oil fields, dams/levees, bridges, quarries, railroads, earthquake retrofitting, fuel tanks, pipelines, or foundation repair?"
                value={formData.performHazardousWork}
                onChange={(val) => handleInputChange('performHazardousWork', val)}
              />

              {formData.performHazardousWork && (
                <div className="pl-4 border-l-2 border-gray-200">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Please explain:</label>
                  <textarea
                    value={formData.hazardousWorkExplanation}
                    onChange={(e) => handleInputChange('hazardousWorkExplanation', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                  />
                </div>
              )}

              <YesNoRadio
                label="Will you perform work (new/remodel) on single family residences, in which the dwelling exceeds 5,000 square feet?"
                value={formData.workOver5000SqFt}
                onChange={(val) => handleInputChange('workOver5000SqFt', val)}
              />

              {formData.workOver5000SqFt && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">Please explain:</label>
                    <textarea
                      value={formData.over5000SqFtExplanation}
                      onChange={(e) => handleInputChange('over5000SqFtExplanation', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      What percentage of your work will be on homes over 5,000 square feet?
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.over5000SqFtPercent}
                        onChange={(e) => handleInputChange('over5000SqFtPercent', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                        max="100"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Additional Business Information */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <div className="bg-[#3A3C3F] text-white px-6 py-3.5">
              <h2 className="text-lg font-semibold">Additional Business Information</h2>
            </div>
            <div className="px-8 pt-6 pb-7">
            
            <div className="space-y-7 mt-1">
              <YesNoRadio
                label="Do you perform Industrial Operations?"
                value={formData.performIndustrialOps}
                onChange={(val) => handleInputChange('performIndustrialOps', val)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  List any other business names which you have used in the past or are currently using in addition to that for which you're currently applying for insurance
                </label>
                <textarea
                  value={formData.otherBusinessNames}
                  onChange={(e) => handleInputChange('otherBusinessNames', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#00BCD4] text-sm"
                />
              </div>

              <YesNoRadio
                label="Have you been cited for an OSHA violation more than once in the last 3 years?"
                value={formData.citedForOSHAViolations}
                onChange={(val) => handleInputChange('citedForOSHAViolations', val)}
              />

              <YesNoRadio
                label="Are the number of years in business and loss information provided verifiable with company loss runs?"
                value={formData.lossInfoVerifiable}
                onChange={(val) => handleInputChange('lossInfoVerifiable', val)}
              />

              <YesNoRadio
                label="Has any licensing authority taken any action against you, your company, or any affiliates?"
                value={formData.licensingActionTaken}
                onChange={(val) => handleInputChange('licensingActionTaken', val)}
              />

              <YesNoRadio
                label="Have you allowed or will you allow your license to be used by another contractor?"
                value={formData.allowedLicenseUseByOthers}
                onChange={(val) => handleInputChange('allowedLicenseUseByOthers', val)}
              />

              <YesNoRadio
                label="Has any lawsuit ever been filed or any claim otherwise been made against your company?"
                value={formData.lawsuitsFiled}
                onChange={(val) => handleInputChange('lawsuitsFiled', val)}
              />

              <YesNoRadio
                label="Is your company aware of any facts, circumstances, incidents, situations, damages or accidents that might give rise to a claim or lawsuit?"
                value={formData.awareOfPotentialClaims}
                onChange={(val) => handleInputChange('awareOfPotentialClaims', val)}
              />

              <YesNoRadio
                label="Do you have a written contract for all work you perform?"
                value={formData.hasWrittenContracts}
                onChange={(val) => handleInputChange('hasWrittenContracts', val)}
              />

              {formData.hasWrittenContracts && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                  <YesNoRadio
                    label="Does the contract identify a start date for the work?"
                    value={formData.contractHasStartDate}
                    onChange={(val) => handleInputChange('contractHasStartDate', val)}
                  />

                  <YesNoRadio
                    label="Does the contract identify a precise scope of work?"
                    value={formData.contractHasScopeOfWork}
                    onChange={(val) => handleInputChange('contractHasScopeOfWork', val)}
                  />

                  <YesNoRadio
                    label="Does the contract identify all subcontracted trades (if any)?"
                    value={formData.contractIdentifiesSubcontractors}
                    onChange={(val) => handleInputChange('contractIdentifiesSubcontractors', val)}
                  />

                  <YesNoRadio
                    label="Does the contract provide a set price?"
                    value={formData.contractHasSetPrice}
                    onChange={(val) => handleInputChange('contractHasSetPrice', val)}
                  />

                  <YesNoRadio
                    label="Is the contract signed by all parties to the contract?"
                    value={formData.contractSignedByAllParties}
                    onChange={(val) => handleInputChange('contractSignedByAllParties', val)}
                  />
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Excess Liability Coverage */}
          <div className="bg-white rounded shadow-md overflow-hidden border border-gray-200">
            <div className="bg-[#3A3C3F] text-white px-6 py-3.5">
              <h2 className="text-lg font-semibold">Add Excess Liability coverage</h2>
            </div>
            <div className="px-8 pt-6 pb-7">
            
            <div className="space-y-7 mt-1">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Add Excess Liability</h3>
                <p className="text-sm font-semibold text-gray-700 mb-1">Sutton – A-, VII Rated</p>
                <p className="text-sm text-gray-600 mb-1">Non-Admitted</p>
                <p className="text-sm text-gray-600">Covers General Liability, Auto, Employers Liability</p>
              </div>

              <YesNoRadio
                label="Would you like to add Excess Liability coverage?"
                value={formData.addExcessLiability}
                onChange={(val) => handleInputChange('addExcessLiability', val)}
              />
            </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-6">
            <Link
              href="/agency/dashboard"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-50"
            >
              Return to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              {/* Download PDF Button */}
              <button
                type="button"
                onClick={handleDownloadApplicationPDF}
                disabled={isSubmitting || isDownloadingPDF}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                title="Download Application PDF"
              >
                {isDownloadingPDF ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-[#00BCD4] to-[#0097A7] text-white rounded font-bold hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quote Result */}
        {calculatedPremium && quoteId && (
          <div id="quote-result" className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-[#3A3C3F] text-white px-6 py-3.5">
              <h2 className="text-lg font-semibold">Quote Summary</h2>
            </div>
            <div className="px-8 pt-6 pb-7">

            <div className="bg-gradient-to-br from-[#00BCD4] to-[#0097A7] rounded-2xl p-8 text-center text-white shadow-2xl mb-6">
              <p className="text-lg font-semibold mb-2 opacity-90">As Low As</p>
              <p className="text-6xl font-bold mb-2">${calculatedPremium.toLocaleString()}</p>
              <p className="text-sm opacity-75">per year</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleDownloadPDF}
                className="flex-1 py-4 border-2 border-[#00BCD4] text-[#00BCD4] rounded font-semibold hover:bg-[#00BCD4]/5 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Quote PDF
              </button>
              <button
                onClick={handleEmailQuote}
                className="flex-1 py-4 bg-gradient-to-r from-[#00BCD4] to-[#0097A7] text-white rounded font-semibold hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Quote to Client
              </button>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Completion Percentage Indicator - Fixed Bottom Right */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative">
          {/* Circular Progress */}
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="url(#progressGradient)"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - completionPercentage / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00BCD4" />
                <stop offset="100%" stopColor="#0097A7" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Percentage Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{completionPercentage}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
