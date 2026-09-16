import { API_URL } from "./config";

export interface LoginResponse {
  token: string;
  user: { id: number; email: string; name: string };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

if (response.status === 429) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "Trop de tentatives. Réessaie plus tard.");
}
if (!response.ok) {
    throw new Error("Email ou mot de passe incorrect.");
}
  return (await response.json()) as LoginResponse;
}