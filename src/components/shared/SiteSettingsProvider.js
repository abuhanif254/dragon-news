"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getSiteSettings } from "@/lib/firestore";
import { SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from "@/lib/site";

const SiteSettingsContext = createContext({
  siteName: SITE_NAME,
  siteDescription: SITE_DESCRIPTION,
  logoUrl: DEFAULT_OG_IMAGE,
  adminEmail: "contact@dragonnews.com",
  socialLinks: {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com",
    instagram: "https://instagram.com"
  }
});

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    siteName: SITE_NAME,
    siteDescription: SITE_DESCRIPTION,
    logoUrl: DEFAULT_OG_IMAGE,
    adminEmail: "contact@dragonnews.com",
    socialLinks: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      youtube: "https://youtube.com",
      instagram: "https://instagram.com"
    }
  });

  useEffect(() => {
    let mounted = true;
    getSiteSettings().then((data) => {
      if (data && mounted) {
        setSettings((prev) => ({ ...prev, ...data, socialLinks: { ...prev.socialLinks, ...(data.socialLinks || {}) } }));
      }
    }).catch(console.error);
    return () => { mounted = false; };
  }, []);

  const primaryColor = settings.primaryColor || "#c0392b";

  return (
    <SiteSettingsContext.Provider value={settings}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --brand-red: ${primaryColor} !important;
        }
      ` }} />
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
