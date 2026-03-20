import { useState, useEffect } from "react";
import {
  ChevronDown,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import useStore from "../store/useStore";
import api from "../utils/api";
import {
  evaluateFormula,
  calculateRequired,
  extractVariables,
} from "../utils/gradeCalc";
import toast from "react-hot-toast";

export default function NotesPage() {
  const { semesters, user, updateSemester } = useStore();
  const [selectedSemId, setSelectedSemId] = useState("");
  const [aiFeedbacks, setAiFeedbacks] = useState({});
  const [loadingFeedback, setLoadingFeedback] = useState({});
  const [bilan, setBilan] = useState("");
  const [loadingBilan, setLoadingBilan] = useState(false);

  const semester =
    semesters.find((s) => s._id === selectedSemId) || semesters[0];

  useEffect(() => {
    if (semesters.length && !selectedSemId) {
      const cur =
        semesters.find((s) => s.number === user?.currentSemester) ||
        semesters[0];
      setSelectedSemId(cur._id);
    }
  }, [semesters]);

  const getScores = (subject) => {
    const scores = {};
    subject.controls.forEach((c) => {
      if (c.score !== null) scores[c.variable] = c.score;
    });
    return scores;
  };

  const computeAverage = (subject) => {
    const scores = getScores(subject);
    if (Object.keys(scores).length === 0) return null;
    return evaluateFormula(subject.formula, scores);
  };

  const computeRequired = (subject) => {
    const scores = getScores(subject);
    const vars = extractVariables(subject.formula);
    return calculateRequired(
      subject.formula,
      scores,
      vars,
      subject.targetAverage,
    );
  };

  const handleScoreUpdate = async (
    semId,
    subjectIndex,
    controlIndex,
    score,
  ) => {
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 20) return;

    try {
      const res = await api.put(
        `/semesters/${semId}/subjects/${subjectIndex}/controls/${controlIndex}`,
        { score: scoreNum },
      );
      updateSemester(res.data);

      // Trigger AI feedback
      const subject = res.data.subjects[subjectIndex];
      const avg = computeAverage(subject);
      const req = computeRequired(subject);
      const missingCount = subject.controls.filter(
        (c) => c.score === null,
      ).length;

      fetchAIFeedback(subject, scoreNum, avg, req, missingCount, subjectIndex);

      // Check if semester complete for bilan
      const allFilled = res.data.subjects.every((s) =>
        s.controls.every((c) => c.score !== null),
      );
      if (allFilled && !res.data.globalBilanGenerated) {
        fetchBilan(res.data);
      }
    } catch (err) {
      toast.error("Erreur mise à jour");
    }
  };

  const fetchAIFeedback = async (
    subject,
    score,
    avg,
    req,
    missingCount,
    subIdx,
  ) => {
    const key = `${subject.name}-${subIdx}`;
    setLoadingFeedback((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await api.post("/ai/note-feedback", {
        subjectName: subject.name,
        score,
        targetAverage: subject.targetAverage,
        currentAverage: avg,
        requiredNext: Object.values(req.requiredScores)[0] ?? null,
        controlsLeft: missingCount,
      });
      setAiFeedbacks((prev) => ({ ...prev, [key]: res.data.feedback }));
    } catch {
    } finally {
      setLoadingFeedback((prev) => ({ ...prev, [key]: false }));
    }
  };

  const fetchBilan = async (sem) => {
    setLoadingBilan(true);
    try {
      const subjects = sem.subjects.map((s) => ({
        name: s.name,
        average: computeAverage(s) || 0,
        target: s.targetAverage,
        coefficient: s.coefficient,
      }));
      const res = await api.post("/ai/semester-bilan", {
        semesterNumber: sem.number,
        subjects,
      });
      setBilan(res.data.bilan);
      await api.put(`/semesters/${sem._id}`, { globalBilanGenerated: true });
    } catch {
    } finally {
      setLoadingBilan(false);
    }
  };

  if (!semester)
    return (
      <div
        className=" text-center py-16"
        style={{ color: "var(--text-muted)" }}
      >
        <p>Aucun semestre disponible</p>
      </div>
    );

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title mb-0">Notes</h1>
        <select
          className="input w-40 text-sm"
          value={selectedSemId}
          onChange={(e) => setSelectedSemId(e.target.value)}
        >
          {semesters.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {semester.subjects.map((subject, subIdx) => {
        const avg = computeAverage(subject);
        const req = computeRequired(subject);
        const key = `${subject.name}-${subIdx}`;
        const isPassing = avg !== null && avg >= subject.targetAverage;

        return (
          <div key={subIdx} className="card mb-4 overflow-hidden">
            {/* Header */}
            <div
              className="p-3 pb-2 flex items-start justify-between"
              style={{ borderBottom: `1px solid var(--border)` }}
            >
              <div>
                <h3 className="font-bold">
                  {subject.name.replace(/&amp;/g, "&")}
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Coeff. {subject.coefficient}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-xl font-bold"
                  style={{
                    color:
                      avg !== null
                        ? isPassing
                          ? "#22c55e"
                          : "var(--accent)"
                        : "var(--text-muted)",
                  }}
                >
                  {avg !== null ? avg.toFixed(2) : "—"}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  obj. {subject.targetAverage}/20
                </p>
              </div>
            </div>

            {/* Progress */}
            {avg !== null && (
              <div className="px-3 py-1.5">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, (avg / 20) * 100)}%`,
                      background: isPassing ? "#22c55e" : "var(--accent)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="p-3 pt-1.5 space-y-2">
              {subject.controls.map((ctrl, ctrlIdx) => (
                <div key={ctrlIdx} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ctrl.name}</p>
                    {ctrl.date && (
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {new Date(ctrl.date).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.5}
                      className="input w-16 py-1 text-center text-base font-bold"
                      placeholder="—"
                      defaultValue={ctrl.score ?? ""}
                      onBlur={(e) => {
                        if (e.target.value !== "")
                          handleScoreUpdate(
                            semester._id,
                            subIdx,
                            ctrlIdx,
                            e.target.value,
                          );
                      }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      /20
                    </span>
                    {ctrl.score !== null &&
                      (ctrl.score >= 10 ? (
                        <CheckCircle size={16} color="#22c55e" />
                      ) : (
                        <AlertCircle size={16} color="var(--accent)" />
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Required next */}
            {Object.keys(req.requiredScores).length > 0 && (
              <div className="px-3 pb-2.5">
                <div
                  className="rounded-lg px-2.5 py-1.5 text-[11px]"
                  style={{
                    background: req.isPossible
                      ? "var(--primary-light)"
                      : "#fee2e2",
                  }}
                >
                  <span className="font-medium">
                    {req.isPossible
                      ? `Il te faut au moins ${Object.values(req.requiredScores)[0].toFixed(1)}/20 sur ${Object.keys(req.requiredScores).join(", ")} pour atteindre ton objectif`
                      : `⚠️ Objectif ${subject.targetAverage}/20 hors d'atteinte même avec 20`}
                  </span>
                </div>
              </div>
            )}

            {/* AI Feedback */}
            {(aiFeedbacks[key] || loadingFeedback[key]) && (
              <div className="px-3 pb-3">
                <div
                  className="rounded-lg p-2.5 flex gap-2"
                  style={{ background: "var(--primary-light)" }}
                >
                  <Sparkles
                    size={16}
                    className="shrink-0 mt-0.5"
                    style={{ color: "var(--primary)" }}
                  />
                  <p
                    className="text-sm italic"
                    style={{ color: "var(--primary)" }}
                  >
                    {loadingFeedback[key]
                      ? "Analyse en cours..."
                      : aiFeedbacks[key]}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Global Bilan */}
      {(bilan || loadingBilan) && (
        <div
          className="card p-4 mt-4"
          style={{ borderLeft: "4px solid var(--primary)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} style={{ color: "var(--primary)" }} />
            <span className="font-bold">Bilan de semestre IA</span>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text)" }}
          >
            {loadingBilan ? "Génération du bilan..." : bilan}
          </p>
        </div>
      )}
    </div>
  );
}
