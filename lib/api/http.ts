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

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResult<T>> {
  const { method = "GET", body, userId, role = "LANDLORD" } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (userId) {
    headers["x-user-id"] = userId;
    headers["x-user-role"] = role;
  }

  try {
    const response = await fetch(endpoint, {
      method,
      headers,
      credentials: "include",
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
