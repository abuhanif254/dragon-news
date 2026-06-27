"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  InputBase, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  IconButton,
  CircularProgress,
  Stack,
  Divider,
  Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import PrintIcon from "@mui/icons-material/Print";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { useThemeContext } from "@/theme/ThemeContextProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef(null);
  const { toggleTheme } = useThemeContext();

  const commands = [
    { name: "Toggle Theme (Light/Dark)", action: () => toggleTheme(), icon: <Brightness4Icon fontSize="small" /> },
    { name: "Go to Dashboard", action: () => router.push("/dashboard"), icon: <DashboardIcon fontSize="small" /> },
    { name: "Write New Article", action: () => router.push("/dashboard/news/create"), icon: <AddCircleOutlineIcon fontSize="small" /> },
    { name: "Go to Profile", action: () => router.push("/dashboard/profile"), icon: <PersonIcon fontSize="small" /> },
    { name: "Go to Portal Settings", action: () => router.push("/dashboard/settings"), icon: <SettingsIcon fontSize="small" /> },
    { name: "Print Current Page", action: () => window.print(), icon: <PrintIcon fontSize="small" /> }
  ];

  // Load history
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("search_history");
      if (saved) setHistory(JSON.parse(saved));
    }
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results?.slice(0, 5) || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const itemsLength = query ? results.length + 1 : history.length + commands.length; // +1 for "See all results"
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < itemsLength - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (query && selectedIndex === results.length) {
        handleSeeAll();
      } else if (query && selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (!query && selectedIndex >= 0 && selectedIndex < history.length) {
        setQuery(history[selectedIndex]);
      } else if (!query && selectedIndex >= history.length && selectedIndex < history.length + commands.length) {
        commands[selectedIndex - history.length].action();
        onClose();
      } else if (query && selectedIndex === -1) {
        handleSeeAll();
      }
    }
  };

  const saveHistory = (term) => {
    const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  const handleSelect = (news) => {
    saveHistory(query);
    onClose();
    router.push(`/news/${news.id || news._id}`);
  };

  const handleSeeAll = () => {
    if (!query.trim()) return;
    saveHistory(query);
    onClose();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const removeHistoryItem = (e, term) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h !== term);
    setHistory(newHistory);
    localStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(6px)",
          }
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 24px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
          mt: { xs: 2, md: 10 },
          verticalAlign: "top",
          alignSelf: "flex-start"
        }
      }}
    >
      {/* Search Input Area */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", borderBottom: "1px solid", borderColor: "divider" }}>
        <SearchIcon sx={{ color: "text.secondary", mr: 2 }} />
        <InputBase
          inputRef={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search articles, authors, topics..."
          sx={{ flex: 1, fontSize: "1.1rem", fontWeight: 500 }}
        />
        {loading && <CircularProgress size={20} sx={{ mr: 2, color: "text.secondary" }} />}
        <Chip label="ESC" size="small" sx={{ borderRadius: 1, fontWeight: 700, mr: 1, display: { xs: 'none', sm: 'inline-flex' } }} />
        <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Results Area */}
      <Box sx={{ maxHeight: "60vh", overflowY: "auto" }}>
        {!query && history.length > 0 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ px: 2, display: "block", mb: 1 }}>
              Recent Searches
            </Typography>
            <List disablePadding>
              {history.map((term, idx) => (
                <ListItem 
                  key={idx} 
                  button 
                  onClick={() => setQuery(term)}
                  selected={selectedIndex === idx}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <HistoryIcon sx={{ color: "text.secondary", fontSize: 20, mr: 2 }} />
                  <ListItemText primary={term} primaryTypographyProps={{ fontWeight: 500 }} />
                  <IconButton size="small" onClick={(e) => removeHistoryItem(e, term)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {!query && (
          <Box sx={{ p: 2, pt: history.length > 0 ? 0 : 2 }}>
            <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ px: 2, display: "block", mb: 1 }}>
              Command Palette (Quick Actions)
            </Typography>
            <List disablePadding>
              {commands.map((cmd, idx) => {
                const commandIndex = history.length + idx;
                return (
                  <ListItem 
                    key={idx} 
                    button 
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    selected={selectedIndex === commandIndex}
                    sx={{ borderRadius: 2, mb: 0.5 }}
                  >
                    <Box sx={{ color: "text.secondary", display: "flex", alignItems: "center", mr: 2 }}>
                      {cmd.icon}
                    </Box>
                    <ListItemText primary={cmd.name} primaryTypographyProps={{ fontWeight: 500 }} />
                    <Chip label="ACTION" size="small" sx={{ borderRadius: 1, height: 18, fontSize: "0.55rem", fontWeight: 700 }} />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {query && (
          <List disablePadding sx={{ p: 1 }}>
            {results.map((news, idx) => (
              <ListItem 
                key={news.id || news._id}
                button
                onClick={() => handleSelect(news)}
                selected={selectedIndex === idx}
                sx={{ 
                  borderRadius: 2, 
                  mb: 0.5,
                  flexDirection: "column",
                  alignItems: "flex-start",
                  p: 2
                }}
              >
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                  <Chip label={news.category} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: "rgba(192,57,43,0.1)", color: "#c0392b" }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {news.author?.name}
                  </Typography>
                </Stack>
                <ListItemText 
                  primary={news.title}
                  primaryTypographyProps={{ fontWeight: 700, variant: "subtitle2", lineHeight: 1.4 }}
                />
              </ListItem>
            ))}
            
            {results.length > 0 && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItem 
                  button 
                  onClick={handleSeeAll}
                  selected={selectedIndex === results.length}
                  sx={{ borderRadius: 2, justifyContent: "center", color: "#c0392b" }}
                >
                  <Typography variant="button" fontWeight={700}>
                    See all results for &quot;{query}&quot;
                  </Typography>
                </ListItem>
              </>
            )}

            {query && !loading && results.length === 0 && (
              <Box sx={{ p: 6, textAlign: "center" }}>
                <SearchIcon sx={{ fontSize: 48, color: "divider", mb: 2 }} />
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  No results found for &quot;{query}&quot;
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try checking your spelling or using different keywords.
                </Typography>
              </Box>
            )}
          </List>
        )}
      </Box>
    </Dialog>
  );
}
