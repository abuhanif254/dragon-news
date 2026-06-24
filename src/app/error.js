"use client";
import { Box, Button, Typography, Stack, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";
import Link from "next/link";

const ErrorPage = ({ error, reset }) => {
  return (
    <Box
      sx={{
        minHeight: "72vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: 8,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          width: "100%",
          p: { xs: 4, md: 6 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "rgba(192,57,43,0.2)",
          textAlign: "center",
          background: "linear-gradient(135deg, #fff8f8 0%, #ffffff 100%)",
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(192,57,43,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <ErrorOutlineIcon sx={{ color: "#c0392b", fontSize: 36 }} />
        </Box>

        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ fontFamily: "'Playfair Display', serif", mb: 1.5, color: "#c0392b" }}
        >
          Something Went Wrong
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 4 }}>
          We encountered an unexpected error while loading this page.
          This has been logged and our team will look into it.
          {error?.message && (
            <Box
              component="code"
              sx={{ display: "block", mt: 1.5, p: 1.5, borderRadius: 1.5, backgroundColor: "rgba(0,0,0,0.04)", fontSize: "0.75rem", color: "text.secondary", textAlign: "left", wordBreak: "break-all" }}
            >
              {error.message}
            </Box>
          )}
        </Typography>

        <Stack direction="row" spacing={1.5} justifyContent="center">
          <Button
            onClick={() => reset?.()}
            variant="contained"
            startIcon={<RefreshIcon />}
            sx={{
              background: "linear-gradient(135deg, #c0392b, #e74c3c)",
              fontWeight: 700,
              borderRadius: 2.5,
              textTransform: "none",
              px: 3,
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 4px 12px rgba(192,57,43,0.25)",
              "&:hover": { background: "linear-gradient(135deg, #96281b, #c0392b)" },
            }}
          >
            Try Again
          </Button>
          <Link href="/">
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              sx={{
                borderColor: "divider",
                color: "text.primary",
                fontWeight: 700,
                borderRadius: 2.5,
                textTransform: "none",
                px: 3,
                fontFamily: "'Inter', sans-serif",
                "&:hover": { borderColor: "#c0392b", color: "#c0392b", backgroundColor: "rgba(192,57,43,0.04)" },
              }}
            >
              Go Home
            </Button>
          </Link>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ErrorPage;
