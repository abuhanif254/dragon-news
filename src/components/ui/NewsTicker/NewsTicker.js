import { Box, Typography } from "@mui/material";
import { getAllNews } from "@/utils/getAllNews";
import Link from "next/link";
import { articlePath } from "@/lib/site";

const NewsTicker = ({ allNews: data = [] }) => {

  if (data.length === 0) return null;

  return (
    <Box sx={{ my: 2, display: "flex", alignItems: "center", bgcolor: "#000", color: "#fff", p: 1, borderRadius: 1, overflow: "hidden", position: "relative", width: "100%", maxWidth: "100%", minWidth: 0 }}>
      <Typography
        variant="body2"
        fontWeight="bold"
        sx={{
          bgcolor: "#e53e3e",
          px: { xs: 1.5, sm: 2 },
          py: 0.5,
          borderRadius: 1,
          mr: { xs: 1.5, sm: 2 },
          whiteSpace: "nowrap",
          zIndex: 10,
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          flexShrink: 0,
        }}
      >
        Breaking News
      </Typography>

      <Box sx={{ overflow: "hidden", whiteSpace: "nowrap", width: "100%", position: "relative", display: "flex", alignItems: "center", minWidth: 0, flex: 1 }}>
        <style>
          {`
            @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .animate-marquee {
              display: inline-block;
              animation: marquee 50s linear infinite;
              padding-left: 100%;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}
        </style>
        <div className="animate-marquee">
          {data.slice(0, 10).map((news, index) => (
            <span key={news.id || news._id} className="mx-6">
              <Link
                href={articlePath(news)}
                className="hover:text-red-500 transition-colors"
                style={{ textDecoration: "none" }}
              >
                {news.title}
              </Link>
              {index < data.length - 1 && index < 9 && <span className="text-red-500 ml-6">|</span>}
            </span>
          ))}
        </div>
      </Box>
    </Box>
  );
};

export default NewsTicker;
