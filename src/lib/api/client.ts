export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly url?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function resolveUrl(path: string): string {
  // In the browser, relative paths resolve against the current origin automatically.
  if (typeof window !== "undefined") return path;
  // On the server, Node fetch has no implicit base URL — build one from runtime env vars.
  const base =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base}${path}`;
}

export async function apiFetch<T>(path: string): Promise<T> {
  const url = resolveUrl(path);
  console.log("[apiFetch] requesting", url);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `${response.status} ${response.statusText} — ${url}`,
      url,
    );
  }
  return response.json() as Promise<T>;
}
