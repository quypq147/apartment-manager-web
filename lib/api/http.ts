export interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  userId?: string;
  role?: string;
}

const FALLBACK_LANDLORD_ID =
  process.env.NEXT_PUBLIC_DEMO_LANDLORD_ID ?? "landlord-demo-id";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResult<T>> {
  const { method = "GET", body, userId, role = "LANDLORD" } = options;

  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId ?? FALLBACK_LANDLORD_ID,
        "x-user-role": role,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });

    const payload = (await response.json()) as ApiResult<T>;

    if (!response.ok) {
      return {
        success: false,
        error: payload.error ?? "Request failed",
      };
    }

    return payload;
  } catch {
    return {
      success: false,
      error: "Network error",
    };
  }
}
