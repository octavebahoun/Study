import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import useStore from "../store/useStore";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6)
      return toast.error("Mot de passe trop court (6 caractères min)");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      setAuth(res.data.user, res.data.token);
      navigate("/onboarding");
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur inscription");
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
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{ background: "var(--primary)" }}
          >
            <BookOpen size={32} color="white" />
          </div>
          <h1 className="text-3xl font-bold">StudyNotes</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Créer ton compte
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-bold mb-2">Inscription</h2>

          <div>
            <label className="label">Prénom / Nom</label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-3"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                className="input pl-9"
                type="text"
                placeholder="Ton nom"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

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
                className="input pl-9"
                type="password"
                placeholder="6 caractères min"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </div>

        <p
          className="text-center text-sm mt-4"
          style={{ color: "var(--text-muted)" }}
        >
          Déjà un compte ?{" "}
          <Link
            to="/login"
            className="font-semibold"
            style={{ color: "var(--primary)" }}
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
