"use client";
import React from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Avatar,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GetAppIcon from "@mui/icons-material/GetApp";
import IosShareIcon from "@mui/icons-material/IosShare";
import AddBoxIcon from "@mui/icons-material/AddBox";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { usePwa } from "@/context/PwaContext";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function PwaInstallPrompt({ bottomOffset = 0 }) {
  const {
    isInstallable,
    isInstalled,
    isIos,
    showBanner,
    installApp,
    dismissBanner,
    showIosGuide,
    setShowIosGuide,
  } = usePwa();

  if (isInstalled) return null;

  return (
    <>
      {/* ── Floating Smart Install Banner ── */}
      {showBanner && isInstallable && (
        <Box
          sx={{
            position: "fixed",
            bottom: { xs: bottomOffset + 12, sm: 24 },
            left: { xs: 12, sm: "auto" },
            right: { xs: 12, sm: 24 },
            zIndex: 1250,
            maxWidth: { xs: "calc(100% - 24px)", sm: 420 },
            animation: "fadeInUp 0.35s ease-out",
            "@keyframes fadeInUp": {
              from: { opacity: 0, transform: "translateY(20px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 2,
              borderRadius: 3.5,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
              backdropFilter: "blur(10px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Crimson accent bar */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                bgcolor: "#c0392b",
              }}
            />

            <Stack direction="row" spacing={1.5} alignItems="center">
              {/* App Icon */}
              <Avatar
                src="/icon-192.png"
                alt="The Brain App"
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2.5,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  bgcolor: "#0a0d14",
                }}
              />

              {/* Title & Tagline */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    color="text.primary"
                    noWrap
                  >
                    The Brain App
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      px: 0.8,
                      py: 0.15,
                      borderRadius: 1,
                      bgcolor: "rgba(192, 57, 43, 0.1)",
                      color: "#c0392b",
                    }}
                  >
                    FREE
                  </Box>
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.3,
                  }}
                >
                  Offline reading, fast load & breaking alerts
                </Typography>
              </Box>

              {/* Close Button */}
              <IconButton
                size="small"
                onClick={dismissBanner}
                aria-label="Dismiss app install banner"
                sx={{
                  color: "text.secondary",
                  p: 0.5,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>

            {/* Install Action CTA */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.5, pt: 1, borderTop: "1px solid", borderColor: "divider" }}
              alignItems="center"
              justifyContent="flex-end"
            >
              <Button
                size="small"
                variant="text"
                color="inherit"
                onClick={dismissBanner}
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 1.5,
                }}
              >
                Maybe Later
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={installApp}
                startIcon={<GetAppIcon sx={{ fontSize: 16 }} />}
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  py: 0.6,
                  bgcolor: "#c0392b",
                  "&:hover": { bgcolor: "#962d22" },
                  boxShadow: "0 4px 14px rgba(192, 57, 43, 0.35)",
                }}
              >
                {isIos ? "Add to Home Screen" : "Install App"}
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}

      {/* ── iOS Safari Add to Home Screen Guided Dialog ── */}
      <Dialog
        open={showIosGuide}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setShowIosGuide(false)}
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            p: 1,
            maxWidth: 380,
            mx: 2,
            boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2, px: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              src="/icon-192.png"
              alt="The Brain App"
              sx={{ width: 40, height: 40, borderRadius: 2 }}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                Install on iPhone / iPad
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Install The Brain directly from Safari
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 1.5 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "rgba(192, 57, 43, 0.1)",
                  color: "#c0392b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  flexShrink: 0,
                }}
              >
                1
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  Tap the Share Button
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tap the{" "}
                  <IosShareIcon
                    sx={{ fontSize: 16, verticalAlign: "middle", color: "#3b82f6" }}
                  />{" "}
                  Share icon in Safari&apos;s bottom navigation bar.
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "rgba(192, 57, 43, 0.1)",
                  color: "#c0392b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  flexShrink: 0,
                }}
              >
                2
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  Select &quot;Add to Home Screen&quot;
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Scroll down the share sheet and tap{" "}
                  <AddBoxIcon
                    sx={{ fontSize: 16, verticalAlign: "middle", color: "text.primary" }}
                  />{" "}
                  <strong>Add to Home Screen</strong>.
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "rgba(192, 57, 43, 0.1)",
                  color: "#c0392b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  flexShrink: 0,
                }}
              >
                3
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  Tap &quot;Add&quot;
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tap <strong>Add</strong> in the top right corner to enjoy full offline access and fast launch!
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowIosGuide(false)}
            startIcon={<CheckCircleOutlineIcon />}
            sx={{
              bgcolor: "#c0392b",
              "&:hover": { bgcolor: "#962d22" },
              borderRadius: 2.5,
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            Got it, thanks!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Reusable Button to mount anywhere (Navbar, Footer, Menu)
export function InstallAppButton({ variant = "outlined", size = "small", color = "inherit", sx = {} }) {
  const { isInstallable, isInstalled, installApp } = usePwa();

  if (isInstalled || !isInstallable) return null;

  return (
    <Button
      variant={variant}
      size={size}
      color={color}
      onClick={installApp}
      startIcon={<GetAppIcon />}
      sx={{
        fontWeight: 700,
        borderRadius: 2,
        textTransform: "none",
        ...sx,
      }}
    >
      Install App
    </Button>
  );
}
