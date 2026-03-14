import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  BookOpen,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import useStore from "../store/useStore";
import { extractVariables } from "../utils/gradeCalc";

const STEPS = ["Bienvenue", "Semestres", "Matières", "Terminé"];

export default function OnboardingPage() {
  const { user, updateUser, setSemesters } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState({
    totalSemesters: 2,
    currentSemester: 1,
    semesters: [
      {
        number: 1,
        name: "Semestre 1",
        targetAverage: 12,
        subjects: [
          {
            name: "",
            coefficient: 1,
            formula: "",
            targetAverage: 12,
            controls: [],
          },
        ],
      },
    ],
  });

  const updateSemCount = (total, current) => {
    const sems = [];
    for (let i = 1; i <= total; i++) {
      const existing = config.semesters.find((s) => s.number === i);
      sems.push(
        existing || {
          number: i,
          name: `Semestre ${i}`,
          targetAverage: 12,
          subjects: [
            {
              name: "",
              coefficient: 1,
              formula: "",
              targetAverage: 12,
              controls: [],
            },
          ],
        },
      );
    }
    setConfig((prev) => ({
      ...prev,
      totalSemesters: total,
      currentSemester: current,
      semesters: sems,
    }));
  };

  const addSubject = (semIdx) => {
    const sems = [...config.semesters];
    sems[semIdx].subjects.push({
      name: "",
      coefficient: 1,
      formula: "",
      targetAverage: 12,
      controls: [],
    });
    setConfig({ ...config, semesters: sems });
  };

  const removeSubject = (semIdx, subIdx) => {
    const sems = [...config.semesters];
    sems[semIdx].subjects.splice(subIdx, 1);
    setConfig({ ...config, semesters: sems });
  };

  const updateSubject = (semIdx, subIdx, field, value) => {
    const sems = [...config.semesters];
    sems[semIdx].subjects[subIdx][field] = value;

    if (field === "formula") {
      try {
        const vars = extractVariables(value);
        sems[semIdx].subjects[subIdx].controls = vars.map((v) => ({
          name: v.toUpperCase(),
          variable: v,
          date: null,
          score: null,
        }));
      } catch {}
    }
    setConfig({ ...config, semesters: sems });
  };

  const updateControlDate = (semIdx, subIdx, ctrlIdx, date) => {
    const sems = [...config.semesters];
    sems[semIdx].subjects[subIdx].controls[ctrlIdx].date = date;
    setConfig({ ...config, semesters: sems });
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Update user onboarding info
      const userRes = await api.put("/user/onboarding", {
        totalSemesters: config.totalSemesters,
        currentSemester: config.currentSemester,
      });
      updateUser(userRes.data);

      // Create semesters
      const createdSems = [];
      for (const sem of config.semesters) {
        const validSubjects = sem.subjects.filter((s) => s.name && s.formula);
        if (validSubjects.length === 0) continue;
        const res = await api.post("/semesters", {
          ...sem,
          subjects: validSubjects,
        });
        createdSems.push(res.data);
      }
      setSemesters(createdSems);
      toast.success("Configuration terminée ! 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "var(--bg)" }}>
      <div className="max-w-lg mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${i <= step ? "text-white" : "text-gray-400"}`}
                style={{
                  background: i <= step ? "var(--primary)" : "var(--border)",
                }}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="w-8 h-0.5 mx-1"
                  style={{
                    background: i < step ? "var(--primary)" : "var(--border)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="animate-slide-up text-center space-y-6">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl"
              style={{ background: "var(--primary)" }}
            >
              <BookOpen size={40} color="white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Bienvenue {user?.name || ""} ! 👋
              </h1>
              <p style={{ color: "var(--text-muted)" }}>
                Configures ton espace en quelques étapes pour un suivi
                personnalisé de tes notes.
              </p>
            </div>
            <div className="card p-4 text-left">
              <p className="text-sm font-medium mb-2">Tu vas :</p>
              <ul
                className="text-sm space-y-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                <li>• Définir le nombre de semestres de ta formation</li>
                <li>• Ajouter tes matières avec leur formule de calcul</li>
                <li>• Fixer tes objectifs de moyenne</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 1: Semesters config */}
        {step === 1 && (
          <div className="animate-slide-up space-y-4">
            <h2 className="section-title">Configuration des semestres</h2>

            <div className="card p-4 space-y-4">
              <div>
                <label className="label">Nombre total de semestres</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  className="input"
                  value={config.totalSemesters}
                  onChange={(e) =>
                    updateSemCount(
                      parseInt(e.target.value) || 1,
                      config.currentSemester,
                    )
                  }
                />
              </div>
              <div>
                <label className="label">Semestre actuel</label>
                <select
                  className="input"
                  value={config.currentSemester}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      currentSemester: parseInt(e.target.value),
                    })
                  }
                >
                  {Array.from({ length: config.totalSemesters }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Semestre {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {config.semesters.map((sem, idx) => (
                <div
                  key={idx}
                  className="border rounded-xl p-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex gap-2">
                    <input
                      className="input"
                      placeholder={`Nom semestre ${idx + 1}`}
                      value={sem.name}
                      onChange={(e) => {
                        const s = [...config.semesters];
                        s[idx].name = e.target.value;
                        setConfig({ ...config, semesters: s });
                      }}
                    />
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.5}
                      className="input w-24"
                      placeholder="Obj."
                      value={sem.targetAverage}
                      onChange={(e) => {
                        const s = [...config.semesters];
                        s[idx].targetAverage = parseFloat(e.target.value);
                        setConfig({ ...config, semesters: s });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Subjects */}
        {step === 2 && (
          <div className="animate-slide-up space-y-4">
            <h2 className="section-title">Matières par semestre</h2>

            <div
              className="card p-3 flex gap-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Info size={14} className="mt-0.5 shrink-0" />
              <span>
                Formule ex:{" "}
                <code className="font-mono bg-gray-100 px-1 rounded">
                  (i1+i2)*0.4 + (0.6*d1)
                </code>{" "}
                — les variables (i1, i2, d1) deviennent automatiquement tes
                contrôles.
              </span>
            </div>

            {config.semesters.map((sem, semIdx) => (
              <div key={semIdx} className="card p-4 space-y-3">
                <h3
                  className="font-bold text-sm"
                  style={{ color: "var(--primary)" }}
                >
                  {sem.name}
                </h3>

                {sem.subjects.map((subj, subIdx) => (
                  <div
                    key={subIdx}
                    className="border rounded-xl p-3 space-y-2"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex gap-2">
                      <input
                        className="input"
                        placeholder="Nom de la matière"
                        value={subj.name}
                        onChange={(e) =>
                          updateSubject(semIdx, subIdx, "name", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        min={0.5}
                        max={10}
                        step={0.5}
                        className="input w-20"
                        placeholder="Coeff"
                        value={subj.coefficient}
                        onChange={(e) =>
                          updateSubject(
                            semIdx,
                            subIdx,
                            "coefficient",
                            parseFloat(e.target.value),
                          )
                        }
                      />
                      {sem.subjects.length > 1 && (
                        <button
                          onClick={() => removeSubject(semIdx, subIdx)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <input
                      className="input font-mono text-sm"
                      placeholder="Formule : (i1+i2)*0.4 + (0.6*d1)"
                      value={subj.formula}
                      onChange={(e) =>
                        updateSubject(semIdx, subIdx, "formula", e.target.value)
                      }
                    />

                    {subj.controls.length > 0 && (
                      <div className="space-y-2">
                        <p
                          className="text-xs font-medium"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Contrôles détectés — date optionnelle :
                        </p>
                        {subj.controls.map((ctrl, ctrlIdx) => (
                          <div
                            key={ctrlIdx}
                            className="flex items-center gap-2"
                          >
                            <span
                              className="text-xs font-mono px-2 py-1 rounded-lg"
                              style={{
                                background: "var(--primary-light)",
                                color: "var(--primary)",
                              }}
                            >
                              {ctrl.variable}
                            </span>
                            <input
                              className="input text-sm"
                              placeholder={ctrl.name}
                              value={ctrl.name}
                              onChange={(e) => {
                                const sems = [...config.semesters];
                                sems[semIdx].subjects[subIdx].controls[
                                  ctrlIdx
                                ].name = e.target.value;
                                setConfig({ ...config, semesters: sems });
                              }}
                            />
                            <input
                              type="date"
                              className="input w-36 text-sm"
                              onChange={(e) =>
                                updateControlDate(
                                  semIdx,
                                  subIdx,
                                  ctrlIdx,
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <label
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Objectif :
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.5}
                        className="input w-20 text-sm"
                        value={subj.targetAverage}
                        onChange={(e) =>
                          updateSubject(
                            semIdx,
                            subIdx,
                            "targetAverage",
                            parseFloat(e.target.value),
                          )
                        }
                      />
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        /20
                      </span>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addSubject(semIdx)}
                  className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Ajouter une matière
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="animate-slide-up text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold">Tout est prêt !</h2>
            <p style={{ color: "var(--text-muted)" }}>
              {config.semesters.reduce(
                (acc, s) => acc + s.subjects.filter((sub) => sub.name).length,
                0,
              )}{" "}
              matière(s) configurée(s) sur {config.totalSemesters} semestre(s).
            </p>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="btn-primary px-8 py-3 text-base"
            >
              {loading ? "Finalisation..." : "Commencer StudyNotes →"}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="btn-ghost flex items-center gap-2 disabled:invisible"
          >
            <ChevronLeft size={18} /> Retour
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary flex items-center gap-2"
            >
              Suivant <ChevronRight size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
