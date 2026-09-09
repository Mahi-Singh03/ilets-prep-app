"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function LoginModal({ isOpen, onClose, callbackUrl = "/" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else if (res?.ok) {
        setEmail("");
        setPassword("");
        onClose();
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`🔐 Initiating ${provider} login with callbackUrl:`, callbackUrl || "/");
    signIn(provider, {
      callbackUrl: callbackUrl || "/",
      redirect: true,
      prompt: 'select_account',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm rounded-xl bg-background shadow-xl animate-in fade-in zoom-in duration-200" style={{ borderColor: 'var(--border)', borderWidth: '1px' }}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            aria-label="Close"
          >
            <X className="w-4 h-4 text-foreground/70" />
          </button>

          <div className="p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-xs text-foreground/60 mt-0.5">
                Login to continue with StudyBest
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md p-2.5 text-xs" style={{ backgroundColor: 'var(--error)', color: 'white', borderColor: 'var(--error)', borderWidth: '1px', opacity: 0.9 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                  className="w-full rounded-md bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/50 transition-all"
                  style={{ borderColor: 'var(--border)', borderWidth: '1px' }}
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full rounded-md bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-foreground/50 transition-all"
                  style={{ borderColor: 'var(--border)', borderWidth: '1px' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md px-3 py-2 text-sm font-medium text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="my-4 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTopColor: 'var(--border)', borderTopWidth: '1px' }}></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-foreground/50">Or</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleSocialLogin("google")}
                className="flex items-center justify-center gap-1.5 rounded-md bg-transparent px-3 py-2 text-xs font-medium text-foreground transition-colors hover:opacity-80"
                style={{ borderColor: 'var(--border)', borderWidth: '1px' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-foreground/60">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent("openRegisterWithCallback", { 
                      detail: { callbackUrl: callbackUrl }
                    }));
                  }, 100);
                }}
                className="font-semibold transition-colors hover:opacity-80"
                style={{ color: 'var(--primary)' }}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}