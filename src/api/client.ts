import { getConnectionId } from "./realtime";

const API = `${import.meta.env.VITE_API_URL}/api`;

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

  if (reponse.status === 401) {
      localStorage.removeItem("token");
      window.location.reload(); // l'app se relance : plus de token → page de connexion
      throw new Error("Session expirée");
  }
  if (!reponse.ok) throw new Error(`Erreur HTTP : ${reponse.status}`);
  if (reponse.status === 204) return undefined as T;

  return (await reponse.json()) as T;
}