'use client';

import { useTheme } from "@/src/app/context/ThemeContext";
import { useLoading } from "@/src/app/context/LoadingContext";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const { isLoading: themeLoading, activeTheme } = useTheme();
  const { isLoading: contextLoading, loadingMessage } = useLoading();
  const [showLoader, setShowLoader] = useState(true);

  const isLoading = themeLoading || contextLoading;

  useEffect(() => {
    if (!isLoading) {
      // Small fade out delay for smooth transition
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(true);
    }
  }, [isLoading]);

  if (!showLoader) {
    return null;
  }

  // Get primary color from active theme, fallback to red
  const primaryColor = activeTheme?.colors?.primary || "#8B0000";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300"
      style={{
        backgroundColor: activeTheme?.colors?.background || '#FFFFFF',
        opacity: showLoader && isLoading ? 1 : 0,
        pointerEvents: isLoading ? 'auto' : 'none',
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div
          className="w-12 h-12 rounded-full animate-spin"
          style={{
            backgroundColor: primaryColor,
            mask: 'radial-gradient(closest-side, transparent calc(100% - 4px), black calc(100% - 4px))',
            WebkitMask: 'radial-gradient(closest-side, transparent calc(100% - 4px), black calc(100% - 4px))',
          }}
        />

        {/* Loading text */}
        <p
          className="text-sm font-medium"
          style={{ color: activeTheme?.colors?.text || '#1F2933', opacity: 0.7 }}
        >
          {loadingMessage}
        </p>

        {/* Pulse animation backdrop */}
        <style>{`
          @keyframes shimmer {
            0%, 100% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.6;
            }
          }
          .animate-shimmer {
            animation: shimmer 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
