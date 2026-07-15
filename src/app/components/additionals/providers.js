"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/src/app/context/ThemeContext";
import { LoadingProvider } from "@/src/app/context/LoadingContext";
import { UserProvider } from "@/src/app/components/additionals/userContext";
import ThemeColorSync from "@/src/app/components/additionals/themeColorSync";
import LoadingScreen from "@/src/app/components/LoadingScreen";
import RouteChangeListener from "@/src/app/components/RouteChangeListener";

export default function Providers({ children }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <UserProvider>
        <ThemeProvider>
          <LoadingProvider>
            <ThemeColorSync />
            <LoadingScreen />
            <Suspense fallback={null}>
              <RouteChangeListener />
            </Suspense>
            {children}
          </LoadingProvider>
        </ThemeProvider>
      </UserProvider>
    </SessionProvider>
  );
}
