"use client";
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  IconButton,
  Divider,
  TextField,
  Button,
  Tooltip,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import SendIcon from "@mui/icons-material/Send";
import Link from "next/link";
import { useState, useEffect } from "react";
import { NAV_ITEMS } from "@/utils/navItems";
import { subscribeToNewsletter } from "@/lib/firestore";
import { useSiteSettings } from "./SiteSettingsProvider";

const CATEGORIES = ["Technology", "Sports", "Culture", "Entertainment", "Business", "Science"];

const Footer = () => {
  const [year, setYear] = useState("");
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", content: "" });
  const { siteName, siteDescription, socialLinks } = useSiteSettings();

  useEffect(() => {
    // Only run on client to avoid hydration mismatch
    setYear(new Date().getFullYear().toString());
    setMounted(true);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setMsg({ type: "error", content: "Please enter a valid email." });
      return;
    }

    setLoading(true);
    setMsg({ type: "", content: "" });

    try {
      const res = await subscribeToNewsletter(email);
      if (res.status === "exists") {
        setMsg({ type: "info", content: res.message });
      } else {
        setMsg({ type: "success", content: res.message });
        setEmail("");
      }
    } catch (err) {
      setMsg({ type: "error", content: "Something went wrong. Try again!" });
    } finally {
      setLoading(false);
    }
  };

  const socialIcons = [
    { Icon: FacebookIcon, color: "#1877F2", label: "Facebook", key: "facebook" },
    { Icon: TwitterIcon, color: "#1DA1F2", label: "Twitter", key: "twitter" },
    { Icon: YouTubeIcon, color: "#FF0000", label: "YouTube", key: "youtube" },
    { Icon: InstagramIcon, color: "#E4405F", label: "Instagram", key: "instagram" },
    { Icon: LinkedInIcon, color: "#0A66C2", label: "LinkedIn", key: "linkedin" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)",
        color: "rgba(255,255,255,0.85)",
        pt: 7,
        pb: 3,
        mt: 6,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={5} sx={{ mb: 5 }}>
          {/* Brand column */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                fontFamily: "'Playfair Display', serif",
                color: "white",
                mb: 1.5,
                background: "linear-gradient(90deg, #f39c12, #e74c3c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {siteName}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.8, mb: 3, maxWidth: 300 }}
            >
              {siteDescription}
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialIcons
                .filter((social) => socialLinks && socialLinks[social.key])
                .map(({ Icon, color, label, key }) => (
                <Tooltip key={label} title={label} arrow>
                  <IconButton
                    component="a"
                    href={socialLinks[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      transition: "all 0.2s",
                      "&:hover": {
                        color: color,
                        borderColor: color,
                        backgroundColor: `${color}20`,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ))}
              
              {/* RSS Feed Icon */}
              <Tooltip title="RSS Feed" arrow>
                <IconButton
                  component="a"
                  href="/rss.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: "rgba(255,255,255,0.6)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    transition: "all 0.2s",
                    "&:hover": {
                      color: "#f39c12",
                      borderColor: "#f39c12",
                      backgroundColor: "#f39c1220",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <RssFeedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>

          {/* Navigation column */}
          <Grid item xs={6} md={2}>
            <Typography
              variant="overline"
              sx={{
                color: "#f39c12",
                fontWeight: 700,
                letterSpacing: "0.1em",
                display: "block",
                mb: 2,
              }}
            >
              Navigation
            </Typography>
            <Stack spacing={1.2}>
              {NAV_ITEMS.map((item) => (
                <Link key={item.route} href={item.pathname}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255,255,255,0.55)",
                      transition: "all 0.2s",
                      "&:hover": { color: "white", paddingLeft: "4px" },
                    }}
                  >
                    {item.route}
                  </Typography>
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Categories column */}
          <Grid item xs={6} md={2}>
            <Typography
              variant="overline"
              sx={{
                color: "#f39c12",
                fontWeight: 700,
                letterSpacing: "0.1em",
                display: "block",
                mb: 2,
              }}
            >
              Topics
            </Typography>
            <Stack spacing={1.2}>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/categories/news?category=${cat.toLowerCase()}`}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255,255,255,0.55)",
                      transition: "all 0.2s",
                      "&:hover": { color: "white", paddingLeft: "4px" },
                    }}
                  >
                    {cat}
                  </Typography>
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Newsletter column */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="overline"
              sx={{
                color: "#f39c12",
                fontWeight: 700,
                letterSpacing: "0.1em",
                display: "block",
                mb: 2,
              }}
            >
              Stay Informed
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", mb: 2, lineHeight: 1.7 }}>
              Get the top headlines delivered to your inbox every morning. No spam, ever.
            </Typography>
            {mounted ? (
              <Stack spacing={1}>
                <Stack direction="row" gap={1} component="form" onSubmit={handleSubscribe}>
                  <TextField
                    size="small"
                    placeholder="your@email.com"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255,255,255,0.06)",
                        borderRadius: 2,
                        "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                        "&:hover fieldset": { borderColor: "rgba(255,255,255,0.35)" },
                        "&.Mui-focused fieldset": { borderColor: "#f39c12" },
                        "& input": { color: "white", fontSize: "0.875rem" },
                        "& input::placeholder": { color: "rgba(255,255,255,0.35)" },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    endIcon={<SendIcon fontSize="small" />}
                    sx={{
                      background: "linear-gradient(135deg, #c0392b, #e74c3c)",
                      whiteSpace: "nowrap",
                      boxShadow: "none",
                      textTransform: "none",
                      fontWeight: 600,
                      px: 2,
                      borderRadius: 2,
                      "&:hover": {
                        background: "linear-gradient(135deg, #96281b, #c0392b)",
                      },
                    }}
                  >
                    {loading ? "..." : "Subscribe"}
                  </Button>
                </Stack>
                {msg.content && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: msg.type === "error" ? "#e74c3c" : msg.type === "info" ? "#3498db" : "#2ecc71",
                      fontWeight: 600,
                      display: "block"
                    }}
                  >
                    {msg.content}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Box sx={{ height: 40 }} />
            )}
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", mt: 1, display: "block" }}>
              🔒 Your privacy is protected. Unsubscribe anytime.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 3 }} />

        {/* Legal row */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)" }}>
            © {year || "2026"} The Brain. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2.5}>
            {[
              { name: "Privacy Policy", href: "/privacy-policy" },
              { name: "Terms of Service", href: "/terms" },
              { name: "Cookie Policy", href: "/cookies" }
            ].map((item) => (
              <Link key={item.name} href={item.href}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.35)",
                    transition: "color 0.2s",
                    "&:hover": { color: "rgba(255,255,255,0.7)" },
                  }}
                >
                  {item.name}
                </Typography>
              </Link>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
