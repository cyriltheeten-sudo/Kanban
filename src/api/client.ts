import { getConnectionId } from "./realtime";

const API = "https://localhost:7007/api";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const connectionId = getConnectionId();

  const reponse = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(connectionId ? { "X-Connection-Id": connectionId } : {}),
      ...options.headers,
    },
  });

  if (!reponse.ok) throw new Error(`Erreur HTTP : ${reponse.status}`);
  if (reponse.status === 204) return undefined as T;

  return (await reponse.json()) as T;
}