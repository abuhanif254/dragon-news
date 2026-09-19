"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  CircularProgress,
  TextField,
  Alert,
  Chip,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SendIcon from "@mui/icons-material/Send";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { subscribeToAuth, requestWriterAccess } from "@/lib/auth-service";
import { isAdminEmail } from "@/lib/site";

export default function RoleGuard({
  children,
  allowedRoles = ["admin", "writer"],
  fallbackTitle = "Authoring Resource",
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState({ type: "", message: "" });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApply = async () => {
    setApplying(true);
    setApplyResult({ type: "", message: "" });

    try {
      await requestWriterAccess(applicationMessage.trim());
      setUser((prev) => ({ ...prev, writerApplicationStatus: "pending" }));
      setApplicationMessage("");
      setApplyResult({
        type: "success",
        message: "Your application has been submitted to the editorial desk for review.",
      });
    } catch (err) {
      setApplyResult({
        type: "error",
        message: err.message || "Failed to submit writer application. Please try again.",
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress color="error" size={36} />
        <Typography variant="body2" color="text.secondary">
          Verifying editorial credentials...
        </Typography>
      </Box>
    );
  }

  // Not logged in -> prompt login
  if (!user) {
    return (
      <Box sx={{ py: 6, px: 2, display: "flex", justifyContent: "center" }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: 520,
            width: "100%",
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            border: "1px solid #fed7aa",
            bgcolor: "#fffaf5",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              bgcolor: "#ffedd5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <EditNoteIcon sx={{ fontSize: 32, color: "#ea580c" }} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: "#1e293b", mb: 1 }}>
            Sign In Required
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You need to be logged in with an authorized contributor account to access {fallbackTitle}.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="error"
              component={Link}
              href="/login"
              sx={{ fontWeight: 700, textTransform: "none", borderRadius: 2, px: 3 }}
            >
              Sign In to Continue
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              component={Link}
              href="/"
              sx={{ fontWeight: 600, textTransform: "none", borderRadius: 2 }}
            >
              Return Home
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Check authorization
  const isAdmin = isAdminEmail(user.email) || user.role === "admin";
  const hasRole = allowedRoles.includes(user.role);
  const isAuthorized = isAdmin || hasRole;

  if (isAuthorized) {
    return children;
  }

  // User is logged in as a reader (or lacking writer permissions)
  const isPending = user.writerApplicationStatus === "pending";
  const isRejected = user.writerApplicationStatus === "rejected";

  return (
    <Box sx={{ py: 6, px: 2, display: "flex", justifyContent: "center" }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 620,
          width: "100%",
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <EditNoteIcon sx={{ fontSize: 36, color: "#d97706" }} />
        </Box>

        <Chip
          label="WRITER CLEARANCE REQUIRED"
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: "0.68rem",
            letterSpacing: "0.08em",
            bgcolor: "#fef3c7",
            color: "#92400e",
            mb: 1.5,
          }}
        />

        <Typography
          variant="h5"
          fontWeight={900}
          sx={{ color: "#0f172a", fontFamily: "'Playfair Display', serif", mb: 1 }}
        >
          Contributing Author Privileges Required
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, maxWidth: 500, mx: "auto" }}>
          The section <strong>{fallbackTitle}</strong> is exclusively available to verified reporters, contributing journalists, and editorial staff. Your current account (<strong>{user.email}</strong>) has <em>Reader</em> privileges.
        </Typography>

        {applyResult.message && (
          <Alert severity={applyResult.type} sx={{ mb: 3, textAlign: "left" }}>
            {applyResult.message}
          </Alert>
        )}

        {isPending ? (
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#fefce8",
              border: "1px solid #fef08a",
              mb: 3,
              textAlign: "left",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <HourglassEmptyIcon sx={{ color: "#ca8a04", fontSize: 22 }} />
              <Typography variant="subtitle2" fontWeight={800} color="#854d0e">
                Writer Application Under Review
              </Typography>
            </Stack>
            <Typography variant="body2" color="#713f12" sx={{ lineHeight: 1.5 }}>
              Your application for contributor access is pending review by the Chief Editor. Once approved, authoring, editing, and analytics features will unlock immediately.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
              mb: 3,
              textAlign: "left",
            }}
          >
            <Typography variant="subtitle2" fontWeight={800} color="#1e293b" sx={{ mb: 0.5 }}>
              {isRejected ? "Submit an Updated Application" : "Apply for Contributor Access"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isRejected
                ? "Your previous application was not approved. Provide extra details or portfolio links below to be reconsidered."
                : "Tell the editorial desk about your topics of interest, writing background, or portfolio links."}
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="e.g., Tech and finance reporter with 3 years experience. Portfolio: https://..."
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              disabled={applying}
              size="small"
              sx={{ bgcolor: "#ffffff", mb: 2 }}
            />

            <Button
              variant="contained"
              color="error"
              endIcon={<SendIcon />}
              onClick={handleApply}
              disabled={applying}
              sx={{ fontWeight: 700, textTransform: "none", borderRadius: 2, px: 3 }}
            >
              {applying ? "Submitting Application..." : "Submit Writer Application"}
            </Button>
          </Box>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center">
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/dashboard")}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
              borderColor: "#cbd5e1",
              color: "#334155",
            }}
          >
            Dashboard Overview
          </Button>
          <Button
            variant="text"
            color="inherit"
            component={Link}
            href="/"
            sx={{ fontWeight: 600, textTransform: "none", color: "#64748b" }}
          >
            Return to Public Site
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
