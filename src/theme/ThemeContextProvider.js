"use client";
import { createContext, useState, useMemo, useContext, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const ThemeContext = createContext();

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeContextProvider");
  }
  return context;
};

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check local storage first
    const savedMode = localStorage.getItem("themeMode");
    
    // Fall back to system preference
    const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialMode = savedMode || (systemPrefersDark ? "dark" : "light");
    setMode(initialMode);
    
    if (initialMode === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
    
    if (newMode === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#c0392b",
          },
          secondary: {
            main: "#f39c12",
          },
          ...(mode === "dark"
            ? {
                background: {
                  default: "#0f0f1a",
                  paper: "#1a1a2e",
                },
                text: {
                  primary: "#ffffff",
                  secondary: "rgba(255, 255, 255, 0.7)",
                },
              }
            : {
                background: {
                  default: "#ffffff",
                  paper: "#f8fafc",
                },
                text: {
                  primary: "#1a1a2e",
                  secondary: "#64748b",
                },
              }),
        },
        typography: {
          fontFamily: "'Inter', sans-serif",
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
