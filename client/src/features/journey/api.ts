import { useCallback, useEffect, useState } from "react";
import { environment } from "@/constants/environment.constants";
import { getCurrentAuthToken } from "@/states/authSession";

export async function networkRequest<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  // Public reads never carry an expired login or require account hydration.
  if (authenticated) {
    const token = getCurrentAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(
    `${environment.apiUrl.replace(/\/$/, "")}${path}`,
    {
      ...options,
      headers,
      credentials: "omit",
      referrerPolicy: "strict-origin",
    },
  );
  if (response.status === 204) return undefined as T;
  const body = await response
    .json()
    .catch(() => ({ message: "The service could not be reached. Try again." }));
  if (!response.ok)
    throw new Error(
      Array.isArray(body.message)
        ? body.message.join(". ")
        : body.message || "The request failed. Try again.",
    );
  return body.data as T;
}

export function useNetworkResource<T>(
  path: string | null,
  authenticated = false,
) {
  const token = authenticated ? getCurrentAuthToken() : null;
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(path));
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setData(undefined);
    setError("");
    setLoading(Boolean(path));
    if (path)
      void networkRequest<T>(path, { signal: controller.signal }, authenticated)
        .then((value) => {
          if (!controller.signal.aborted) setData(value);
        })
        .catch((e) => {
          if (!controller.signal.aborted)
            setError(e instanceof Error ? e.message : "Unable to load.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    return () => controller.abort();
  }, [path, authenticated, token, version]);
  return { data, error, loading, refresh };
}
