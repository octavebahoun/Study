import { useState, useEffect } from "react";
import {
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  BookMarked,
  Edit2,
  Settings,
  Save,
  File,
  Trash2,
  Loader2,
  Upload,
} from "lucide-react";
import useStore from "../store/useStore";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function MatieresPage() {
  const { semesters, user, updateSemester } = useStore();
  const [selectedSemId, setSelectedSemId] = useState("");
  const [expanded, setExpanded] = useState({});
  const [notionInputs, setNotionInputs] = useState({});
  const [saving, setSaving] = useState({});
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    coefficient: 1,
    targetAverage: 10,
  });
  const [uploading, setUploading] = useState({});

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

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleAddSubject = async () => {
    if (!subjectForm.name || !subjectForm.formula) {
      return toast.error("Nom et formule requis");
    }

    try {
      const newSubjects = [
        ...semester.subjects,
        { ...subjectForm, notions: [], controls: [] },
      ];
      const res = await api.put(`/semesters/${semester._id}`, {
        subjects: newSubjects,
      });
      updateSemester(res.data);
      setIsAddingSubject(false);
      setSubjectForm({
        name: "",
        coefficient: 1,
        formula: "",
        targetAverage: 10,
      });
      toast.success("Matière ajoutée !");
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleUpdateSubject = async (index) => {
    try {
      const newSubjects = [...semester.subjects];
      newSubjects[index] = { ...newSubjects[index], ...subjectForm };
      const res = await api.put(`/semesters/${semester._id}`, {
        subjects: newSubjects,
      });
      updateSemester(res.data);
      setEditingSubject(null);
      toast.success("Matière mise à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteSubject = async (index) => {
    if (!window.confirm("Supprimer cette matière ?")) return;
    try {
      const newSubjects = semester.subjects.filter((_, i) => i !== index);
      const res = await api.put(`/semesters/${semester._id}`, {
        subjects: newSubjects,
      });
      updateSemester(res.data);
      toast.success("Matière supprimée");
    } catch {
      toast.error("Erreur");
    }
  };

  const addNotion = async (subjectIndex) => {
    const key = `${selectedSemId}-${subjectIndex}`;
    const notion = notionInputs[key]?.trim();
    if (!notion) return;

    const subject = semester.subjects[subjectIndex];
    const newNotions = [...(subject.notions || []), notion];

    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await api.put(
        `/semesters/${semester._id}/subjects/${subjectIndex}/notions`,
        { notions: newNotions },
      );
      updateSemester(res.data);
      setNotionInputs((prev) => ({ ...prev, [key]: "" }));
      toast.success("Notion ajoutée");
    } catch {
      toast.error("Erreur");
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleFileUpload = async (subjectIndex, file) => {
    if (!file) return;
    const key = `${selectedSemId}-${subjectIndex}`;
    setUploading((prev) => ({ ...prev, [key]: true }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(
        `/subjects/${selectedSemId}/subjects/${subjectIndex}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      updateSemester(res.data);
      toast.success("Document ajouté");
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur upload");
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const deleteDocument = async (subjectIndex, docId) => {
    if (!confirm("Supprimer ce document ?")) return;
    try {
      const res = await api.delete(
        `/subjects/${selectedSemId}/subjects/${subjectIndex}/documents/${docId}`,
      );
      updateSemester(res.data);
      toast.success("Document supprimé");
    } catch (err) {
      toast.error("Erreur suppression");
    }
  };

  const removeNotion = async (subjectIndex, notionIndex) => {
    const key = `${selectedSemId}-${subjectIndex}`;
    const subject = semester.subjects[subjectIndex];
    const newNotions = subject.notions.filter((_, i) => i !== notionIndex);

    try {
      const res = await api.put(
        `/semesters/${semester._id}/subjects/${subjectIndex}/notions`,
        { notions: newNotions },
      );
      updateSemester(res.data);
    } catch {
      toast.error("Erreur");
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
        <h1 className="section-title mb-0">Matières</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddingSubject(true)}
            className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 hover:scale-105 transition-all"
            title="Ajouter une matière"
          >
            <Plus size={20} />
          </button>
          <select
            className="input w-36 text-sm"
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
      </div>

      {/* Add Subject Modal/Form */}
      {isAddingSubject && (
        <div className="card p-4 mb-5 border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold flex items-center gap-2">
              <Plus size={18} className="text-indigo-600" /> Nouvel objet
              d'étude
            </h2>
            <button
              onClick={() => setIsAddingSubject(false)}
              className="text-slate-400 hover:text-red-500"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nom de la matière</label>
              <input
                className="input"
                placeholder="Ex: Mathématiques"
                value={subjectForm.name}
                onChange={(e) =>
                  setSubjectForm({ ...subjectForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Coefficient</label>
              <input
                className="input"
                type="number"
                step="0.5"
                value={subjectForm.coefficient}
                onChange={(e) =>
                  setSubjectForm({
                    ...subjectForm,
                    coefficient: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="label">Moyenne cible (/20)</label>
              <input
                className="input"
                type="number"
                value={subjectForm.targetAverage}
                onChange={(e) =>
                  setSubjectForm({
                    ...subjectForm,
                    targetAverage: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <button
            onClick={handleAddSubject}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm"
          >
            <Save size={16} /> Enregistrer la matière
          </button>
        </div>
      )}

      <div className="space-y-3">
        {semester.subjects.map((subject, idx) => {
          const key = `${selectedSemId}-${idx}`;
          const isExpanded = expanded[idx];
          const notionCount = subject.notions?.length || 0;

          return (
            <div key={idx} className="card overflow-hidden">
              <div
                className="w-full p-3 flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(idx)}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--primary-light)" }}
                  >
                    <BookMarked size={16} style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {subject.name.replace(/&amp;/g, "&")}
                    </p>
                    <p
                      className="text-[10px] leading-tight"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Coeff. {subject.coefficient} · {notionCount} notion
                      {notionCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSubject(idx);
                      setSubjectForm({
                        name: subject.name,
                        coefficient: subject.coefficient,
                        targetAverage: subject.targetAverage,
                      });
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-all"
                  >
                    <Settings size={16} />
                  </button>
                  {isExpanded ? (
                    <ChevronUp
                      size={18}
                      style={{ color: "var(--text-muted)" }}
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      style={{ color: "var(--text-muted)" }}
                    />
                  )}
                </div>
              </div>

              {/* Edit Form */}
              {editingSubject === idx && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label text-[10px]">Nom</label>
                      <input
                        className="input text-sm"
                        value={subjectForm.name}
                        onChange={(e) =>
                          setSubjectForm({
                            ...subjectForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label text-[10px]">Coeff</label>
                        <input
                          className="input text-sm"
                          type="number"
                          value={subjectForm.coefficient}
                          onChange={(e) =>
                            setSubjectForm({
                              ...subjectForm,
                              coefficient: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="label text-[10px]">Cible</label>
                        <input
                          className="input text-sm"
                          type="number"
                          value={subjectForm.targetAverage}
                          onChange={(e) =>
                            setSubjectForm({
                              ...subjectForm,
                              targetAverage: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingSubject(null)}
                      className="btn-ghost text-sm py-2 flex-1"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => deleteSubject(idx)}
                      className="btn-ghost text-sm py-2 text-red-500 hover:bg-red-50 flex-1"
                    >
                      Supprimer
                    </button>
                    <button
                      onClick={() => handleUpdateSubject(idx)}
                      className="btn-primary text-sm py-2 flex-1"
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>
              )}

              {isExpanded && (
                <div
                  className="px-3 pb-3 space-y-3 border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  {/* Notions */}
                  <div>
                    <p
                      className="text-xs font-medium mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Notions étudiées
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {subject.notions?.map((notion, nIdx) => (
                        <span
                          key={nIdx}
                          className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px]"
                          style={{
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                          }}
                        >
                          {notion}
                          <button
                            onClick={() => removeNotion(idx, nIdx)}
                            className="hover:opacity-60"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      {subject.notions?.length === 0 && (
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Aucune notion ajoutée
                        </p>
                      )}
                    </div>

                    {/* Add Notion Input */}
                    <div className="flex gap-2 mb-3">
                      <input
                        className="input text-sm flex-1"
                        placeholder="Ajouter une notion..."
                        value={notionInputs[key] || ""}
                        onChange={(e) =>
                          setNotionInputs((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && addNotion(idx)}
                      />
                      <button
                        onClick={() => addNotion(idx)}
                        disabled={saving[key]}
                        className="btn-primary px-3"
                      >
                        {saving[key] ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Plus size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <p
                        className="text-[10px] font-bold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Documents (RAG)
                      </p>
                      <label className="cursor-pointer text-indigo-600 hover:text-indigo-700 transition-colors">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.txt,.docx"
                          onChange={(e) =>
                            handleFileUpload(idx, e.target.files[0])
                          }
                          disabled={uploading[key]}
                        />
                        {uploading[key] ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                      </label>
                    </div>

                    <div className="space-y-2">
                      {subject.documents?.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic">
                          Aucun document pour cette matière
                        </p>
                      )}
                      {subject.documents?.map((doc) => (
                        <div
                          key={doc._id}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <File
                              size={14}
                              className="text-slate-400 shrink-0"
                            />
                            <span className="text-xs truncate">{doc.name}</span>
                          </div>
                          <button
                            onClick={() => deleteDocument(idx, doc._id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p
                      className="text-[10px] font-bold mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Contrôles
                    </p>
                    <div className="space-y-1">
                      {subject.controls.map((ctrl, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="font-bold">{ctrl.name}</span>
                          <div className="flex items-center gap-2">
                            {ctrl.date && (
                              <span style={{ color: "var(--text-muted)" }}>
                                {new Date(ctrl.date).toLocaleDateString(
                                  "fr-FR",
                                )}
                              </span>
                            )}
                            <span
                              className={`badge scale-90 ${ctrl.score !== null ? "badge-success" : "badge-warning"}`}
                            >
                              {ctrl.score !== null
                                ? `${ctrl.score}/20`
                                : "À venir"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
