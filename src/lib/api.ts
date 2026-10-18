import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  formData?: FormData;
  token?: string | null;
};

const MAX_NETWORK_RETRIES = 4;

function extractMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "Something went wrong";
  }

  const data = payload as { message?: string | string[] };
  if (Array.isArray(data.message)) {
    return data.message.join("\n");
  }
  if (typeof data.message === "string") {
    return data.message;
  }

  return "Something went wrong";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePayload(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/** XMLHttpRequest is more reliable than fetch for multipart uploads on RN. */
function xhrRequest<T>(
  path: string,
  options: RequestOptions,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method ?? "POST", `${API_BASE_URL}${path}`);
    xhr.setRequestHeader("Accept", "application/json");
    if (options.token) {
      xhr.setRequestHeader("Authorization", `Bearer ${options.token}`);
    }
    // Do not set Content-Type for FormData — boundary must be auto-set.
    xhr.timeout = 60000;

    xhr.onload = () => {
      const payload = parsePayload(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload as T);
        return;
      }
      reject(new ApiError(extractMessage(payload), xhr.status));
    };

    xhr.onerror = () => {
      reject(
        new ApiError(
          `Cannot reach API at ${API_BASE_URL}. Check your internet and try again.`,
          0,
        ),
      );
    };

    xhr.ontimeout = () => {
      reject(
        new ApiError(
          `Request timed out talking to ${API_BASE_URL}. Try again.`,
          0,
        ),
      );
    };

    xhr.send(options.formData ?? null);
  });
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  if (options.formData) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_NETWORK_RETRIES; attempt += 1) {
      try {
        return await xhrRequest<T>(path, options);
      } catch (error) {
        lastError = error;
        if (
          error instanceof ApiError &&
          error.status !== 0 &&
          error.status !== 408
        ) {
          throw error;
        }
        if (attempt < MAX_NETWORK_RETRIES) {
          await sleep(600 * attempt);
          continue;
        }
      }
    }
    if (lastError instanceof ApiError) throw lastError;
    throw new ApiError(
      `Cannot reach API at ${API_BASE_URL}. Check your internet and try again.`,
      0,
    );
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  for (let attempt = 1; attempt <= MAX_NETWORK_RETRIES; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method ?? "GET",
        headers,
        body:
          options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });
    } catch (error) {
      if (__DEV__) {
        console.warn(
          `[api] network fail ${options.method ?? "GET"} ${path} (#${attempt})`,
          error,
        );
      }
      if (attempt < MAX_NETWORK_RETRIES) {
        await sleep(500 * attempt);
        continue;
      }
      throw new ApiError(
        `Cannot reach API at ${API_BASE_URL}. Check your internet and try again.`,
        0,
      );
    }

    const payload = parsePayload(await response.text());

    if (!response.ok) {
      throw new ApiError(extractMessage(payload), response.status);
    }

    return payload as T;
  }

  throw new ApiError(
    `Cannot reach API at ${API_BASE_URL}. Check your internet and try again.`,
    0,
  );
}
