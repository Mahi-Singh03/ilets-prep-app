"use client";
import { createContext, useState, useEffect, useCallback, useMemo } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: true
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const initializeFromNextAuthSession = useCallback(async () => {
    try {
      const sessionResponse = await fetch("/api/auth/session");
      if (!sessionResponse.ok) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          loading: false
        });
        setIsInitialized(true);
        return;
      }

      const session = await sessionResponse.json();
      if (session?.user) {
        localStorage.setItem("user", JSON.stringify(session.user));
        localStorage.setItem("nextAuthSession", JSON.stringify(session));
        setAuthState({
          user: session.user,
          isAuthenticated: true,
          isAdmin: false,
          loading: false
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          loading: false
        });
      }
    } catch (sessionError) {
      console.error("Error checking NextAuth session:", sessionError);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false
      });
    }
    setIsInitialized(true);
  }, []);

  const fetchCompleteStudentData = useCallback(async (userId) => {
    const token = localStorage.getItem("token");
    if (!token || !userId) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`/api/students/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      if (response.ok) {
        const completeUserData = await response.json();
        localStorage.setItem("user", JSON.stringify(completeUserData));
        setAuthState({
          user: completeUserData,
          isAuthenticated: true,
          isAdmin: false,
          loading: false
        });
        setIsInitialized(true);
        return true;
      }

      if (response.status === 401 || response.status === 403 || response.status === 404) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return false;
      }

      const storedUser = localStorage.getItem("user");
      const userData = storedUser ? JSON.parse(storedUser) : null;
      setAuthState({
        user: userData,
        isAuthenticated: !!userData,
        isAdmin: false,
        loading: false
      });
      setIsInitialized(true);
      return !!userData;
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching student data:", error);
      }
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    // Check if we've already initialized
    if (isInitialized) {
      return;
    }
    
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const storedUser = localStorage.getItem("user");
      const adminToken = localStorage.getItem("adminToken");
      const userToken = localStorage.getItem("token");

      if (adminToken) {
        // Admin authentication takes precedence
        setAuthState({
          user: storedUser ? JSON.parse(storedUser) : { isAdmin: true },
          isAuthenticated: true,
          isAdmin: true,
          loading: false
        });
        setIsInitialized(true);
      } else if (userToken) {
        const userData = storedUser ? JSON.parse(storedUser) : null;
        if (userData) {
          const refreshed = await fetchCompleteStudentData(userData._id || userData.id);
          if (!refreshed) {
            await initializeFromNextAuthSession();
          }
        } else {
          localStorage.removeItem("token");
          await initializeFromNextAuthSession();
        }
      } else {
        await initializeFromNextAuthSession();
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      // Clear invalid auth data
      localStorage.removeItem("user");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      setAuthState({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false
      });
      setIsInitialized(true);
    }
  }, [isInitialized, fetchCompleteStudentData, initializeFromNextAuthSession]);

  useEffect(() => {
    initializeAuth();

    // Listen for focus events to re-check auth state
    // (in case user logged in from another tab)
    const handleFocus = () => {
      setIsInitialized(false); // Reset to re-initialize
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [initializeAuth]);

  // Monitor for session changes (only on window focus/blur events)
  useEffect(() => {
    if (isInitialized) {
      const checkSession = async () => {
        try {
          const sessionResponse = await fetch("/api/auth/session", {
            cache: "no-store"
          });
          if (sessionResponse.ok) {
            const session = await sessionResponse.json();
            if (session && session.user && !authState.isAuthenticated) {
              // New session detected! User just logged in
              localStorage.setItem("user", JSON.stringify(session.user));
              localStorage.setItem("nextAuthSession", JSON.stringify(session));
              setAuthState({
                user: session.user,
                isAuthenticated: true,
                isAdmin: false,
                loading: false
              });
            } else if (!session || !session.user) {
              // Session expired
              if (authState.isAuthenticated && !authState.isAdmin && !localStorage.getItem("token")) {
                // User was authenticated via NextAuth but session expired
                localStorage.removeItem("nextAuthSession");
                setAuthState({
                  user: null,
                  isAuthenticated: false,
                  isAdmin: false,
                  loading: false
                });
              }
            }
          }
        } catch (error) {
          console.error("Error checking session:", error);
        }
      };

      // Check session when window regains focus (user returns to tab)
      window.addEventListener("focus", checkSession);
      
      // Optional: Check once on mount and then every 10 minutes
      const longCheckInterval = setInterval(checkSession, 600000); // 10 minutes

      return () => {
        window.removeEventListener("focus", checkSession);
        clearInterval(longCheckInterval);
      };
    }
  }, [isInitialized, authState.isAuthenticated, authState.isAdmin]);

  const login = useCallback((userData, isAdminLogin = false, token = null) => {
    try {
      if (isAdminLogin) {
        if (!token) throw new Error("Admin token is required");
        localStorage.setItem("adminToken", token);
        localStorage.removeItem("token"); // Clear regular user token if exists
      } else {
        if (!userData) throw new Error("User data is required");
        localStorage.setItem("user", JSON.stringify(userData));
        if (token) localStorage.setItem("token", token);
        localStorage.removeItem("adminToken"); // Clear admin token if exists
      }

      const newAuthState = {
        user: userData || { isAdmin: true },
        isAuthenticated: true,
        isAdmin: isAdminLogin,
        loading: false
      };
      
      setAuthState(newAuthState);
      setIsInitialized(true);
      setRefreshKey(prev => prev + 1);
      
      // Force immediate re-render
      setTimeout(() => {
        setAuthState(prev => ({ ...prev }));
        // Dispatch custom event for navbar
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      }, 0);
    } catch (error) {
      console.error("Login error:", error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Sign out from NextAuth if there's a session
      try {
        const sessionResponse = await fetch("/api/auth/session");
        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          if (session && session.user) {
            // There's an active NextAuth session, sign it out
            await fetch("/api/auth/signout", {
              method: "POST",
              headers: { "Content-Type": "application/json" }
            });
          }
        }
      } catch (error) {
        console.error("Error signing out from NextAuth:", error);
      }

      // Clear all local storage
      localStorage.removeItem("user");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      localStorage.removeItem("onlineCourseUser");
      localStorage.removeItem("onlineCourseUserToken");
      localStorage.removeItem("nextauth.message");
      localStorage.removeItem("nextAuthSession");
      localStorage.removeItem("adminData");
      
      const newAuthState = {
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false
      };
      
      // Reset all state to ensure proper re-render
      setAuthState(newAuthState);
      setIsInitialized(false);
      setRefreshKey(prev => prev + 1);
      
      // Force immediate re-render
      setTimeout(() => {
        setAuthState(prev => ({ ...prev }));
        // Dispatch custom event for navbar
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      }, 0);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  // Check fee status and course completion
  const checkFeeStatus = useCallback(() => {
    if (!authState.user || authState.isAdmin) return null;

    const today = new Date();
    const user = authState.user;

    // Check if course is completed
    if (user.farewellDate && today > new Date(user.farewellDate)) {
      return {
        type: 'courseCompleted',
        data: {
          farewellDate: user.farewellDate,
          courseName: user.selectedCourse || 'Course'
        }
      };
    }

    // If no fee details exist, block access and require fee setup
    if (!user.feeDetails || !user.feeDetails.installmentDetails || user.feeDetails.installmentDetails.length === 0) {
      return {
        type: 'noFeeSetup',
        data: {
          message: 'Your fee structure has not been set up yet. Please contact the fees manager to set up your payment plan before accessing exams.'
        }
      };
    }

    // Find overdue installments
    const overdueInstallments = user.feeDetails.installmentDetails
      .filter(installment => {
        const dueDate = new Date(installment.submissionDate);
        return !installment.paid && today > dueDate;
      })
      .sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate));

    if (overdueInstallments.length > 0) {
      return {
        type: 'overdueInstallment',
        data: {
          installment: overdueInstallments[0],
          totalOverdue: overdueInstallments.length,
          totalAmount: overdueInstallments.reduce((sum, inst) => sum + (inst.amount || 0), 0)
        }
      };
    }

    // Check for upcoming installments (within 7 days) - but don't block access
    const upcomingInstallments = user.feeDetails.installmentDetails
      .filter(installment => {
        const dueDate = new Date(installment.submissionDate);
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        return !installment.paid && daysUntilDue <= 7 && daysUntilDue >= 0;
      })
      .sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate));

    if (upcomingInstallments.length > 0) {
      return {
        type: 'upcomingInstallment',
        data: {
          installment: upcomingInstallments[0],
          daysUntilDue: Math.ceil((new Date(upcomingInstallments[0].submissionDate) - today) / (1000 * 60 * 60 * 24))
        }
      };
    }

    return null; // All good
  }, [authState.user, authState.isAdmin]);

  const contextValue = useMemo(() => ({
    ...authState,
    login, 
    logout,
    initializeAuth,
    checkFeeStatus,
    fetchCompleteStudentData,
    refreshKey
  }), [authState, login, logout, initializeAuth, checkFeeStatus, fetchCompleteStudentData, refreshKey]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}