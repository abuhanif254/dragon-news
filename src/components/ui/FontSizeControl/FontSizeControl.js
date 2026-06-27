"use client";
import React from "react";
import { Stack, IconButton, Typography, Tooltip, Box, Divider, Button } from "@mui/material";
import TextDecreaseIcon from "@mui/icons-material/TextDecrease";
import TextIncreaseIcon from "@mui/icons-material/TextIncrease";

export default function FontSizeControl({ fontSize, setFontSize, fontFamily, setFontFamily }) {
  const handleIncrease = () => setFontSize((prev) => Math.min(prev + 0.1, 1.4));
  const handleDecrease = () => setFontSize((prev) => Math.max(prev - 0.1, 0.9));

  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, px: 1.5, py: 0.5, display: "inline-flex", gap: 2, alignItems: "center" }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Tooltip title="Decrease Text Size">
          <IconButton size="small" onClick={handleDecrease} disabled={fontSize <= 0.9}>
            <TextDecreaseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Typography variant="caption" fontWeight={600} sx={{ minWidth: 32, textAlign: "center" }}>
          {Math.round(fontSize * 100)}%
        </Typography>

        <Tooltip title="Increase Text Size">
          <IconButton size="small" onClick={handleIncrease} disabled={fontSize >= 1.4}>
            <TextIncreaseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Divider orientation="vertical" flexItem />

      <Stack direction="row" alignItems="center" spacing={0.8}>
        <Button
          size="small"
          variant={fontFamily === "sans-serif" ? "contained" : "outlined"}
          onClick={() => setFontFamily("sans-serif")}
          color={fontFamily === "sans-serif" ? "error" : "inherit"}
          sx={{ 
            fontSize: "0.75rem", 
            textTransform: "none", 
            fontWeight: 800, 
            borderRadius: 1.5,
            px: 1.2,
            minWidth: 0,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" }
          }}
        >
          Sans
        </Button>
        <Button
          size="small"
          variant={fontFamily === "serif" ? "contained" : "outlined"}
          onClick={() => setFontFamily("serif")}
          color={fontFamily === "serif" ? "error" : "inherit"}
          sx={{ 
            fontSize: "0.75rem", 
            textTransform: "none", 
            fontWeight: 800, 
            borderRadius: 1.5,
            px: 1.2,
            minWidth: 0,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" }
          }}
        >
          Serif
        </Button>
      </Stack>
    </Box>
  );
}
