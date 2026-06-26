import {
  ApiError,
  AuthUser,
  CaseInvitation,
  DocumentMetadata,
  LoginResponse,
  Paginated,
  TuitionCase,
  TuitionCaseStatus,
  TutorProfile
} from "./types";
import { tokenStorage } from "./token-storage";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown | FormData;
  auth?: boolean;
};

async function request<T>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {}
): Promise<T> {
  const headers = new Headers();

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = tokenStorage.get();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers,
    body:
      body === undefined ? undefined : isFormData ? body : JSON.stringify(body)
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const error = new Error(getErrorMessage(payload, response.status)) as ApiError;
    error.status = response.status;
    error.payload = payload;

    if (response.status === 401) {
      tokenStorage.clear();
    }

    throw error;
  }

  return payload as T;
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(payload: unknown, status: number): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload
  ) {
    const message = (payload as { message: unknown }).message;
    return Array.isArray(message) ? message.join(", ") : String(message);
  }

  return `Request failed with status ${status}`;
}

export const apiClient = {
  login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password }
    });
  },

  logout(): Promise<{ ok: true }> {
    return request<{ ok: true }>("/auth/logout", { method: "POST" });
  },

  me(): Promise<AuthUser> {
    return request<AuthUser>("/auth/me");
  },

  listCases(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    subject?: string;
    level?: string;
    status?: TuitionCaseStatus | "";
  }): Promise<Paginated<TuitionCase>> {
    return request<Paginated<TuitionCase>>(`/cases${toQueryString(params)}`);
  },

  createCase(input: CaseFormInput): Promise<TuitionCase> {
    return request<TuitionCase>("/cases", {
      method: "POST",
      body: input
    });
  },

  getCase(id: string): Promise<TuitionCase> {
    return request<TuitionCase>(`/cases/${id}`);
  },

  updateCase(id: string, input: Partial<CaseFormInput> & { status?: TuitionCaseStatus }): Promise<TuitionCase> {
    return request<TuitionCase>(`/cases/${id}`, {
      method: "PATCH",
      body: input
    });
  },

  listCaseInvitations(caseId: string): Promise<CaseInvitation[]> {
    return request<CaseInvitation[]>(`/cases/${caseId}/invitations`);
  },

  inviteTutor(caseId: string, tutorId: string): Promise<CaseInvitation> {
    return request<CaseInvitation>(`/cases/${caseId}/invitations`, {
      method: "POST",
      body: { tutorId }
    });
  },

  revokeTutor(caseId: string, tutorId: string): Promise<CaseInvitation> {
    return request<CaseInvitation>(`/cases/${caseId}/invitations/${tutorId}`, {
      method: "DELETE"
    });
  },

  listCaseDocuments(caseId: string): Promise<DocumentMetadata[]> {
    return request<DocumentMetadata[]>(`/cases/${caseId}/documents`);
  },

  uploadCaseDocument(caseId: string, file: File): Promise<DocumentMetadata> {
    const body = new FormData();
    body.append("file", file);

    return request<DocumentMetadata>(`/cases/${caseId}/documents`, {
      method: "POST",
      body
    });
  },

  listTutorProfiles(params: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<Paginated<TutorProfile>> {
    return request<Paginated<TutorProfile>>(
      `/tutor-profiles${toQueryString(params)}`
    );
  },

  getTutorProfile(id: string): Promise<TutorProfile> {
    return request<TutorProfile>(`/tutor-profiles/${id}`);
  },

  getMyTutorProfile(): Promise<TutorProfile> {
    return request<TutorProfile>("/tutor-profile/me");
  },

  upsertMyTutorProfile(input: TutorProfileFormInput): Promise<TutorProfile> {
    return request<TutorProfile>("/tutor-profile/me", {
      method: "PUT",
      body: input
    });
  },

  listTutorProfileDocuments(profileId: string): Promise<DocumentMetadata[]> {
    return request<DocumentMetadata[]>(`/tutor-profiles/${profileId}/documents`);
  },

  uploadTutorProfileDocument(file: File): Promise<DocumentMetadata> {
    const body = new FormData();
    body.append("file", file);

    return request<DocumentMetadata>("/tutor-profile/documents", {
      method: "POST",
      body
    });
  },

  async downloadDocument(id: string): Promise<Blob> {
    const headers = new Headers();
    const token = tokenStorage.get();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${apiBaseUrl}/documents/${id}/download`, {
      headers
    });

    if (!response.ok) {
      const payload = await parseResponse(response);
      const error = new Error(getErrorMessage(payload, response.status)) as ApiError;
      error.status = response.status;
      error.payload = payload;

      if (response.status === 401) {
        tokenStorage.clear();
      }

      throw error;
    }

    return response.blob();
  }
};

export type CaseFormInput = {
  title: string;
  subject: string;
  level: string;
  location: string;
  budgetPerHour: number;
};

export type TutorProfileFormInput = {
  displayName: string;
  qualifications: string;
  experiences: string;
};

function toQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
