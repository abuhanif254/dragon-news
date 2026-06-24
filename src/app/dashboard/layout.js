"use client";
import { useState, useEffect } from "react";
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Button, ListItemButton,
  Avatar, Stack, Tooltip, Divider, useMediaQuery, Collapse,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArticleIcon from "@mui/icons-material/Article";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CategoryIcon from "@mui/icons-material/Category";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailIcon from "@mui/icons-material/Email";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PagesIcon from "@mui/icons-material/Pages";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { subscribeToAuth, logout as firebaseLogout } from "@/lib/auth-service";

const DRAWER_FULL = 260;
const DRAWER_MINI = 72;

const MENU_ITEMS = [
  { title: "Overview", path: "/dashboard", icon: <DashboardIcon />, roles: ["admin", "writer", "reader"] },
  { title: "Articles", path: "/dashboard/news", icon: <ArticleIcon />, roles: ["admin", "writer"] },
  { title: "Publish New", path: "/dashboard/news/create", icon: <AddCircleIcon />, roles: ["admin", "writer"] },
  { title: "Categories", path: "/dashboard/categories", icon: <CategoryIcon />, roles: ["admin"] },
  { title: "Pages", path: "/dashboard/pages", icon: <PagesIcon />, roles: ["admin"] },
  { title: "Analytics", path: "/dashboard/analytics", icon: <BarChartIcon />, roles: ["admin", "writer"] },
  { title: "Messages", path: "/dashboard/messages", icon: <EmailIcon />, roles: ["admin"] },
  { title: "Subscribers", path: "/dashboard/subscribers", icon: <PeopleIcon />, roles: ["admin"] },
  { title: "Users", path: "/dashboard/users", icon: <PeopleIcon />, roles: ["admin"] },
  { title: "My Profile", path: "/dashboard/profile", icon: <PeopleIcon />, roles: ["admin", "writer", "reader"] },
  { title: "Settings", path: "/dashboard/settings", icon: <SettingsIcon />, roles: ["admin"] },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width:900px)");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => {
      if (!u) router.push("/login");
      setUser(u);
    });
    return () => unsubscribe();
  }, [router]);

  const drawerWidth = collapsed ? DRAWER_MINI : DRAWER_FULL;

  const handleLogout = async () => {
    await firebaseLogout();
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/login");
  };

  const isActive = (path) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  const visibleMenuItems = MENU_ITEMS.filter(item => item.roles.includes(user?.role || "reader"));

  /* ─── Sidebar Content ─── */
  const sidebarContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Brand */}
      <Box sx={{ p: collapsed ? 1.5 : 3, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", minHeight: 64 }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, background: "linear-gradient(135deg, #ef4444, #f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "white", fontSize: 16 }}>D</Box>
          {!collapsed && (
            <Box>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: "white", lineHeight: 1.2 }}>DRAGON</Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6rem" }}>NEWS ENGINE</Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 2, px: collapsed ? 1 : 1.5 }}>
        <List disablePadding>
          {visibleMenuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={collapsed ? item.title : ""} placement="right">
                  <ListItemButton
                    onClick={() => { router.push(item.path); if (isMobile) setMobileOpen(false); }}
                    sx={{
                      borderRadius: 2, minHeight: 44, justifyContent: collapsed ? "center" : "flex-start",
                      bgcolor: active ? "rgba(239, 68, 68, 0.12)" : "transparent",
                      color: active ? "#f87171" : "rgba(255,255,255,0.55)",
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: collapsed ? 0 : 36 }}>{item.icon}</ListItemIcon>
                    {!collapsed && <ListItemText primary={item.title} primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: "0.85rem" }} />}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Footer */}
      <Box sx={{ p: collapsed ? 1 : 2, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {!collapsed && user && (
          <Box sx={{ p: 1.5, borderRadius: 2, mb: 1, background: "rgba(255,255,255,0.03)" }}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Avatar src={user.photoURL || user.photo} sx={{ width: 32, height: 32, bgcolor: "#ef4444", fontSize: 14 }}>{user.displayName?.charAt(0) || user.name?.charAt(0)}</Avatar>
              <Box sx={{ overflow: "hidden" }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: "white", display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>{user.displayName || user.name}</Typography>
                <Typography variant="caption" sx={{ color: "#f87171", fontSize: "0.6rem", textTransform: "uppercase", fontWeight: 800 }}>{user.role}</Typography>
              </Box>
            </Stack>
          </Box>
        )}
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: "rgba(255,255,255,0.4)" }}>
          <ListItemIcon sx={{ color: "inherit", minWidth: collapsed ? 0 : 36 }}><LogoutIcon /></ListItemIcon>
          {!collapsed && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: "0.85rem" }} />}
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "#0f172a",
              color: "white",
              borderRight: "1px solid rgba(255,255,255,0.04)",
              transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
              overflowX: "hidden",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_FULL,
              bgcolor: "#0f172a",
              color: "white",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            color: "#334155",
            borderBottom: "1px solid #e2e8f0",
            zIndex: 10,
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            {isMobile ? (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            ) : (
              <IconButton onClick={() => setCollapsed(!collapsed)} size="small" sx={{ mr: 1 }}>
                {collapsed ? <MenuIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
              </IconButton>
            )}

            {/* Breadcrumb */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                The Brain Admin
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: "capitalize" }}>
                {pathname === "/dashboard" ? "Overview" : pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <Tooltip title="Notifications">
                <IconButton size="small" sx={{ color: "#64748b" }}>
                  <NotificationsNoneIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button
                size="small"
                variant="outlined"
                startIcon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
                onClick={() => router.push("/")}
                sx={{
                  borderColor: "#e2e8f0", color: "#64748b",
                  fontWeight: 600, fontSize: "0.75rem",
                  textTransform: "none", borderRadius: 2,
                  "&:hover": { borderColor: "#ef4444", color: "#ef4444", bgcolor: "rgba(239,68,68,0.04)" },
                }}
              >
                View Site
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1, p: { xs: 2, sm: 3, md: 4 },
            overflowY: "auto",
            maxWidth: 1400, width: "100%", mx: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
