"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { questionAPI } from "@/lib/api";
import { Question } from "@/types";

// ── Part metadata per test type ──
const COGNITIVE_PARTS = [
  { num: 1, name: "Verbal Reasoning", color: "#3b82f6" },
  { num: 2, name: "Numerical Reasoning", color: "#8b5cf6" },
  { num: 3, name: "Spatial Reasoning", color: "#10b981" },
  { num: 4, name: "Memory & Processing Speed", color: "#f97316" },
] as const;

const APTITUDE_PARTS = [
  { num: 1, name: "Logical Reasoning", color: "#3b82f6" },
  { num: 2, name: "Numerical Aptitude", color: "#8b5cf6" },
  { num: 3, name: "Verbal Aptitude", color: "#10b981" },
  { num: 4, name: "Mechanical Aptitude", color: "#f97316" },
  { num: 5, name: "Creativity", color: "#ec4899" },
] as const;

type TestTypeToggle = "COGNITIVE" | "APTITUDE";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [testType, setTestType] = useState<TestTypeToggle>("COGNITIVE");
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
  const [addOptions, setAddOptions] = useState([
    { label: "A", text: "" },
    { label: "B", text: "" },
    { label: "C", text: "" },
    { label: "D", text: "" },
  ]);
  const [addCorrectAnswer, setAddCorrectAnswer] = useState("A");
  const [adding, setAdding] = useState(false);

  const PARTS = testType === "COGNITIVE" ? COGNITIVE_PARTS : APTITUDE_PARTS;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testType]);

  // Reset active tab when test type changes
  useEffect(() => {
    setActiveTab(1);
  }, [testType]);

  const activePart = PARTS.find((p) => p.num === activeTab)!;
  const partQuestions = questions
    .filter((q) => q.partNumber === activeTab)
    .sort((a, b) => a.questionNumber - b.questionNumber);

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
    if (!addText.trim()) {
      toast.error("Please enter a question text");
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
        partNumber: activeTab,
        partName: activePart.name,
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
            {questions.length} questions &middot;{" "}
            {testType === "COGNITIVE" ? "Cognitive Ability" : "Aptitude"} Assessment
          </p>
        </div>
        {/* COGNITIVE / APTITUDE Toggle */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTestType("COGNITIVE")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              testType === "COGNITIVE"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Cognitive
          </button>
          <button
            onClick={() => setTestType("APTITUDE")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              testType === "APTITUDE"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Aptitude
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
          {/* TOP: Horizontal Part Tabs */}
          <div className="border-b border-gray-200 bg-white flex-shrink-0">
            <nav className="flex overflow-x-auto">
              {PARTS.map((part) => {
                const count = questions.filter((q) => q.partNumber === part.num).length;
                const isActive = activeTab === part.num;
                return (
                  <button
                    key={part.num}
                    onClick={() => setActiveTab(part.num)}
                    className={`relative flex-1 min-w-[140px] flex flex-col items-center gap-1 px-4 py-3.5 text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full"
                        style={{ backgroundColor: part.color }}
                      />
                    )}
                    <span className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{
                          backgroundColor: isActive ? part.color : part.color + "99",
                        }}
                      >
                        P{part.num}
                      </span>
                      <span className={isActive ? "font-semibold" : ""}>
                        {part.name}
                      </span>
                    </span>
                    <span className="text-[11px] text-gray-400">{count} Qs</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Panel header + questions */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">
                  Part {activePart.num}: {activePart.name}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {partQuestions.length} question{partQuestions.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl transition hover:opacity-90"
                style={{ backgroundColor: activePart.color }}
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
                      style={{ backgroundColor: activePart.color }}
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
                style={{ backgroundColor: activePart.color }}
              >
                P{activeTab}
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Question</h3>
                <p className="text-sm text-gray-500">
                  {activePart.name} &middot;{" "}
                  {testType === "COGNITIVE" ? "Cognitive" : "Aptitude"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
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
                disabled={adding || !addText.trim() || addOptions.some((o) => !o.text.trim())}
                className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: activePart.color }}
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
