import { useState } from "react";
import { Box, Card, CardContent, Divider, Stack, Typography, Button, TextField } from "@mui/material";
import SafeImage from "../SafeImage/SafeImage";
import SidebarNewsCard from "./SideBarNewsCard";
import { getAllNews } from "@/utils/getAllNews";
import Link from "next/link";
import CategoryBadge from "../CategoryBadge/CategoryBadge";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SendIcon from "@mui/icons-material/Send";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { subscribeToNewsletter } from "@/lib/firestore";
import TrendingTopics from "../TrendingTopics/TrendingTopics";

const readingTime = (text = "") => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const SideBar = ({ allNews: data = [] }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", content: "" });

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

  if (data.length === 0) return null;

  const heroNews = data[0]; 
  const sideCards = data.slice(1, 6);

  return (
    <Box className="my-5" sx={{ position: { md: "sticky" }, top: { md: 80 } }}>
      {/* ── Editor's Pick Hero ── */}
      <Box sx={{ mb: 0.5 }}>
        <div className="section-header" style={{ marginBottom: 12 }}>Editor&apos;s Pick</div>
      </Box>

      <Link href={`/news/${heroNews.id || heroNews._id}`} style={{ display: "block" }}>
        <Card
          className="news-card"
          sx={{
            borderRadius: 2.5,
            overflow: "hidden",
            cursor: "pointer",
            "&:hover .sidebar-hero-img": { transform: "scale(1.04)" },
          }}
        >
          <Box sx={{ position: "relative", height: 200, overflow: "hidden" }}>
            <SafeImage
              className="sidebar-hero-img"
              src={heroNews.thumbnail_url || heroNews.image_url}
              fallback="https://picsum.photos/600/400"
              fill
              unoptimized
              alt={heroNews.title}
              sizes="35vw"
              style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
            />
            <Box className="hero-gradient-overlay" sx={{ position: "absolute", inset: 0 }} />
            <Box sx={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
              <CategoryBadge category={heroNews.category} />
              <Typography
                variant="body1"
                fontWeight={800}
                sx={{
                  color: "white",
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: 1.35,
                  mt: 0.5,
                  textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                }}
              >
                {heroNews.title.length > 70 ? heroNews.title.slice(0, 70) + "…" : heroNews.title}
              </Typography>
            </Box>
          </Box>
          <CardContent sx={{ p: 2, pb: "12px !important" }}>
            <Stack direction="row" gap={2} alignItems="center">
              <Stack direction="row" alignItems="center" gap={0.4}>
                <AccessTimeIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {readingTime(heroNews.details)} min read
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.4}>
                <VisibilityIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {(heroNews.total_view || 0).toLocaleString()} views
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.4} sx={{ ml: "auto", color: "#c0392b" }}>
                <Typography variant="caption" fontWeight={700} color="#c0392b">Read</Typography>
                <ArrowForwardIcon sx={{ fontSize: 13 }} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Link>

      <Divider sx={{ my: 2.5 }} />

      {/* ── Trending Topics ── */}
      <TrendingTopics allNews={data} />

      <Divider sx={{ my: 2.5 }} />

      {/* ── Most Read ── */}
      <div className="section-header">Most Read</div>
      <Stack rowGap={0}>
        {sideCards.map((news, i) => (
          <SidebarNewsCard key={news._id || news.id} news={news} rank={i + 1} />
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* ── Newsletter Widget ── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #c0392b 100%)",
          borderRadius: 3,
          p: 3,
          color: "white",
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={800}
          sx={{ fontFamily: "'Playfair Display', serif", mb: 0.5 }}
        >
          📬 Daily Headlines
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", display: "block", mb: 2 }}>
          Get top stories delivered every morning.
        </Typography>
        <Stack gap={1.2} component="form" onSubmit={handleSubscribe}>
          <TextField
            size="small"
            placeholder="your@email.com"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 2,
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                "&.Mui-focused fieldset": { borderColor: "white" },
                "& input": { color: "white", fontSize: "0.8rem", py: 1 },
                "& input::placeholder": { color: "rgba(255,255,255,0.4)" },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            endIcon={<SendIcon fontSize="small" />}
            sx={{
              backgroundColor: "white",
              color: "#c0392b",
              fontWeight: 700,
              borderRadius: 2,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
            }}
          >
            {loading ? "Subscribing..." : "Subscribe Free"}
          </Button>
          {msg.content && (
            <Typography
              variant="caption"
              sx={{
                color: msg.type === "error" ? "#ff8a80" : msg.type === "info" ? "#90caf9" : "#a5d6a7",
                fontWeight: 700,
                display: "block",
                textAlign: "center",
                mt: 0.5
              }}
            >
              {msg.content}
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default SideBar;
