import { getConnectionId } from "./realtime";
import { redirectToLogin } from "./navigation";
import { API_URL } from "./config";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const connectionId = getConnectionId();

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(connectionId ? { "X-Connection-Id": connectionId } : {}),
        ...options.headers,
      },
    });
  } catch (e) {
    throw new Error("Connexion au serveur impossible. Vérifie ta connexion et réessaie.", { cause: e });
  }

if (response.status === 401) {
    localStorage.removeItem("token");
    redirectToLogin();
    throw new Error("Session expirée");
}

if (response.status === 429) {
    // Le serveur a mis un message explicite dans le corps → on le récupère
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "Trop de tentatives. Réessaie plus tard.");
}

if (!response.ok) {
    throw new Error("Une erreur est survenue. Réessaie dans un instant.", { cause: response.status });
}
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}