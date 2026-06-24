"use client";
import LatestNews from "@/components/ui/LatestNews/LatestNews";
import SideBar from "@/components/ui/SideBar/SideBar";
import NewsTicker from "@/components/ui/NewsTicker/NewsTicker";
import SearchBox from "@/components/ui/SearchBox/SearchBox";
import TrendingTopics from "@/components/ui/TrendingTopics/TrendingTopics";
import { Grid, Box, Alert, AlertTitle, Typography, Button } from "@mui/material";
import WifiOffIcon from "@mui/icons-material/WifiOff";

export default function HomeClient({ allNews, error }) {
  if (error) {
    return (
      <Box sx={{ my: 10, display: 'flex', justifyContent: 'center' }}>
        <Alert 
          severity="error" 
          icon={<WifiOffIcon fontSize="inherit" />}
          sx={{ maxWidth: 600, borderRadius: 3, p: 3, boxShadow: '0 4px 20px rgba(192,57,43,0.1)' }}
        >
          <AlertTitle sx={{ fontWeight: 800, fontSize: '1.2rem' }}>Database Connection Error</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
            The Brain was unable to reach the Cloud Firestore backend. This is usually caused by a network block, VPN, or firewall on your local machine.
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 2, fontFamily: 'monospace', p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
            Error: {error}
          </Typography>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => window.location.reload()}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Try Reconnecting
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="fade-in-up">
      <NewsTicker allNews={allNews} />
      <SearchBox allNews={allNews} />
      <TrendingTopics allNews={allNews} />
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} md={8}>
          <LatestNews allNews={allNews} />
        </Grid>
        <Grid item xs={12} md={4}>
          <SideBar allNews={allNews} />
        </Grid>
      </Grid>
    </Box>
  );
}
