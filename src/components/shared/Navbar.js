"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Image from "next/image";
import logo from "@/assets/the-brain-landscape-logo.png";
import { IconButton, Stack, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, Badge, Popover, Card, CardContent, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";

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
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import SearchModal from "@/components/ui/SearchModal/SearchModal";

function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [notiAnchorEl, setNotiAnchorEl] = React.useState(null);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const loadNotifications = React.useCallback(async () => {
    if (user) {
      const { getNotificationsForUser } = await import("@/lib/firestore");
      const list = await getNotificationsForUser(user);
      setNotifications(list);
    }
  }, [user]);

  React.useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 20000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user, loadNotifications]);

  const handleOpenNoti = (e) => setNotiAnchorEl(e.currentTarget);
  const handleCloseNoti = () => setNotiAnchorEl(null);
  const openNoti = Boolean(notiAnchorEl);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <Header />
      <AppBar
        position="sticky"
        top={0}
        sx={{
          backgroundColor: isScrolled ? "rgba(26, 26, 46, 0.95)" : "#1a1a2e",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.3)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1100,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ 
            minHeight: { xs: 56, md: isScrolled ? 64 : 76 },
            transition: "min-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
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
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.pathname;
                return (
                  <Link key={item.route} href={item.pathname}>
                    <Button
                      sx={{
                        color: isActive ? "#f39c12" : "#ffffff",
                        fontWeight: isActive ? 700 : 600,
                        fontSize: "0.95rem",
                        letterSpacing: "0.02em",
                        px: 2,
                        py: 1,
                        borderRadius: 1.5,
                        textTransform: "none",
                        transition: "all 0.2s ease",
                        position: "relative",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.06)",
                          color: "#f39c12",
                          transform: "translateY(-1px)",
                        },
                        "&::after": isActive ? {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "20px",
                          height: "3px",
                          backgroundColor: "#f39c12",
                          borderRadius: "4px 4px 0 0",
                        } : {},
                      }}
                    >
                      {item.route}
                    </Button>
                  </Link>
                );
              })}
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
              
              <Divider orientation="vertical" flexItem sx={{ mx: 1.5, borderColor: "rgba(255,255,255,0.1)", height: 24, alignSelf: "center" }} />
              
              <IconButton onClick={() => setSearchOpen(true)} sx={{ color: "white", "&:hover": { color: "#f39c12" } }}>
                <SearchIcon />
              </IconButton>
              
              {user && (
                <IconButton onClick={handleOpenNoti} sx={{ color: "white", "&:hover": { color: "#f39c12" } }}>
                  <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              )}
              
              <ThemeToggle />

              <Divider orientation="vertical" flexItem sx={{ mx: 1.5, borderColor: "rgba(255,255,255,0.1)", height: 24, alignSelf: "center" }} />

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

            {/* Mobile menu and theme toggle */}
            <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto", alignItems: "center", gap: 1 }}>
              <IconButton onClick={() => setSearchOpen(true)} sx={{ color: "white" }}>
                <SearchIcon />
              </IconButton>
              {user && (
                <IconButton onClick={handleOpenNoti} sx={{ color: "white" }}>
                  <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              )}
              <ThemeToggle />
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
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.pathname;
              return (
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
                        backgroundColor: isActive ? "rgba(243, 156, 18, 0.08)" : "transparent",
                        borderLeft: isActive ? "4px solid #f39c12" : "4px solid transparent",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.08)",
                          color: "#f39c12",
                        },
                      }}
                    >
                      <ListItemText
                        primary={item.route}
                        primaryTypographyProps={{ 
                          fontWeight: isActive ? 800 : 600,
                          color: isActive ? "#f39c12" : "inherit"
                        }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              );
            })}
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

      {/* Global Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Notifications Popover */}
      <Popover
        open={openNoti}
        anchorEl={notiAnchorEl}
        onClose={handleCloseNoti}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            borderRadius: 3,
            mt: 1.5,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            overflowY: "auto",
            bgcolor: "background.paper",
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle2" fontWeight={800} color="text.primary">
            Notifications ({notifications.length})
          </Typography>
          {notifications.length > 0 && (
            <Chip label="NEW" size="small" color="error" sx={{ height: 18, fontSize: "0.55rem", fontWeight: 800 }} />
          )}
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <NotificationsIcon sx={{ color: "divider", fontSize: 36, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              All caught up! No new notifications.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((noti) => (
              <Link 
                key={noti.id} 
                href={noti.link}
                style={{ textDecoration: "none", color: "inherit" }}
                onClick={handleCloseNoti}
              >
                <ListItem 
                  button
                  sx={{ 
                    borderBottom: "1px solid #f1f5f9", 
                    py: 1.5,
                    px: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    transition: "background 0.2s",
                    "&:hover": { bgcolor: "action.hover" }
                  }}
                >
                  <Typography variant="caption" fontWeight={800} color={noti.type === "comment_reply" ? "#3b82f6" : "#c0392b"} sx={{ textTransform: "uppercase", fontSize: "0.6rem", mb: 0.5 }}>
                    {noti.title}
                  </Typography>
                  <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ lineHeight: 1.4, mb: 0.5 }}>
                    {noti.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(noti.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </ListItem>
              </Link>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}

export default Navbar;
