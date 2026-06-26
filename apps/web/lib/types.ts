export type UserRole = "PARENT" | "TUTOR";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type TuitionCaseStatus = "OPEN" | "MATCHED" | "CLOSED";

export type TuitionCase = {
  id: string;
  ownerId: string;
  title: string;
  subject: string;
  level: string;
  location: string;
  budgetPerHour: number;
  status: TuitionCaseStatus;
  createdAt: string;
  updatedAt: string;
};

export type CaseInvitation = {
  id: string;
  caseId: string;
  tutorId: string;
  createdAt: string;
  revokedAt: string | null;
};

export type TutorProfile = {
  id: string;
  userId: string;
  displayName: string;
  qualifications: string;
  experiences: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentMetadata = {
  id: string;
  caseId: string | null;
  tutorProfileId: string | null;
  uploadedById: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export type ApiError = Error & {
  status?: number;
  payload?: unknown;
};
