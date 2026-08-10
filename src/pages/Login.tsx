import { useState } from "react";
import { login } from "../api/auth";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();               // empêche le rechargement de la page
    setChargement(true);
    setErreur(null);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      onLogin();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Marque */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold tracking-widest text-emerald-400 uppercase">
            Gemboard
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Connecte-toi pour accéder à tes tableaux
          </p>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs text-zinc-400">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.fr"
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus-visible:border-emerald-400/50 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs text-zinc-400">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus-visible:border-emerald-400/50 transition"
            />
          </div>

          {erreur && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={chargement}
            className="mt-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-black font-medium py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {chargement ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}