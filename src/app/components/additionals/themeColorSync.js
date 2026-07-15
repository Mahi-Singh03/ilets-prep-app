"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/src/app/context/ThemeContext";

export default function ThemeColorSync() {
  const { colorTheme, mounted } = useTheme();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;

    // Ensure theme-color meta tag is set to white (light mode)
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement("meta");
      themeColorMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute("content", "#ffffff");

    // Set light favicon
    const faviconUrl = "https://res.cloudinary.com/dyigmfiar/image/upload/v1778833118/light_cxol3v.ico";
    const timestamp = new Date().getTime();

    // Update or create favicon links
    let faviconLink = document.querySelector('link[rel="icon"]');
    if (!faviconLink) {
      faviconLink = document.createElement("link");
      faviconLink.rel = "icon";
      faviconLink.type = "image/x-icon";
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = `${faviconUrl}?t=${timestamp}`;

    // Update shortcut icon
    let shortcutLink = document.querySelector('link[rel="shortcut icon"]');
    if (!shortcutLink) {
      shortcutLink = document.createElement("link");
      shortcutLink.rel = "shortcut icon";
      document.head.appendChild(shortcutLink);
    }
    shortcutLink.href = `${faviconUrl}?t=${timestamp}`;

    // Update apple touch icon
    let appleLink = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleLink) {
      appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      document.head.appendChild(appleLink);
    }
    appleLink.href = `${faviconUrl}?t=${timestamp}`;

    setInitialized(true);
  }, [mounted]);

  // Re-sync favicon when color theme changes (for dynamic color updates)
  useEffect(() => {
    if (!initialized || typeof document === "undefined") return;

    const faviconUrl = "https://res.cloudinary.com/dyigmfiar/image/upload/v1778833118/light_cxol3v.ico";
    const timestamp = new Date().getTime();

    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(link => {
      link.href = `${faviconUrl}?t=${timestamp}`;
    });
  }, [colorTheme, initialized]);

  return null;
}
