import { useState } from "react";
import "../styles/animations.css";
import { useLogin } from "../hooks/useLogin";

const DEMO_EMAIL = "demo@kanban.fr";
const DEMO_PASSWORD = "demo";

export default function Login() {
  const { signIn, error, isLoading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn(email, password);
  }

  async function handleDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    await signIn(DEMO_EMAIL, DEMO_PASSWORD);
  }

  return (
    <div className="relative min-h-screen w-full bg-app bg-[radial-gradient(circle_at_50%_38%,rgba(20,184,166,0.16)_0%,rgba(13,148,136,0.08)_22%,rgba(15,118,110,0.03)_42%,rgba(10,15,16,0)_65%)] text-ink flex flex-col justify-between items-center px-6 py-8 overflow-hidden font-sans selection:bg-teal-500/20 selection:text-teal-300">

      <main className="relative z-10 flex flex-col items-center w-full max-w-105 mb-auto pt-2 sm:pt-6 pb-8">

        <div className="relative w-full rounded-3xl p-px overflow-hidden bg-rim">

          <div
            aria-hidden="true"
            className="absolute inset-[-150%] animate-rotate-border pointer-events-none"
            style={{
              background: "conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(45, 212, 191, 0.85) 320deg, transparent 360deg)"
            }}
          />

          <div className="relative w-full h-full bg-surface rounded-[23px] p-8 sm:p-10 z-10">

            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                <span className="bg-linear-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Gem
                </span>
                <span className="text-white">Board</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-muted">
                Connecte-toi pour accéder à tes tableaux
              </p>
            </div>

            <div
              className={`w-full mb-6 rounded-xl bg-black border transition-colors duration-300 ${
                isDemoOpen ? "border-teal-500/30" : "border-hair"
              }`}
            >
              <button
                type="button"
                aria-expanded={isDemoOpen}
                aria-controls="demo-panel"
                onClick={() => setIsDemoOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-2 cursor-pointer px-4 py-3 text-xs font-semibold text-ink-soft hover:text-teal-300 transition-colors"
              >
                <span>Découvrir GemBoard &amp; compte démo</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 transition-transform duration-300 ${isDemoOpen ? "rotate-180" : ""}`}
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              <div
                id="demo-panel"
                inert={!isDemoOpen}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  isDemoOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 flex flex-col gap-3 text-xs text-muted">
                    <p>
                      GemBoard est une application Kanban pour organiser tes projets :
                      crée tes propres tableaux, découpe ton travail en colonnes et fais
                      avancer tes cartes par simple glisser-déposer.
                    </p>

                    <div className="rounded-lg border border-hair-soft px-3 py-2.5 flex flex-col gap-1">
                      <p>
                        Email : <span className="font-mono text-ink">{DEMO_EMAIL}</span>
                      </p>
                      <p>
                        Mot de passe : <span className="font-mono text-ink">{DEMO_PASSWORD}</span>
                      </p>
                    </div>

                    <p className="text-[11px] text-faint">
                      Le serveur est hébergé sur Render : la première connexion peut
                      prendre ~30 secondes.
                    </p>

                    <button
                      type="button"
                      onClick={handleDemo}
                      disabled={isLoading}
                      className="w-full rounded-lg border border-teal-500/40 hover:border-teal-400 hover:bg-teal-500/10 text-teal-300 font-semibold py-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Utiliser le compte démo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-ink-soft"
                >
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.fr"
                  className="w-full rounded-xl bg-field border border-hair focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 px-4 py-3 text-sm text-ink placeholder:text-placeholder outline-none transition-all duration-200 autofill:shadow-[0_0_0_30px_var(--color-field)_inset] autofill:[-webkit-text-fill-color:var(--color-ink)] autofill:caret-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-ink-soft"
                >
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-field border border-hair focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 px-4 py-3 text-sm text-ink placeholder:text-placeholder outline-none transition-all duration-200 autofill:shadow-[0_0_0_30px_var(--color-field)_inset] autofill:[-webkit-text-fill-color:var(--color-ink)] autofill:caret-white"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-xs text-red-400 transition-all">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 w-full rounded-xl bg-linear-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-black font-semibold text-sm py-3.5 px-4 active:scale-[0.98] transition-all duration-200 shadow-[0_8px_28px_-8px_rgba(45,212,191,0.45)] hover:shadow-[0_10px_32px_-6px_rgba(52,211,153,0.55)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-hair-soft text-center">
              <p className="text-xs text-muted">
                Pas encore de compte ?{" "}
                <a
                  href="#contact"
                  className="text-teal-300 hover:text-emerald-400 font-medium transition-colors"
                >
                  Demander un accès
                </a>
              </p>
            </div>

            {isLoading && (
              <p className="mt-4 text-[11px] text-faint text-center animate-pulse">
                Initialisation du serveur Render en cours (~30 sec)...
              </p>
            )}

          </div>
        </div>
      </main>

      <footer className="relative z-10 text-xs text-faint font-medium text-center py-2">
        Gemboard © {new Date().getFullYear()}
      </footer>

    </div>
  );
}
