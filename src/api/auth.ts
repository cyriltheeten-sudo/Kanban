const API = "https://localhost:7007/api";

export interface LoginResponse {
  token: string;
  user: { id: number; email: string; name: string };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const reponse = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!reponse.ok) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  return (await reponse.json()) as LoginResponse;
}