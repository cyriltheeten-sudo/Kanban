const API = "https://localhost:7007/api";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const reponse = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!reponse.ok) throw new Error(`Erreur HTTP : ${reponse.status}`);

  // 204 No Content (ex. suppression) → pas de JSON à parser
  if (reponse.status === 204) return undefined as T;

  return (await reponse.json()) as T;
}