"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import HomeIcon from "@mui/icons-material/Home";
import Link from "next/link";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : false);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setChecking(true);
    if (typeof navigator !== "undefined" && navigator.onLine) {
      window.location.reload();
    } else {
      setTimeout(() => {
        setChecking(false);
      }, 1000);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
          p: { xs: 3, sm: 6 },
          bgcolor: "background.paper",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              borderRadius: "50%",
              bgcolor: "rgba(192, 57, 43, 0.08)",
              color: "#c0392b",
              mb: 3,
            }}
          >
            <WifiOffIcon sx={{ fontSize: 42 }} />
          </Box>

          <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
            <Chip
              label={isOnline ? "CONNECTION RESTORED" : "NO INTERNET CONNECTION"}
              color={isOnline ? "success" : "error"}
              size="small"
              sx={{ fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.08em" }}
            />
          </Stack>

          <Typography
            variant="h4"
            fontWeight={900}
            gutterBottom
            sx={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: "text.primary",
              fontSize: { xs: "1.75rem", sm: "2.25rem" },
            }}
          >
            You&apos;re Currently Offline
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 520,
              mx: "auto",
              lineHeight: 1.7,
              mb: 4,
            }}
          >
            Don&apos;t worry — any stories or reports you previously opened while browsing{" "}
            <strong>The Brain</strong> remain cached on your device. When your connection returns,
            new stories will automatically load.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={handleRetry}
              disabled={checking}
              startIcon={<RefreshIcon />}
              sx={{
                fontWeight: 700,
                borderRadius: 2.5,
                px: 3.5,
                py: 1.2,
                textTransform: "none",
                bgcolor: "#c0392b",
                "&:hover": { bgcolor: "#962d22" },
              }}
            >
              {checking ? "Checking Network..." : "Check Connection & Reload"}
            </Button>

            <Link href="/dashboard/bookmarks" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                startIcon={<BookmarkBorderIcon />}
                sx={{
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 3,
                  py: 1.2,
                  textTransform: "none",
                  borderColor: "divider",
                }}
              >
                Saved Bookmarks
              </Button>
            </Link>

            <Link href="/" style={{ textDecoration: "none" }}>
              <Button
                variant="text"
                color="inherit"
                size="large"
                startIcon={<HomeIcon />}
                sx={{
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 2.5,
                  py: 1.2,
                  textTransform: "none",
                }}
              >
                Home
              </Button>
            </Link>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
