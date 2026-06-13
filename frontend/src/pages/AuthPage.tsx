import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";
import { Brain, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

export const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "register") {
        await apiService.register(username, password);
        setSuccess("Registrazione completata! Ora accedi.");
        setMode("login");
        setPassword("");
      } else {
        const data = await apiService.loginUser(username, password);
        login(data.access_token, username);
      }
    } catch (err: any) {
      setError(err.message || "Errore durante l'operazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-black text-xl mx-auto mb-4">
            RAG
          </div>
          <h1 className="text-2xl font-bold text-white">Smart Enterprise Search</h1>
          <p className="text-slate-400 text-sm mt-1">Local AI · RAG Platform</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          {/* Tab switch */}
          <div className="flex bg-slate-800 rounded-xl p-1 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {m === "login" ? "Accedi" : "Registrati"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="il_tuo_username"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login" ? "Accedi" : "Crea account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Brain className="w-3.5 h-3.5" />
            I tuoi dati non lasciano mai il server locale
          </div>
        </div>
      </div>
    </div>
  );
};