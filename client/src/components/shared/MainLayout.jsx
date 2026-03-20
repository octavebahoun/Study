import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  Brain,
  Calendar,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import useStore from "../../store/useStore";
import api from "../../utils/api";

const tabs = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/notes", icon: BookOpen, label: "Notes" },
  { path: "/matieres", icon: Library, label: "Matières" },
  { path: "/revisions", icon: Brain, label: "Révisions" },
  { path: "/calendar", icon: Calendar, label: "Calendrier" },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSemesters, setGroqModels, user, logout } = useStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [semRes, modelsRes] = await Promise.all([
          api.get("/semesters"),
          api.get("/ai/groq-models"),
        ]);
        setSemesters(semRes.data);
        setGroqModels(modelsRes.data);
      } catch (err) {
        console.error("Erreur chargement données:", err);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600" strokeWidth={2.5} />
            <span className="text-lg font-bold tracking-tight">StudyNotes</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/profile")}
              className={`p-1.5 rounded-lg transition-all ${
                location.pathname === "/profile"
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                  : "text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
              title="Mon Profil"
            >
              <User size={18} />
            </button>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              title="Déconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 md:px-8">
        <Outlet />
      </main>

      {/* Solid Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 safe-bottom z-50 border-t"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.03)",
        }}
      >
        <div className="max-w-xl mx-auto px-2 py-1.5 flex items-center justify-around">
          {tabs.map(({ path, icon: Icon, label }) => {
            const isActive =
              path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg transition-all duration-200 text-[10px] font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                    : "text-slate-400 hover:text-indigo-500"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
