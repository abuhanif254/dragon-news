"use client";
import { Box, Typography, Stack, alpha } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchBox = () => {
  const handleOpenSearch = () => {
    // Dispatch a custom event that Navbar can listen to
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      metaKey: true
    }));
  };

  return (
    <Box 
      onClick={handleOpenSearch}
      sx={{ 
        my: { xs: 4, md: 6 },
        width: "100%",
        maxWidth: 600,
        mx: "auto",
        cursor: "text",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 4,
        p: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        "&:hover": {
          borderColor: "#c0392b",
          boxShadow: "0 8px 30px rgba(192,57,43,0.12)",
          transform: "translateY(-2px)"
        }
      }}
    >
      <Stack direction="row" alignItems="center" gap={2}>
        <SearchIcon sx={{ color: "text.secondary" }} />
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Search articles, authors, topics...
        </Typography>
      </Stack>
      <Box sx={{ 
        display: { xs: "none", sm: "flex" }, 
        alignItems: "center", 
        gap: 0.5,
        bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
        px: 1.5,
        py: 0.5,
        borderRadius: 1
      }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary">
          Ctrl + K
        </Typography>
      </Box>
    </Box>
  );
};

export default SearchBox;

