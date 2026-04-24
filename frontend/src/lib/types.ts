export type Placement = {
  id: string;
  title: string;
  description: string;
  requiredDepartment?: string | null;
  state: string;
  isRemote: boolean;
  totalSlots: number;
  filledSlots: number;
  status?: "DRAFT" | "ACTIVE" | "CLOSED";
  applicationDeadline: string;
};

export type ScoredPlacement = {
  placement: Placement;
  matchScore: number;
  breakdown: {
    location: number;
    department: number;
    level: number;
    cgpa: number;
  };
};

export type OrganizationSummary = {
  id: string;
  companyName: string;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
};

export type ApplicationItem = {
  id: string;
  status:
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "ACCEPTED"
    | "REJECTED"
    | "WITHDRAWN"
    | "PLACEMENT_CONFIRMED";
  createdAt: string;
  placement: Placement & {
    organization?: OrganizationSummary;
  };
};

export type StudentDashboardStats = {
  totalApplications: number;
  submitted: number;
  underReview: number;
  accepted: number;
  rejected: number;
  placementConfirmed: number;
};

export type OrganizationDashboardStats = {
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  totalPlacements: number;
  activePlacements: number;
  totalApplications: number;
  acceptedStudents: number;
  totalSlots: number;
  filledSlots: number;
};

export type CoordinatorOverviewStats = {
  totalStudents: number;
  totalOrganizations: number;
  pendingOrganizations: number;
  totalPlacements: number;
  activePlacements: number;
  totalApplications: number;
  confirmedApplications: number;
};

export type CoordinatorAnalytics = {
  overview: CoordinatorOverviewStats;
  placementByState: Array<{ state: string; count: number }>;
  applicationByStatus: Array<{ status: string; count: number }>;
};

export type AuthUser = {
  id: string;
  email: string;
  role: "STUDENT" | "ORGANIZATION" | "COORDINATOR";
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type StudentProfile = {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  level: string;
  cgpa?: number | null;
  currentState: string;
  preferredStates: string[];
};

export type OrganizationProfile = {
  id: string;
  companyName: string;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
};

export type CoordinatorStudent = {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  level: string;
  currentState: string;
  user: {
    email: string;
    isActive: boolean;
  };
  applications: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
};

export type CoordinatorStudentDetail = Omit<CoordinatorStudent, "applications"> & {
  applications: Array<{
    id: string;
    status: string;
    createdAt: string;
    placement: Placement & {
      organization?: OrganizationSummary;
    };
  }>;
};

export type CoordinatorAnnouncement = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  recipients: number;
};
