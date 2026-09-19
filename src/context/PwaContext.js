"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const PwaContext = createContext({
  isInstallable: false,
  isInstalled: false,
  isIos: false,
  showBanner: false,
  installApp: () => {},
  dismissBanner: () => {},
  showIosGuide: false,
  setShowIosGuide: () => {},
});

const DISMISSAL_KEY = "the_brain_pwa_dismissed_at";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function PwaProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if running standalone (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|optios|edgios/.test(ua);

    if (isIosDevice && isSafari && !isStandalone) {
      setIsIos(true);
      setIsInstallable(true);
    }

    // 3. Listen for Chromium beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      setShowBanner(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 4. Delayed evaluation for showing prompt
    const timer = setTimeout(() => {
      const dismissedAt = localStorage.getItem(DISMISSAL_KEY);
      const isDismissedRecently =
        dismissedAt && Date.now() - parseInt(dismissedAt, 10) < SEVEN_DAYS_MS;

      if (!isDismissedRecently && !isStandalone) {
        setShowBanner(true);
      }
    }, 4000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  }, [isIos, deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  }, []);

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIos,
        showBanner,
        installApp,
        dismissBanner,
        showIosGuide,
        setShowIosGuide,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}
