import type { ServiceNowDomain, DomainInfo } from '@/types';

// Domain definitions with exam code mappings
export const SERVICENOW_DOMAINS: Record<ServiceNowDomain, DomainInfo> = {
  "ITSM": {
    id: "ITSM",
    name: "IT Service Management",
    description: "Core ITSM processes, incident, problem, change management",
    examCodes: ["CIS-ITSM", "CIS-EM", "CIS-Discovery", "CIS-SM"],
    color: "bg-blue-500"
  },
  "Security": {
    id: "Security",
    name: "Security & Risk",
    description: "Security incident response, vulnerability & risk management",
    examCodes: ["CIS-SIR", "CIS-VR", "CIS-VRM", "CIS-RC"],
    color: "bg-red-500"
  },
  "HR": {
    id: "HR",
    name: "Human Resources",
    description: "HR service delivery and case management",
    examCodes: ["CIS-HR"],
    color: "bg-green-500"
  },
  "Asset Management": {
    id: "Asset Management",
    name: "Asset Management",
    description: "Hardware and software asset lifecycle management",
    examCodes: ["CIS-HAM", "CIS-SAM"],
    color: "bg-purple-500"
  },
  "Service Management": {
    id: "Service Management",
    name: "Service Management",
    description: "Customer and field service management",
    examCodes: ["CIS-CSM", "CIS-FSM"],
    color: "bg-orange-500"
  },
  "Portfolio Management": {
    id: "Portfolio Management",
    name: "Portfolio Management", 
    description: "Project, strategic portfolio and application portfolio management",
    examCodes: ["CIS-PPM", "CIS-SPM", "CIS-APM"],
    color: "bg-indigo-500"
  },
  "Development": {
    id: "Development",
    name: "Development & Analytics",
    description: "Application development and performance analytics",
    examCodes: ["CAD", "CAS-PA"],
    color: "bg-yellow-500"
  },
  "Infrastructure": {
    id: "Infrastructure",
    name: "Infrastructure & Cloud",
    description: "System administration and cloud provisioning",
    examCodes: ["CSA", "CIS-CPG"],
    color: "bg-cyan-500"
  }
};

/**
 * Get the ServiceNow domain for a given exam code
 */
export const getDomainForExam = (examCode: string): ServiceNowDomain | null => {
  for (const [domain, info] of Object.entries(SERVICENOW_DOMAINS)) {
    if (info.examCodes.includes(examCode)) {
      return domain as ServiceNowDomain;
    }
  }
  return null;
};

/**
 * Get all exam codes for a specific domain
 */
export const getExamsForDomain = (domain: ServiceNowDomain): string[] => {
  return SERVICENOW_DOMAINS[domain]?.examCodes || [];
};

/**
 * Get domain info by domain ID
 */
export const getDomainInfo = (domain: ServiceNowDomain): DomainInfo | null => {
  return SERVICENOW_DOMAINS[domain] || null;
};

/**
 * Get all available domains
 */
export const getAllDomains = (): ServiceNowDomain[] => {
  return Object.keys(SERVICENOW_DOMAINS) as ServiceNowDomain[];
};

/**
 * Get heatmap color class based on accuracy percentage
 */
export const getAccuracyColorClass = (accuracy: number): string => {
  if (accuracy >= 80) return "bg-green-500"; // Excellent
  if (accuracy >= 60) return "bg-yellow-500"; // Average  
  return "bg-red-500"; // Needs improvement
};

/**
 * Get text color class for heatmap cell text based on accuracy
 */
export const getAccuracyTextColorClass = (): string => {
  return "text-white"; // All backgrounds are dark enough for white text
};

/**
 * Format accuracy percentage for display
 */
export const formatAccuracy = (accuracy: number): string => {
  return `${Math.round(accuracy)}%`;
};

/**
 * Get performance level description based on accuracy
 */
export const getPerformanceLevel = (accuracy: number): string => {
  if (accuracy >= 80) return "Excellent";
  if (accuracy >= 60) return "Average";
  return "Needs Improvement";
};

/**
 * Get domain color based on accuracy (used in components)
 */
export const getDomainColor = (accuracy: number): string => {
  return getAccuracyColorClass(accuracy);
};