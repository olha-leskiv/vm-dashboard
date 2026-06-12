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

export async function apiFetch<T>(path: string): Promise<T> {
  console.log("[apiFetch] requesting", path);
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `${response.status} ${response.statusText} — ${path}`,
      path,
    );
  }
  return response.json() as Promise<T>;
}
