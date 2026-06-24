import { Box, Typography } from "@mui/material";
import { getAllNews } from "@/utils/getAllNews";
import Link from "next/link";

const NewsTicker = ({ allNews: data = [] }) => {

  if (data.length === 0) return null;

  return (
    <Box className="my-4 flex items-center bg-black text-white p-2 rounded overflow-hidden relative">
      <Typography
        variant="body2"
        fontWeight="bold"
        className="bg-red-500 px-3 py-1 rounded mr-4 whitespace-nowrap z-10"
      >
        Breaking News
      </Typography>

      <Box className="overflow-hidden whitespace-nowrap w-full relative flex items-center">
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
                href={`/news/${news.id || news._id}`}
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
