import { useEffect, useState } from "react";
import {
  TrendingUp,
  Target,
  BookOpen,
  Star,
  Zap,
  Clock,
  ChevronRight,
} from "lucide-react";
import useStore from "../store/useStore";
import api from "../utils/api";
import { getSubjectAverage } from "../utils/gradeCalc";
import { format, isPast, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

export default function DashboardPage() {
  const { user, semesters } = useStore();
  const [aiWord, setAiWord] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [stats, setStats] = useState(null);

  const currentSem =
    semesters.find((s) => s.number === user?.currentSemester) || semesters[0];

  useEffect(() => {
    if (currentSem) computeStats();
  }, [currentSem]);

  const computeStats = () => {
    if (!currentSem) return;
    const subjectStats = currentSem.subjects.map((subj) => {
      const result = getSubjectAverage(subj);
      return {
        _id: subj._id,
        name: subj.name,
        coefficient: subj.coefficient,
        average: result?.average ?? null,
        target: subj.targetAverage,
      };
    });

    const filled = subjectStats.filter((s) => s.average !== null);
    const weightedSum = filled.reduce(
      (acc, s) => acc + s.average * s.coefficient,
      0,
    );
    const totalCoeff = filled.reduce((acc, s) => acc + s.coefficient, 0);
    const globalAvg = totalCoeff > 0 ? weightedSum / totalCoeff : null;
    const globalTarget = currentSem.targetAverage;

    const upcoming = currentSem.subjects
      .flatMap((subj) =>
        subj.controls
          .filter((c) => c.date && c.score === null)
          .map((c) => ({
            subject: subj.name,
            name: c.name,
            date: new Date(c.date),
          })),
      )
      .filter((c) => !isPast(c.date))
      .sort((a, b) => a.date - b.date)
      .slice(0, 3);

    setStats({
      subjectStats,
      globalAvg,
      globalTarget,
      upcoming,
      semName: currentSem.name,
    });

    if (globalAvg !== null) {
      setLoadingAI(true);
      api
        .post("/ai/dashboard-word", {
          currentAverage: globalAvg.toFixed(2),
          target: globalTarget,
          upcomingControls: upcoming.map((c) => `${c.subject} - ${c.name}`),
        })
        .then((res) => setAiWord(res.data.word))
        .catch(() => {})
        .finally(() => setLoadingAI(false));
    }
  };

  const getUrgencyColor = (date) => {
    const diff = differenceInDays(date, new Date());
    if (diff <= 1) return "badge-danger";
    if (diff <= 3) return "badge-warning";
    return "badge-info";
  };

  return (
    <div>
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <p
            className="text-sm font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--primary)" }}
          >
            {format(new Date(), "EEEE d MMMM", { locale: fr })}
          </p>
          <h1 className="text-3xl md:text-4xl">
            Salut, {user?.name?.split(" ")[0] || "Étudiant"} ! ✨
          </h1>
          {stats?.semName && (
            <div className="flex items-center gap-2 mt-2 text-sm font-medium text-slate-500">
              <Clock size={14} />
              <span>{stats.semName}</span>
            </div>
          )}
        </div>

        {/* AI Insight Card */}
        {(aiWord || loadingAI) && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-4 max-w-sm">
            <div className="flex gap-3 items-start">
              <Zap size={18} className="mt-1 shrink-0 text-indigo-500" />
              <div className="text-sm italic text-indigo-700 dark:text-indigo-300">
                {loadingAI ? (
                  <span className="skeleton h-4 w-48 inline-block" />
                ) : (
                  aiWord
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Global Average Hero Card */}
          {stats && (
            <div className="card bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-indigo-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md">
                  <TrendingUp size={18} />
                  <span className="font-bold text-sm">Moyenne générale</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Target size={16} />
                  <span className="text-sm font-bold">
                    Objectif: {stats.globalTarget}/20
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-3 mb-6">
                <span className="text-6xl font-black">
                  {stats.globalAvg !== null ? stats.globalAvg.toFixed(2) : "--"}
                </span>
                <span className="text-2xl font-bold opacity-60 mb-2">/20</span>
              </div>

              {stats.globalAvg !== null && (
                <div className="space-y-2">
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.min(100, (stats.globalAvg / 20) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs font-bold text-white/70 text-right">
                    {Math.round((stats.globalAvg / 20) * 100)}% de progression
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Subject Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-bold">Matières suivies</h2>
              <button className="text-sm font-bold text-indigo-500 flex items-center gap-1">
                Tout voir <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats?.subjectStats.map((subj, i) => (
                <div key={i} className="card-hover p-5 border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {subj.name.replace(/&amp;/g, "&")}
                      </p>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">
                        Coef. {subj.coefficient}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                        {subj.average !== null ? subj.average.toFixed(1) : "—"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400">
                        obj. {subj.target}
                      </p>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${subj.average !== null ? Math.min(100, (subj.average / 20) * 100) : 0}%`,
                        background:
                          subj.average !== null && subj.average >= subj.target
                            ? "var(--success)"
                            : "var(--primary)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Mini Column */}
        <div className="space-y-6">
          {/* Upcoming Controls */}
          <div className="card border-slate-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />À venir
            </h2>

            {stats?.upcoming.length > 0 ? (
              <div className="space-y-3">
                {stats.upcoming.map((ctrl, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-sm truncate pr-2">
                        {ctrl.subject}
                      </p>
                      <span className={getUrgencyColor(ctrl.date)}>
                        {format(ctrl.date, "d MMM", { locale: fr })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {ctrl.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <p className="text-sm">Aucun contrôle prévu ☕</p>
              </div>
            )}
          </div>

          {/* Badges / Motivation */}
          <div className="card border-slate-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Star size={18} className="text-yellow-500" />
              Badges
            </h2>
            <div className="flex flex-wrap gap-2">
              {user?.badges?.length > 0 ? (
                user.badges.slice(-6).map((badge, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm hover:scale-110 transition-transform cursor-help"
                    title={badge.name}
                  >
                    {badge.icon}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Continue tes efforts pour débloquer des badges !
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {!currentSem && (
        <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200 mt-8">
          <BookOpen size={64} className="mx-auto mb-4 text-slate-200" />
          <h3 className="text-xl font-bold text-slate-400">
            Prêt à commencer ?
          </h3>
          <p className="text-slate-400 mb-6">
            Configure tes semestres pour voir tes statistiques ici.
          </p>
          <button
            className="btn-primary"
            onClick={() => (window.location.href = "/onboarding")}
          >
            Lancer la configuration
          </button>
        </div>
      )}
    </div>
  );
}
