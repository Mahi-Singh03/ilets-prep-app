"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { BookOpen, Brain, CheckCircle2, RotateCcw, Sparkles, Target, TrendingUp, XCircle } from "lucide-react";
import { useTheme } from "@/src/app/context/ThemeContext";

const fallbackWords = [
  {
    word: "analysis",
    topic: "Academic Writing",
    partOfSpeech: "noun",
    meaning: "a careful study of something in order to understand it",
    example: "The analysis of the survey results reveals a clear pattern.",
    collocation: "in-depth analysis",
    category: "academic"
  },
  {
    word: "significant",
    topic: "Society",
    partOfSpeech: "adjective",
    meaning: "important or meaningful enough to have an effect",
    example: "There is a significant rise in public concern about pollution.",
    collocation: "significant impact",
    category: "society"
  },
  {
    word: "maintain",
    topic: "Education",
    partOfSpeech: "verb",
    meaning: "to keep something in existence or continue it",
    example: "Schools should maintain high standards of discipline.",
    collocation: "maintain balance",
    category: "education"
  },
  {
    word: "regulate",
    topic: "Government",
    partOfSpeech: "verb",
    meaning: "to control or manage according to rules",
    example: "The government plans to regulate online advertisements.",
    collocation: "regulate activity",
    category: "government"
  },
  {
    word: "consequently",
    topic: "Cause and Effect",
    partOfSpeech: "adverb",
    meaning: "as a result",
    example: "The roads became crowded, consequently travel times increased.",
    collocation: "and consequently",
    category: "linking"
  },
  {
    word: "enhance",
    topic: "Technology",
    partOfSpeech: "verb",
    meaning: "to improve or increase the value, quality, or attractiveness of something",
    example: "Online learning can enhance students' communication skills.",
    collocation: "enhance performance",
    category: "technology"
  },
  {
    word: "evaluate",
    topic: "Research",
    partOfSpeech: "verb",
    meaning: "to judge or calculate the quality, importance, amount, or value of something",
    example: "The report evaluates the effect of the new policy.",
    collocation: "evaluate progress",
    category: "research"
  },
  {
    word: "obstacle",
    topic: "Development",
    partOfSpeech: "noun",
    meaning: "something that blocks progress or makes success difficult",
    example: "Funding remains the main obstacle for many small businesses.",
    collocation: "major obstacle",
    category: "development"
  },
  {
    word: "sustainable",
    topic: "Environment",
    partOfSpeech: "adjective",
    meaning: "able to continue for a long time without causing damage",
    example: "Cleaner energy is essential for a sustainable future.",
    collocation: "sustainable development",
    category: "environment"
  },
  {
    word: "allocate",
    topic: "Economics",
    partOfSpeech: "verb",
    meaning: "to divide and give something for a particular purpose",
    example: "The city should allocate more resources to public health.",
    collocation: "allocate funds",
    category: "economics"
  }
];

export default function TypingPracticePage() {
  const { colorTheme, activeTheme } = useTheme();
  const { data: session, status } = useSession();
  const isGoogleUser = status === 'authenticated' && session?.user?.provider === 'google';
  const [words, setWords] = useState(fallbackWords);
  const [currentWord, setCurrentWord] = useState(fallbackWords[0]);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState("Ready to type");
  const [messageType, setMessageType] = useState("neutral");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("curated");
  const [streak, setStreak] = useState(0);
  const inputRef = useRef(null);

  const progress = useMemo(() => {
    if (!typed || !currentWord?.word) return 0;
    return Math.min(100, Math.round((typed.length / currentWord.word.length) * 100));
  }, [typed, currentWord]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)", color: "var(--text)" }}>
        <div className="text-center">
          <Sparkles className="mx-auto mb-3" size={34} style={{ color: "var(--primary)" }} />
          <p style={{ color: "var(--muted)" }}>Checking Google login...</p>
        </div>
      </main>
    );
  }

  if (!isGoogleUser) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)", color: "var(--text)" }}>
        <div className="rounded-3xl border max-w-xl w-full p-8 text-center" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
          <div className="inline-flex items-center justify-center rounded-full p-4 mb-4" style={{ backgroundColor: "var(--accent)" }}>
            <Sparkles size={30} style={{ color: "var(--primary)" }} />
          </div>
          <h1 className="text-3xl font-black mb-3">Google Login Required</h1>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            Sign in with Google to access IELTS typing and spelling practice.
          </p>
          <button
            className="px-6 py-3 rounded-2xl font-bold"
            style={{ backgroundColor: "var(--primary)", color: "#fff" }}
            onClick={() => signIn('google', { callbackUrl: '/typing' })}
          >
            Continue with Google
          </button>
        </div>
      </main>
    );
  }

  const loadWords = async () => {
    setLoading(true);
    setFeedback("Generating IELTS words...");
    setMessageType("neutral");

    try {
      const response = await fetch("/api/typing/words");
      const data = await response.json();

      if (Array.isArray(data.words) && data.words.length >= 1) {
        const nextWords = data.words;
        setWords(nextWords);
        setCurrentWord(nextWords[0]);
        setTyped("");
        setSource(data.source || "curated");
        setFeedback("Fresh vocabulary loaded");
        setMessageType("success");
        return;
      }

      setFeedback("Using fallback vocabulary");
      setMessageType("neutral");
    } catch (error) {
      setFeedback("Could not fetch Gemini suggestions");
      setMessageType("error");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  useEffect(() => {
    loadWords();
  }, []);

  const handleTyping = (event) => {
    const nextValue = event.target.value;
    setTyped(nextValue);

    if (!nextValue) {
      setFeedback("Start typing");
      setMessageType("neutral");
      return;
    }

    if (nextValue.length > currentWord.word.length) {
      setFeedback("Too long");
      setMessageType("error");
      return;
    }

    if (nextValue.toLowerCase() === currentWord.word.toLowerCase()) {
      setFeedback("Correct spelling");
      setMessageType("success");
      setStreak((marker) => marker + 1);
      const nextIndex = (words.findIndex((item) => item.word === currentWord.word) + 1) % words.length;
      setTimeout(() => {
        setCurrentWord(words[nextIndex]);
        setTyped("");
        setFeedback("Next word");
        setMessageType("neutral");
      }, 550);
      return;
    }

    const isProgressing = currentWord.word.toLowerCase().startsWith(nextValue.toLowerCase());
    if (isProgressing) {
      setFeedback("Keep going");
      setMessageType("neutral");
    } else {
      setFeedback("Check the spelling");
      setMessageType("error");
    }
  };

  const nextWord = () => {
    const currentIndex = words.findIndex((item) => item.word === currentWord.word);
    const next = words[(currentIndex + 1) % words.length];
    setCurrentWord(next);
    setTyped("");
    setFeedback("New word");
    setMessageType("neutral");
  };

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: "var(--background)", color: "var(--text)" }}>
      <section className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border" style={{ borderColor: "var(--border)", background: "var(--card-bg)" }}>
              <Sparkles size={16} style={{ color: "var(--primary)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--primary)" }}>IELTS Typing Lab</span>
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight" style={{ color: "var(--text)" }}>Vocabulary Typing Practice</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-2xl px-5 py-3 font-bold transition hover:opacity-90"
              style={{ background: "var(--primary)", color: "#fff" }}
              onClick={loadWords}
              disabled={loading}
            >
              {loading ? "Generating..." : "New Words"}
            </button>
          </div>
        </div>

        <section className="grid lg:grid-cols-[280px_1fr] gap-6 mt-8">
          <aside className="rounded-3xl border p-4 shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={20} style={{ color: "var(--primary)" }} />
                <span className="font-black text-lg">IELTS Words</span>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "var(--accent)", color: "var(--primary)" }}>{source}</span>
            </div>

            <div className="mt-4 space-y-2 max-h-[560px] overflow-auto">
              {words.map((item, index) => (
                <button
                  key={`${item.word}-${index}`}
                  className="w-full text-left rounded-2xl px-4 py-3 border hover:translate-x-1 transition"
                  style={{
                    borderColor: item.word === currentWord.word ? "var(--primary)" : "var(--border)",
                    background: item.word === currentWord.word ? "var(--accent)" : "var(--card-bg)",
                    color: "var(--text)",
                  }}
                  onClick={() => {
                    setCurrentWord(item);
                    setTyped("");
                    setFeedback("Ready to type");
                    setMessageType("neutral");
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-black">{item.word}</span>
                    <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{item.partOfSpeech}</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{item.topic}</div>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-3xl border p-6 shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <div className="text-sm font-bold uppercase tracking-[.2em]" style={{ color: "var(--muted)" }}>Current Word</div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-5xl font-black" style={{ color: "var(--primary)" }}>{currentWord.word}</span>
                  <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "var(--accent)", color: "var(--primary)" }}>{currentWord.partOfSpeech}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-2xl p-3 border" style={{ borderColor: "var(--border)" }} onClick={nextWord}>
                  <RotateCcw size={20} />
                </button>
                <button className="rounded-2xl p-3 border" style={{ borderColor: "var(--border)" }} onClick={loadWords}>
                  <Sparkles size={20} />
                </button>
              </div>
            </div>

            <div className="mt-6 h-3 rounded-full" style={{ background: "var(--accent)" }}>
              <div className="h-3 rounded-full transition-all" style={{ background: "var(--primary)", width: `${progress}%` }}></div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-8">
              <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Target size={18} style={{ color: "var(--primary)" }} />
                  <span className="font-black text-sm uppercase">Meaning</span>
                </div>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{currentWord.meaning}</p>
              </div>

              <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={18} style={{ color: "var(--primary)" }} />
                  <span className="font-black text-sm uppercase">IELTS Use</span>
                </div>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{currentWord.collocation}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
              <label className="block text-xs font-bold uppercase" style={{ color: "var(--muted)" }}>Type the word</label>
              <input
                ref={inputRef}
                className="w-full mt-3 rounded-2xl border px-4 py-4 text-2xl font-bold outline-none"
                style={{ borderColor: messageType === "error" ? "var(--error)" : "var(--border)", background: "var(--card-bg)", color: "var(--text)" }}
                value={typed}
                onChange={handleTyping}
                autoCapitalize="off"
                spellCheck="false"
                placeholder="type the vocabulary word"
              />

              <div className="flex justify-between items-center gap-3 mt-4">
                <div className="flex items-center gap-2">
                  {messageType === "success" ? <CheckCircle2 size={18} style={{ color: "var(--success)" }} /> : null}
                  {messageType === "error" ? <XCircle size={18} style={{ color: "var(--error)" }} /> : null}
                  <span className="font-bold" style={{ color: messageType === "error" ? "var(--error)" : "var(--primary)" }}>{feedback}</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
                  <TrendingUp size={16} />
                  <span>Streak {streak}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
              <div className="text-xs font-black uppercase" style={{ color: "var(--muted)" }}>Example Sentence</div>
              <p className="mt-2 text-sm leading-7" style={{ color: "var(--text)" }}>{currentWord.example}</p>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
