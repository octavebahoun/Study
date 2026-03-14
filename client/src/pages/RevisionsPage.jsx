import React, { useState } from "react";
import {
  Layers,
  HelpCircle,
  FileText,
  Mic,
  Search,
  Map,
  Eye,
  ChevronDown,
  Play,
  RotateCcw,
} from "lucide-react";
import useStore from "../store/useStore";
import api from "../utils/api";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

const FEATURES = [
  { id: "flashcards", icon: Layers, label: "Flashcards" },
  { id: "quiz", icon: HelpCircle, label: "Quiz" },
  { id: "summary", icon: FileText, label: "Résumé" },
  { id: "podcast", icon: Mic, label: "Podcast" },
  { id: "rag", icon: Search, label: "Mini RAG" },
  { id: "roadmap", icon: Map, label: "Roadmap" },
  { id: "visualizer", icon: Eye, label: "Visualiseur" },
  { id: "history", icon: RotateCcw, label: "Historique" },
];

export default function RevisionsPage() {
  const {
    semesters,
    user,
    groqModels,
    selectedGroqModel,
    setSelectedGroqModel,
  } = useStore();
  const [selectedSemId, setSelectedSemId] = useState(semesters[0]?._id || "");
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0);
  const [activeFeature, setActiveFeature] = useState("flashcards");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [ragQuery, setRagQuery] = useState("");
  const [vizPrompt, setVizPrompt] = useState("");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizRevealed, setQuizRevealed] = useState({});
  const [flashIdx, setFlashIdx] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const semester = semesters.find((s) => s._id === selectedSemId);
  const subject = semester?.subjects[selectedSubjectIdx];

  const fetchHistory = async () => {
    if (!subject) return;
    setLoadingHistory(true);
    try {
      const res = await api.get(
        `/revisions/${selectedSemId}/${encodeURIComponent(subject.name)}`,
      );
      setHistory(res.data);
    } catch (err) {
      console.error("Erreur historique", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const generate = async () => {
    if (!subject) return toast.error("Sélectionne une matière");
    if (
      !subject.notions?.length &&
      activeFeature !== "rag" &&
      activeFeature !== "visualizer"
    ) {
      return toast.error("Ajoute d'abord des notions dans l'onglet Matières");
    }

    setLoading(true);
    setResult(null);
    setAudioUrl(null);
    setFlashIdx(0);
    setFlashFlipped(false);
    setQuizAnswers({});
    setQuizRevealed({});

    try {
      if (activeFeature === "podcast") {
        const res = await api.post("/ai/revision/podcast", {
          notions: subject.notions,
          subjectName: subject.name,
          model: selectedGroqModel,
          semesterId: selectedSemId,
        });
        setAudioUrl(res.data.audioUrl);
        setResult({ type: "podcast", summary: res.data.summary });
        return;
      }

      if (activeFeature === "rag") {
        if (!ragQuery.trim()) return toast.error("Écris ta question");
        const res = await api.post("/ai/revision/rag", {
          query: ragQuery,
          notions: subject.notions || [],
          subjectName: subject.name,
          model: selectedGroqModel,
          semesterId: selectedSemId,
        });
        setResult({ type: "rag", answer: res.data.answer });
        return;
      }

      if (activeFeature === "visualizer") {
        if (!vizPrompt.trim())
          return toast.error("Décris le sujet à visualiser");
        const res = await api.post("/ai/revision/visualizer", {
          prompt: vizPrompt,
          model: selectedGroqModel,
          subjectName: subject.name,
          semesterId: selectedSemId,
        });
        setResult({ type: "visualizer", html: res.data.html });
        return;
      }

      const res = await api.post(`/ai/revision/${activeFeature}`, {
        notions: subject.notions,
        subjectName: subject.name,
        model: selectedGroqModel,
        semesterId: selectedSemId,
      });
      setResult({ type: activeFeature, ...res.data });
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur génération");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <h1 className="section-title">Révisions</h1>

      {/* Subject & Model selection */}
      <div className="card p-4 mb-4 space-y-3">
        <div className="flex gap-2">
          <select
            className="input text-sm flex-1"
            value={selectedSemId}
            onChange={(e) => {
              setSelectedSemId(e.target.value);
              setSelectedSubjectIdx(0);
              setResult(null);
            }}
          >
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            className="input text-sm flex-1"
            value={selectedSubjectIdx}
            onChange={(e) => {
              setSelectedSubjectIdx(parseInt(e.target.value));
              setResult(null);
            }}
          >
            {semester?.subjects.map((s, i) => (
              <option key={i} value={i}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Modèle IA (Groq)</label>
          <select
            className="input text-sm"
            value={selectedGroqModel}
            onChange={(e) => setSelectedGroqModel(e.target.value)}
          >
            {groqModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feature tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {FEATURES.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => {
              setActiveFeature(id);
              setResult(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeFeature === id ? "text-white" : ""}`}
            style={{
              background:
                activeFeature === id ? "var(--primary)" : "var(--surface)",
              color: activeFeature === id ? "white" : "var(--text-muted)",
              border: `1px solid ${activeFeature === id ? "var(--primary)" : "var(--border)"}`,
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Feature-specific inputs */}
      {activeFeature === "rag" && (
        <div className="mb-4">
          <input
            className="input"
            placeholder="Pose ta question sur les notions..."
            value={ragQuery}
            onChange={(e) => setRagQuery(e.target.value)}
          />
        </div>
      )}

      {activeFeature === "visualizer" && (
        <div className="mb-4">
          <input
            className="input"
            placeholder="Ex: Explique les lois de Newton"
            value={vizPrompt}
            onChange={(e) => setVizPrompt(e.target.value)}
          />
        </div>
      )}

      {/* Generate button */}
      {activeFeature !== "history" && (
        <button
          onClick={generate}
          disabled={loading}
          className="btn-primary w-full mb-6 flex items-center justify-center gap-2"
        >
          {loading ? (
            "Génération..."
          ) : (
            <>
              Générer <Play size={16} />
            </>
          )}
        </button>
      )}

      {/* History View */}
      {activeFeature === "history" && (
        <div className="space-y-4 mb-6">
          <button
            onClick={fetchHistory}
            disabled={loadingHistory}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            {loadingHistory ? (
              "Chargement..."
            ) : (
              <>
                <RotateCcw size={16} /> Rafraîchir l'historique
              </>
            )}
          </button>

          <div className="space-y-3">
            {history.length === 0 && !loadingHistory && (
              <p className="text-center text-slate-400 py-8 italic">
                Aucun historique pour cette matière
              </p>
            )}
            {history.map((item) => (
              <div
                key={item._id}
                className="card p-3 flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-colors"
                onClick={() => {
                  setResult({ type: item.type, ...item.content });
                  if (item.type === "podcast")
                    setAudioUrl(item.content.audioUrl);
                  setActiveFeature(item.type);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    {FEATURES.find((f) => f.id === item.type)?.icon &&
                      React.createElement(
                        FEATURES.find((f) => f.id === item.type).icon,
                        { size: 16 },
                      )}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{item.type}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono text-slate-300">
                  {item.model?.split("/")[1] || item.model}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="animate-slide-up">
          {/* FLASHCARDS */}
          {result.type === "flashcards" && result.flashcards && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  {flashIdx + 1} / {result.flashcards.length}
                </span>
                <button
                  onClick={() => {
                    setFlashIdx(0);
                    setFlashFlipped(false);
                  }}
                  className="btn-ghost text-sm flex items-center gap-1"
                >
                  <RotateCcw size={14} /> Recommencer
                </button>
              </div>
              <div
                className="card p-6 min-h-48 flex flex-col items-center justify-center cursor-pointer text-center"
                onClick={() => setFlashFlipped(!flashFlipped)}
                style={{
                  background: flashFlipped
                    ? "var(--primary-light)"
                    : "var(--surface)",
                }}
              >
                <p
                  className="text-xs font-medium mb-3 uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  {flashFlipped ? "Réponse" : "Question"} ·{" "}
                  {result.flashcards[flashIdx].difficulty}
                </p>
                <p className="text-lg font-medium leading-relaxed">
                  {flashFlipped
                    ? result.flashcards[flashIdx].answer
                    : result.flashcards[flashIdx].question}
                </p>
                <p
                  className="text-xs mt-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  Clique pour retourner
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFlashIdx((i) => Math.max(0, i - 1));
                    setFlashFlipped(false);
                  }}
                  disabled={flashIdx === 0}
                  className="btn-secondary flex-1"
                >
                  ← Précédent
                </button>
                <button
                  onClick={() => {
                    setFlashIdx((i) =>
                      Math.min(result.flashcards.length - 1, i + 1),
                    );
                    setFlashFlipped(false);
                  }}
                  disabled={flashIdx === result.flashcards.length - 1}
                  className="btn-primary flex-1"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* QUIZ */}
          {result.type === "quiz" && result.quiz && (
            <div className="space-y-4">
              {result.quiz.map((q, qIdx) => (
                <div key={qIdx} className="card p-4">
                  <p className="font-medium mb-3">
                    Q{qIdx + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const selected = quizAnswers[qIdx] === oIdx;
                      const revealed = quizRevealed[qIdx];
                      const isCorrect = oIdx === q.correct;
                      let bg = "var(--surface)",
                        border = "var(--border)",
                        color = "var(--text)";
                      if (revealed) {
                        if (isCorrect) {
                          bg = "#dcfce7";
                          border = "#22c55e";
                        } else if (selected && !isCorrect) {
                          bg = "#fee2e2";
                          border = "#ef4444";
                        }
                      } else if (selected) {
                        bg = "var(--primary-light)";
                        border = "var(--primary)";
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() =>
                            !revealed &&
                            setQuizAnswers((prev) => ({
                              ...prev,
                              [qIdx]: oIdx,
                            }))
                          }
                          className="w-full text-left px-3 py-2 rounded-xl text-sm transition-all"
                          style={{
                            background: bg,
                            border: `1.5px solid ${border}`,
                            color,
                          }}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </button>
                      );
                    })}
                  </div>
                  {!quizRevealed[qIdx] && quizAnswers[qIdx] !== undefined && (
                    <button
                      className="btn-primary text-sm mt-3"
                      onClick={() =>
                        setQuizRevealed((prev) => ({ ...prev, [qIdx]: true }))
                      }
                    >
                      Valider
                    </button>
                  )}
                  {quizRevealed[qIdx] && (
                    <p
                      className="text-sm mt-2 italic"
                      style={{ color: "var(--text-muted)" }}
                    >
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SUMMARY */}
          {result.type === "summary" && (
            <div
              className="card p-4 prose prose-sm max-w-none"
              style={{ color: "var(--text)" }}
            >
              <ReactMarkdown>{result.summary}</ReactMarkdown>
            </div>
          )}

          {/* PODCAST */}
          {result.type === "podcast" && (
            <div className="space-y-4">
              {audioUrl && (
                <div className="card p-4">
                  <p className="font-bold mb-3 flex items-center gap-2">
                    <Mic size={18} style={{ color: "var(--primary)" }} />{" "}
                    Écouter le podcast
                  </p>
                  <audio controls className="w-full" src={audioUrl} />
                </div>
              )}
              <div
                className="card p-4 prose prose-sm max-w-none"
                style={{ color: "var(--text)" }}
              >
                <ReactMarkdown>{result.summary}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* RAG */}
          {result.type === "rag" && (
            <div className="card p-4">
              <p className="font-bold mb-2 flex items-center gap-2">
                <Search size={16} style={{ color: "var(--primary)" }} /> Réponse
              </p>
              <p className="text-sm leading-relaxed">{result.answer}</p>
            </div>
          )}

          {/* ROADMAP */}
          {result.type === "roadmap" && result.roadmap && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg">{result.roadmap.title}</h3>
              {result.roadmap.steps?.map((step, i) => (
                <div key={i} className="card p-4 flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white"
                    style={{ background: "var(--primary)" }}
                  >
                    {step.order}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{step.title}</p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {step.description}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--primary)" }}
                    >
                      ⏱ {step.duration}
                    </p>
                    {step.resources?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {step.resources.map((r, ri) => (
                          <div
                            key={ri}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span
                              className={`badge ${r.type === "youtube" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
                            >
                              {r.type === "youtube" ? "▶ YouTube" : "🌐 Web"}
                            </span>
                            <span style={{ color: "var(--text-muted)" }}>
                              {r.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VISUALIZER */}
          {result.type === "visualizer" && result.html && (
            <div className="space-y-3">
              <p className="font-bold flex items-center gap-2">
                <Eye size={16} style={{ color: "var(--primary)" }} /> Résultat
              </p>
              <div
                className="rounded-2xl overflow-hidden shadow-lg border"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="px-4 py-2 flex items-center gap-2"
                  style={{
                    background: "var(--surface)",
                    borderBottom: `1px solid var(--border)`,
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span
                    className="text-xs ml-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Aperçu
                  </span>
                </div>
                <iframe
                  srcDoc={result.html}
                  className="w-full"
                  style={{ height: "600px", border: "none" }}
                  sandbox="allow-scripts allow-same-origin"
                  title="Visualisation"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
