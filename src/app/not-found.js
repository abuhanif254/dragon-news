import { Box, Button, Typography, Stack } from "@mui/material";
import Link from "next/link";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "72vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 10,
        px: 3,
      }}
    >
      {/* 404 number */}
      <Box sx={{ position: "relative", mb: 3 }}>
        <Typography
          variant="h1"
          fontWeight={900}
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontSize: { xs: "7rem", md: "10rem" },
            lineHeight: 1,
            background: "linear-gradient(135deg, #c0392b 0%, #1a1a2e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            userSelect: "none",
          }}
        >
          404
        </Typography>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 160, md: 200 },
            height: { xs: 160, md: 200 },
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(192,57,43,0.08), transparent)",
            zIndex: -1,
          }}
        />
      </Box>

      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ fontFamily: "'Playfair Display', serif", mb: 1.5, fontSize: { xs: "1.5rem", md: "2rem" } }}
      >
        Page Not Found
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 420, lineHeight: 1.8, mb: 4, fontFamily: "'Inter', sans-serif" }}
      >
        The article or page you&apos;re looking for may have been moved, removed, or never existed.
        Let&apos;s get you back on track.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Link href="/">
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            sx={{
              background: "linear-gradient(135deg, #c0392b, #e74c3c)",
              fontWeight: 700,
              borderRadius: 2.5,
              textTransform: "none",
              px: 3.5,
              py: 1.3,
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 4px 16px rgba(192,57,43,0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #96281b, #c0392b)",
                boxShadow: "0 6px 20px rgba(192,57,43,0.4)",
              },
            }}
          >
            Back to Home
          </Button>
        </Link>
        <Link href="/categories/news?category=all-news">
          <Button
            variant="outlined"
            size="large"
            startIcon={<SearchIcon />}
            sx={{
              borderColor: "divider",
              color: "text.primary",
              fontWeight: 700,
              borderRadius: 2.5,
              textTransform: "none",
              px: 3.5,
              py: 1.3,
              fontFamily: "'Inter', sans-serif",
              "&:hover": {
                borderColor: "#c0392b",
                color: "#c0392b",
                backgroundColor: "rgba(192,57,43,0.04)",
              },
            }}
          >
            Browse All News
          </Button>
        </Link>
      </Stack>
    </Box>
  );
}
