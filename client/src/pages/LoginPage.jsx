import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import useStore from "../store/useStore";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      setAuth(res.data.user, res.data.token);
      navigate(res.data.user.onboardingCompleted ? "/" : "/onboarding");
    } catch (err) {
      const errorMessage =
        typeof err.response?.data?.error === "string"
          ? err.response.data.error
          : err.message || "Erreur de connexion";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{ background: "var(--primary)" }}
          >
            <BookOpen size={32} color="white" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
            StudyNotes
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Ton carnet de notes intelligent
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h2 className="text-xl font-bold mb-2">Connexion</h2>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-3"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                className="input pl-9"
                type="email"
                placeholder="ton@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Mot de passe</label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-3"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                className="input pl-9 pr-10"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-3"
                style={{ color: "var(--text-muted)" }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p
          className="text-center text-sm mt-4"
          style={{ color: "var(--text-muted)" }}
        >
          Pas encore de compte ?{" "}
          <Link
            to="/register"
            className="font-semibold"
            style={{ color: "var(--primary)" }}
          >
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
