"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Paper,
  Stack,
  IconButton,
  Typography,
  Select,
  MenuItem,
  Tooltip,
  Box,
  Grid,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import SpeedIcon from "@mui/icons-material/Speed";
import SettingsIcon from "@mui/icons-material/Settings";

export default function AudioNarrator({ text }) {
  const [supported, setSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSupported(true);
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const list = window.speechSynthesis.getVoices();
        const englishVoices = list.filter(v => v.lang.startsWith("en-") || v.lang.startsWith("en_") || v.lang === "en");
        setVoices(englishVoices);
        if (englishVoices.length > 0) {
          setSelectedVoiceName(englishVoices[0].name);
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const decodeHtmlEntities = (str) => {
    if (!str) return "";
    return str
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&ldquo;/gi, '"')
      .replace(/&rdquo;/gi, '"')
      .replace(/&lsquo;/gi, "'")
      .replace(/&rsquo;/gi, "'")
      .replace(/&#39;/gi, "'")
      .replace(/&#34;/gi, '"');
  };

  const stripHtml = (htmlString) => {
    if (!htmlString) return "";
    let clean = htmlString;
    // Remove style tags and content
    clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    // Remove script tags and content
    clean = clean.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    // Remove other html tags
    clean = clean.replace(/<[^>]*>/g, " ");
    // Decode html entities
    clean = decodeHtmlEntities(clean);
    // Clean spaces
    return clean.replace(/\s+/g, " ").trim();
  };

  const speak = (speakRate, speakVoiceName, speakPitch) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();

    const plainText = stripHtml(text);
    if (!plainText) return;

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = "en-US";
      
      const activeRate = speakRate !== undefined ? speakRate : rate;
      const activePitch = speakPitch !== undefined ? speakPitch : pitch;
      const activeVoiceName = speakVoiceName !== undefined ? speakVoiceName : selectedVoiceName;

      utterance.rate = activeRate;
      utterance.pitch = activePitch;
      
      const voicesList = synthRef.current.getVoices();
      const chosenVoice = voicesList.find((v) => v.name === activeVoiceName);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      } else {
        const fallback = voicesList.find((v) => v.lang.startsWith("en-") || v.lang.startsWith("en_") || v.lang === "en");
        if (fallback) utterance.voice = fallback;
      }
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.error("SpeechSynthesis error:", e);
        }
        setIsPlaying(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }, 100);
  };

  const handlePlayPause = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      if (isPaused) {
        synthRef.current.resume();
        setIsPaused(false);
      } else {
        synthRef.current.pause();
        setIsPaused(true);
      }
    } else {
      speak();
    }
  };

  const handleStop = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleRateChange = (event) => {
    const newRate = parseFloat(event.target.value);
    setRate(newRate);
    if (isPlaying && !isPaused) {
      speak(newRate, selectedVoiceName, pitch);
    }
  };

  const handleVoiceChange = (event) => {
    const newVoice = event.target.value;
    setSelectedVoiceName(newVoice);
    if (isPlaying && !isPaused) {
      speak(rate, newVoice, pitch);
    }
  };

  const handlePitchChange = (event) => {
    const newPitch = parseFloat(event.target.value);
    setPitch(newPitch);
    if (isPlaying && !isPaused) {
      speak(rate, selectedVoiceName, newPitch);
    }
  };

  if (!supported || !text) return null;

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "rgba(192, 57, 43, 0.02)",
        boxShadow: "none",
        mb: 4,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <VolumeUpIcon sx={{ color: "var(--brand-red)", fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="text.primary">
              Listen to Article
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Let our AI voice read this story aloud for you.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: { xs: "100%", sm: "auto" }, justifyContent: { xs: "space-between", sm: "flex-end" } }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title={isPlaying && !isPaused ? "Pause" : "Play"}>
              <IconButton
                color="error"
                onClick={handlePlayPause}
                sx={{
                  bgcolor: "rgba(192, 57, 43, 0.08)",
                  "&:hover": { bgcolor: "rgba(192, 57, 43, 0.15)" },
                }}
              >
                {isPlaying && !isPaused ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </Tooltip>

            {(isPlaying || isPaused) && (
              <Tooltip title="Stop">
                <IconButton
                  color="default"
                  onClick={handleStop}
                  sx={{
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.08)" },
                  }}
                >
                  <StopIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SpeedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              <Select
                size="small"
                value={rate}
                onChange={handleRateChange}
                sx={{
                  borderRadius: 2,
                  fontSize: "0.85rem",
                  "& .MuiSelect-select": { py: 0.6, px: 1.5 },
                }}
              >
                <MenuItem value={0.75}>0.75x</MenuItem>
                <MenuItem value={1.0}>1.0x (Normal)</MenuItem>
                <MenuItem value={1.25}>1.25x</MenuItem>
                <MenuItem value={1.5}>1.5x</MenuItem>
                <MenuItem value={2.0}>2.0x</MenuItem>
              </Select>
            </Stack>

            <Tooltip title="Voice Settings">
              <IconButton 
                onClick={() => setShowSettings(!showSettings)} 
                color={showSettings ? "error" : "default"}
                sx={{ 
                  bgcolor: showSettings ? "rgba(192, 57, 43, 0.08)" : "transparent",
                  "&:hover": { bgcolor: "rgba(192, 57, 43, 0.15)" }
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>

      {showSettings && (
        <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: "block", mb: 1, letterSpacing: "0.08em" }}>
                SPEECH VOICE
              </Typography>
              <Select
                fullWidth
                size="small"
                value={selectedVoiceName}
                onChange={handleVoiceChange}
                sx={{ borderRadius: 2, fontSize: "0.85rem" }}
              >
                {voices.length === 0 ? (
                  <MenuItem value="">System Default English</MenuItem>
                ) : (
                  voices.map((v) => (
                    <MenuItem key={v.name} value={v.name}>
                      {v.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: "block", mb: 1, letterSpacing: "0.08em" }}>
                SPEECH PITCH
              </Typography>
              <Select
                fullWidth
                size="small"
                value={pitch}
                onChange={handlePitchChange}
                sx={{ borderRadius: 2, fontSize: "0.85rem" }}
              >
                <MenuItem value={0.6}>0.6 (Deep)</MenuItem>
                <MenuItem value={0.8}>0.8 (Baritone)</MenuItem>
                <MenuItem value={1.0}>1.0 (Normal)</MenuItem>
                <MenuItem value={1.2}>1.2 (Bright)</MenuItem>
                <MenuItem value={1.5}>1.5 (High)</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
}
