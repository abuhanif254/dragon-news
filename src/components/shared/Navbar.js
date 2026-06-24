"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Image from "next/image";
import logo from "@/assets/the-brain-landscape-logo.png";
import { IconButton, Stack, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

// icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Link from "next/link";
import { NAV_ITEMS } from "@/utils/navItems";
import Header from "./Header";
import { subscribeToAuth } from "@/lib/auth-service";

function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <Header />
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#1a1a2e",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 64 } }}>
            {/* Logo */}
            <Link href="/">
              <Image 
                src={logo} 
                alt="The Brain logo" 
                priority
                style={{ width: "120px", height: "auto", display: "block" }}
              />
            </Link>

            {/* Desktop navigation links */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              {NAV_ITEMS.map((item) => (
                <Link key={item.route} href={item.pathname}>
                  <Button
                    sx={{
                      color: "#ffffff",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      letterSpacing: "0.03em",
                      px: 2,
                      py: 1,
                      borderRadius: 1.5,
                      textTransform: "none",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.12)",
                        color: "#f39c12",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    {item.route}
                  </Button>
                </Link>
              ))}
            </Box>

            {/* Social icons - desktop */}
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <Stack direction="row">
                <IconButton component="a" href="https://www.facebook.com/bitulla" target="_blank" sx={{ color: "white", "&:hover": { color: "#4267B2" } }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton component="a" href="https://x.com/MohammadBitull1" target="_blank" sx={{ color: "white", "&:hover": { color: "#1DA1F2" } }}>
                  <TwitterIcon />
                </IconButton>
                <IconButton component="a" href="https://www.youtube.com/@MohammadBitullah" target="_blank" sx={{ color: "white", "&:hover": { color: "#FF0000" } }}>
                  <YouTubeIcon />
                </IconButton>
                <IconButton component="a" href="https://www.instagram.com/bitullah_aj" target="_blank" sx={{ color: "white", "&:hover": { color: "#E1306C" } }}>
                  <InstagramIcon />
                </IconButton>
                <IconButton component="a" href="https://www.linkedin.com/in/md-abu-hanif-mia" target="_blank" sx={{ color: "white", "&:hover": { color: "#0A66C2" } }}>
                  <LinkedInIcon />
                </IconButton>
              </Stack>

              <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: "rgba(255,255,255,0.1)", height: 24, alignSelf: "center" }} />

              <Stack direction="row" spacing={1}>
                {user ? (
                  <Link href="/dashboard">
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: "#c0392b", fontWeight: 700, px: 2, borderRadius: 1.5, textTransform: "none",
                        "&:hover": { bgcolor: "#a93226" }
                      }}
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button sx={{ color: "white", fontWeight: 600, textTransform: "none" }}>Sign In</Button>
                    </Link>
                    <Link href="/register">
                      <Button
                        variant="outlined"
                        sx={{
                          color: "white", borderColor: "rgba(255,255,255,0.3)", fontWeight: 700, px: 2, borderRadius: 1.5, textTransform: "none",
                          "&:hover": { borderColor: "#f39c12", color: "#f39c12" }
                        }}
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </Stack>
            </Box>

            {/* Mobile menu button */}
            <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
              <IconButton
                size="large"
                onClick={handleDrawerToggle}
                sx={{ color: "white" }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: 260,
            backgroundColor: "#1a1a2e",
            color: "white",
          },
        }}
      >
        <Box sx={{ pt: 2 }}>
          <List>
            {NAV_ITEMS.map((item) => (
              <ListItem key={item.route} disablePadding>
                <Link
                  href={item.pathname}
                  style={{ width: "100%", textDecoration: "none", color: "inherit" }}
                  onClick={handleDrawerToggle}
                >
                  <ListItemButton
                    sx={{
                      px: 3,
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.08)",
                        color: "#f39c12",
                      },
                    }}
                  >
                    <ListItemText
                      primary={item.route}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
          </List>

          {/* Social icons in mobile */}
          <Stack direction="row" justifyContent="center" sx={{ mt: 2, gap: 1 }}>
            <IconButton component="a" href="https://www.facebook.com/bitulla" target="_blank" sx={{ color: "white" }}>
              <FacebookIcon />
            </IconButton>
            <IconButton component="a" href="https://x.com/MohammadBitull1" target="_blank" sx={{ color: "white" }}>
              <TwitterIcon />
            </IconButton>
            <IconButton component="a" href="https://www.youtube.com/@MohammadBitullah" target="_blank" sx={{ color: "white" }}>
              <YouTubeIcon />
            </IconButton>
            <IconButton component="a" href="https://www.instagram.com/bitullah_aj" target="_blank" sx={{ color: "white" }}>
              <InstagramIcon />
            </IconButton>
            <IconButton component="a" href="https://www.linkedin.com/in/md-abu-hanif-mia" target="_blank" sx={{ color: "white" }}>
              <LinkedInIcon />
            </IconButton>
          </Stack>

          <Box sx={{ px: 2, mt: 3 }}>
            {user ? (
              <Link href="/dashboard" style={{ textDecoration: "none" }} onClick={handleDrawerToggle}>
                <Button fullWidth variant="contained" sx={{ bgcolor: "#c0392b", fontWeight: 700, borderRadius: 2 }}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Stack spacing={1.5}>
                <Link href="/login" style={{ textDecoration: "none" }} onClick={handleDrawerToggle}>
                  <Button fullWidth sx={{ color: "white", fontWeight: 600 }}>Sign In</Button>
                </Link>
                <Link href="/register" style={{ textDecoration: "none" }} onClick={handleDrawerToggle}>
                  <Button fullWidth variant="outlined" sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)", fontWeight: 700 }}>
                    Create Account
                  </Button>
                </Link>
              </Stack>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;
