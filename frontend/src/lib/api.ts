import {
  ApplicationItem,
  AuthTokens,
  CoordinatorAnalytics,
  CoordinatorAnnouncement,
  CoordinatorOverviewStats,
  CoordinatorStudentDetail,
  CoordinatorStudent,
  OrganizationDashboardStats,
  OrganizationProfile,
  OrganizationSummary,
  Placement,
  ScoredPlacement,
  StudentDashboardStats,
  StudentProfile
} from "./types";

let envApiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
if (!envApiUrl.endsWith("/api/v1")) {
  envApiUrl += "/api/v1";
}
const API_BASE_URL = envApiUrl;

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Request failed";
    let errors: { field: string; message: string }[] | undefined;
    try {
      const body = (await response.json()) as { message?: string; errors?: { field: string; message: string }[] };
      if (body.errors && body.errors.length > 0) {
        message = body.errors.map((e) => `${e.field}: ${e.message}`).join(", ");
        errors = body.errors;
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      message = response.statusText || message;
    }
    const error = new Error(message);
    (error as any).errors = errors;
    throw error;
  }

  if (response.status === 204) return {} as T;
  return (await response.json()) as T;
}

async function publicRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });
  return parseResponse<T>(response);
}

async function authRequest<T>(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });
  return parseResponse<T>(response);
}

async function authMultipartRequest<T>(path: string, token: string, formData: FormData) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData,
    cache: "no-store"
  });
  return parseResponse<T>(response);
}

export async function loginUser(email: string, password: string): Promise<AuthTokens> {
  return publicRequest<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  return publicRequest<AuthTokens>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  });
}

export async function registerStudent(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
  level: string;
  cgpa?: number;
  currentState: string;
  preferredStates: string[];
}) {
  return publicRequest<{ message: string }>("/auth/register/student", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function registerOrganization(payload: {
  email: string;
  password: string;
  companyName: string;
}) {
  return publicRequest<{ message: string }>("/auth/register/organization", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function registerCoordinator(payload: {
  email: string;
  password: string;
  fullName: string;
  inviteCode: string;
}) {
  return publicRequest<{ message: string }>("/auth/register/coordinator", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function verifyEmailToken(token: string): Promise<AuthTokens> {
  return publicRequest<AuthTokens>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token })
  });
}

export async function forgotPassword(email: string) {
  return publicRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export async function resetPassword(token: string, password: string) {
  return publicRequest<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password })
  });
}

export async function getPublicPlacements() {
  const body = await publicRequest<{ data: Placement[] }>("/placements");
  return body.data;
}

export async function getPlacementDetail(id: string) {
  const body = await publicRequest<{ data: Placement & { organization?: OrganizationSummary } }>(
    `/placements/${id}`
  );
  return body.data;
}

export async function getMatchedPlacements(token: string): Promise<ScoredPlacement[]> {
  const body = await authRequest<{ data: ScoredPlacement[] }>("/students/placements", token);
  return body.data;
}

export async function getRecommendedPlacements(token: string): Promise<ScoredPlacement[]> {
  const body = await authRequest<{ data: ScoredPlacement[] }>(
    "/students/placements/recommended",
    token
  );
  return body.data;
}

export async function getStudentDashboardStats(token: string): Promise<StudentDashboardStats> {
  const body = await authRequest<{ data: StudentDashboardStats }>(
    "/students/dashboard/stats",
    token
  );
  return body.data;
}

export async function getStudentProfile(token: string): Promise<StudentProfile> {
  const body = await authRequest<{ data: StudentProfile }>("/students/profile", token);
  return body.data;
}

export async function updateStudentProfile(
  token: string,
  payload: Partial<
    Pick<
      StudentProfile,
      "firstName" | "lastName" | "department" | "level" | "cgpa" | "currentState"
    >
  >
) {
  return authRequest<{ message: string }>("/students/profile", token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateStudentPreferences(
  token: string,
  payload: Pick<StudentProfile, "currentState" | "preferredStates">
) {
  return authRequest<{ message: string }>("/students/profile/preferences", token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function getStudentApplications(token: string): Promise<ApplicationItem[]> {
  const body = await authRequest<{ data: ApplicationItem[] }>("/students/applications", token);
  return body.data;
}

export async function getStudentApplicationById(token: string, id: string) {
  const body = await authRequest<{ data: ApplicationItem }>(`/students/applications/${id}`, token);
  return body.data;
}

export async function applyToPlacement(token: string, placementId: string) {
  return authRequest<{ message: string; data: { id: string } }>("/students/applications", token, {
    method: "POST",
    body: JSON.stringify({ placementId })
  });
}

export async function applyToPlacementDetailed(
  token: string,
  payload: {
    placementId: string;
    coverLetter?: string;
    resumeUrl?: string;
    additionalDocs?: string[];
  }
) {
  return authRequest<{ message: string; data: { id: string } }>("/students/applications", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function withdrawApplication(token: string, applicationId: string) {
  return authRequest<{ message: string }>(`/students/applications/${applicationId}`, token, {
    method: "DELETE"
  });
}

export async function getOrganizationDashboardStats(
  token: string
): Promise<OrganizationDashboardStats> {
  const body = await authRequest<{ data: OrganizationDashboardStats }>(
    "/organizations/dashboard/stats",
    token
  );
  return body.data;
}

export async function getOrganizationProfile(token: string): Promise<OrganizationProfile> {
  const body = await authRequest<{ data: OrganizationProfile }>("/organizations/profile", token);
  return body.data;
}

export async function updateOrganizationProfile(
  token: string,
  payload: Partial<OrganizationProfile>
) {
  return authRequest<{ message: string }>("/organizations/profile", token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function uploadStudentResume(token: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return authMultipartRequest<{ message: string; data: { resumeUrl: string } }>(
    "/students/profile/resume",
    token,
    form
  );
}

export async function uploadOrganizationDocument(
  token: string,
  file: File,
  documentType: "cac" | "itf" | "logo"
) {
  const form = new FormData();
  form.append("file", file);
  form.append("documentType", documentType);
  return authMultipartRequest<{
    message: string;
    data: { cacDocumentUrl?: string; itfDocumentUrl?: string; logoUrl?: string };
  }>("/organizations/profile/documents", token, form);
}

export async function getOrganizationPlacements(token: string) {
  const body = await authRequest<{ data: Placement[] }>("/organizations/placements", token);
  return body.data;
}

export async function getOrganizationPlacementById(token: string, id: string) {
  const body = await authRequest<{ data: Placement }>(`/organizations/placements/${id}`, token);
  return body.data;
}

export async function createPlacement(
  token: string,
  payload: {
    title: string;
    description: string;
    state: string;
    totalSlots: number;
    applicationDeadline: string;
    isRemote?: boolean;
    requiredDepartment?: string;
  }
) {
  return authRequest<{ message: string }>(`/organizations/placements`, token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updatePlacement(
  token: string,
  placementId: string,
  payload: Partial<{
    title: string;
    description: string;
    state: string;
    totalSlots: number;
    applicationDeadline: string;
    isRemote: boolean;
    requiredDepartment?: string;
  }>
) {
  return authRequest<{ message: string }>(`/organizations/placements/${placementId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updatePlacementStatus(
  token: string,
  placementId: string,
  status: "DRAFT" | "ACTIVE" | "CLOSED"
) {
  return authRequest<{ message: string }>(
    `/organizations/placements/${placementId}/status`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ status })
    }
  );
}

export async function getOrganizationApplications(token: string) {
  const body = await authRequest<{
    data: Array<{
      id: string;
      status: string;
      createdAt: string;
      student: { firstName: string; lastName: string; department: string; level: string };
      placement: { id: string; title: string; status: string };
    }>;
  }>("/organizations/applications", token);
  return body.data;
}

export async function getOrganizationApplicationById(token: string, id: string) {
  const body = await authRequest<{
    data: {
      id: string;
      status: string;
      createdAt: string;
      student: StudentProfile;
      placement: Placement;
    };
  }>(`/organizations/applications/${id}`, token);
  return body.data;
}

export async function updateOrganizationApplicationStatus(
  token: string,
  applicationId: string,
  status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "PLACEMENT_CONFIRMED"
) {
  return authRequest<{ message: string }>(
    `/organizations/applications/${applicationId}/status`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ status })
    }
  );
}

export async function confirmOrganizationPlacement(token: string, applicationId: string) {
  return authRequest<{ message: string }>(
    `/organizations/applications/${applicationId}/confirm`,
    token,
    { method: "POST" }
  );
}

export async function getCoordinatorDashboardStats(
  token: string
): Promise<CoordinatorOverviewStats> {
  const body = await authRequest<{ data: CoordinatorOverviewStats }>(
    "/coordinator/dashboard/stats",
    token
  );
  return body.data;
}

export async function getCoordinatorAnalytics(token: string): Promise<CoordinatorAnalytics> {
  const body = await authRequest<{ data: CoordinatorAnalytics }>(
    "/coordinator/analytics",
    token
  );
  return body.data;
}

export async function getCoordinatorOrganizations(
  token: string,
  status?: "PENDING" | "APPROVED" | "REJECTED"
) {
  const query = status ? `?status=${status}` : "";
  const body = await authRequest<{ data: OrganizationSummary[] }>(
    `/coordinator/organizations${query}`,
    token
  );
  return body.data;
}

export async function getCoordinatorOrganizationById(token: string, id: string) {
  const body = await authRequest<{
    data: OrganizationProfile & {
      user: { email: string; isActive: boolean; createdAt: string };
      placements: Placement[];
    };
  }>(`/coordinator/organizations/${id}`, token);
  return body.data;
}

export async function approveOrganization(token: string, id: string) {
  return authRequest<{ message: string }>(`/coordinator/organizations/${id}/approve`, token, {
    method: "PATCH",
    body: JSON.stringify({})
  });
}

export async function rejectOrganization(token: string, id: string, reason: string) {
  return authRequest<{ message: string }>(`/coordinator/organizations/${id}/reject`, token, {
    method: "PATCH",
    body: JSON.stringify({ reason })
  });
}

export async function getCoordinatorStudents(token: string): Promise<CoordinatorStudent[]> {
  const body = await authRequest<{ data: CoordinatorStudent[] }>("/coordinator/students", token);
  return body.data;
}

export async function getCoordinatorStudentById(token: string, id: string) {
  const body = await authRequest<{ data: CoordinatorStudentDetail }>(
    `/coordinator/students/${id}`,
    token
  );
  return body.data;
}

export async function getAnnouncements(token: string): Promise<CoordinatorAnnouncement[]> {
  const body = await authRequest<{ data: CoordinatorAnnouncement[] }>(
    "/coordinator/announcements",
    token
  );
  return body.data;
}

export async function createAnnouncement(
  token: string,
  payload: {
    title: string;
    message: string;
    targetRole: "ALL" | "STUDENT" | "ORGANIZATION";
  }
) {
  return authRequest<{ message: string }>("/coordinator/announcements", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function deleteAnnouncement(token: string, id: string) {
  return authRequest<{ message: string }>(`/coordinator/announcements/${id}`, token, {
    method: "DELETE"
  });
}
