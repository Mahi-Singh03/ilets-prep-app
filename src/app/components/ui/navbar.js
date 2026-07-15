// app/components/Navbar.jsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/src/app/context/ThemeContext";
import LoginModal from "../auth/LoginModal";
import RegisterModal from "../auth/RegisterModal";
import { FaLaptopCode } from "react-icons/fa";
import { FaCode } from "react-icons/fa";
import { GrDocumentNotes } from "react-icons/gr";
import { AiOutlineTeam } from "react-icons/ai";
import { IoIosHelpBuoy } from "react-icons/io";
import {
  Home,
  UserRoundPlus,
  FolderKanban,
  Images,
  HelpCircle,
  Users,
  Mail,
  Sun,
  Moon,
  LogOut,
  LogIn,
  ChevronDown,
  User,
  Settings,
  Bell,
  Bookmark,
  FileText,
  Shield,
  CreditCard,
  Heart,
  Star,
  Zap,
  Palette,
  Check,
  ChevronRight,
  X,
  Menu,
  Search,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  Headphones,
  MessageCircle,
  Gift,
  Share2,
  Info,
} from "lucide-react";

// Main navigation links (visible on desktop without "More")
const mainNavLinks = [
  { name: "Home", href: "/", icon: Home, badge: null, category: "main" },
  { name: "Code Space", href: "/code-space", icon: FaCode, badge: null, category: "main" },
  { name: "Notes", href: "/notes", icon: GrDocumentNotes, badge: "New", category: "main" },
  { name: "Collaborate", href: "/collaborate", icon: AiOutlineTeam, badge: null, category: "main" },
  { name: "Help", href: "/help", icon: IoIosHelpBuoy, badge: null, category: "main" },
];

// Secondary navigation links (shown in "More" dropdown on desktop)
const secondaryNavLinks = [
  { name: "About", href: "/about", icon: Users, badge: null, category: "info" },
  { name: "Contact", href: "/contact", icon: Mail, badge: null, category: "info" },
  { name: "Privacy Policies", href: "/privacy-policies", icon: Shield, badge: null, category: "info" },
];

// All nav links combined for mobile
const allNavLinks = [...mainNavLinks, ...secondaryNavLinks];

// Quick action items for mobile
const quickActions = [
  { name: "Notes", icon: GrDocumentNotes, href: "/jobs", color: "primary", requiresAuth: true},
  { name: "About", icon: Bookmark, href: "/about  ", color: "secondary", requiresAuth: false },
  { name: "Notifications", icon: Bell, href: "/notifications", color: "accent", requiresAuth: true },
  { name: "Help Center", icon: HelpCircle, href: "/help", color: "muted" },
];

const quickActionIconColors = {
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  accent: "var(--accent)",
  muted: "var(--muted)",
};

// Categories for mobile menu organization
const menuCategories = {
  all: { title: "All", icon: Home },
  main: { title: "Main", icon: Home },
  info: { title: "Info", icon: Info },
};

// Theme categories for mobile
const themeCategories = {
  all: { name: "All Themes", icon: Palette, color: "var(--primary)" },
  vibrant: { name: "Vibrant", icon: FaLaptopCode, color: "#FF6B6B" },
  dark: { name: "Dark", icon: Moon, color: "#4A5568" },
  light: { name: "Light", icon: Sun, color: "#FBBF24" },
  professional: { name: "Professional", icon: FaCode, color: "#3B82F6" },
  creative: { name: "Creative", icon: Palette, color: "#EC4899" }
};

// Mobile Theme Selector Component
const MobileThemeSelector = memo(({ isOpen, onClose, activeThemeOption, themeOptions, setColorTheme }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const sheetRef = useRef(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Filter themes based on category and search
  const filteredThemes = useMemo(() => {
    let filtered = themeOptions || [];

    if (selectedCategory !== "all") {
      filtered = filtered.filter(theme => theme.category === selectedCategory);
    }

    return filtered;
  }, [themeOptions, selectedCategory]);

  // Touch handlers for swipe to close
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
    setTouchEnd(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientY);

    const delta = e.touches[0].clientY - touchStart;
    if (sheetRef.current && delta > 0) {
      // Swipe down gesture
      if (delta < 300) {
        // Apply resistance the further we swipe down
        const pullDistance = delta * 0.7;
        sheetRef.current.style.transform = `translateY(${pullDistance}px)`;
        sheetRef.current.style.transition = 'none'; // Instant follow finger
      }
    }
  };

  const handleTouchEnd = () => {
    if (sheetRef.current) {
      sheetRef.current.style.transform = "";
      sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'; // Spring back or close smoothly
    }

    const delta = touchEnd - touchStart;
    if (touchEnd !== 0 && delta > 80) {
      onClose();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] lg:hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-card-bg rounded-t-3xl shadow-2xl overflow-hidden animate-slideUp max-h-[85vh] flex flex-col transition-transform duration-300 ease-out"
      >
        <div
          className="shrink-0 cursor-grab active:cursor-grabbing touch-none z-[201] relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div
              className="w-12 h-1.5 rounded-full"
              style={{ background: "var(--primary)" }}
            />
          </div>

          {/* Header */}
          <div className="px-5 pt-2 pb-4 border-b border-border bg-card-bg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Palette className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-text">Theme Gallery</h2>
              </div>
              <span
                className="px-3 py-1 text-xs font-bold text-white rounded-full bg-primary"
                style={{ background: "var(--primary)" }}
              >
                {filteredThemes.length} Themes
              </span>
            </div>
          </div>
        </div>

        {/* Theme Grid */}
        <div className="flex-1 overflow-y-auto px-5 py-3 pb-6">
          {filteredThemes.length > 0 ? (
            <div className="space-y-3">
              {filteredThemes.map((option, index) => (
                <button
                  key={option.key}
                  onClick={() => {
                    setColorTheme(option.key);
                    onClose();
                  }}
                  className={`w-full text-left transition-all duration-300 rounded-2xl p-4 ${activeThemeOption?.key === option.key
                      ? "ring-2 ring-primary shadow-lg bg-primary/5"
                      : "hover:bg-muted/5 border border-border"
                    }`}
                  style={{
                    animation: `fadeIn 0.3s ease-out ${index * 0.05}s forwards`,
                    opacity: 0,
                    transform: "translateY(10px)"
                  }}
                >
                  <div className="flex items-start space-x-4">
                    {/* Color Preview */}
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-1">
                        <div
                          className="w-10 h-10 rounded-xl shadow-md"
                          style={{ backgroundColor: option.colors.primary }}
                        />
                        <div
                          className="w-10 h-10 rounded-xl shadow-md"
                          style={{ backgroundColor: option.colors.secondary }}
                        />
                        <div
                          className="w-10 h-10 rounded-xl shadow-md"
                          style={{ backgroundColor: option.colors.accent }}
                        />
                      </div>
                      <div
                        className="w-full h-2 rounded-full"
                        style={{ backgroundColor: option.colors.text }}
                      />
                    </div>

                    {/* Theme Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-text text-lg">
                          {option.name}
                        </h3>
                        {activeThemeOption?.key === option.key && (
                          <div className="flex items-center space-x-1">
                            <Check className="w-5 h-5 text-primary" />
                            <span className="text-xs text-primary font-medium">Active</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted mb-2 line-clamp-2">
                        {option.description}
                      </p>

                      {/* Preview Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${option.colors.primary}20`,
                            color: option.colors.primary
                          }}
                        >
                          Primary
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${option.colors.secondary}20`,
                            color: option.colors.secondary
                          }}
                        >
                          Secondary
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${option.colors.accent}20`,
                            color: option.colors.accent
                          }}
                        >
                          Accent
                        </span>
                      </div>
                    </div>

                    {/* Preview Icon */}
                    <div className="self-center">
                      <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${activeThemeOption?.key === option.key
                          ? "text-primary translate-x-1"
                          : "text-muted"
                        }`} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Palette className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-text mb-2">No themes found</h3>
              <p className="text-sm text-muted">
                Try adjusting your filter
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                }}
                className="mt-4 px-6 py-2 text-primary font-medium rounded-full border border-primary/30"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Quick Preview Bar */}
        <div className="border-t border-border p-4 bg-card-bg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-1">
                <div
                  className="w-6 h-6 rounded-full border-2 border-card-bg"
                  style={{ backgroundColor: activeThemeOption?.colors.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-card-bg"
                  style={{ backgroundColor: activeThemeOption?.colors.secondary }}
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-card-bg"
                  style={{ backgroundColor: activeThemeOption?.colors.accent }}
                />
              </div>
              <span className="text-sm text-muted">
                Current: <span className="text-text font-medium">{activeThemeOption?.name}</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-primary font-medium rounded-full bg-primary/10"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

MobileThemeSelector.displayName = 'MobileThemeSelector';

// Memoized Nav Links Component for Desktop
const DesktopNavLinks = memo(({ pathname }) => (
  <>
    {mainNavLinks.map((link) => {
      const Icon = link.icon;
      const isActive = pathname === link.href;
      return (
        <Link
          key={link.name}
          href={link.href}
          className={`relative px-4 py-2 rounded-xl transition-all duration-300 group whitespace-nowrap ${isActive
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-text hover:text-primary hover:bg-muted/10'
          }`}
        >
          <span className="flex items-center space-x-2 text-sm font-semibold">
            <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span>{link.name}</span>
            {link.badge && (
              <span
                className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full shadow-sm"
                style={{ background: "var(--primary)" }}
              >
                {link.badge}
              </span>
            )}
          </span>
        </Link>
      );
    })}
  </>
));

DesktopNavLinks.displayName = 'DesktopNavLinks';

const Navbar = memo(() => {
  const { data: session, status } = useSession({ refetchInterval: 0 });
  const pathname = usePathname();
  const router = useRouter();
  const {
    theme,
    colorTheme,
    setColorTheme,
    themeOptions,
  } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loginCallbackUrl, setLoginCallbackUrl] = useState("/");
  const [registerCallbackUrl, setRegisterCallbackUrl] = useState("/register");
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMoreMenuClicked, setIsMoreMenuClicked] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isMobileThemeOpen, setIsMobileThemeOpen] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isNavigating, setIsNavigating] = useState(false); // Add navigation state

  const mobileMenuRef = useRef(null);
  const sheetRef = useRef(null);
  const userMenuRef = useRef(null);
  const moreMenuRef = useRef(null);
  const moreDropdownRef = useRef(null);
  const themeMenuRef = useRef(null);
  const themeDropdownRef = useRef(null);
  const navContainerRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const isLoggedIn = status === "authenticated" && session?.user;
  const activeThemeOption = useMemo(
    () => themeOptions?.find((option) => option.key === colorTheme) || themeOptions?.[0],
    [themeOptions, colorTheme]
  );

  // Filtered links based on category for mobile
  const filteredLinks = useMemo(() => {
    if (activeCategory === "all") {
      return allNavLinks;
    }
    return allNavLinks.filter(link => link.category === activeCategory);
  }, [activeCategory]);

  // Reset image error when session or image URL changes
  useEffect(() => {
    setImageError(false);
  }, [session?.user?.image, session?.user?.email]);

  // Initialize component
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle navigation state
  useEffect(() => {
    setIsNavigating(false);
    // Close menus when pathname changes
    setIsUserMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsMoreMenuClicked(false);
    setIsThemeMenuOpen(false);
    setIsOpen(false);
  }, [pathname]);

  // Scroll handling with hide/show effect - optimized with debouncing
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    setIsScrolled(currentScrollY > 20);

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setShowNavbar(false);
    } else {
      setShowNavbar(true);
    }

    if (currentScrollY > lastScrollY + 10) {
      setIsUserMenuOpen(false);
      setIsMoreMenuOpen(false);
      setIsMoreMenuClicked(false);
      setIsThemeMenuOpen(false);
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  // Add scroll listener with passive flag
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Mouse move listener to detect when mouse leaves navbar
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!navContainerRef.current || !isMoreMenuOpen || isMoreMenuClicked) return;

      const navRect = navContainerRef.current.getBoundingClientRect();
      const isMouseInNavbar = (
        e.clientX >= navRect.left &&
        e.clientX <= navRect.right &&
        e.clientY >= navRect.top &&
        e.clientY <= navRect.bottom
      );

      if (!isMouseInNavbar) {
        setIsMoreMenuOpen(false);
      }
    };

    if (isMoreMenuOpen && !isMoreMenuClicked) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMoreMenuOpen, isMoreMenuClicked]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close menus if we're currently navigating
      if (isNavigating) return;

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsOpen(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }

      // Close More dropdown when clicking outside
      if (
        isMoreMenuOpen &&
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target) &&
        !moreDropdownRef.current?.contains(event.target)
      ) {
        setIsMoreMenuOpen(false);
        setIsMoreMenuClicked(false);
      }

      // Close desktop theme menu when clicking outside
      if (
        isThemeMenuOpen &&
        themeMenuRef.current &&
        !themeMenuRef.current.contains(event.target) &&
        !themeDropdownRef.current?.contains(event.target)
      ) {
        setIsThemeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMoreMenuOpen, isThemeMenuOpen, isNavigating]);

  // Enhanced touch swipe handlers for mobile menu with direction detection
  const handleTouchStart = useCallback((e) => {
    // Don't initiate swipe if touching a link
    if (e.target.closest('a')) return;
    setSwipeStartX(e.touches[0].clientX);
    setTouchStartTime(Date.now());
    setSwipeDistance(0);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isOpen) return;

    const currentX = e.touches[0].clientX;
    const distance = currentX - swipeStartX;

    // Only allow left swipe to close (negative distance)
    if (distance < 0) {
      setSwipeDistance(Math.abs(distance));

      if (sheetRef.current) {
        const translateX = Math.min(Math.abs(distance) * 0.5, 100);
        sheetRef.current.style.transform = `translateX(-${translateX}px)`;
        sheetRef.current.style.opacity = `${1 - (translateX / 200)}`;
      }
    }
  }, [isOpen, swipeStartX]);

  const handleTouchEnd = useCallback(() => {
    const swipeDuration = Date.now() - touchStartTime;
    const isQuickSwipe = swipeDuration < 300 && swipeDistance > 30;
    const isSlowSwipe = swipeDistance > 80;

    if (isQuickSwipe || isSlowSwipe) {
      setIsOpen(false);
    }

    if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateX(0)';
      sheetRef.current.style.opacity = '1';
    }

    setSwipeDistance(0);
  }, [swipeDistance, touchStartTime]);

  // Handle link clicks
  const handleLinkClick = useCallback((e, callback) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    // Execute any additional callback (like closing menus)
    if (callback) {
      callback();
    }
    
    // Navigate immediately without delay
    const href = e.currentTarget.getAttribute('href');
    if (href) {
      router.push(href);
    }
  }, [isNavigating, router]);

  // Handle logout with NextAuth
  const handleLogout = async () => {
    await signOut({ redirect: false });
    setIsUserMenuOpen(false);
    router.push("/");
  };

  // Modal event listeners
  useEffect(() => {
    const handleOpenLogin = () => {
      setLoginCallbackUrl("/");
      setIsLoginOpen(true);
    };
    const handleOpenRegister = () => {
      setRegisterCallbackUrl("/register");
      setIsRegisterOpen(true);
    };
    const handleOpenRegisterWithCallback = (event) => {
      const callbackUrl = event.detail?.callbackUrl || "/register";
      setRegisterCallbackUrl(callbackUrl);
      setIsRegisterOpen(true);
    };

    window.addEventListener("openLogin", handleOpenLogin);
    window.addEventListener("openRegister", handleOpenRegister);
    window.addEventListener("openRegisterWithCallback", handleOpenRegisterWithCallback);

    return () => {
      window.removeEventListener("openLogin", handleOpenLogin);
      window.removeEventListener("openRegister", handleOpenRegister);
      window.removeEventListener("openRegisterWithCallback", handleOpenRegisterWithCallback);
    };
  }, []);

  // Handle More menu enter (container)
  const handleMenuEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (!isMoreMenuClicked) {
      setIsMoreMenuOpen(true);
    }
  };

  // Handle More button click
  const handleMoreClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMoreMenuOpen && !isMoreMenuClicked) {
      setIsMoreMenuClicked(true);
    } else {
      setIsMoreMenuClicked(!isMoreMenuClicked);
      setIsMoreMenuOpen(!isMoreMenuOpen);
    }
  };

  // Handle link click in dropdown
  const handleMoreLinkClick = () => {
    setIsMoreMenuOpen(false);
    setIsMoreMenuClicked(false);
  };

  // Handle More menu leave (container)
  const handleMenuLeave = () => {
    if (!isMoreMenuClicked) {
      closeTimeoutRef.current = setTimeout(() => {
        setIsMoreMenuOpen(false);
      }, 150);
    }
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className="h-16 bg-card-bg">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="h-8 w-32 bg-muted/20 rounded-lg animate-pulse"></div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-muted/20 rounded-full animate-pulse"></div>
            <div className="h-8 w-8 bg-muted/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} callbackUrl={loginCallbackUrl} />

      {/* Register Modal */}
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} callbackUrl={registerCallbackUrl} />

      {/* Mobile Theme Selector */}
      <MobileThemeSelector
        isOpen={isMobileThemeOpen}
        onClose={() => setIsMobileThemeOpen(false)}
        activeThemeOption={activeThemeOption}
        themeOptions={themeOptions}
        setColorTheme={setColorTheme}
      />

      <nav
        ref={navContainerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'
          } ${isScrolled
            ? 'bg-card-bg/95 backdrop-blur-md shadow-lg border-b border-border'
            : 'bg-card-bg border-b border-transparent'
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">

            {/* Logo with Primary Color Accent */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
              <div className="relative">
                <div
                  className="w-20 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transform group-hover:rotate-[360deg] transition-all duration-700 shadow-lg"
                  style={{
                    background: "var(--primary)",
                    boxShadow: '0 10px 15px -3px var(--shadow)'
                  }}
                >
                  <img src="https://res.cloudinary.com/dyigmfiar/image/upload/v1778834672/image_pwldog.png" alt="Codership AI Logo" className="w-full h-full object-contain p-1.5" />
                </div>
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-ping opacity-75"
                  style={{ background: "var(--secondary)" }}
                ></div>
              </div>
              <div className="flex flex-col justify-center">
                <h1
                  className="text-lg sm:text-3xl font-bold leading-tight"
                  style={{ color: "var(--primary)" }}
                >
                  CoderShip AI
                </h1>
                <p className="hidden sm:block text-xs text-muted -mt-0.5 font-medium tracking-wide">Learn, Code and Grow</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-8">
              <div className="flex items-center space-x-1 bg-card-bg p-1.5 rounded-2xl border border-border">
                <DesktopNavLinks pathname={pathname} />

                {/* More Dropdown */}
                <div
                  className="relative"
                  ref={moreMenuRef}
                  onMouseEnter={handleMenuEnter}
                  onMouseLeave={handleMenuLeave}
                >
                  <button
                    onClick={handleMoreClick}
                    aria-expanded={isMoreMenuOpen}
                    aria-haspopup="true"
                    className={`flex items-center space-x-1 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${isMoreMenuOpen || secondaryNavLinks.some(link => pathname === link.href)
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-text hover:text-primary hover:bg-muted/10'
                      }`}
                  >
                    <span>More</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isMoreMenuOpen && (
                    <div
                      ref={moreDropdownRef}
                      className="absolute right-0 top-full mt-2 w-56 origin-top-right z-50 animate-dropdown"
                    >
                      <div className="py-2 bg-card-bg rounded-2xl shadow-xl border border-border overflow-hidden">
                        {secondaryNavLinks.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={handleMoreLinkClick}
                            className={`flex items-center justify-between px-4 py-3 transition-all duration-200 group/item ${pathname === link.href
                              ? 'bg-primary/5'
                              : 'hover:bg-muted/10'
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-1.5 rounded-lg transition-colors ${pathname === link.href
                                  ? 'bg-primary'
                                  : 'bg-muted/10 group-hover/item:bg-primary/20'
                                  }`}
                              >
                                <link.icon className={`w-4 h-4 ${pathname === link.href
                                  ? 'text-white'
                                  : 'text-muted group-hover/item:text-primary'
                                  }`} />
                              </div>
                              <span className={`text-sm font-medium ${pathname === link.href
                                ? 'text-primary font-bold'
                                : 'text-text'
                                }`}>{link.name}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">

              {/* Desktop Theme Selector */}
              <div className="relative hidden lg:block" ref={themeMenuRef}>
                <button
                  onClick={() => setIsThemeMenuOpen((prev) => !prev)}
                  className="relative p-2 sm:p-2.5 rounded-full bg-muted/10 hover:bg-muted/20 transition-all duration-300 group"
                  aria-expanded={isThemeMenuOpen}
                  aria-haspopup="true"
                  aria-label="Open theme picker"
                  title="Change theme"
                >
                  <div className="relative">
                    <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    <span
                      className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card-bg"
                      style={{
                        background: "var(--primary)",
                      }}
                    />
                  </div>
                </button>

                {isThemeMenuOpen && (
                  <div
                    ref={themeDropdownRef}
                    className="absolute right-0 top-full mt-2 z-50 animate-dropdown w-[38rem] max-w-[calc(100vw-2rem)] origin-top-right"
                  >
                    <div className="p-4 bg-card-bg rounded-2xl shadow-xl border border-border">
                      <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-border">
                        <div className="flex items-center space-x-2">
                          <Palette className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold text-text">Theme Gallery</h3>
                        </div>
                        <span
                          className="text-xs px-2 py-1 rounded-full text-white shrink-0"
                          style={{ background: "var(--primary)" }}
                        >
                          {activeThemeOption?.name}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 p-4 max-h-[60vh] overflow-y-auto pr-1">
                        {themeOptions.map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => {
                              setColorTheme(option.key);
                              setIsThemeMenuOpen(false);
                            }}
                            className={`relative group text-left transition-all duration-200 rounded-xl p-3 ${colorTheme === option.key
                                ? "ring-2 ring-primary shadow-lg"
                                : "hover:bg-muted/10"
                              }`}
                            title={option.description}
                            aria-label={`Set theme: ${option.name}`}
                          >
                            {/* Theme Preview Card */}
                            <div className="space-y-2">
                              {/* Color Palette Preview */}
                              <div className="flex gap-1">
                                <div
                                  className="w-6 h-6 rounded-full shadow-sm"
                                  style={{ backgroundColor: option.colors.primary }}
                                />
                                <div
                                  className="w-6 h-6 rounded-full shadow-sm"
                                  style={{ backgroundColor: option.colors.secondary }}
                                />
                                <div
                                  className="w-6 h-6 rounded-full shadow-sm"
                                  style={{ backgroundColor: option.colors.accent }}
                                />
                                <div
                                  className="w-6 h-6 rounded-full shadow-sm"
                                  style={{ backgroundColor: option.colors.text }}
                                />
                              </div>

                              {/* Theme Name */}
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-semibold ${colorTheme === option.key ? 'text-primary' : 'text-text'
                                  }`}>
                                  {option.name}
                                </span>
                                {colorTheme === option.key && (
                                  <Check className="w-4 h-4 text-primary" />
                                )}
                              </div>

                              {/* Theme Description */}
                              <p className="text-xs text-muted line-clamp-2">
                                {option.description}
                              </p>
                            </div>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                              style={{
                                boxShadow: `0 0 0 2px var(--primary), 0 0 0 4px var(--secondary)`,
                                borderRadius: '0.75rem'
                              }}
                            />
                          </button>
                        ))}
                      </div>

                      {/* Current Theme Info */}
                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="flex items-center justify-between text-xs text-muted">
                          <span>Active Theme</span>
                          <span className="font-mono">{activeThemeOption?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Theme Button */}
              <button
                onClick={() => setIsMobileThemeOpen(true)}
                className="relative lg:hidden p-2 rounded-full bg-muted/10 hover:bg-muted/20 transition-all duration-300 group"
                aria-label="Open theme picker"
                title="Change theme"
              >
                <div className="relative">
                  <Palette className="w-5 h-5 text-primary" />
                  <span
                    className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card-bg"
                    style={{
                      background: "var(--primary)",
                    }}
                  />
                </div>
              </button>

              {/* User Avatar */}
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 group"
                  >
                    <div className="relative">
                      <div
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-0.5 shadow-md group-hover:shadow-lg transition-all duration-300"
                        style={{ background: "var(--primary)" }}
                      >
                        <div className="w-full h-full rounded-[10px] bg-card-bg overflow-hidden flex items-center justify-center">
                          {session?.user?.image && !imageError ? (
                            <Image
                              src={session.user.image}
                              alt={session.user.name || "Student Profile"}
                              width={44}
                              height={44}
                              className="object-cover w-full h-full"
                              onError={() => setImageError(true)}
                              onLoad={() => {
                                if (imageError) setImageError(false);
                              }}
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white text-lg font-bold"
                              style={{ background: "var(--primary)" }}
                            >
                              {session?.user?.name?.[0]?.toUpperCase() || "S"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card-bg"
                        style={{ background: "var(--secondary)" }}
                      ></div>
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">
                        {session?.user?.name || "Student"}
                      </p>
                     <p className="text-xs text-muted font-medium">
                      {session?.user?.provider === "google"
                        ? "Google Login"
                        : session?.user?.provider === "github"
                        ? "GitHub Login"
                        : session?.user?.provider === "facebook"
                        ? "Facebook Login"
                        : "Premium Student"}
                    </p>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-4 w-80 origin-top-right animate-dropdown z-50">
                      <div className="p-3 bg-card-bg rounded-3xl shadow-xl border border-border">

                        {/* User Info */}
                        <div
                          className="p-4 rounded-2xl mb-2 border border-border"
                          style={{ background: 'var(--background)' }}
                        >
                          <div className="flex items-center space-x-4 mb-4">
                            <div
                              className="w-14 h-14 rounded-2xl p-0.5"
                              style={{ background: "var(--primary)" }}
                            >
                              <div className="w-full h-full rounded-[14px] bg-card-bg overflow-hidden flex items-center justify-center">
                                {session?.user?.image && !imageError ? (
                                  <Image
                                    src={session.user.image}
                                    alt={session.user.name || "Profile"}
                                    width={56}
                                    height={56}
                                    className="object-cover"
                                    onError={(e) => {
                                      console.error("Image load error:", session.user.image);
                                      setImageError(true);
                                    }}
                                    onLoad={() => {
                                      if (imageError) setImageError(false);
                                    }}
                                  />
                                ) : (
                                  <div
                                    className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                                    style={{ background: "var(--primary)" }}
                                  >
                                    {session?.user?.name?.[0]?.toUpperCase() || "S"}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-lg text-text flex items-center gap-2">
                                {session?.user?.name || "Student"}
                              </p>
                              <p className="text-sm text-muted font-medium">
                                {session?.user?.email}
                              </p>
                              {session?.user?.provider && (
                                <p className="text-xs font-medium capitalize mt-1" style={{ color: 'var(--primary)' }}>
                                  Logged in via {session.user.provider}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              className="px-3 py-1 text-xs font-bold text-white rounded-full"
                              style={{ background: "var(--primary)" }}
                            >
                              Premium Member
                            </span>
                            <Star className="w-4 h-4 text-warning" />
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="space-y-1">
                          <Link
                            href="/myProfile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/10 transition-all duration-200 group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                <User className="w-5 h-5" />
                              </div>
                              <span className="font-semibold text-text">My Profile</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted" />
                          </Link>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-all duration-200 group"
                          >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <span className="font-semibold text-primary">Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="hidden sm:flex items-center space-x-2 px-6 py-2.5 text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                  style={{
                    background: "var(--primary)",
                    boxShadow: '0 4px 6px -1px var(--shadow)'
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => {
                  setIsOpen((prev) => !prev);
                }}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
                className="lg:hidden relative w-10 h-10 flex items-center justify-center"
              >
                {isOpen ? (
                  <X className="w-6 h-6 text-primary" />
                ) : (
                  <Menu className="w-6 h-6 text-primary" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Bottom Sheet with Swipe Gesture */}
      {isOpen && (
        <div className="fixed inset-0 z-[99] lg:hidden">
          {/* Backdrop with fade effect */}
          <div
            className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
              }`}
            onClick={() => setIsOpen(false)}
          />

          {/* Bottom Sheet with swipe gesture */}
          <div
            ref={(element) => {
              sheetRef.current = element;
              mobileMenuRef.current = element;
            }}
            className="absolute bottom-0 left-0 right-0 h-[90vh] bg-card-bg rounded-t-3xl shadow-2xl animate-slideUp overflow-hidden flex flex-col"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Swipe indicator */}
            <div
              className="flex justify-center pt-3 pb-2 cursor-pointer active:cursor-grabbing"
              onClick={() => setIsOpen(false)}
            >
              <div
                className="w-12 h-1.5 rounded-full"
                style={{ background: "var(--primary)" }}
              ></div>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {/* User Profile Section */}
              <div className="pt-4 pb-6">
                {isLoggedIn ? (
                  <div
                    className="flex items-center space-x-4 p-4 rounded-2xl mb-6 border border-border animate-fadeIn"
                    style={{ background: 'var(--background)' }}
                  >
                    <div className="relative">
                      <div
                        className="w-14 h-14 rounded-2xl p-0.5"
                        style={{ background: "var(--primary)" }}
                      >
                        <div className="w-full h-full rounded-xl bg-card-bg overflow-hidden flex items-center justify-center">
                          {session?.user?.image && !imageError ? (
                            <Image
                              src={session.user.image}
                              alt={session.user.name || "Profile"}
                              width={56}
                              height={56}
                              className="object-cover"
                              onError={(e) => {
                                console.error("Image load error:", session.user.image);
                                setImageError(true);
                              }}
                              onLoad={() => {
                                if (imageError) setImageError(false);
                              }}
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                              style={{ background: "var(--primary)" }}
                            >
                              {session?.user?.name?.[0]?.toUpperCase() || "S"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card-bg flex items-center justify-center"
                        style={{ background: "var(--secondary)" }}
                      >
                        <Star className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-text">
                        {session?.user?.name || "Student"}
                      </h3>
                      <p className="text-sm text-muted mb-2">
                        {session?.user?.email}
                      </p>
                      {session?.user?.provider && (
                        <p className="text-xs font-medium capitalize mb-2" style={{ color: 'var(--primary)' }}>
                          Logged in via {session.user.provider}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        <span
                          className="text-xs px-2 py-1 rounded-full text-white"
                          style={{ background: "var(--primary)" }}
                        >
                          Premium Member
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-4 rounded-2xl mb-6 border border-border animate-fadeIn"
                    style={{ background: 'var(--background)' }}
                  >
                    <h3 className="font-bold text-lg text-text mb-2">Welcome to Code Collab! 🚀</h3>
                    <p className="text-sm text-muted mb-4">Access coding resources, collaborate with teams & grow your skills</p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setIsLoginOpen(true);
                          setIsOpen(false);
                        }}
                        className="flex-1 py-3 text-white font-semibold rounded-xl shadow-lg active:scale-95 transition-transform duration-200"
                        style={{
                          background: "var(--primary)",
                          boxShadow: '0 10px 15px -3px var(--shadow)'
                        }}
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setRegisterCallbackUrl('/register');
                          setIsRegisterOpen(true);
                          setIsOpen(false);
                        }}
                        className="flex-1 py-3 text-primary font-semibold rounded-xl border-2 border-primary/30 active:scale-95 transition-transform duration-200"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Actions Grid */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-muted mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-primary" />
                    Quick Actions
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {quickActions.map((action) => {
                      if (action.requiresAuth && !isLoggedIn) return null;
                      return (
                        <Link
                          key={action.name}
                          href={action.href}
                          onClick={() => setIsOpen(false)}
                          className="flex flex-col items-center p-3 bg-card-bg rounded-xl hover:shadow-lg transition-all duration-300 active:scale-95 border border-border group"
                        >
                          <div className={`p-2 rounded-lg mb-2 transition-colors group-hover:bg-primary/20`}>
                            <action.icon
                              className="w-5 h-5"
                              style={{ color: quickActionIconColors[action.color] || "var(--primary)" }}
                            />
                          </div>
                          <span className="text-xs font-medium text-text text-center">{action.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="mb-6">
                  <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    {Object.entries(menuCategories).map(([key, category]) => (
                      <button
                        key={key}
                        onClick={() => setActiveCategory(key)}
                        className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${activeCategory === key
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-muted/10 text-text hover:bg-muted/20'
                          }`}
                      >
                        <div className="flex items-center space-x-2">
                          <category.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{category.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2 pb-20">
                  {filteredLinks.map((link, index) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted/10 transition-all duration-300 group active:scale-[0.98] border border-transparent hover:border-border animate-fadeIn"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${isActive ? 'bg-primary' : 'bg-muted/10'}`}>
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted'}`} />
                          </div>
                          <span className={`font-medium ${isActive ? 'text-primary' : 'text-text'}`}>
                            {link.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {link.badge && (
                            <span
                              className="px-2 py-1 text-xs font-bold text-white rounded-full"
                              style={{ background: "var(--primary)" }}
                            >
                              {link.badge}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-muted group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-border p-4 bg-card-bg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
                  <button
                    onClick={() => {
                      setIsMobileThemeOpen(true);
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 text-sm text-muted hover:text-primary transition-colors"
                  >
                    <Palette className="w-4 h-4" />
                    <span>Theme</span>
                  </button>
                </div>
                {!isLoggedIn && (
                  <button
                    onClick={() => {
                      setIsLoginOpen(true);
                      setIsOpen(false);
                    }}
                    className="text-sm text-primary font-medium text-left sm:text-right"
                  >
                    Sign in for more →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-16" />

      {/* Global Styles */}
      <style jsx global>{`
        body {
          background-color: var(--background);
          color: var(--text);
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        /* Remove default focus outline */
        button, a, input, select, textarea {
          outline: none;
        }
        
        button:focus, a:focus, input:focus, select:focus, textarea:focus {
          outline: none;
          box-shadow: none;
        }
        
        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes dropdown {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-dropdown {
          animation: dropdown 0.2s ease-out forwards;
        }
        
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Smooth scrollbar */
        .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: var(--primary) transparent;
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: var(--primary);
          border-radius: 3px;
        }
        
        /* Enhanced selection with theme primary color */
        ::selection {
          background-color: var(--primary);
          color: white;
        }
        
        /* Smooth transitions */
        * {
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        
        /* Better focus styles with theme primary color */
        button:focus-visible, a:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
          border-radius: 0.375rem;
        }
        
        /* Mobile menu swipe feedback */
        .active:cursor-grabbing {
          cursor: grabbing;
        }
        
        /* Line clamp utility */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Prevent body scroll when menu is open */
        body.menu-open {
          overflow: hidden;
        }
        
        /* Touch feedback */
        .active\\:scale-\\[0\\.98\\]:active {
          transform: scale(0.98);
        }

        /* Mobile-specific touch improvements */
        @media (max-width: 1024px) {
          button, 
          [role="button"],
          a {
            min-height: 44px;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
          }
          
          .touch-feedback:active {
            transform: scale(0.97);
            transition: transform 0.1s ease;
          }
        }
        
        /* Scroll snap for categories */
        .scroll-snap-x {
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        
        .scroll-snap-start {
          scroll-snap-align: start;
        }
        
        /* Prevent text selection during swipe */
        .no-select {
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;