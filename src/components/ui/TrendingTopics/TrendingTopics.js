import { getAllNews } from "@/utils/getAllNews";
import { Box, Chip, Stack, Typography } from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import Link from "next/link";

const TrendingTopics = ({ allNews: data = [] }) => {
  if (data.length === 0) return null;

  // collect unique categories
  const categories = [...new Set(data.map((n) => n.category))];

  // top trending titles (first 6 for the tag cloud)
  const trending = data.slice(0, 6);

  return (
    <Box
      sx={{
        my: 2,
        p: 2,
        background: "linear-gradient(135deg, #fff8f8 0%, #fff 100%)",
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "rgba(192,57,43,0.12)",
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <LocalFireDepartmentIcon sx={{ color: "#c0392b", fontSize: 18 }} />
        <Typography
          variant="caption"
          fontWeight={800}
          sx={{ color: "#c0392b", letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          Trending Topics
        </Typography>
      </Stack>

      {/* Category chips */}
      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
        {categories.map((cat) => (
          <Link key={cat} href={`/categories/news?category=${cat.toLowerCase()}`}>
            <Chip
              label={cat}
              size="small"
              clickable
              sx={{
                backgroundColor: "rgba(192,57,43,0.08)",
                color: "#c0392b",
                fontWeight: 700,
                fontSize: "0.7rem",
                borderRadius: 1.5,
                border: "1px solid rgba(192,57,43,0.15)",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: "#c0392b",
                  color: "white",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(192,57,43,0.3)",
                },
              }}
            />
          </Link>
        ))}
      </Stack>

      {/* Trending headlines */}
      <Stack spacing={0.6}>
        {trending.map((news, i) => (
          <Link key={news._id || news.id} href={`/news/${news._id || news.id}`}>
            <Stack direction="row" alignItems="flex-start" gap={1.2} sx={{ transition: "opacity 0.2s", "&:hover": { opacity: 0.75 } }}>
              <Typography
                variant="caption"
                sx={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: 0.8,
                  background: i < 3 ? "#c0392b" : "rgba(0,0,0,0.08)",
                  color: i < 3 ? "white" : "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  flexShrink: 0,
                  mt: 0.1,
                }}
              >
                {i + 1}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  lineHeight: 1.4,
                  fontWeight: 500,
                  color: "text.primary",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {news.title}
              </Typography>
            </Stack>
          </Link>
        ))}
      </Stack>
    </Box>
  );
};

export default TrendingTopics;
