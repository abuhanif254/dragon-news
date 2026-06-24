import { Box, Divider, Stack, Typography, Avatar, Chip } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const readingTime = (text = "") => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const SidebarNewsCard = ({ news, rank }) => {
  return (
    <>
      <Link href={`/news/${news._id || news.id}`} style={{ display: "block" }}>
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
            cursor: "pointer",
            p: 1,
            borderRadius: 1.5,
            transition: "all 0.2s",
            borderLeft: "3px solid transparent",
            "&:hover": {
              borderLeftColor: "#c0392b",
              backgroundColor: "rgba(192,57,43,0.04)",
              "& .rank-num": { backgroundColor: "#c0392b", color: "white" },
            },
          }}
        >
          {/* Rank badge */}
          {rank && (
            <Box
              className="rank-num"
              sx={{
                minWidth: 26,
                height: 26,
                borderRadius: 1,
                backgroundColor: "rgba(192,57,43,0.1)",
                color: "#c0392b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.75rem",
                flexShrink: 0,
                transition: "all 0.2s",
                mt: 0.3,
              }}
            >
              {rank}
            </Box>
          )}

          {/* Thumbnail */}
          <Box sx={{ flexShrink: 0, borderRadius: 1.5, overflow: "hidden", width: 90, height: 72, position: 'relative' }}>
            <Image
              src={news.thumbnail_url}
              fill
              alt={news.title}
              sizes="90px"
              style={{ objectFit: "cover", transition: "transform 0.3s" }}
            />
          </Box>

          {/* Text */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{
                lineHeight: 1.4,
                fontFamily: "'Playfair Display', serif",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                mb: 0.5,
              }}
            >
              {news.title}
            </Typography>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Chip
                label={news.category}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  backgroundColor: "rgba(192,57,43,0.1)",
                  color: "#c0392b",
                  borderRadius: 0.8,
                }}
              />
              <Stack direction="row" alignItems="center" gap={0.3}>
                <AccessTimeIcon sx={{ fontSize: 11, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
                  {readingTime(news.details)} min
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Link>
      <Divider sx={{ my: 1, borderColor: "divider" }} />
    </>
  );
};

export default SidebarNewsCard;
