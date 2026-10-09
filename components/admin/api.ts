"use client";

export class ApiError extends Error {
  constructor(message: string, public status: number, public body: Record<string, unknown> = {}) {
    super(message);
  }
}

// fetch wrapper for admin API routes. A 401 sends the browser back to the login screen.
export async function api<T = unknown>(url: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const res = await fetch(url, {
    ...init,
    headers: isForm ? init.headers : { "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.reload();
    throw new ApiError("Your session has expired. Please sign in again.", 401, body);
  }
  if (!res.ok) {
    throw new ApiError(typeof body.error === "string" ? body.error : "Something went wrong. Please try again.", res.status, body);
  }
  return body as T;
}

export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}
