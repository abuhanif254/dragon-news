"use client";
import { useState, useMemo } from "react";
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import Link from "next/link";
import { NAV_ITEMS } from "@/utils/navItems";
import { useThemeContext } from "@/theme/ThemeContextProvider";

const SearchBox = ({ allNews }) => {
  const [query, setQuery] = useState("");
  const { mode, toggleTheme } = useThemeContext();
  const isDarkMode = mode === "dark";

  const filteredNews = useMemo(() => {
    if (!query) return [];
    return allNews
      .filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.category.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  }, [query, allNews]);

  const filteredPages = useMemo(() => {
    if (!query) return [];
    return NAV_ITEMS.filter((item) =>
      item.route.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <Box className="my-6 flex flex-col md:flex-row justify-between items-center gap-4 relative z-50 bg-gray-50 p-3 rounded-lg border border-gray-200">
      
      {/** Left side: Compact Search Box **/}
      <Box className="relative w-full md:w-1/2 lg:w-1/3">
        <TextField
          size="small"
          fullWidth
          variant="outlined"
          placeholder="Search news, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: "white",
              borderRadius: 2,
            },
          }}
        />

        {/** Dropdown Results Box **/}
        {query && (
          <Box className="absolute top-[110%] left-0 w-full md:w-[200%] bg-white shadow-xl border border-gray-100 rounded-b mt-1 max-h-[400px] overflow-y-auto z-50">
            {filteredPages.length > 0 && (
              <Box className="px-4 py-2 border-b border-gray-100 bg-emerald-50">
                <Typography variant="overline" className="text-emerald-700" fontWeight="bold">
                  Pages & Links
                </Typography>
                <List dense disablePadding>
                  {filteredPages.map((page) => (
                    <ListItem key={page.route} disablePadding className="mb-1">
                      <Link
                        href={page.pathname}
                        className="w-full text-black hover:text-emerald-600 transition-colors"
                        onClick={() => setQuery("")}
                      >
                        <ListItemText primary={page.route} />
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {filteredNews.length > 0 && (
              <Box className="px-4 py-2 bg-white">
                <Typography variant="overline" className="text-red-500" fontWeight="bold">
                  News Articles ({filteredNews.length})
                </Typography>
                <List dense disablePadding>
                  {filteredNews.map((news) => (
                    <ListItem key={news.id || news._id} disablePadding className="mb-2">
                      <Link
                        href={`/news/${news.id || news._id}`}
                        className="w-full hover:bg-red-50 p-2 rounded transition-colors"
                        onClick={() => setQuery("")}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight="500" className="text-gray-900">
                              {news.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" className="text-red-500 font-bold">
                              {news.category.toUpperCase()}
                            </Typography>
                          }
                        />
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {filteredNews.length === 0 && filteredPages.length === 0 && (
              <Box className="p-6 text-center text-gray-500">
                <SearchIcon className="text-gray-300 mb-2" fontSize="large" />
                <Typography variant="body1">
                  No results found for &quot;{query}&quot;
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/** Right side: Social Icons & Theme Toggle **/}
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton
          color="inherit"
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          sx={{ 
            border: "1px solid", 
            borderColor: "divider", 
            mr: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "rotate(180deg)",
              backgroundColor: isDarkMode ? "rgba(245, 158, 11, 0.1)" : "rgba(0, 0, 0, 0.05)",
            }
          }}
        >
          {isDarkMode ? (
            <LightModeIcon sx={{ color: "#f59e0b" }} />
          ) : (
            <DarkModeIcon sx={{ color: "#1a1a2e" }} />
          )}
        </IconButton>

        <IconButton size="small" sx={{ color: "#1877F2", backgroundColor: "#f0f2f5", "&:hover": { backgroundColor: "#e4e6eb" } }}>
          <FacebookIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ color: "#1DA1F2", backgroundColor: "#f0f2f5", "&:hover": { backgroundColor: "#e4e6eb" } }}>
          <TwitterIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ color: "#FF0000", backgroundColor: "#f0f2f5", "&:hover": { backgroundColor: "#e4e6eb" } }}>
          <YouTubeIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ color: "#E4405F", backgroundColor: "#f0f2f5", "&:hover": { backgroundColor: "#e4e6eb" } }}>
          <InstagramIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default SearchBox;

