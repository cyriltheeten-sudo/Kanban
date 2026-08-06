import { useState } from "react";
import { login } from "../api/auth";

interface LoginProps {
  onLogin: () => void;   // appelé après une connexion réussie
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function handleSubmit() {
    setChargement(true);
    setErreur(null);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);   // on garde le jeton
      onLogin();                                     // on prévient App
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div>
      <h1>Connexion</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
      />
      <button onClick={handleSubmit} disabled={chargement}>
        {chargement ? "Connexion..." : "Se connecter"}
      </button>
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}
    </div>
  );
}