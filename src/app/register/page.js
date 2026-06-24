"use client";
import { useState } from "react";
import {
  Box, Grid, Typography, TextField, Button, Alert,
  Stack, Divider
} from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { loginWithGoogle, registerWithEmailPassword } from "@/lib/auth-service";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const router = useRouter();

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      document.cookie = `admin_token=google_session; path=/; max-age=604800`;
      router.push("/dashboard");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      await registerWithEmailPassword(formData);
      document.cookie = `admin_token=email_session; path=/; max-age=604800`;
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <Typography variant="h3" fontWeight={900} color="white" sx={{ fontFamily: "'Playfair Display', serif", mb: 2 }}>
            Join The Brain
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.7)" sx={{ mb: 4, maxWidth: 400 }}>
            Start your journey as a digital journalist. Create your account today and contribute to global breaking news.
          </Typography>
          <Stack spacing={2}>
            {["Collaborate with experts", "Publish worldwide", "Build your authority"].map(text => (
              <Stack key={text} direction="row" spacing={2} alignItems="center">
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#f39c12" }} />
                <Typography color="white" fontWeight={500}>{text}</Typography>
              </Stack>
            ))}
          </Stack>
        </Grid>

        {/* Form Side */}
        <Grid item xs={12} md={7} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", px: { xs: 3, md: 8 }, py: 6 }}>
          <Link href="/login" style={{ alignSelf: "flex-start", marginBottom: 32 }}>
            <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
              <ArrowBackIcon fontSize="small" />
              <Typography variant="body2">Back to Login</Typography>
            </Stack>
          </Link>

          <Box sx={{ maxWidth: 440, width: "100%", mx: "auto" }}>
            <Stack spacing={1} sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight={900} sx={{ fontFamily: "'Playfair Display', serif" }}>
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Register as a contributor to start publishing articles.
              </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <Stack spacing={3}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleGoogleRegister}
                disabled={loading}
                startIcon={<Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={20} height={20} alt="G" />}
                sx={{ py: 1.5, borderRadius: 2.5, borderColor: "#e2e8f0", color: "#475569", fontWeight: 700, textTransform: "none" }}
              >
                Sign Up with Google
              </Button>

              <Box sx={{ py: 1 }}>
                <Divider><Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>OR REGISTER WITH EMAIL</Typography></Divider>
              </Box>

              <Stack spacing={2} component="form" onSubmit={handleEmailRegister}>
                <TextField
                  fullWidth
                  required
                  label="Full Name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  required
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  required
                  label="Create Password"
                  type="password"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                
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
                  Create Journalist Account
                </Button>
              </Stack>

              <Typography variant="body2" align="center" color="text.secondary">
                Already have an account? <Link href="/login" style={{ color: "#c0392b", fontWeight: 700 }}>Sign In</Link>
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterPage;
