"use client";
import { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SecurityIcon from "@mui/icons-material/Security";
import LanguageIcon from "@mui/icons-material/Language";
import ShareIcon from "@mui/icons-material/Share";
import { getSiteSettings, updateSiteSettings } from "@/lib/firestore";
import { SITE_NAME, SITE_DESCRIPTION, ADMIN_EMAIL } from "@/lib/site";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  
  const [settings, setSettings] = useState({
    siteName: SITE_NAME,
    siteDescription: SITE_DESCRIPTION,
    siteUrl: "https://dragonnews.com",
    contactEmail: "contact@dragonnews.com",
    adminName: "Admin User",
    adminEmail: ADMIN_EMAIL,
    seoKeywords: "news, journalism, world, technology",
    socialLinks: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      youtube: "https://youtube.com",
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSiteSettings();
      if (data) {
        setSettings((prev) => ({
          ...prev,
          ...data,
          socialLinks: { ...prev.socialLinks, ...(data.socialLinks || {}) }
        }));
      }
    } catch (err) {
      console.error("Failed to load settings", err);
      showAlert("error", "Failed to load settings from Firestore.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field.startsWith("social_")) {
      const socialKey = field.split("_")[1];
      setSettings((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [socialKey]: value }
      }));
    } else {
      setSettings((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSiteSettings(settings);
      showAlert("success", "Site settings updated successfully in Firestore!");
    } catch (err) {
      showAlert("error", "Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#1e293b", mb: 0.5 }}>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your site configuration and global preferences.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ px: 4, borderRadius: 2 }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Box>

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
                  disabled
                  helperText="Primary admin email cannot be changed from UI."
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid2>

        {/* Site Settings & Social Links */}
        <Grid2 size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* General Settings */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
                  <LanguageIcon sx={{ color: "#3b82f6" }} />
                  <Typography variant="h6" fontWeight="bold">
                    Global Site Settings
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
                      helperText="Used globally across the footer and meta tags."
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
                      label="SEO Keywords"
                      fullWidth
                      value={settings.seoKeywords}
                      onChange={(e) => handleChange("seoKeywords", e.target.value)}
                      helperText="Comma separated keywords."
                    />
                  </Grid2>
                </Grid2>
              </CardContent>
            </Card>

            {/* Social Media Links */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
                  <ShareIcon sx={{ color: "#f59e0b" }} />
                  <Typography variant="h6" fontWeight="bold">
                    Social Media Links
                  </Typography>
                </Stack>

                <Grid2 container spacing={2.5}>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Facebook URL"
                      fullWidth
                      value={settings.socialLinks.facebook}
                      onChange={(e) => handleChange("social_facebook", e.target.value)}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Twitter / X URL"
                      fullWidth
                      value={settings.socialLinks.twitter}
                      onChange={(e) => handleChange("social_twitter", e.target.value)}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="LinkedIn URL"
                      fullWidth
                      value={settings.socialLinks.linkedin}
                      onChange={(e) => handleChange("social_linkedin", e.target.value)}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="YouTube URL"
                      fullWidth
                      value={settings.socialLinks.youtube}
                      onChange={(e) => handleChange("social_youtube", e.target.value)}
                    />
                  </Grid2>
                </Grid2>
              </CardContent>
            </Card>
          </Stack>
        </Grid2>
      </Grid2>
    </Box>
  );
}
