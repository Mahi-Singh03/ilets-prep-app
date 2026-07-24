"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, ChevronLeft, ChevronRight, 
  GripVertical, Send, Bookmark, BookmarkCheck,
  AlertCircle, CheckCircle2
} from 'lucide-react';

// ============================================================
// IELTS WRITING TEST - SINGLE COMPONENT
// ============================================================

export default function WritingTest() {
  // -------------------------------------------
  // State Management
  // -------------------------------------------
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [isRunning, setIsRunning] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [essay, setEssay] = useState('');
  const [markedForReview, setMarkedForReview] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState('');
  const [mobileView, setMobileView] = useState('question'); // 'question' | 'writing'
  
  // Refs
  const containerRef = useRef(null);
  const dividerRef = useRef(null);
  const textareaRef = useRef(null);
  const timerRef = useRef(null);
  const saveTimerRef = useRef(null);

  // -------------------------------------------
  // Question Data
  // -------------------------------------------
  const question = questions[currentQuestion - 1];
  const questionData = question
    ? {
        title: question.title,
        type: 'Sectional Test',
        duration: question.taskType === 1 ? '20 min' : '40 min',
        taskType: question.taskType,
        instructions: `You should spend about ${question.taskType === 1 ? 20 : 40} minutes on this task.`,
        prompt: question.description,
        minimumWords: question.taskType === 1 ? 150 : 250,
        imageUrl: question.image?.url || '',
        imageAlt: `${question.title} writing question`
      }
    : null;

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/api/admin/writing');
        if (!response.ok) {
          throw new Error('Unable to load writing questions.');
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No writing questions are available.');
        }

        setQuestions(data);
      } catch (error) {
        setQuestionError(error.message);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, []);

  // -------------------------------------------
  // Timer Logic
  // -------------------------------------------
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft < 60) return '#EF4444'; // red
    if (timeLeft < 300) return '#F59E0B'; // yellow
    return '#166534'; // green
  };

  // -------------------------------------------
  // Word Count Logic
  // -------------------------------------------
  const countWords = (text) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  const handleEssayChange = (e) => {
    const newEssay = e.target.value;
    setEssay(newEssay);
    setWordCount(countWords(newEssay));
  };

  // -------------------------------------------
  // Auto-save Logic
  // -------------------------------------------
  useEffect(() => {
    // Load saved essay from localStorage
    const savedEssay = localStorage.getItem('ielts-writing-essay');
    if (savedEssay) {
      setEssay(savedEssay);
      setWordCount(countWords(savedEssay));
    }
  }, []);

  useEffect(() => {
    // Auto-save every 5 seconds
    saveTimerRef.current = setInterval(() => {
      if (essay.trim()) {
        localStorage.setItem('ielts-writing-essay', essay);
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 2000);
      }
    }, 5000);

    return () => clearInterval(saveTimerRef.current);
  }, [essay]);

  // -------------------------------------------
  // Resizable Panel Logic
  // -------------------------------------------
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain between 20% and 80%
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftPanelWidth(newLeftWidth);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // -------------------------------------------
  // Submit Logic
  // -------------------------------------------
  const handleSubmit = () => {
    if (wordCount < questionData.minimumWords) {
      setShowSubmitModal(true);
      return;
    }
    submitTest();
  };

  const submitTest = () => {
    setSubmitted(true);
    setIsRunning(false);
    clearInterval(timerRef.current);
    clearInterval(saveTimerRef.current);
    localStorage.removeItem('ielts-writing-essay');
    console.log('Test submitted:', { essay, wordCount, timeRemaining: timeLeft });
  };

  const handleAutoSubmit = () => {
    console.log('Time expired - auto submitting:', { essay, wordCount });
    setSubmitted(true);
    localStorage.removeItem('ielts-writing-essay');
  };

  // -------------------------------------------
  // Keyboard Shortcuts
  // -------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        localStorage.setItem('ielts-writing-essay', essay);
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 2000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [essay, wordCount]);

  // -------------------------------------------
  // Navigation Logic
  // -------------------------------------------
  const handleExit = () => {
    if (essay.trim() && !submitted) {
      if (window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
        localStorage.setItem('ielts-writing-essay', essay);
        window.history.back();
      }
    } else {
      window.history.back();
    }
  };

  // -------------------------------------------
  // Submit Confirmation Modal
  // -------------------------------------------
  const SubmitModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Word Count Warning
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            You have written <strong>{wordCount} words</strong>. The minimum requirement is <strong>{questionData.minimumWords} words</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Are you sure you want to submit?
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setShowSubmitModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Continue Writing
          </button>
          <button
            onClick={() => {
              setShowSubmitModal(false);
              submitTest();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Submit Anyway
          </button>
        </div>
      </motion.div>
    </div>
  );

  // -------------------------------------------
  // Submitted State
  // -------------------------------------------
  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-[#FAFAFB] flex items-center justify-center text-gray-600">
        Loading writing questions...
      </div>
    );
  }

  if (questionError || !questionData) {
    return (
      <div className="min-h-screen bg-[#FAFAFB] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm max-w-md w-full p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Questions unavailable</h2>
          <p className="text-sm text-gray-500">{questionError || 'No writing questions are available.'}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAFAFB] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6"
          >
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Your writing test has been submitted successfully.
          </p>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Words Written:</span>
              <span className="font-semibold text-gray-900">{wordCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Time Remaining:</span>
              <span className="font-semibold text-gray-900">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Start New Test
          </button>
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------
  // Main Render
  // -------------------------------------------
  return (
    <div className="h-screen flex flex-col bg-[#FAFAFB] font-['Inter']">
      {/* Top Navigation */}
      <header className="h-[72px] bg-white border-b border-[#E8E8EC] shadow-sm flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-20">
        {/* Left Section */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Exit</span>
          </button>
          <div className="hidden sm:block w-px h-6 bg-gray-200 mx-2"></div>
          <div className="min-w-0 hidden sm:block">
            <h1 className="text-sm font-semibold text-gray-900 truncate">
              {questionData.title}
            </h1>
            <p className="text-xs text-gray-500">
              {questionData.type} • {questionData.duration}
            </p>
          </div>
        </div>

        {/* Center Section - Timer */}
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" style={{ color: getTimerColor() }} />
          <span 
            className="text-lg font-bold tabular-nums"
            style={{ color: getTimerColor() }}
          >
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs text-gray-500 hidden sm:inline">remaining</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Auto-save indicator */}
          <AnimatePresence>
            {showSaveIndicator && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-xs text-green-600 font-medium hidden sm:block"
              >
                Saved ✓
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold rounded-xl text-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </header>

      {/* Mobile View Toggle */}
      <div className="md:hidden flex bg-white border-b border-gray-200">
        <button
          onClick={() => setMobileView('question')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mobileView === 'question' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-500'
          }`}
        >
          Question
        </button>
        <button
          onClick={() => setMobileView('writing')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mobileView === 'writing' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-500'
          }`}
        >
          Writing ({wordCount} words)
        </button>
      </div>

      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className="flex-1 flex overflow-hidden"
      >
        {/* Desktop: Side by Side */}
        <div className="hidden md:flex w-full overflow-hidden">
          {/* Question Panel */}
          <div 
            className="overflow-y-auto p-8"
            style={{ width: `${leftPanelWidth}%` }}
          >
            <div className="bg-white rounded-2xl border border-[#E8E8EC] shadow-sm p-6">
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-800">
                    {questionData.instructions}
                  </p>
                </div>

                {/* Prompt */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Question {currentQuestion}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {questionData.prompt}
                  </p>
                </div>

                {/* Image */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  {questionData.imageUrl ? (
                    <>
                      <img
                        src={questionData.imageUrl}
                        alt={questionData.imageAlt}
                        className="w-full h-auto rounded-lg"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                      />
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {questionData.imageAlt}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      This question does not include an image.
                    </p>
                  )}
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500">Minimum Words</p>
                    <p className="text-lg font-bold text-gray-900">{questionData.minimumWords}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500">Suggested Time</p>
                    <p className="text-lg font-bold text-gray-900">{questionData.duration}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resize Divider */}
          <div
            ref={dividerRef}
            onMouseDown={handleMouseDown}
            className="w-[10px] cursor-col-resize flex items-center justify-center hover:bg-gray-100 transition-colors group flex-shrink-0"
          >
            <div className="w-px h-full bg-[#E8E8EC] group-hover:bg-indigo-400 transition-colors"></div>
            <GripVertical className="w-4 h-4 text-gray-400 absolute group-hover:text-indigo-600 transition-colors" />
          </div>

          {/* Writing Panel */}
          <div 
            className="overflow-y-auto p-8"
            style={{ width: `${100 - leftPanelWidth}%` }}
          >
            <div className="bg-white rounded-2xl border border-[#E8E8EC] shadow-sm h-full flex flex-col">
              {/* Writing Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="text-sm text-gray-500">
                  Write at least <strong className="text-gray-700">{questionData.minimumWords} words</strong>
                </span>
                <span className={`text-sm font-medium ${
                  wordCount >= questionData.minimumWords ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {wordCount} / {questionData.minimumWords} words
                </span>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={essay}
                onChange={handleEssayChange}
                placeholder="Write here..."
                className="flex-1 p-6 text-gray-800 resize-none focus:outline-none placeholder-gray-400 leading-relaxed"
                style={{ minHeight: '300px' }}
              />

              {/* Writing Panel Footer */}
              <div className="flex items-center justify-between p-4 border-t border-gray-100">
                <button
                  onClick={() => setMarkedForReview(!markedForReview)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    markedForReview
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {markedForReview ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                  {markedForReview ? 'Marked for Review' : 'Mark for Review'}
                </button>

                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Stacked View */}
        <div className="md:hidden w-full overflow-y-auto">
          {mobileView === 'question' ? (
            <div className="p-4">
              <div className="bg-white rounded-2xl border border-[#E8E8EC] shadow-sm p-4 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs font-medium text-blue-800">
                    {questionData.instructions}
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    Question {currentQuestion}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {questionData.prompt}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  {questionData.imageUrl ? (
                    <img
                      src={questionData.imageUrl}
                      alt={questionData.imageAlt}
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      This question does not include an image.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 h-full">
              <div className="bg-white rounded-2xl border border-[#E8E8EC] shadow-sm flex flex-col" style={{ minHeight: 'calc(100vh - 250px)' }}>
                <div className="flex items-center justify-between p-3 border-b border-gray-100">
                  <span className="text-xs text-gray-500">
                    Min {questionData.minimumWords} words
                  </span>
                  <span className={`text-xs font-medium ${
                    wordCount >= questionData.minimumWords ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {wordCount} words
                  </span>
                </div>
                <textarea
                  value={essay}
                  onChange={handleEssayChange}
                  placeholder="Write here..."
                  className="flex-1 p-4 text-sm text-gray-800 resize-none focus:outline-none placeholder-gray-400"
                  style={{ minHeight: '200px' }}
                />
                <div className="flex items-center justify-between p-3 border-t border-gray-100">
                  <button
                    onClick={() => setMarkedForReview(!markedForReview)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${
                      markedForReview ? 'bg-amber-100 text-amber-700' : 'text-gray-500'
                    }`}
                  >
                    {markedForReview ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
                    Review
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
                  >
                    <Send className="w-3 h-3" />
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <footer className="h-[78px] bg-white border-t border-[#E8E8EC] flex items-center justify-between px-4 md:px-8 flex-shrink-0">
        <button
          onClick={() => setMarkedForReview(!markedForReview)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            markedForReview
              ? 'bg-amber-100 text-amber-700'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {markedForReview ? (
            <BookmarkCheck className="w-5 h-5" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
          <span className="hidden sm:inline">
            {markedForReview ? 'Marked for Review' : 'Mark for Review'}
          </span>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            {questions.map((item, i) => (
              <button
                key={item._id || i}
                onClick={() => setCurrentQuestion(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                  currentQuestion === i + 1
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={currentQuestion === questions.length}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Submit Test</span>
        </button>
      </footer>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && <SubmitModal />}

      {/* Global styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #D1D5DB;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }
      `}</style>
    </div>
  );
}