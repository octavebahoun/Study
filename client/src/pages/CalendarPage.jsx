import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  differenceInDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar as CalendarIcon,
  Save,
} from "lucide-react";
import useStore from "../store/useStore";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function CalendarPage() {
  const { semesters, updateSemester } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    semId: "",
    subjectIndex: "",
    name: "",
    variable: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  // Reset form when opening
  const openScheduling = (day) => {
    setScheduleForm({
      ...scheduleForm,
      semId: semesters[0]?._id || "",
      subjectIndex: "0",
      date: day ? format(day, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    });
    setIsScheduling(true);
  };

  const handleSchedule = async () => {
    if (
      !scheduleForm.semId ||
      scheduleForm.subjectIndex === "" ||
      !scheduleForm.name ||
      !scheduleForm.date
    ) {
      return toast.error("Tous les champs sont requis");
    }

    const sem = semesters.find((s) => s._id === scheduleForm.semId);
    if (!sem) return;

    try {
      const newSubjects = [...sem.subjects];
      const subjIdx = parseInt(scheduleForm.subjectIndex);
      const newControls = [
        ...newSubjects[subjIdx].controls,
        {
          name: scheduleForm.name,
          variable:
            scheduleForm.variable ||
            `v${newSubjects[subjIdx].controls.length + 1}`,
          date: scheduleForm.date,
          score: null,
        },
      ];
      newSubjects[subjIdx] = { ...newSubjects[subjIdx], controls: newControls };

      const res = await api.put(`/semesters/${sem._id}`, {
        subjects: newSubjects,
      });
      updateSemester(res.data);
      setIsScheduling(false);
      setScheduleForm({ ...scheduleForm, name: "", variable: "" });
      toast.success("Contrôle programmé !");
    } catch (err) {
      toast.error("Erreur de programmation");
    }
  };

  // Gather all controls with dates across all semesters
  const allControls = semesters.flatMap((sem) =>
    sem.subjects.flatMap((subj) =>
      subj.controls
        .filter((c) => c.date)
        .map((c) => ({
          date: new Date(c.date),
          subject: subj.name,
          name: c.name,
          score: c.score,
          semesterName: sem.name,
        })),
    ),
  );

  const getDayControls = (day) =>
    allControls.filter((c) => isSameDay(c.date, day));

  const getUrgency = (date) => {
    const diff = differenceInDays(date, new Date());
    if (diff < 0 && diff >= -7) return "past";
    if (diff <= 0) return "past";
    if (diff <= 1) return "critical";
    if (diff <= 3) return "warning";
    return "normal";
  };

  const urgencyStyles = {
    critical: {
      bg: "#fee2e2",
      dot: "#ef4444",
      badge: "bg-red-100 text-red-700",
    },
    warning: {
      bg: "#fef3c7",
      dot: "#f59e0b",
      badge: "bg-amber-100 text-amber-700",
    },
    normal: {
      bg: "var(--primary-light)",
      dot: "var(--primary)",
      badge: "badge-info",
    },
    past: { bg: "#f3f4f6", dot: "#9ca3af", badge: "bg-gray-100 text-gray-500" },
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const startDayOfWeek = (days[0].getDay() + 6) % 7; // Monday first

  const selectedControls = selectedDay ? getDayControls(selectedDay) : [];

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title mb-0">Calendrier</h1>
        <button
          onClick={() => openScheduling(selectedDay)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 transition-all"
        >
          <Plus size={18} /> Programmer
        </button>
      </div>

      {/* Scheduling Form */}
      {isScheduling && (
        <div className="card p-5 mb-6 border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold flex items-center gap-2">
              <CalendarIcon size={18} className="text-indigo-600" /> Nouvel
              examen / devoir
            </h2>
            <button
              onClick={() => setIsScheduling(false)}
              className="text-slate-400 hover:text-red-500"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Semestre</label>
                <select
                  className="input text-sm"
                  value={scheduleForm.semId}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      semId: e.target.value,
                      subjectIndex: "0",
                    })
                  }
                >
                  {semesters.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Matière</label>
                <select
                  className="input text-sm"
                  value={scheduleForm.subjectIndex}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      subjectIndex: e.target.value,
                    })
                  }
                >
                  {semesters
                    .find((s) => s._id === scheduleForm.semId)
                    ?.subjects.map((subj, idx) => (
                      <option key={idx} value={idx}>
                        {subj.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="label">Nom de l'évaluation</label>
                <input
                  className="input text-sm"
                  placeholder="Ex: DS 1, Partiel..."
                  value={scheduleForm.name}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  className="input text-sm"
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, date: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="label">
                Variable dans la formule (ex: d1, i2...)
              </label>
              <input
                className="input text-sm font-mono"
                placeholder="Laissez vide pour auto"
                value={scheduleForm.variable}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, variable: e.target.value })
                }
              />
            </div>

            <button
              onClick={handleSchedule}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save size={18} /> Confirmer la programmation
            </button>
          </div>
        </div>
      )}

      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCurrentMonth(
              (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
            )
          }
          className="btn-ghost p-2"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-bold text-lg capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: fr })}
        </h2>
        <button
          onClick={() =>
            setCurrentMonth(
              (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
            )
          }
          className="btn-ghost p-2"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold py-1"
            style={{ color: "var(--text-muted)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const controls = getDayControls(day);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const todayDay = isToday(day);
          const urgency =
            controls.length > 0 ? getUrgency(controls[0].date) : null;

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className="relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all"
              style={{
                background: isSelected
                  ? "var(--primary)"
                  : controls.length > 0
                    ? urgencyStyles[urgency]?.bg
                    : "transparent",
                color: isSelected
                  ? "white"
                  : todayDay
                    ? "var(--primary)"
                    : "var(--text)",
                fontWeight: todayDay ? "700" : "400",
                border:
                  todayDay && !isSelected
                    ? `2px solid var(--primary)`
                    : "2px solid transparent",
              }}
            >
              <span>{format(day, "d")}</span>
              {controls.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {controls.slice(0, 3).map((_, ci) => (
                    <div
                      key={ci}
                      className="w-1 h-1 rounded-full"
                      style={{
                        background: isSelected
                          ? "white"
                          : urgencyStyles[urgency]?.dot,
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day details */}
      {selectedDay && (
        <div className="animate-slide-up">
          <h3 className="font-bold mb-3">
            {format(selectedDay, "EEEE d MMMM", { locale: fr })}
          </h3>
          {selectedControls.length === 0 ? (
            <div
              className="card p-4 text-center"
              style={{ color: "var(--text-muted)" }}
            >
              Aucun contrôle ce jour
            </div>
          ) : (
            <div className="space-y-2">
              {selectedControls.map((ctrl, i) => {
                const urgency = getUrgency(ctrl.date);
                return (
                  <div
                    key={i}
                    className="card p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold">{ctrl.subject}</p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {ctrl.name} · {ctrl.semesterName}
                      </p>
                    </div>
                    <span className={urgencyStyles[urgency]?.badge + " badge"}>
                      {ctrl.score !== null
                        ? `${ctrl.score}/20`
                        : urgency === "past"
                          ? "Passé"
                          : urgency === "critical"
                            ? "Demain"
                            : "À venir"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Upcoming list */}
      {!selectedDay && (
        <div className="space-y-2">
          <h3
            className="font-bold text-sm uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Prochains contrôles
          </h3>
          {allControls
            .filter(
              (c) =>
                c.score === null && differenceInDays(c.date, new Date()) >= 0,
            )
            .sort((a, b) => a.date - b.date)
            .slice(0, 8)
            .map((ctrl, i) => {
              const urgency = getUrgency(ctrl.date);
              const diff = differenceInDays(ctrl.date, new Date());
              return (
                <div
                  key={i}
                  className="card p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{ctrl.subject}</p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {ctrl.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      {format(ctrl.date, "d MMM", { locale: fr })}
                    </p>
                    <span
                      className={
                        urgencyStyles[urgency]?.badge + " badge text-xs"
                      }
                    >
                      {diff === 0
                        ? "Aujourd'hui"
                        : diff === 1
                          ? "Demain"
                          : `J-${diff}`}
                    </span>
                  </div>
                </div>
              );
            })}
          {allControls.filter((c) => c.score === null).length === 0 && (
            <div
              className="text-center py-8"
              style={{ color: "var(--text-muted)" }}
            >
              <p>Aucun contrôle à venir</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
