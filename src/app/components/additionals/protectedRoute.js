"use client";

import { useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserContext } from "./userContext";
import { Loader2 } from "lucide-react";
import LoginModal from "../auth/LoginModal";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(UserContext);
  const pathname = usePathname();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [persistentCheckCount, setPersistentCheckCount] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowLoginModal(true);
      setPersistentCheckCount(0);
    } else if (!loading && isAuthenticated) {
      // Close modal when user becomes authenticated
      setShowLoginModal(false);
      setPersistentCheckCount(0);
    }
  }, [loading, isAuthenticated]);

  // Periodic check for authentication after user attempts login
  useEffect(() => {
    if (showLoginModal && persistentCheckCount < 20) {
      const timer = setTimeout(() => {
        setPersistentCheckCount(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showLoginModal, persistentCheckCount]);

  const handleLoginClose = () => {
    // User clicked X to close without logging in - redirect to home
    if (!isAuthenticated) {
      router.push("/");
    } else {
      setShowLoginModal(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 dark:border-blue-400 mb-6">
          <Loader2 className="h-16 w-16 text-blue-500 dark:text-blue-400" />
        </div>
        <p className="text-lg font-medium text-gray-800 dark:text-white">
          Verifying access...
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Please wait while we check your credentials
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginModal
          isOpen={showLoginModal}
          onClose={handleLoginClose}
          callbackUrl={pathname || "/"}
        />
        {/* Render children in background but they won't be interactive */}
        <div className="pointer-events-none opacity-50">
          {children}
        </div>
      </>
    );
  }

  return children;
}
