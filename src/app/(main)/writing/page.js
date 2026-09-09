"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPenFancy, FaArrowLeft, FaClock, FaLightbulb, 
  FaChartLine, FaCheckCircle, FaExclamationTriangle,
  FaUndo, FaSave, FaPaperPlane, FaSpinner, FaBook,
  FaRocket, FaStar, FaTrophy, FaGraduationCap,
  FaImage, FaExpand, FaCompress, FaChevronDown, FaChevronUp,
  FaEye, FaEyeSlash, FaColumns, FaGripVertical,
  FaChevronCircleDown
} from 'react-icons/fa';
import { useTheme } from '@/src/app/context/ThemeContext';
import Link from 'next/link';

const WritingPage = () => {
  const { colorTheme, activeTheme } = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isGoogleUser = status === 'authenticated' && session?.user?.provider === 'google';
  const [taskType, setTaskType] = useState(2);
  const [essay, setEssay] = useState('');
  const [question, setQuestion] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showTips, setShowTips] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionLoadError, setQuestionLoadError] = useState('');
  const [isQuestionSelected, setIsQuestionSelected] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [layoutMode, setLayoutMode] = useState('split');
  const [splitRatio, setSplitRatio] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);
  const reviewRef = useRef(null);
  const [windowHeight, setWindowHeight] = useState(800);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Track window height
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Word count effect
  useEffect(() => {
    const words = essay.trim() ? essay.trim().split(/\s+/) : [];
    setWordCount(words.length);
  }, [essay]);

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          showToast('Time is up!', 'warning');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  // Auto-save draft
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (essay.trim() && isQuestionSelected) {
        localStorage.setItem('ielts-writing-draft', essay);
        localStorage.setItem('ielts-writing-task', taskType);
        localStorage.setItem('ielts-writing-question-id', selectedQuestionId);
        localStorage.setItem('ielts-writing-split-ratio', splitRatio);
      }
    }, 30000);

    return () => clearInterval(autoSaveTimer);
  }, [essay, taskType, selectedQuestionId, isQuestionSelected, splitRatio]);

  // Load saved draft and settings only when the user returns to writing practice.
  useEffect(() => {
    const savedDraft = localStorage.getItem('ielts-writing-draft');
    const savedTask = localStorage.getItem('ielts-writing-task');
    const savedSplitRatio = localStorage.getItem('ielts-writing-split-ratio');
    
    if (savedDraft) setEssay(savedDraft);
    if (savedTask) setTaskType(Number(savedTask));
    if (savedSplitRatio) {
      setSplitRatio(Number(savedSplitRatio));
    }
  }, []);

  // Handle resize
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleResizeMove = useCallback((e) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const containerWidth = containerRect.width;
    
    let newRatio = (mouseX / containerWidth) * 100;
    
    // Limit ratio between 20% and 80%
    newRatio = Math.max(20, Math.min(80, newRatio));
    
    setSplitRatio(newRatio);
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    // Save ratio to localStorage
    localStorage.setItem('ielts-writing-split-ratio', splitRatio);
  }, [splitRatio]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const scrollToReview = () => {
    if (reviewRef.current) {
      reviewRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  const handleAnalyze = async () => {
    if (!essay.trim() || wordCount < 50) {
      showToast('Please write at least 50 words before analyzing', 'warning');
      return;
    }

    if (!question.trim()) {
      showToast('Please enter the essay question', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setShowScrollIndicator(false);

    try {
      const response = await fetch('/api/writing/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          essay,
          taskType,
          question,
          wordCount
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze writing');
      }

      setAnalysisResult(data);
      showToast('Analysis complete!', 'success');
      
      // Show scroll indicator and scroll to review after a short delay
      setShowScrollIndicator(true);
      setTimeout(() => {
        scrollToReview();
      }, 500);
      
      // Hide scroll indicator after 3 seconds
      setTimeout(() => {
        setShowScrollIndicator(false);
      }, 3000);
    } catch (err) {
      setError(err.message);
      showToast(err.message || 'Failed to analyze writing', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setEssay('');
    setWordCount(0);
    setAnalysisResult(null);
    setTimeLeft(taskType === 1 ? 20 * 60 : 40 * 60);
    setIsTimerRunning(false);
    setError(null);
    setShowScrollIndicator(false);
    showToast('Writing area cleared', 'info');
  };

  const handleSave = () => {
    try {
      localStorage.setItem('ielts-writing-draft', essay);
      localStorage.setItem('ielts-writing-task', taskType);
      localStorage.setItem('ielts-writing-question-id', selectedQuestionId);
      localStorage.setItem('ielts-writing-split-ratio', splitRatio);
      showToast('Draft saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save draft', 'error');
    }
  };

  const handleExport = () => {
    const blob = new Blob([essay], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ielts-writing-task-${taskType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Essay exported!', 'success');
  };

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestionId(questionId);
    setIsQuestionSelected(true);
    setEssay('');
    setAnalysisResult(null);
    setError(null);
    setTimeLeft(taskType === 1 ? 20 * 60 : 40 * 60);
    setIsTimerRunning(false);
    setShowScrollIndicator(false);
    
    const selected = taskQuestions.find(q => q._id === questionId);
    if (selected?.description) {
      setQuestion(selected.description);
    }
  };

  const handleTaskChange = (type) => {
    setTaskType(type);
    setIsQuestionSelected(false);
    setSelectedQuestionId('');
    setEssay('');
    setAnalysisResult(null);
    setError(null);
    setQuestion('');
    setTimeLeft(type === 1 ? 20 * 60 : 40 * 60);
    setIsTimerRunning(false);
    setShowScrollIndicator(false);
    
    const firstQuestion = availableQuestions.find(
      (item) => Number(item.taskType) === type
    );
    if (firstQuestion?._id) {
      setSelectedQuestionId(firstQuestion._id);
    }
  };

  const toggleLayout = () => {
    setLayoutMode(prev => prev === 'split' ? 'focus' : 'split');
  };

  const taskPrompts = {
    1: {
      title: 'Task 1 - Academic',
      description: 'Describe, summarize, or explain information presented in a graph, table, chart, or diagram.',
      minWords: 150,
      timeLimit: '20 minutes',
      prompt: 'The chart below shows the percentage of households in a European country that had access to the internet between 1998 and 2018. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.'
    },
    2: {
      title: 'Task 2 - Essay',
      description: 'Write an essay in response to a point of view, argument, or problem.',
      minWords: 250,
      timeLimit: '40 minutes',
      prompt: 'Some people believe that unpaid community service should be a compulsory part of high school programs. To what extent do you agree or disagree?'
    }
  };

  const taskQuestions = availableQuestions.filter(
    (item) => Number(item.taskType) === taskType
  );
  
  const selectedQuestion = taskQuestions.find(
    (item) => item._id === selectedQuestionId
  );

  const currentTask = selectedQuestion
    ? {
        ...taskPrompts[taskType],
        title: selectedQuestion.title,
        prompt: selectedQuestion.description,
        imageUrl: selectedQuestion.image?.url || '',
      }
    : taskPrompts[taskType];

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/api/admin/writing');
        if (!response.ok) {
          throw new Error('Unable to load available writing questions.');
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('The writing questions response was invalid.');
        }

        setAvailableQuestions(data);
      } catch (loadError) {
        setQuestionLoadError(loadError.message);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, []);

  useEffect(() => {
    if (selectedQuestion?.description && isQuestionSelected) {
      setQuestion(selectedQuestion.description);
    }
  }, [selectedQuestion?.description, isQuestionSelected]);

  useEffect(() => {
    if (taskQuestions.length > 0 && !taskQuestions.some((item) => item._id === selectedQuestionId)) {
      setSelectedQuestionId(taskQuestions[0]._id);
    }
  }, [taskQuestions, selectedQuestionId]);

  const getBandColor = (band) => {
    if (band >= 8) return 'var(--success)';
    if (band >= 7) return 'var(--primary)';
    if (band >= 6) return 'var(--warning)';
    return 'var(--error)';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
        <div className="text-center">
          <FaSpinner className="animate-spin text-3xl mx-auto mb-3" style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--muted)' }}>Checking Google login...</p>
        </div>
      </div>
    );
  }

  if (!isGoogleUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
        <div className="rounded-3xl border max-w-xl w-full p-8 text-center" style={{ backgroundColor: 'var(--cardBg)', borderColor: 'var(--border)' }}>
          <div className="inline-flex items-center justify-center rounded-full p-4 mb-4" style={{ backgroundColor: 'var(--accent)' }}>
            <FaBook style={{ color: 'var(--primary)' }} className="text-3xl" />
          </div>
          <h1 className="text-3xl font-black mb-3">Google Login Required</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
            Sign in with Google to open the IELTS writing task chooser and practice question content.
          </p>
          <button
            className="px-6 py-3 rounded-2xl font-bold shadow-sm"
            style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
            onClick={() => signIn('google', { callbackUrl: '/writing' })}
          >
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--background)',
        color: 'var(--text)',
        minHeight: '100vh',
        height: '100%'
      }}
    >
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-20 right-0 w-96 h-96 rounded-full"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <motion.div
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.08, 0.05, 0.08]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full"
          style={{ backgroundColor: 'var(--secondary)' }}
        />
        
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="h-full w-full" style={{ 
            backgroundImage: `linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-4 left-1/2 z-50 px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg"
            style={{ 
              backgroundColor: 'var(--cardBg)',
              border: '1px solid var(--border)',
              color: 'var(--text)'
            }}
          >
            {toast.type === 'success' && <FaCheckCircle style={{ color: 'var(--success)' }} />}
            {toast.type === 'warning' && <FaExclamationTriangle style={{ color: 'var(--warning)' }} />}
            {toast.type === 'error' && <FaExclamationTriangle style={{ color: 'var(--error)' }} />}
            {toast.type === 'info' && <FaLightbulb style={{ color: 'var(--primary)' }} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Indicator */}
      <AnimatePresence>
        {showScrollIndicator && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToReview}
            className="fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-lg"
            style={{ 
              backgroundColor: 'var(--primary)',
              color: 'white'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <FaChevronCircleDown className="text-2xl" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {isImageExpanded && currentTask.imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80"
            onClick={() => setIsImageExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentTask.imageUrl}
                alt="Task visual prompt enlarged"
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
              />
              <button
                onClick={() => setIsImageExpanded(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <FaCompress />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header 
        className="sticky top-0 z-40 backdrop-blur-lg transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--cardBg)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
          height: '64px'
        }}
      >
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ x: -5 }}
                transition={{ duration: 0.2 }}
              >
                <FaArrowLeft style={{ color: 'var(--text)' }} />
              </motion.div>
              <span className="font-semibold" style={{ color: 'var(--text)' }}>
                Back
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {isQuestionSelected && taskType === 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleLayout}
                  className="p-2 rounded-xl"
                  style={{ 
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)'
                  }}
                  title={layoutMode === 'split' ? 'Focus on Writing' : 'Split View'}
                >
                  <FaColumns />
                </motion.button>
              )}

              {isQuestionSelected && (
                <>
                  <motion.div
                    animate={timeLeft < 60 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ 
                      backgroundColor: timeLeft < 60 ? 'var(--error)' : 'var(--surface)',
                      color: timeLeft < 60 ? 'white' : 'var(--text)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <FaClock />
                    <span className="font-mono font-semibold text-sm">{formatTime(timeLeft)}</span>
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="ml-1 text-xs px-2 py-1 rounded-lg"
                      style={{ 
                        backgroundColor: 'var(--primary)',
                        color: 'white'
                      }}
                    >
                      {isTimerRunning ? 'Pause' : 'Start'}
                    </button>
                  </motion.div>

                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      className="p-2 rounded-xl"
                      style={{ 
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)'
                      }}
                      title="Save Draft"
                    >
                      <FaSave />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExport}
                      className="p-2 rounded-xl"
                      style={{ 
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)'
                      }}
                      title="Export as Text"
                    >
                      <FaPaperPlane />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReset}
                      className="p-2 rounded-xl"
                      style={{ 
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)'
                      }}
                      title="Reset"
                    >
                      <FaUndo />
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {!isQuestionSelected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-block p-4 rounded-2xl mb-4"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <FaPenFancy className="text-white text-3xl" />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
                Choose Your Writing Task
              </h1>
              <p className="text-lg" style={{ color: 'var(--muted)' }}>
                Select a task type and question to begin writing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[1, 2].map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTaskChange(type)}
                  className="p-6 rounded-2xl transition-all duration-300"
                  style={{ 
                    backgroundColor: taskType === type ? 'var(--primary)' : 'var(--cardBg)',
                    color: taskType === type ? 'white' : 'var(--text)',
                    border: `2px solid ${taskType === type ? 'var(--primary)' : 'var(--border)'}`,
                    boxShadow: 'var(--shadow)'
                  }}
                >
                  <div className="text-2xl mb-3">
                    {type === 1 ? <FaImage /> : <FaBook />}
                  </div>
                  <div className="font-bold text-lg mb-2">
                    Task {type}
                  </div>
                  <div className="text-sm opacity-80">
                    {type === 1 ? 'Academic - 150 words' : 'Essay - 250 words'}
                  </div>
                  <div className="text-xs mt-2 opacity-70">
                    {type === 1 ? '20 minutes' : '40 minutes'}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="rounded-2xl p-6"
              style={{ 
                backgroundColor: 'var(--cardBg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)'
              }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>
                Available Questions
              </h3>
              
              {isLoadingQuestions ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-3xl mx-auto mb-3" style={{ color: 'var(--primary)' }} />
                  <p style={{ color: 'var(--muted)' }}>Loading questions...</p>
                </div>
              ) : questionLoadError ? (
                <div className="text-center py-8">
                  <FaExclamationTriangle className="text-3xl mx-auto mb-3" style={{ color: 'var(--error)' }} />
                  <p style={{ color: 'var(--error)' }}>{questionLoadError}</p>
                </div>
              ) : taskQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <p style={{ color: 'var(--muted)' }}>No questions available for this task type</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {taskQuestions.map((item, index) => (
                    <motion.button
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuestionSelect(item._id)}
                      className="w-full p-4 rounded-xl text-left transition-all duration-300"
                      style={{ 
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="font-semibold mb-2">
                            {item.title}
                          </div>
                          <div className="text-sm line-clamp-3" style={{ color: 'var(--muted)' }}>
                            {item.description}
                          </div>
                        </div>
                        <FaChevronDown className="mt-1 shrink-0" style={{ color: 'var(--primary)' }} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4" style={{ minHeight: 'calc(100vh - 96px)' }}>
            {/* Question Info Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-3"
              style={{ 
                backgroundColor: 'var(--cardBg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
                maxHeight: '100px',
                overflowY: 'auto'
              }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FaBook style={{ color: 'var(--primary)' }} />
                  <span className="font-semibold text-sm">{currentTask.title}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    Min: {currentTask.minWords} words
                  </span>
                </div>
                <button
                  onClick={() => setIsQuestionSelected(false)}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--muted)'
                  }}
                >
                  Change Question
                </button>
              </div>
              <div 
                className="mt-2 p-2 rounded-lg text-xs"
                style={{ 
                  backgroundColor: 'var(--surface)',
                  borderLeft: '3px solid var(--primary)',
                  color: 'var(--text)',
                  lineHeight: '1.5',
                  maxHeight: '50px',
                  overflowY: 'auto'
                }}
              >
                {question}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <FaBook style={{ color: 'var(--primary)' }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>IELTS Typing Lab</span>
                </div>
                <button
                  className="px-4 py-2 rounded-xl font-bold text-xs"
                  style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                  onClick={() => router.push('/typing')}
                >
                  Open Typing Practice
                </button>
              </div>
            </motion.div>

            {/* Resizable Split View for Task 1 */}
            {taskType === 1 && currentTask.imageUrl && layoutMode === 'split' ? (
              <div 
                ref={containerRef}
                className="flex gap-0 rounded-2xl overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--cardBg)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow)',
                  height: 'calc(100vh - 200px)',
                  minHeight: '400px'
                }}
              >
                {/* Image Panel */}
                <div 
                  className="relative overflow-hidden"
                  style={{ 
                    width: `${splitRatio}%`,
                    minWidth: '20%',
                    maxWidth: '80%',
                    transition: isResizing ? 'none' : 'width 0.3s ease'
                  }}
                >
                  <div className="p-3 border-b" style={{ borderColor: 'var(--border)', height: '50px' }}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <FaImage style={{ color: 'var(--primary)' }} />
                        Visual Prompt
                      </h3>
                      <button
                        onClick={() => setIsImageExpanded(true)}
                        className="p-1.5 rounded-lg"
                        style={{ 
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text)'
                        }}
                        title="Expand Image"
                      >
                        <FaExpand className="text-sm" />
                      </button>
                    </div>
                  </div>
                  <div 
                    className="p-3 cursor-pointer overflow-auto"
                    style={{ 
                      backgroundColor: 'white',
                      height: 'calc(100% - 50px)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center'
                    }}
                    onClick={() => setIsImageExpanded(true)}
                  >
                    <img
                      src={currentTask.imageUrl}
                      alt="Task visual prompt"
                      className="w-full h-auto object-contain"
                      style={{ 
                        maxHeight: '100%',
                        minHeight: '200px'
                      }}
                    />
                  </div>
                </div>

                {/* Resize Handle */}
                <div
                  onMouseDown={handleResizeStart}
                  className="relative w-2 cursor-col-resize flex items-center justify-center group"
                  style={{ 
                    backgroundColor: 'var(--border)',
                    transition: 'background-color 0.2s',
                    flexShrink: 0
                  }}
                >
                  <div 
                    className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 group-hover:bg-opacity-50"
                    style={{ 
                      backgroundColor: isResizing ? 'var(--primary)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  />
                  <FaGripVertical 
                    className="text-xs"
                    style={{ 
                      color: isResizing ? 'var(--primary)' : 'var(--muted)',
                      transition: 'color 0.2s'
                    }}
                  />
                </div>

                {/* Writing Panel */}
                <div 
                  className="flex-1 overflow-hidden flex flex-col"
                  style={{ 
                    transition: isResizing ? 'none' : 'width 0.3s ease'
                  }}
                >
                  <div className="p-3 border-b" style={{ borderColor: 'var(--border)', height: '50px' }}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <FaPenFancy style={{ color: 'var(--primary)' }} />
                        Your Answer
                      </h3>
                      <motion.div
                        animate={{ 
                          scale: wordCount >= currentTask.minWords ? [1, 1.1, 1] : 1 
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: wordCount >= currentTask.minWords ? 'var(--success)' : 'var(--warning)',
                            color: 'white'
                          }}
                        >
                          {wordCount} / {currentTask.minWords}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                  <textarea
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    placeholder="Start writing your answer here..."
                    className="w-full p-3 resize-none transition-all duration-300 focus:outline-none flex-1"
                    style={{ 
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text)',
                      border: 'none',
                      lineHeight: '1.6',
                      fontSize: '15px'
                    }}
                  />
                  <div className="p-3 border-t" style={{ borderColor: 'var(--border)', height: '60px' }}>
                    <div className="flex gap-2 h-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="flex-1 px-4 py-2 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm"
                        style={{ 
                          backgroundColor: 'var(--primary)',
                          opacity: isAnalyzing ? 0.7 : 1
                        }}
                      >
                        {isAnalyzing ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <FaChartLine />
                            Analyze
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2 text-sm"
                        style={{ 
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)'
                        }}
                      >
                        <FaSave />
                        Save
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Regular Writing Area (Task 2 or Focus Mode) */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-4 flex flex-col"
                style={{ 
                  backgroundColor: 'var(--cardBg)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow)',
                  height: 'calc(100vh - 200px)',
                  minHeight: '400px'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FaPenFancy style={{ color: 'var(--primary)' }} />
                    Your Answer
                  </h2>
                  <div className="flex items-center gap-2">
                    {taskType === 1 && currentTask.imageUrl && (
                      <button
                        onClick={() => setIsImageExpanded(true)}
                        className="p-2 rounded-lg"
                        style={{ 
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)'
                        }}
                        title="View Image"
                      >
                        <FaImage className="text-sm" />
                      </button>
                    )}
                    <motion.div
                      animate={{ 
                        scale: wordCount >= currentTask.minWords ? [1, 1.1, 1] : 1 
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: wordCount >= currentTask.minWords ? 'var(--success)' : 'var(--warning)',
                          color: 'white'
                        }}
                      >
                        {wordCount} / {currentTask.minWords} words
                      </span>
                    </motion.div>
                  </div>
                </div>

                <textarea
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  placeholder="Start writing your answer here..."
                  className="w-full p-3 rounded-xl resize-none transition-all duration-300 focus:outline-none flex-1"
                  style={{ 
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text)',
                    border: '2px solid var(--border)',
                    lineHeight: '1.6',
                    fontSize: '15px',
                    minHeight: '300px'
                  }}
                />

                <div className="flex gap-2 mt-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex-1 px-4 py-2 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm"
                    style={{ 
                      backgroundColor: 'var(--primary)',
                      opacity: isAnalyzing ? 0.7 : 1
                    }}
                  >
                    {isAnalyzing ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FaChartLine />
                        Analyze My Writing
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2 text-sm"
                    style={{ 
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)'
                    }}
                  >
                    <FaSave />
                    Save
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-3"
                style={{ 
                  backgroundColor: 'var(--error-bg, var(--surface))',
                  border: '1px solid var(--error)',
                  color: 'var(--error)'
                }}
              >
                <div className="flex items-center gap-2 text-sm">
                  <FaExclamationTriangle />
                  {error}
                </div>
              </motion.div>
            )}

            {/* Analysis Results with ref for scrolling */}
            <div ref={reviewRef}>
              <AnimatePresence>
                {analysisResult && (
                  <motion.section
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                      duration: 0.5
                    }}
                    className="rounded-2xl p-4 md:p-6 space-y-6"
                    style={{
                      backgroundColor: 'var(--cardBg)',
                      border: '2px solid var(--primary)',
                      boxShadow: 'var(--shadow-lg)',
                      scrollMarginTop: '80px'
                    }}
                  >
                    {/* Success Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      className="flex justify-center"
                    >
                      <div 
                        className="px-4 py-2 rounded-full flex items-center gap-2"
                        style={{ 
                          backgroundColor: 'var(--success)',
                          color: 'white'
                        }}
                      >
                        <FaCheckCircle />
                        Review Complete
                      </div>
                    </motion.div>

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <FaChartLine style={{ color: 'var(--primary)' }} />
                          Writing Review
                        </h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                          {analysisResult.wordCount || wordCount} words reviewed · Confidence: {analysisResult.confidence || 'Not provided'}
                        </p>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        className="rounded-xl px-5 py-3 text-center"
                        style={{
                          backgroundColor: 'var(--surface)',
                          border: `2px solid ${getBandColor(Number(analysisResult.finalBand || analysisResult.average || 0))}`,
                        }}
                      >
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>Final Band</div>
                        <div
                          className="text-3xl font-bold"
                          style={{ color: getBandColor(Number(analysisResult.finalBand || analysisResult.average || 0)) }}
                        >
                          {analysisResult.finalBand || analysisResult.average || '-'}
                        </div>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-3"
                    >
                      {[
                        ['Task', analysisResult.criterionScores?.task],
                        ['Coherence', analysisResult.criterionScores?.coherence],
                        ['Vocabulary', analysisResult.criterionScores?.vocabulary],
                        ['Grammar', analysisResult.criterionScores?.grammar],
                      ].map(([label, score], index) => (
                        <motion.div
                          key={label}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="rounded-xl p-3 text-center"
                          style={{
                            backgroundColor: 'var(--surface)',
                            border: `2px solid ${getBandColor(Number(score || 0))}`,
                          }}
                        >
                          <div
                            className="text-2xl font-bold"
                            style={{ color: getBandColor(Number(score || 0)) }}
                          >
                            {score ?? '-'}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--muted)' }}>{label}</div>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {Object.entries({
                        task: 'Task Achievement / Response',
                        coherence: 'Coherence & Cohesion',
                        vocabulary: 'Lexical Resource',
                        grammar: 'Grammatical Range & Accuracy',
                      }).map(([key, title], index) => {
                        const criterion = analysisResult.criteria?.[key];
                        return (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="rounded-xl p-4"
                            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                          >
                            <h3 className="font-semibold mb-3">{title}</h3>
                            <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
                              <strong>Evidence:</strong> {(criterion?.evidence || []).join(' ') || 'No evidence returned.'}
                            </p>
                            <p className="text-sm mb-2" style={{ color: 'var(--success)' }}>
                              <strong>Strengths:</strong> {(criterion?.strengths || []).join(' ') || 'None identified.'}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--error)' }}>
                              <strong>Mistakes:</strong> {(criterion?.weaknesses || []).join(' ') || 'None identified.'}
                            </p>
                          </motion.div>
                        );
                      })}
                    </motion.div>

                    {(analysisResult.sentenceAnalysis || []).length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <FaExclamationTriangle style={{ color: 'var(--warning)' }} />
                          Mistakes and corrections
                        </h3>
                        <div className="space-y-3">
                          {analysisResult.sentenceAnalysis.map((item, index) => (
                            <motion.div
                              key={`${item.sentence || 'sentence'}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.9 + index * 0.05 }}
                              className="rounded-xl p-4 text-sm"
                              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                            >
                              <p className="font-medium">{index + 1}. {item.sentence}</p>
                              <p className="mt-2" style={{ color: 'var(--muted)' }}><strong>Grammar:</strong> {item.grammar || 'No issue identified.'}</p>
                              <p style={{ color: 'var(--muted)' }}><strong>Vocabulary:</strong> {item.vocabulary || 'No issue identified.'}</p>
                              <p style={{ color: 'var(--primary)' }}><strong>Correction:</strong> {item.corrections || 'No correction provided.'}</p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {analysisResult.improvedAnswer && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                      >
                        <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--success)' }}>
                          <FaRocket /> Improved answer
                        </h3>
                        <div
                          className="rounded-xl p-4 text-sm whitespace-pre-wrap"
                          style={{
                            backgroundColor: 'var(--surface)',
                            borderLeft: '4px solid var(--success)',
                            lineHeight: '1.6',
                          }}
                        >
                          {analysisResult.improvedAnswer}
                        </div>
                      </motion.div>
                    )}

                    {(analysisResult.improvements || []).length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                        className="rounded-xl p-4"
                        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                      >
                        <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--warning)' }}>
                          <FaGraduationCap /> Improvement roadmap
                        </h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
                          {analysisResult.improvements.slice(0, 10).map((item, index) => (
                            <li key={`${item}-${index}`}>{item}</li>
                          ))}
                        </ol>
                      </motion.div>
                    )}
                  </motion.section>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WritingPage;