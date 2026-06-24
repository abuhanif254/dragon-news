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
    const savedMode = localStorage.getItem("themeMode") || "light";
    setMode(savedMode);
    if (savedMode === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
    
    if (newMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    console.log("Theme toggled to:", newMode); // Debug log
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

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
