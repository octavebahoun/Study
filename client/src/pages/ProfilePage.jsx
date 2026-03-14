import { useState } from "react";
import {
  User,
  Palette,
  Brain,
  Bell,
  LogOut,
  Trophy,
  TrendingUp,
  Save,
  Eye,
} from "lucide-react";
import useStore from "../store/useStore";
import api from "../utils/api";
import toast from "react-hot-toast";

const THEMES = [
  { id: "default", name: "Bleu · Défaut", primary: "#3F51B5", bg: "#F5F7FA" },
  { id: "nature", name: "Nature", primary: "#2D6A4F", bg: "#F8F9F1" },
  { id: "energy", name: "Énergie", primary: "#F77F00", bg: "#FFFFFF" },
  { id: "dark", name: "Dark Neon", primary: "#BB86FC", bg: "#121212" },
];

const BADGES_DEF = [
  {
    id: "first_note",
    icon: "📝",
    name: "Première note",
    description: "Tu as entré ta première note",
  },
  {
    id: "perfect",
    icon: "⭐",
    name: "Perfection",
    description: "20/20 obtenu",
  },
  {
    id: "target_hit",
    icon: "🎯",
    name: "Objectif atteint",
    description: "Moyenne cible dépassée",
  },
  {
    id: "semester_done",
    icon: "🏅",
    name: "Semestre validé",
    description: "Semestre complété",
  },
  {
    id: "streak",
    icon: "🔥",
    name: "En feu",
    description: "3 bonnes notes consécutives",
  },
];

export default function ProfilePage() {
  const { user, updateUser, logout, semesters } = useStore();
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    language: user?.language || "fr",
    aiPreferences: { ...user?.aiPreferences },
    visualizerSystemPrompt: user?.visualizerSystemPrompt || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/user/profile", form);
      updateUser(res.data);
      toast.success("Profil mis à jour ✅");
    } catch {
      toast.error("Erreur sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleTheme = async (themeId) => {
    try {
      const res = await api.put("/user/profile", { theme: themeId });
      updateUser(res.data);
      document.documentElement.setAttribute("data-theme", themeId);
      toast.success("Thème appliqué");
    } catch {
      toast.error("Erreur");
    }
  };

  const enableNotifications = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const vapidRes = await api.get("/notifications/vapid-key");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidRes.data.publicKey,
      });
      await api.post("/user/push-subscription", { subscription: sub });
      toast.success("Notifications activées ! 🔔");
    } catch {
      toast.error("Impossible d'activer les notifications");
    }
  };

  // Compute real progress
  const totalControls = semesters.flatMap((s) =>
    s.subjects.flatMap((sub) => sub.controls),
  ).length;
  const filledControls = semesters.flatMap((s) =>
    s.subjects.flatMap((sub) => sub.controls.filter((c) => c.score !== null)),
  ).length;
  const completedSems = semesters.filter((s) => s.isCompleted).length;

  return (
    <div className="">
      {/* User header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
          style={{ background: "var(--primary)" }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <h1 className="text-xl font-bold">{user?.name || "Étudiant"}</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {user?.email}
          </p>
          {user?.bio && <p className="text-sm mt-1 italic">{user.bio}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[
          { id: "profile", icon: User, label: "Profil" },
          { id: "theme", icon: Palette, label: "Thème" },
          { id: "ai", icon: Brain, label: "IA" },
          { id: "progress", icon: TrendingUp, label: "Progrès" },
          { id: "badges", icon: Trophy, label: "Badges" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${tab === id ? "text-white" : ""}`}
            style={{
              background: tab === id ? "var(--primary)" : "var(--surface)",
              color: tab === id ? "white" : "var(--text-muted)",
              border: `1px solid var(--border)`,
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="card p-4 space-y-4 animate-fade-in">
          <div>
            <label className="label">Nom</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ton nom"
            />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea
              className="input resize-none h-20"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Quelques mots sur toi..."
            />
          </div>
          <div>
            <label className="label">Langue</label>
            <select
              className="input"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Save size={16} /> {saving ? "Sauvegarde..." : "Enregistrer"}
          </button>

          {/* Notifications */}
          <div
            className="border-t pt-4"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              onClick={enableNotifications}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Bell size={16} /> Activer les notifications push
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      )}

      {/* Theme tab */}
      {tab === "theme" && (
        <div className="space-y-3 animate-fade-in">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleTheme(theme.id)}
              className="card w-full p-4 flex items-center gap-4 text-left transition-all"
              style={{
                border:
                  user?.theme === theme.id
                    ? `2px solid var(--primary)`
                    : "1px solid var(--border)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: theme.bg, border: "1px solid #e5e7eb" }}
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ background: theme.primary }}
                />
              </div>
              <div>
                <p className="font-bold">{theme.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Couleur: {theme.primary}
                </p>
              </div>
              {user?.theme === theme.id && (
                <span className="ml-auto badge-info badge">Actif</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* AI tab */}
      {tab === "ai" && (
        <div className="card p-4 space-y-4 animate-fade-in">
          <div>
            <label className="label">Ton de l'IA</label>
            <input
              className="input"
              value={form.aiPreferences.tone}
              onChange={(e) =>
                setForm({
                  ...form,
                  aiPreferences: {
                    ...form.aiPreferences,
                    tone: e.target.value,
                  },
                })
              }
              placeholder="ex: encourageant et pédagogue"
            />
          </div>
          <div>
            <label className="label">Style de réponse</label>
            <input
              className="input"
              value={form.aiPreferences.style}
              onChange={(e) =>
                setForm({
                  ...form,
                  aiPreferences: {
                    ...form.aiPreferences,
                    style: e.target.value,
                  },
                })
              }
              placeholder="ex: clair et structuré"
            />
          </div>
          <div>
            <label className="label">Prompt système Visualiseur</label>
            <textarea
              className="input resize-none h-48 text-xs font-mono"
              value={form.visualizerSystemPrompt}
              onChange={(e) =>
                setForm({ ...form, visualizerSystemPrompt: e.target.value })
              }
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Save size={16} /> {saving ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </div>
      )}

      {/* Progress tab */}
      {tab === "progress" && (
        <div className="space-y-3 animate-fade-in">
          <div className="card p-4">
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Notes saisies
            </p>
            <p
              className="text-3xl font-bold"
              style={{ color: "var(--primary)" }}
            >
              {filledControls}/{totalControls}
            </p>
            <div className="progress-bar mt-2">
              <div
                className="progress-fill"
                style={{
                  width:
                    totalControls > 0
                      ? `${(filledControls / totalControls) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>
          <div className="card p-4">
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Semestres complétés
            </p>
            <p
              className="text-3xl font-bold"
              style={{ color: "var(--primary)" }}
            >
              {completedSems}/{semesters.length}
            </p>
          </div>
          <div className="card p-4">
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Badges débloqués
            </p>
            <p
              className="text-3xl font-bold"
              style={{ color: "var(--primary)" }}
            >
              {user?.badges?.length || 0}
            </p>
          </div>
        </div>
      )}

      {/* Badges tab */}
      {tab === "badges" && (
        <div className="space-y-3 animate-fade-in">
          {BADGES_DEF.map((badge) => {
            const earned = user?.badges?.find((b) => b.id === badge.id);
            return (
              <div
                key={badge.id}
                className="card p-4 flex items-center gap-4"
                style={{ opacity: earned ? 1 : 0.4 }}
              >
                <span className="text-3xl">{badge.icon}</span>
                <div>
                  <p className="font-bold">{badge.name}</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {badge.description}
                  </p>
                  {earned && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--primary)" }}
                    >
                      Obtenu le{" "}
                      {new Date(earned.earnedAt).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
                {earned && (
                  <span className="ml-auto badge-success badge">✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
