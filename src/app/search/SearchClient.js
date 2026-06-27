"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Stack,
  CircularProgress,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Slider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArticleCard from "@/components/ui/ArticleCard/ArticleCard";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  
  // Advanced Filter States
  const [sortBy, setSortBy] = useState("newest");
  const [readingTimeRange, setReadingTimeRange] = useState([1, 15]);
  const [maxDaysOld, setMaxDaysOld] = useState(30);
  
  const [rawResults, setRawResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sidebar Autocomplete States
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingSuggestions, setSearchingSuggestions] = useState(false);
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(6);

  const fetchResults = async (q, cat) => {
    setLoading(true);
    try {
      const url = `/api/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`;
      const res = await fetch(url);
      const data = await res.json();
      setRawResults(data.results || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(initialQuery, initialCategory);
  }, [initialQuery, initialCategory]);

  // Debounced search suggestions for sidebar input
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingSuggestions(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.results?.slice(0, 5) || []);
      } catch (error) {
        console.error(error);
      } finally {
        setSearchingSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset pagination when search query or filters change
  useEffect(() => {
    setVisibleCount(6);
  }, [query, category, sortBy, readingTimeRange, maxDaysOld]);

  // Helper to calculate reading duration (word count / 200)
  const getArticleReadingTime = (text = "") => {
    return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
  };

  // Process filters & sorting dynamically for instant feedback
  const filteredAndSortedResults = useMemo(() => {
    let list = [...rawResults];

    // Filter by reading duration slider
    list = list.filter((article) => {
      const time = getArticleReadingTime(article.details || "");
      const [min, max] = readingTimeRange;
      if (max === 15) {
        return time >= min;
      }
      return time >= min && time <= max;
    });

    // Filter by age slider
    if (maxDaysOld < 30) {
      list = list.filter((article) => {
        const publishedAt = article.publishedAt || article.createdAt || article.author?.published_date;
        if (!publishedAt) return false;
        
        const date = new Date(publishedAt);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= maxDaysOld;
      });
    }

    // Sort the list
    list.sort((a, b) => {
      if (sortBy === "views") {
        return (b.total_view || 0) - (a.total_view || 0);
      }
      if (sortBy === "rating") {
        return (b.rating?.number || 0) - (a.rating?.number || 0);
      }
      const dateA = new Date(a.publishedAt || a.createdAt || a.author?.published_date || 0);
      const dateB = new Date(b.publishedAt || b.createdAt || b.author?.published_date || 0);
      return dateB - dateA;
    });

    return list;
  }, [rawResults, sortBy, readingTimeRange, maxDaysOld]);

  const displayedResults = useMemo(() => {
    return filteredAndSortedResults.slice(0, visibleCount);
  }, [filteredAndSortedResults, visibleCount]);

  const handleSearchSubmit = (e, customQuery) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const activeQuery = customQuery !== undefined ? customQuery : query;
    const params = new URLSearchParams();
    if (activeQuery) params.set("q", activeQuery);
    if (category) params.set("category", category);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6, minHeight: "75vh" }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight={900} sx={{ fontFamily: "'Playfair Display', serif", mb: 2 }}>
          Search Results
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {loading ? "Searching..." : `Showing ${filteredAndSortedResults.length} of ${rawResults.length} articles found`}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              position: "sticky",
              top: 100,
              display: "flex",
              flexDirection: "column",
              gap: 2.5
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <FilterListIcon sx={{ color: "var(--brand-red)", fontSize: 20 }} />
              <Typography variant="overline" fontWeight={800} sx={{ letterSpacing: "0.05em" }}>
                Filter & Sort
              </Typography>
            </Stack>
            
            <Box sx={{ position: "relative" }}>
              <TextField
                fullWidth
                size="small"
                label="Keywords"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <Paper
                  variant="outlined"
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    bgcolor: "background.paper",
                    mt: 0.5,
                    maxHeight: 220,
                    overflowY: "auto",
                    borderRadius: 2,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
                  }}
                >
                  <List disablePadding>
                    {suggestions.map((item) => (
                      <ListItem
                        button
                        key={item.id || item._id}
                        onClick={() => {
                          setQuery(item.title);
                          setShowSuggestions(false);
                          fetchResults(item.title, category);
                        }}
                        sx={{ py: 1 }}
                      >
                        <ListItemText
                          primary={item.title}
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: 600,
                            noWrap: true
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
            
            <TextField
              select
              fullWidth
              size="small"
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Technology">Technology</MenuItem>
              <MenuItem value="Politics">Politics</MenuItem>
              <MenuItem value="Business">Business</MenuItem>
              <MenuItem value="Science">Science</MenuItem>
              <MenuItem value="Health">Health</MenuItem>
              <MenuItem value="Sports">Sports</MenuItem>
              <MenuItem value="Entertainment">Entertainment</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="views">Most Popular (Views)</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
            </TextField>

            {/* Reading Duration Slider */}
            <Box sx={{ px: 1, mt: 1 }}>
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: "block", mb: 1, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>
                Reading Duration: {readingTimeRange[0]} - {readingTimeRange[1] === 15 ? "15+ min" : `${readingTimeRange[1]} min`}
              </Typography>
              <Slider
                value={readingTimeRange}
                onChange={(e, newVal) => setReadingTimeRange(newVal)}
                valueLabelDisplay="auto"
                min={1}
                max={15}
                color="error"
                sx={{ py: 1 }}
              />
            </Box>

            {/* Publication Age Slider */}
            <Box sx={{ px: 1, mt: 1 }}>
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: "block", mb: 1, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>
                Maximum Age: {maxDaysOld === 30 ? "Anytime" : `${maxDaysOld} days old`}
              </Typography>
              <Slider
                value={maxDaysOld}
                onChange={(e, newVal) => setMaxDaysOld(newVal)}
                valueLabelDisplay="auto"
                min={1}
                max={30}
                color="error"
                sx={{ py: 1 }}
              />
            </Box>
            
            <Button
              type="submit"
              variant="contained"
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2,
                py: 1,
                bgcolor: "#c0392b",
                "&:hover": { bgcolor: "#96281b" }
              }}
            >
              Search Keywords
            </Button>
          </Paper>

          {/* Trending Searches tag cloud */}
          <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", mt: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mb: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Trending Searches
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {["Neuroscience", "Ethics", "Philosophy", "Artificial Intelligence", "Morality", "Science", "Secularism", "Atheism"].map((term) => (
                <Chip 
                  key={term}
                  label={term}
                  onClick={() => {
                    setQuery(term);
                    handleSearchSubmit(null, term);
                  }}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    cursor: "pointer",
                    bgcolor: "rgba(192, 57, 43, 0.04)",
                    color: "var(--brand-red)",
                    transition: "all 0.2s",
                    "& :hover": {
                      bgcolor: "var(--brand-red)",
                      color: "white",
                      transform: "translateY(-1px)"
                    }
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
 
        {/* Results Grid */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress color="error" />
            </Box>
          ) : displayedResults.length > 0 ? (
            <Stack spacing={4}>
              <Grid container spacing={3}>
                {displayedResults.map((news) => (
                  <Grid item xs={12} sm={6} lg={4} key={news.id || news._id}>
                    <ArticleCard article={news} searchQuery={query} />
                  </Grid>
                ))}
              </Grid>
              {filteredAndSortedResults.length > visibleCount && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    sx={{
                      borderRadius: 2.5,
                      fontWeight: 800,
                      px: 5,
                      py: 1.2,
                      textTransform: "none",
                      borderColor: "rgba(192, 57, 43, 0.4)",
                      color: "#c0392b",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "#c0392b",
                        bgcolor: "rgba(192, 57, 43, 0.04)",
                        transform: "translateY(-1px)"
                      }
                    }}
                  >
                    Load More Articles
                  </Button>
                </Box>
              )}
            </Stack>
          ) : (
            <Box sx={{ py: 10, textAlign: "center" }}>
              <SearchIcon sx={{ fontSize: 64, color: "divider", mb: 2 }} />
              <Typography variant="h5" fontWeight={700} color="text.secondary" gutterBottom>
                No matching articles found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search terms, sort orders, or filters to find what you're looking for.
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default function SearchClient() {
  return (
    <Suspense fallback={<Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>}>
      <SearchContent />
    </Suspense>
  );
}
