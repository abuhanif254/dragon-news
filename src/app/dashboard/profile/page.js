"use client";
import { useState, useEffect } from "react";
import { 
  Box, Typography, Card, CardContent, TextField, Button, 
  Stack, Grid, Avatar, Alert, Divider, Chip, IconButton,
  InputAdornment, Paper
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PublicIcon from "@mui/icons-material/Public";
import VerifiedIcon from "@mui/icons-material/Verified";
import { getAuthorProfile, saveAuthorProfile } from "@/lib/firestore";

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

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => {
      if (u) {
        setUser(u);
        setProfile(prev => ({ ...prev, name: u.displayName || u.name || "" }));
        fetchProfile(u.displayName || u.name);
      }
    });
    return () => unsubscribe();
  }, []);

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
      const dataToSave = {
        ...profile,
        expertise: profile.expertise.split(",").map(s => s.trim()).filter(Boolean),
        updatedAt: new Date().toISOString()
      };
      
      // Save using the specific doc ID (either existing or generated)
      await saveAuthorProfile(profile.id, dataToSave);
      setMsg({ type: "success", content: "Professional profile updated successfully! Your E-E-A-T signals are now live." });
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

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: "rgba(192,57,43,0.02)", borderColor: "rgba(192,57,43,0.1)" }}>
              <Typography variant="subtitle2" fontWeight={800} color="error" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <VerifiedIcon fontSize="small" /> E-E-A-T Optimization
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Your profile details are used by Google to determine the authority of your reporting. Ensure your bio highlights your unique experience and expertise in your niche.
              </Typography>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
