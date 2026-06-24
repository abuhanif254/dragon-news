"use client";
import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Alert,
  Avatar,
  IconButton,
  Chip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SecurityIcon from "@mui/icons-material/Security";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PaletteIcon from "@mui/icons-material/Palette";
import LanguageIcon from "@mui/icons-material/Language";

export default function SettingsPage() {
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [settings, setSettings] = useState({
    // Site Settings
    siteName: "The Brain",
    siteDescription: "Your trusted source for breaking news",
    siteUrl: "https://dragonnews.com",
    contactEmail: "contact@dragonnews.com",
    
    // Profile Settings
    adminName: "Admin User",
    adminEmail: "admin@dragon.news",
    
    // Notification Settings
    emailNotifications: true,
    newArticleAlerts: true,
    commentNotifications: false,
    weeklyReport: true,
    
    // Display Settings
    articlesPerPage: 10,
    showAuthorInfo: true,
    enableComments: false,
    showRelatedArticles: true,
  });

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    setAlert({ show: true, type: "success", message: "Settings saved successfully!" });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#1e293b", mb: 0.5 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your site configuration and preferences
        </Typography>
      </Box>

      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      <Grid2 container spacing={3}>
        {/* Profile Settings */}
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
                <SecurityIcon sx={{ color: "#ef4444" }} />
                <Typography variant="h6" fontWeight="bold">
                  Profile Settings
                </Typography>
              </Stack>

              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: "#ef4444",
                      fontSize: 36,
                      fontWeight: 700,
                    }}
                  >
                    A
                  </Avatar>
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "white",
                      boxShadow: 2,
                      "&:hover": { bgcolor: "#f8fafc" },
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Stack spacing={2.5}>
                <TextField
                  label="Admin Name"
                  fullWidth
                  value={settings.adminName}
                  onChange={(e) => handleChange("adminName", e.target.value)}
                />
                <TextField
                  label="Email Address"
                  fullWidth
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleChange("adminEmail", e.target.value)}
                />
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Change Password
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>

        {/* Site Settings */}
        <Grid2 size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* General Settings */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
                  <LanguageIcon sx={{ color: "#3b82f6" }} />
                  <Typography variant="h6" fontWeight="bold">
                    General Settings
                  </Typography>
                </Stack>

                <Grid2 container spacing={2.5}>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Site Name"
                      fullWidth
                      value={settings.siteName}
                      onChange={(e) => handleChange("siteName", e.target.value)}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Site URL"
                      fullWidth
                      value={settings.siteUrl}
                      onChange={(e) => handleChange("siteUrl", e.target.value)}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12 }}>
                    <TextField
                      label="Site Description"
                      fullWidth
                      multiline
                      rows={2}
                      value={settings.siteDescription}
                      onChange={(e) => handleChange("siteDescription", e.target.value)}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Contact Email"
                      fullWidth
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleChange("contactEmail", e.target.value)}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Articles Per Page"
                      fullWidth
                      type="number"
                      value={settings.articlesPerPage}
                      onChange={(e) => handleChange("articlesPerPage", parseInt(e.target.value))}
                    />
                  </Grid2>
                </Grid2>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
                  <NotificationsIcon sx={{ color: "#10b981" }} />
                  <Typography variant="h6" fontWeight="bold">
                    Notification Preferences
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Email Notifications
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Receive email updates about your account
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleChange("emailNotifications", e.target.checked)}
                      color="error"
                    />
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        New Article Alerts
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Get notified when new articles are published
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.newArticleAlerts}
                      onChange={(e) => handleChange("newArticleAlerts", e.target.checked)}
                      color="error"
                    />
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Comment Notifications
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Receive alerts for new comments
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.commentNotifications}
                      onChange={(e) => handleChange("commentNotifications", e.target.checked)}
                      color="error"
                    />
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Weekly Report
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Get weekly analytics summary via email
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.weeklyReport}
                      onChange={(e) => handleChange("weeklyReport", e.target.checked)}
                      color="error"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
                  <PaletteIcon sx={{ color: "#f59e0b" }} />
                  <Typography variant="h6" fontWeight="bold">
                    Display Settings
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Show Author Information
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Display author details on articles
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.showAuthorInfo}
                      onChange={(e) => handleChange("showAuthorInfo", e.target.checked)}
                      color="error"
                    />
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Enable Comments
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Allow readers to comment on articles
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.enableComments}
                      onChange={(e) => handleChange("enableComments", e.target.checked)}
                      color="error"
                    />
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Show Related Articles
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Display related content suggestions
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.showRelatedArticles}
                      onChange={(e) => handleChange("showRelatedArticles", e.target.checked)}
                      color="error"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" size="large">
                Reset to Default
              </Button>
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ px: 4 }}
              >
                Save Changes
              </Button>
            </Box>
          </Stack>
        </Grid2>
      </Grid2>
    </Box>
  );
}
