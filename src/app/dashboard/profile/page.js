"use client";
import { useState, useEffect } from "react";
import { 
  Box, Typography, Card, CardContent, TextField, Button, 
  Stack, Grid, Avatar, Alert, Divider, Chip, IconButton,
  InputAdornment, Paper, Switch, FormControlLabel
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PublicIcon from "@mui/icons-material/Public";
import VerifiedIcon from "@mui/icons-material/Verified";
import { getAuthorProfile, saveAuthorProfile } from "@/lib/firestore";
import Link from "next/link";

import { subscribeToAuth } from "@/lib/auth-service";

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", content: "" });
  const [user, setUser] = useState(null);
  
  const [profile, setProfile] = useState({
    name: "",
    image: "",
    role: "Editorial Contributor",
    bio: "",
    expertise: "",
    social: { twitter: "", linkedin: "", website: "" }
  });
  
  const [preferences, setPreferences] = useState({
    weeklySummary: true,
    breakingAlerts: true,
    commentReplies: false,
  });

  const [readingHistory, setReadingHistory] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("reading_history");
      if (saved) {
        try {
          setReadingHistory(JSON.parse(saved));
        } catch (err) {
          console.error("Error reading history from storage:", err);
        }
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => {
      if (u) {
        setUser(u);
        setProfile(prev => ({ ...prev, name: u.displayName || u.name || "" }));
        fetchProfile(u.displayName || u.name);
        fetchUserPreferences(u.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserPreferences = async (uid) => {
    try {
      const { getUserDoc } = await import("@/lib/firestore");
      const uDoc = await getUserDoc(uid);
      if (uDoc && uDoc.preferences) {
        setPreferences({
          weeklySummary: uDoc.preferences.weeklySummary !== false,
          breakingAlerts: uDoc.preferences.breakingAlerts !== false,
          commentReplies: uDoc.preferences.commentReplies === true,
        });
      }
    } catch (err) {
      console.error("Error fetching user preferences:", err);
    }
  };

  const fetchProfile = async (name) => {
    if (!name) return;
    try {
      setLoading(true);
      const data = await getAuthorProfile(name);
      if (data) {
        setProfile({
          ...data,
          expertise: Array.isArray(data.expertise) ? data.expertise.join(", ") : data.expertise || ""
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg({ type: "", content: "" });

    try {
      if (user.role === "admin" || user.role === "writer") {
        const dataToSave = {
          ...profile,
          expertise: profile.expertise.split(",").map(s => s.trim()).filter(Boolean),
          updatedAt: new Date().toISOString()
        };
        
        // Save using the specific doc ID (either existing or generated)
        await saveAuthorProfile(profile.id, dataToSave);
      }
      
      const { updateUserDoc } = await import("@/lib/firestore");
      await updateUserDoc(user.uid, {
        preferences: preferences
      });

      setMsg({ type: "success", content: "Professional profile and subscription preferences updated successfully!" });
    } catch (err) {
      setMsg({ type: "error", content: "Failed to save profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ p: 4 }}>Loading expert profile...</Box>;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ color: "#0f172a", fontFamily: "'Playfair Display', serif" }}>
            My Professional Profile
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Manage your digital authority and E-E-A-T signals
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ 
            bgcolor: "#c0392b", 
            fontWeight: 700, 
            px: 4, 
            borderRadius: 2,
            "&:hover": { bgcolor: "#a93226" }
          }}
        >
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </Stack>

      {msg.content && (
        <Alert severity={msg.type} sx={{ mb: 4, borderRadius: 2 }}>
          {msg.content}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none" }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Core Information</Typography>
              <Stack spacing={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Display Name"
                      variant="outlined"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      helperText="This must match your author name in articles"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Professional Role"
                      variant="outlined"
                      value={profile.role}
                      onChange={(e) => setProfile({...profile, role: e.target.value})}
                      placeholder="e.g. Senior Investigative Reporter"
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Biography"
                  multiline
                  rows={6}
                  variant="outlined"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Tell your readers about your experience and background..."
                />

                <TextField
                  fullWidth
                  label="Expertise / Skills"
                  variant="outlined"
                  value={profile.expertise}
                  onChange={(e) => setProfile({...profile, expertise: e.target.value})}
                  placeholder="e.g. Technology, Politics, Global Affairs (comma separated)"
                  helperText="Boost your E-E-A-T by listing specific areas of knowledge"
                />
              </Stack>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Social & Professional Links</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="X (Twitter) URL"
                    variant="outlined"
                    value={profile.social.twitter}
                    onChange={(e) => setProfile({...profile, social: {...profile.social, twitter: e.target.value}})}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><TwitterIcon sx={{ fontSize: 18 }} /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn URL"
                    variant="outlined"
                    value={profile.social.linkedin}
                    onChange={(e) => setProfile({...profile, social: {...profile.social, linkedin: e.target.value}})}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LinkedInIcon sx={{ fontSize: 18 }} /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Personal Website / Portfolio"
                    variant="outlined"
                    value={profile.social.website}
                    onChange={(e) => setProfile({...profile, social: {...profile.social, website: e.target.value}})}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PublicIcon sx={{ fontSize: 18 }} /></InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={4}>
            <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none", textAlign: "center", p: 4 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 3, color: "#64748b", textTransform: "uppercase" }}>
                Profile Image
              </Typography>
              <Box sx={{ position: "relative", display: "inline-block", mb: 3 }}>
                <Avatar 
                  src={profile.image} 
                  sx={{ width: 120, height: 120, mx: "auto", border: "4px solid #f1f5f9", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                >
                  {profile.name.charAt(0)}
                </Avatar>
                <Box sx={{ position: "absolute", bottom: 0, right: 0 }}>
                  <VerifiedIcon color="primary" />
                </Box>
              </Box>
              <TextField
                fullWidth
                size="small"
                label="Image URL"
                variant="outlined"
                value={profile.image}
                onChange={(e) => setProfile({...profile, image: e.target.value})}
                placeholder="https://..."
                sx={{ mb: 2 }}
              />
              <Typography variant="caption" color="text.secondary">
                Use a professional headshot to build trust with your audience.
              </Typography>
            </Card>

            {/* Newsletter Preferences Card */}
            <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none", p: 3 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2.5, color: "#64748b", textTransform: "uppercase" }}>
                Subscription Preferences
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.weeklySummary}
                      onChange={(e) => setPreferences({ ...preferences, weeklySummary: e.target.checked })}
                      color="error"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={700}>Weekly Digest</Typography>
                      <Typography variant="caption" color="text.secondary">Curated stories every Sunday.</Typography>
                    </Box>
                  }
                />
                <Divider />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.breakingAlerts}
                      onChange={(e) => setPreferences({ ...preferences, breakingAlerts: e.target.checked })}
                      color="error"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={700}>Breaking News</Typography>
                      <Typography variant="caption" color="text.secondary">Instant email alerts for hot stories.</Typography>
                    </Box>
                  }
                />
                <Divider />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.commentReplies}
                      onChange={(e) => setPreferences({ ...preferences, commentReplies: e.target.checked })}
                      color="error"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={700}>Activity Alerts</Typography>
                      <Typography variant="caption" color="text.secondary">Get emails when comments are replied to.</Typography>
                    </Box>
                  }
                />
              </Stack>
            </Card>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: "rgba(192,57,43,0.02)", borderColor: "rgba(192,57,43,0.1)" }}>
              <Typography variant="subtitle2" fontWeight={800} color="error" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <VerifiedIcon fontSize="small" /> E-E-A-T Optimization
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Your profile details are used by Google to determine the authority of your reporting. Ensure your bio highlights your unique experience and expertise in your niche.
              </Typography>
            </Paper>

            {/* Reading History Card */}
            <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none", p: 3 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2.5, color: "#64748b", textTransform: "uppercase" }}>
                Recently Viewed Articles
              </Typography>
              {readingHistory.length === 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Your reading history is empty. As you view articles, they will appear here.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {readingHistory.map((item, idx) => (
                    <Box key={item.id || idx}>
                      <Link href={`/news/${item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <Typography 
                          variant="body2" 
                          fontWeight={700} 
                          sx={{ 
                            "&:hover": { color: "#c0392b" },
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            cursor: "pointer"
                          }}
                        >
                          {item.title}
                        </Typography>
                      </Link>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Chip label={item.category} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: "rgba(0,0,0,0.04)" }} />
                        <Typography variant="caption" color="text.secondary">
                          by {item.authorName}
                        </Typography>
                      </Stack>
                      {idx < readingHistory.length - 1 && <Divider sx={{ mt: 1.5 }} />}
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
