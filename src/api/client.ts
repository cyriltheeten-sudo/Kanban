import { getConnectionId } from "./realtime";
import { redirectToLogin } from "./navigation";

const API = `${import.meta.env.VITE_API_URL}/api`;

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const connectionId = getConnectionId();

  let reponse: Response;
  try {
    reponse = await fetch(`${API}${endpoint}`, {
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

if (reponse.status === 401) {
    localStorage.removeItem("token");
    redirectToLogin();
    throw new Error("Session expirée");
}

if (reponse.status === 429) {
    // Le serveur a mis un message explicite dans le corps → on le récupère
    const data = await reponse.json().catch(() => null);
    throw new Error(data?.message ?? "Trop de tentatives. Réessaie plus tard.");
}

if (!reponse.ok) {
    throw new Error("Une erreur est survenue. Réessaie dans un instant.", { cause: reponse.status });
}
  if (reponse.status === 204) return undefined as T;

  return (await reponse.json()) as T;
}