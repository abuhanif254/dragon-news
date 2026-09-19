"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button, Paper, Stack, CircularProgress } from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { subscribeToAuth } from "@/lib/auth-service";
import { isAdminEmail } from "@/lib/site";

export default function AdminRouteGuard({ children, fallbackTitle = "Administrative Resource" }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 2 }}>
        <CircularProgress color="error" size={36} />
        <Typography variant="body2" color="text.secondary">
          Verifying security clearance...
        </Typography>
      </Box>
    );
  }

  const isAuthorized = user && (user.role === "admin" || isAdminEmail(user.email));

  if (!isAuthorized) {
    return (
      <Box sx={{ py: 6, px: 2, display: "flex", justifyContent: "center" }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: 580,
            width: "100%",
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            border: "1px solid #fee2e2",
            bgcolor: "#fff5f5",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2.5,
            }}
          >
            <ShieldIcon sx={{ fontSize: 36, color: "#dc2626" }} />
          </Box>

          <Typography
            variant="overline"
            sx={{ color: "#dc2626", fontWeight: 800, letterSpacing: "0.1em", display: "block" }}
          >
            SECURITY NOTICE • 403 FORBIDDEN
          </Typography>

          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ color: "#1e293b", fontFamily: "'Playfair Display', serif", mt: 0.5, mb: 1.5 }}
          >
            Administrator Clearance Required
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, maxWidth: 460, mx: "auto" }}>
            Access to <strong>{fallbackTitle}</strong> is strictly restricted to the authorized publication administrator. Your current account ({user?.email || "anonymous"}) does not possess the requisite administrative privileges.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center">
            <Button
              variant="contained"
              color="error"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/dashboard")}
              sx={{ fontWeight: 700, textTransform: "none", borderRadius: 2, px: 3 }}
            >
              Dashboard Overview
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<OpenInNewIcon />}
              component={Link}
              href="/"
              sx={{ fontWeight: 600, textTransform: "none", borderRadius: 2, borderColor: "#cbd5e1", color: "#475569" }}
            >
              Public Site
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return children;
}
