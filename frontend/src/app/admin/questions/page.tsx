"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { questionAPI } from "@/lib/api";
import { Question } from "@/types";

const TEST_TYPES = [
  { value: "COGNITIVE", label: "Cognitive Ability", color: "#7c3aed" },
  { value: "APTITUDE", label: "Aptitude Tests", color: "#0891b2" },
  { value: "PERSONALITY", label: "Personality", color: "#e11d48" },
  { value: "CAREER_INTEREST", label: "Career Interest", color: "#d97706" },
  { value: "EMOTIONAL_INTELLIGENCE", label: "Emotional Intelligence", color: "#ec4899" },
  { value: "LEARNING_STYLE", label: "Learning Style", color: "#059669" },
  { value: "BEHAVIORAL_SOCIAL", label: "Behavioral & Social", color: "#2563eb" },
  { value: "STRESS_RESILIENCE", label: "Stress & Resilience", color: "#0d9488" },
];

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [testType, setTestType] = useState("COGNITIVE");
  const [activeTab, setActiveTab] = useState(1);

  // Edit state
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [editText, setEditText] = useState("");
  const [editOptions, setEditOptions] = useState<{ label: string; text: string }[]>([]);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState("");
  const [editPassage, setEditPassage] = useState("");
  const [saving, setSaving] = useState(false);

  // Add state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addText, setAddText] = useState("");
  const [addPassage, setAddPassage] = useState("");
  const [addPartNumber, setAddPartNumber] = useState(1);
  const [addPartName, setAddPartName] = useState("");
  const [addOptions, setAddOptions] = useState([
    { label: "A", text: "" },
    { label: "B", text: "" },
    { label: "C", text: "" },
    { label: "D", text: "" },
  ]);
  const [addCorrectAnswer, setAddCorrectAnswer] = useState("A");
  const [adding, setAdding] = useState(false);

  const currentTypeConfig = TEST_TYPES.find((t) => t.value === testType)!;

  const fetchQuestions = () => {
    setLoading(true);
    questionAPI
      .getByTestTypeAdmin(testType)
      .then((res) => setQuestions(res.data.questions || []))
      .catch(() => toast.error("Failed to load questions"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuestions();
    setActiveTab(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testType]);

  // Dynamically detect parts from questions
  const partMap = new Map<number, { name: string; questions: Question[] }>();
  questions.forEach((q) => {
    if (!partMap.has(q.partNumber)) {
      partMap.set(q.partNumber, { name: q.partName, questions: [] });
    }
    partMap.get(q.partNumber)!.questions.push(q);
  });
  const parts = Array.from(partMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([num, val]) => ({ num, ...val }));

  const activePart = parts.find((p) => p.num === activeTab) || parts[0];
  const partQuestions =
    activePart?.questions?.sort((a, b) => a.questionNumber - b.questionNumber) || [];

  // ── Edit handlers ──
  const handleEditOpen = (q: Question) => {
    setEditQuestion(q);
    setEditText(q.questionText);
    setEditOptions(q.options.map((o) => ({ label: o.label, text: o.text })));
    setEditCorrectAnswer(q.correctAnswer || "A");
    setEditPassage(q.passage || "");
  };

  const handleEditSave = async () => {
    if (!editQuestion) return;
    setSaving(true);
    try {
      await questionAPI.update(editQuestion._id, {
        questionText: editText,
        options: editOptions,
        correctAnswer: editCorrectAnswer,
        passage: editPassage || undefined,
      });
      toast.success("Question updated");
      setEditQuestion(null);
      fetchQuestions();
    } catch {
      toast.error("Failed to update question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    try {
      await questionAPI.remove(id);
      toast.success("Question deleted");
      fetchQuestions();
    } catch {
      toast.error("Failed to delete question");
    }
  };

  // ── Add handler ──
  const openAddModal = () => {
    setAddText("");
    setAddPassage("");
    setAddPartNumber(activePart?.num || 1);
    setAddPartName(activePart?.name || "");
    setAddOptions([
      { label: "A", text: "" },
      { label: "B", text: "" },
      { label: "C", text: "" },
      { label: "D", text: "" },
    ]);
    setAddCorrectAnswer("A");
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!addText.trim() || !addPartName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (addOptions.some((o) => !o.text.trim())) {
      toast.error("Please fill in all options");
      return;
    }

    setAdding(true);
    try {
      await questionAPI.add({
        testType,
        partNumber: addPartNumber,
        partName: addPartName.trim(),
        questionText: addText.trim(),
        passage: addPassage.trim() || undefined,
        options: addOptions,
        correctAnswer: addCorrectAnswer,
      });
      toast.success("Question added successfully");
      setShowAddModal(false);
      fetchQuestions();
    } catch {
      toast.error("Failed to add question");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-500 mt-1">
            {questions.length} questions &middot; {currentTypeConfig.label}
          </p>
        </div>
        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
        >
          {TEST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
          {/* TOP: Horizontal Part Tabs */}
          {parts.length > 0 && (
            <div className="border-b border-gray-200 bg-white flex-shrink-0">
              <nav className="flex overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {parts.map((part) => {
                  const isActive = activePart?.num === part.num;
                  return (
                    <button
                      key={part.num}
                      onClick={() => setActiveTab(part.num)}
                      className={`relative flex-shrink-0 flex flex-col items-center gap-1 px-6 py-3.5 text-sm font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? "text-gray-900"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full"
                          style={{ backgroundColor: currentTypeConfig.color }}
                        />
                      )}
                      <span className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                          style={{
                            backgroundColor: isActive
                              ? currentTypeConfig.color
                              : currentTypeConfig.color + "99",
                          }}
                        >
                          P{part.num}
                        </span>
                        <span className={isActive ? "font-semibold" : ""}>
                          {part.name}
                        </span>
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {part.questions.length} Qs
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Panel header + questions */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">
                  {activePart
                    ? `Part ${activePart.num}: ${activePart.name}`
                    : "No questions yet"}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {partQuestions.length} question{partQuestions.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl transition hover:opacity-90"
                style={{ backgroundColor: currentTypeConfig.color }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Question
              </button>
            </div>

            {/* Questions list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {partQuestions.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-16">
                  No questions in this part yet.
                </p>
              )}
              {partQuestions.map((q) => (
                <div
                  key={q._id}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition group"
                >
                  <div className="flex items-start gap-3">
                    {/* Question number badge */}
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold mt-0.5"
                      style={{ backgroundColor: currentTypeConfig.color }}
                    >
                      {q.questionNumber}
                    </span>
                    {/* Question content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-relaxed font-medium">
                        {q.questionText}
                      </p>
                      {q.passage && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 italic">
                          Passage: {q.passage}
                        </p>
                      )}
                      {/* Options row */}
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {q.options.map((opt) => (
                          <span
                            key={opt.label}
                            className={`text-xs px-2.5 py-1 rounded-lg border ${
                              q.correctAnswer === opt.label
                                ? "bg-green-50 text-green-700 border-green-200 font-semibold"
                                : "bg-white text-gray-600 border-gray-200"
                            }`}
                          >
                            <strong>{opt.label}.</strong> {opt.text}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleEditOpen(q)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                        title="Edit"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                        title="Delete"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ Edit Modal ═══════════ */}
      {editQuestion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Edit Question</h3>
            <p className="text-sm text-gray-500 mb-4">
              Q{editQuestion.questionNumber} &middot; {editQuestion.partName}
            </p>

            {/* Question text */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Question Text
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Question text…"
              />
            </div>

            {/* Passage (optional) */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Passage <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                value={editPassage}
                onChange={(e) => setEditPassage(e.target.value)}
                placeholder="Passage text…"
              />
            </div>

            {/* Options */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Options</label>
              <div className="space-y-2">
                {editOptions.map((opt, idx) => (
                  <div key={opt.label} className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-500 w-6">{opt.label}.</span>
                    <input
                      type="text"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...editOptions];
                        newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                        setEditOptions(newOpts);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Correct answer */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Correct Answer
              </label>
              <div className="flex gap-2">
                {editOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setEditCorrectAnswer(opt.label)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition ${
                      editCorrectAnswer === opt.label
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditQuestion(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving || !editText.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ Add Question Modal ═══════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-5">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: currentTypeConfig.color }}
              >
                +
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Question</h3>
                <p className="text-sm text-gray-500">{currentTypeConfig.label}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Part number & name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Part Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={addPartNumber}
                    onChange={(e) => setAddPartNumber(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Part Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={addPartName}
                    onChange={(e) => setAddPartName(e.target.value)}
                    placeholder="e.g. Verbal Reasoning"
                  />
                  {parts.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {parts.map((p) => (
                        <button
                          key={p.num}
                          type="button"
                          onClick={() => {
                            setAddPartNumber(p.num);
                            setAddPartName(p.name);
                          }}
                          className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                        >
                          P{p.num}: {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Question text */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Question Text
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[90px]"
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  placeholder="Enter the question text…"
                />
              </div>

              {/* Passage (optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Passage <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                  value={addPassage}
                  onChange={(e) => setAddPassage(e.target.value)}
                  placeholder="Enter passage text (if any)…"
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Options</label>
                <div className="space-y-2">
                  {addOptions.map((opt, idx) => (
                    <div key={opt.label} className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-500 w-6">{opt.label}.</span>
                      <input
                        type="text"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...addOptions];
                          newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                          setAddOptions(newOpts);
                        }}
                        placeholder={`Option ${opt.label}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct answer */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Correct Answer
                </label>
                <div className="flex gap-2">
                  {addOptions.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setAddCorrectAnswer(opt.label)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition ${
                        addCorrectAnswer === opt.label
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={adding || !addText.trim() || !addPartName.trim() || addOptions.some((o) => !o.text.trim())}
                className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: currentTypeConfig.color }}
              >
                {adding ? "Adding…" : "Add Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
