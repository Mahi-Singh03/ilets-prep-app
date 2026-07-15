"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "./userContext";
import { Loader2, ShieldAlert } from "lucide-react";

export default function ProtectedAdminRoute({ children }) {
  const { isAdmin, isAuthenticated, loading } = useContext(UserContext);
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      setRedirecting(true);
      const timer = setTimeout(() => {
        router.push("/auth/adminLogin");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#C62828] dark:border-[#E53935] mb-6">
          <Loader2 className="h-16 w-16 text-[#C62828] dark:text-[#E53935]" />
        </div>
        <p className="text-lg font-medium text-gray-800 dark:text-white">
          Verifying admin access...
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Please wait while we check your permissions
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black bg-opacity-95 dark:bg-opacity-95 z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-[#F9FAFB] dark:bg-[#0B0B0B] p-8 rounded-2xl shadow-lg dark:shadow-[#1F1F1F]/20 border border-[#E5E7EB] dark:border-[#1F1F1F] max-w-md w-full transform transition-all duration-300 hover:scale-[1.02]">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#C62828]/10 dark:bg-[#E53935]/10 rounded-full animate-ping opacity-75"></div>
              <ShieldAlert className="h-16 w-16 text-[#C62828] dark:text-[#E53935] relative z-10" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Access Denied
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You need administrator privileges to access this page.
              {redirecting ? " Redirecting to login..." : ""}
            </p>

            <div className="w-full mb-6">
              <div className="h-2 bg-gray-200 dark:bg-[#1F1F1F] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#C62828] dark:bg-[#E53935] rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: redirecting ? '100%' : '30%',
                    animation: redirecting ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                  }}
                ></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/")}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-transparent border border-[#E5E7EB] dark:border-[#1F1F1F] rounded-xl hover:bg-gray-50 dark:hover:bg-[#1F1F1F] transition-all duration-200 active:scale-95"
              >
                Go Home
              </button>
              <button
                onClick={() => router.push("/auth/adminLogin")}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#C62828] dark:bg-[#E53935] rounded-xl hover:bg-[#B71C1C] dark:hover:bg-[#D32F2F] transition-all duration-200 transform hover:scale-[1.02] active:scale-95 shadow-sm"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 text-center max-w-md">
          If you believe this is an error, please contact your system administrator.
        </p>
      </div>
    );
  }

  return children;
}