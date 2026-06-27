"use client";
import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeContext } from "@/theme/ThemeContextProvider";

export default function ThemeToggle() {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <Tooltip title={mode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: mode === "light" ? "#f39c12" : "#f1c40f",
          backgroundColor: mode === "light" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.2)",
            transform: "rotate(15deg)",
          },
        }}
      >
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
