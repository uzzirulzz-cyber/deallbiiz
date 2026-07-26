"use client";

import { useEffect } from "react";
import { useSiteContent } from "./use-site-content";

/** Injects the admin-configured theme + accent colors as CSS custom properties. */
export function useThemeColor() {
  const { data: content } = useSiteContent();
  const themeColor = content?.themeColor || "#3B82F6";
  const accentColor = content?.accentColor || "#8B5CF6";

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", themeColor);
    root.style.setProperty("--theme-accent", accentColor);
  }, [themeColor, accentColor]);
}
