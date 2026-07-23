"use client";

import { useState, useEffect, useCallback } from "react";

// --------------------------------------------------------------
// Helper Constants
// --------------------------------------------------------------
const API_URL = "/api/admin/writing";

// Title options based on task type
const TASK_TITLES = {
  1: [
    "Line Chart",
    "Bar Chart",
    "Pie Chart",
    "Table",
    "Process Diagram",
    "Map",
    "Mixed Charts",
    "Flow Chart",
  ],
  2: [
    "Opinion Essay",
    "Discussion Essay",
    "Advantages & Disadvantages",
    "Problem & Solution",
    "Double Question",
  ],
};

const INITIAL_FORM = {
  taskType: 1,
  title: "",
  description: "",
  image: null,
};

// --------------------------------------------------------------
// Main Component
// --------------------------------------------------------------
export default function IELTSWritingAdminPage() {
  // -------------------------------------------
  // State Management
  // -------------------------------------------
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Form State
  const [form, setForm] = useState({ ...INITIAL_FORM, title: TASK_TITLES[1][0] });
  const [imagePreview, setImagePreview] = useState(null);
  const [editId, setEditId] = useState(null);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTask, setFilterTask] = useState("All");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  // -------------------------------------------
  // API Functions
  // -------------------------------------------
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      setQuestions(
        data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (error) {
      showMessage("error", "Could not load questions. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // -------------------------------------------
  // Form Handlers
  // -------------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "taskType") {
      const newTaskType = parseInt(value);
      setForm((prev) => ({
        ...prev,
        taskType: newTaskType,
        title: TASK_TITLES[newTaskType][0],
      }));

      if (newTaskType === 2) {
        setForm((prev) => ({ ...prev, image: null }));
        setImagePreview(null);
      }
    } else if (name === "title") {
      setForm((prev) => ({
        ...prev,
        title: value,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm({ ...INITIAL_FORM, title: TASK_TITLES[1][0] });
    setImagePreview(null);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      showMessage("error", "Title is required.");
      return;
    }
    if (!TASK_TITLES[form.taskType].includes(form.title)) {
      showMessage("error", "Please select a valid title from the dropdown.");
      return;
    }
    if (!form.description.trim()) {
      showMessage("error", "Description is required.");
      return;
    }
    if (form.taskType === 1 && !form.image && !editId) {
      showMessage("error", "Task 1 requires an image.");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("taskType", form.taskType);
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    try {
      let res;
      if (editId) {
        res = await fetch(`${API_URL}/${editId}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        res = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Operation failed");
      }

      showMessage("success", editId ? "Question updated successfully!" : "Question added successfully!");
      resetForm();
      fetchQuestions();
    } catch (error) {
      showMessage("error", error.message || "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (question) => {
    setEditId(question._id);
    setForm({
      taskType: question.taskType,
      title: question.title,
      description: question.description,
      image: question.image,
    });
    
    if (question.image?.url) {
      setImagePreview(question.image.url);
    } else {
      setImagePreview(null);
    }
    
    document.getElementById("question-form")?.scrollIntoView({ behavior: "smooth" });
    setMessage({ type: "", text: "" });
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete question");
      
      showMessage("success", "Question deleted successfully!");
      fetchQuestions();
      if (editId === id) resetForm();
    } catch (error) {
      showMessage("error", "Could not delete question. Please try again.");
      console.error(error);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(null);
    }
  };

  // -------------------------------------------
  // Filter & Search Logic
  // -------------------------------------------
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterTask === "All" || q.taskType === filterTask;
    return matchesSearch && matchesFilter;
  });

  // -------------------------------------------
  // Lifecycle
  // -------------------------------------------
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // -------------------------------------------
  // Utility Functions
  // -------------------------------------------
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // -------------------------------------------
  // Delete Confirmation Modal
  // -------------------------------------------
  const DeleteModal = () => {
    if (!showDeleteModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
        <div 
          className="rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all"
          style={{ 
            backgroundColor: 'var(--cardBg)',
            borderColor: 'var(--border)',
            borderWidth: '1px'
          }}
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4" style={{ backgroundColor: 'var(--accent)' }}>
              <svg className="h-6 w-6" style={{ color: 'var(--error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Delete Question?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowDeleteModal(null)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ 
                color: 'var(--text)',
                backgroundColor: 'var(--accent)',
                borderColor: 'var(--border)',
                borderWidth: '1px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(showDeleteModal)}
              disabled={deletingId === showDeleteModal}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--error)' }}
            >
              {deletingId === showDeleteModal ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------
  // Render
  // -------------------------------------------
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="sticky top-0 z-10 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 pt-4" style={{ backgroundColor: 'var(--background)', backdropFilter: 'blur(8px)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                IELTS Writing Manager
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                Manage your Task 1 and Task 2 questions
              </p>
            </div>
            <div 
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-full shadow-sm"
              style={{ 
                color: 'var(--muted)',
                backgroundColor: 'var(--cardBg)',
                borderColor: 'var(--border)',
                borderWidth: '1px'
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--success)' }}></span>
              {questions.length} {questions.length === 1 ? "question" : "questions"} total
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className="p-4 rounded-xl animate-slideIn"
            style={{ 
              backgroundColor: message.type === "success" ? 'var(--accent)' : 'var(--accent)',
              borderColor: message.type === "success" ? 'var(--success)' : 'var(--error)',
              borderLeftWidth: '4px',
              color: message.type === "success" ? 'var(--success)' : 'var(--error)'
            }}
          >
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <svg className="h-5 w-5" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" style={{ color: 'var(--error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-medium" style={{ color: 'var(--text)' }}>{message.text}</span>
            </div>
          </div>
        )}

        {/* Question Form Card */}
        <div
          id="question-form"
          className="rounded-2xl shadow-sm overflow-hidden transition-all"
          style={{ 
            backgroundColor: 'var(--cardBg)',
            borderColor: 'var(--border)',
            borderWidth: '1px'
          }}
        >
          <div 
            className="px-6 py-4"
            style={{ 
              borderBottomColor: 'var(--border)',
              borderBottomWidth: '1px',
              backgroundColor: 'var(--accent)'
            }}
          >
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              {editId ? (
                <>
                  <svg className="h-5 w-5" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Question
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Question
                </>
              )}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Task Type Radio Buttons */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>
                Task Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="taskType"
                    value={1}
                    checked={form.taskType === 1}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Task 1 (Graph/Chart)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="taskType"
                    value={2}
                    checked={form.taskType === 2}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Task 2 (Essay)
                  </span>
                </label>
              </div>
            </div>

            {/* Title Dropdown */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--text)' }}
              >
                Title <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select
                id="title"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg transition-all focus:ring-2 focus:outline-none"
                style={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderWidth: '1px',
                  color: 'var(--text)'
                }}
              >
                <option value="" disabled>
                  Select a title...
                </option>
                {TASK_TITLES[form.taskType].map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                Select the type of question for Task {form.taskType}
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--text)' }}
              >
                Description <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Enter the question prompt or description..."
                className="w-full px-4 py-2.5 rounded-lg transition-all focus:ring-2 focus:outline-none resize-y"
                style={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderWidth: '1px',
                  color: 'var(--text)'
                }}
              />
            </div>

            {/* Image Upload (Task 1 only) */}
            {form.taskType === 1 && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  Image Upload <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="relative inline-block group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-auto rounded-lg object-cover shadow-sm"
                        style={{ borderColor: 'var(--border)', borderWidth: '1px' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setForm((prev) => ({ ...prev, image: null }));
                        }}
                        className="absolute -top-2 -right-2 h-6 w-6 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        style={{ backgroundColor: 'var(--error)' }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm"
                    style={{ color: 'var(--muted)' }}
                  />
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {editId ? "Updating..." : "Saving..."}
                  </>
                ) : editId ? (
                  "Update Question"
                ) : (
                  "Add Question"
                )}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 font-medium rounded-lg transition-colors"
                  style={{ 
                    color: 'var(--text)',
                    borderColor: 'var(--border)',
                    borderWidth: '1px',
                    backgroundColor: 'transparent'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Questions Section */}
        <div 
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{ 
            backgroundColor: 'var(--cardBg)',
            borderColor: 'var(--border)',
            borderWidth: '1px'
          }}
        >
          <div 
            className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{ borderBottomColor: 'var(--border)', borderBottomWidth: '1px' }}
          >
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Existing Questions
            </h2>
            <div className="flex gap-2">
              <div 
                className="flex rounded-lg overflow-hidden"
                style={{ borderColor: 'var(--border)', borderWidth: '1px' }}
              >
                {["All", 1, 2].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterTask(filter)}
                    className="px-3 py-1.5 text-sm font-medium transition-colors"
                    style={{ 
                      backgroundColor: filterTask === filter ? 'var(--primary)' : 'transparent',
                      color: filterTask === filter ? 'white' : 'var(--text)'
                    }}
                  >
                    {filter === "All" ? "All" : `Task ${filter}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          <div 
            className="px-6 py-3"
            style={{ borderBottomColor: 'var(--border)', borderBottomWidth: '1px' }}
          >
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: 'var(--muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search questions by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg transition-all focus:ring-2 focus:outline-none"
                style={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderWidth: '1px',
                  color: 'var(--text)'
                }}
              />
            </div>
          </div>

          {/* Questions List */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin h-8 w-8" style={{ color: 'var(--primary)' }} viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm" style={{ color: 'var(--muted)' }}>Loading questions...</span>
                </div>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div 
                  className="h-24 w-24 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <svg className="h-12 w-12" style={{ color: 'var(--muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text)' }}>
                  No IELTS Writing Questions Found
                </h3>
                <p className="text-sm text-center max-w-sm" style={{ color: 'var(--muted)' }}>
                  {searchTerm || filterTask !== "All"
                    ? "No questions match your current search or filter. Try adjusting them."
                    : "Get started by adding your first question using the form above."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <table className="hidden md:table w-full">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--background)' }}>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Task</th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Title</th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Image</th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Created</th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {filteredQuestions.map((q) => (
                      <tr key={q._id} className="transition-colors hover:bg-opacity-50" style={{ ':hover': { backgroundColor: 'var(--accent)' } }}>
                        <td className="px-6 py-4">
                          <span 
                            className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ 
                              backgroundColor: q.taskType === 1 ? 'var(--accent)' : 'var(--accent)',
                              color: 'var(--primary)'
                            }}
                          >
                            Task {q.taskType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ 
                              backgroundColor: 'var(--accent)',
                              color: 'var(--text)'
                            }}
                          >
                            {q.title}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {q.image?.url ? (
                            <img
                              src={q.image.url}
                              alt={q.title}
                              className="h-10 w-16 object-cover rounded-md shadow-sm"
                              style={{ borderColor: 'var(--border)', borderWidth: '1px' }}
                            />
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--muted)' }}>—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--muted)' }}>
                          {formatDate(q.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(q)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: 'var(--primary)' }}
                              title="Edit"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(q._id)}
                              disabled={deletingId === q._id}
                              className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                              style={{ color: 'var(--error)' }}
                              title="Delete"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
                  {filteredQuestions.map((q) => (
                    <div key={q._id} className="p-4 space-y-3 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span 
                            className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ 
                              backgroundColor: 'var(--accent)',
                              color: 'var(--primary)'
                            }}
                          >
                            Task {q.taskType}
                          </span>
                          <span 
                            className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ 
                              backgroundColor: 'var(--accent)',
                              color: 'var(--text)'
                            }}
                          >
                            {q.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(q)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: 'var(--primary)' }}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(q._id)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: 'var(--error)' }}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>{formatDate(q.createdAt)}</span>
                      </div>
                      {q.image?.url && (
                        <img
                          src={q.image.url}
                          alt={q.title}
                          className="h-20 w-full object-cover rounded-lg shadow-sm"
                          style={{ borderColor: 'var(--border)', borderWidth: '1px' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal />

      {/* Global animation styles */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}