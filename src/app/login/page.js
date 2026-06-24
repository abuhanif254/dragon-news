"use client";
import { useState } from "react";
import {
  Box, Grid, Typography, TextField, Button, Alert, IconButton,
  InputAdornment, FormControlLabel, Checkbox, Paper, Stack, Divider
} from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/the-brain-logo.png";
import Link from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import SecurityIcon from "@mui/icons-material/Security";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { loginWithEmailPassword } from "@/lib/auth-service";

const FEATURES = [
  "Manage breaking news articles",
  "Moderate comments & readers",
  "Access analytics dashboard",
  "Control site-wide settings",
];

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await loginWithEmailPassword(email, password);
      const idToken = await user.getIdToken?.();
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (data.status) {
        const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
        document.cookie = `admin_token=${data.token}; path=/; max-age=${maxAge}`;
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.message || "Authentication failed.");
      }
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { loginWithGoogle } = await import("@/lib/auth-service");
      await loginWithGoogle();
      document.cookie = `admin_token=google_session; path=/; max-age=604800`;
      router.push("/dashboard");
    } catch (err) {
      setError("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      "&:hover fieldset": { borderColor: "#c0392b" },
      "&.Mui-focused fieldset": { borderColor: "#c0392b" },
    },
    "& label.Mui-focused": { color: "#c0392b" },
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#f8fafc" }}>
      <Grid container sx={{ minHeight: "100vh" }}>
        {/* Brand Side */}
        <Grid item xs={false} md={5} sx={{ 
          display: { xs: "none", md: "flex" }, 
          flexDirection: "column", 
          justifyContent: "center", 
          px: 6,
          background: "linear-gradient(160deg, #1a1a2e 0%, #c0392b 100%)",
        }}>
          <Link href="/">
            <Image src={logo} width={80} height={80} alt="Logo" style={{ filter: "brightness(0) invert(1)", marginBottom: 32 }} />
          </Link>
          <Typography variant="h3" fontWeight={900} color="white" sx={{ fontFamily: "'Playfair Display', serif", mb: 2 }}>
            The Brain <br /> <span style={{ color: "#f39c12" }}>Admin Portal</span>
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.7)" sx={{ mb: 4, maxWidth: 400 }}>
            Central command for The Brain editorial team. Secure, fast, and powerful.
          </Typography>
          <Stack spacing={2}>
            {FEATURES.map(f => (
              <Stack key={f} direction="row" spacing={2} alignItems="center">
                <NewspaperIcon sx={{ color: "#f39c12", fontSize: 20 }} />
                <Typography color="white" variant="body2">{f}</Typography>
              </Stack>
            ))}
          </Stack>
        </Grid>

        {/* Form Side */}
        <Grid item xs={12} md={7} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", px: { xs: 3, md: 10 } }}>
          <Box sx={{ maxWidth: 440, width: "100%", mx: "auto" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#64748b", textDecoration: "none", marginBottom: 32 }}>
              <ArrowBackIcon fontSize="small" />
              <Typography variant="body2" fontWeight={600}>Back to Home</Typography>
            </Link>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#1a1a2e" }}><LockIcon sx={{ color: "white" }} /></Box>
              <Box>
                <Typography variant="h5" fontWeight={900} sx={{ fontFamily: "'Playfair Display', serif" }}>Sign In</Typography>
                <Typography variant="caption" color="text.secondary">Secure access to your newsroom</Typography>
              </Box>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <Stack spacing={3}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleGoogleLogin}
                disabled={loading}
                startIcon={<Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={20} height={20} alt="G" />}
                sx={{ py: 1.5, borderRadius: 2.5, borderColor: "#e2e8f0", color: "#475569", fontWeight: 700, textTransform: "none" }}
              >
                Continue with Google
              </Button>

              <Box sx={{ py: 1 }}>
                <Divider><Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>OR SIGN IN WITH EMAIL</Typography></Divider>
              </Box>

              <form onSubmit={handleLogin}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={fieldSx}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={fieldSx}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <FormControlLabel
                      control={<Checkbox size="small" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} sx={{ color: "#c0392b", "&.Mui-checked": { color: "#c0392b" } }} />}
                      label={<Typography variant="body2">Remember me</Typography>}
                    />
                  </Stack>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ 
                      py: 1.5, borderRadius: 2.5, bgcolor: "#c0392b", fontWeight: 800, textTransform: "none",
                      boxShadow: "0 4px 12px rgba(192,57,43,0.3)",
                      "&:hover": { bgcolor: "#a93226" }
                    }}
                  >
                    {loading ? "Authenticating..." : "Sign In to Dashboard"}
                  </Button>
                </Stack>
              </form>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#f1f5f9", border: "1px solid #e2e8f0" }}>
                <SecurityIcon sx={{ fontSize: 18, color: "#64748b" }} />
                <Typography variant="caption" color="text.secondary">Protected by Firebase Authentication. Safe & Secure.</Typography>
              </Stack>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginPage;
