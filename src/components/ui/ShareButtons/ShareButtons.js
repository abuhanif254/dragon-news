"use client";
import { useState, useEffect } from "react";
import { Stack, IconButton, Tooltip, Snackbar, Alert } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import EmailIcon from "@mui/icons-material/Email";
import ShareIcon from "@mui/icons-material/Share";
import RedditIcon from "@mui/icons-material/Reddit";
import { Typography } from "@mui/material";

const ShareButtons = ({ title, url, direction = "row" }) => {
  const [snackOpen, setSnackOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pageUrl, setPageUrl] = useState(url || "");

  useEffect(() => {
    setMounted(true);
    if (!url && typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, [url]);

  const handleCopy = async () => {
    try {
      const shareUrl = url || window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      setSnackOpen(true);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  if (!mounted) return null;

  const currentUrl = url || pageUrl;
  const encoded = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title || "Check this out on The Brain");

  const BUTTONS = [
    {
      icon: <TwitterIcon fontSize="small" />,
      label: "Share on X",
      href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
      color: "#000000",
    },
    {
      icon: <FacebookIcon fontSize="small" />,
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      color: "#1877F2",
    },
    {
      icon: <LinkedInIcon fontSize="small" />,
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      color: "#0A66C2",
    },
    {
      icon: <RedditIcon fontSize="small" />,
      label: "Share on Reddit",
      href: `https://www.reddit.com/submit?url=${encoded}&title=${encodedTitle}`,
      color: "#FF4500",
    },
    {
      icon: <WhatsAppIcon fontSize="small" />,
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      color: "#25D366",
    },
    {
      icon: <TelegramIcon fontSize="small" />,
      label: "Share on Telegram",
      href: `https://t.me/share/url?url=${encoded}&text=${encodedTitle}`,
      color: "#0088cc",
    },
    {
      icon: <EmailIcon fontSize="small" />,
      label: "Share via Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encoded}`,
      color: "#6c757d",
    },
  ];

  return (
    <>
      <Stack direction={direction} alignItems={direction === "row" ? "center" : "flex-start"} gap={1} flexWrap="wrap">
        {direction === "row" && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <ShareIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Share
            </Typography>
          </Stack>
        )}
        {BUTTONS.map(({ icon, label, href, color }) => (
          <Tooltip key={label} title={label} arrow>
            <IconButton
              component="a"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{
                color: "white",
                backgroundColor: color,
                width: 34,
                height: 34,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: color,
                  opacity: 0.9,
                  transform: "translateY(-2px) scale(1.1)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
            >
              {icon}
            </IconButton>
          </Tooltip>
        ))}
        <Tooltip title="Copy link" arrow>
          <IconButton
            onClick={handleCopy}
            size="small"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              width: 34,
              height: 34,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                borderColor: "#c0392b",
                color: "#c0392b",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              },
            }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ fontFamily: "'Inter', sans-serif" }}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareButtons;
