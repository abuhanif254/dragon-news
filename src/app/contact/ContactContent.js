"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  Paper,
  TextField,
  Button,
  Alert,
  Snackbar,
  Chip,
  Divider,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GitHubIcon from "@mui/icons-material/GitHub";
import LanguageIcon from "@mui/icons-material/Language";
import { saveContactMessage } from "@/lib/firestore";
import DOMPurify from "isomorphic-dompurify";

const OFFICE_SCHEDULE = [
  { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
  { day: "Saturday", hours: "10:00 AM – 2:00 PM" },
  { day: "Sunday", hours: "Closed" },
];

const isOpenNow = () => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 6=Sat
  const hour = now.getHours();
  if (day === 0) return false;
  if (day === 6) return hour >= 10 && hour < 14;
  return hour >= 9 && hour < 18;
};

const INFO = [
  { Icon: EmailIcon, label: "Email", value: "mohammadbitullah@gmail.com", href: "mailto:mohammadbitullah@gmail.com" },
  { Icon: PhoneIcon, label: "Phone", value: "+8801724010261", href: "tel:+8801724010261" },
  { Icon: LocationOnIcon, label: "Address", value: "2300 Kishoreganj Sadar, Dhaka", href: "https://www.google.com/maps?q=Kishoreganj+Sadar,+Dhaka" },
  { Icon: LanguageIcon, label: "Portfolio", value: "abu-hanif-mia.vercel.app", href: "https://abu-hanif-mia.vercel.app" },
  { Icon: GitHubIcon, label: "GitHub", value: "github.com/abuhanif254", href: "https://github.com/abuhanif254" },
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "'Inter', sans-serif",
    "&:hover fieldset": { borderColor: "#c0392b" },
    "&.Mui-focused fieldset": { borderColor: "#c0392b" },
  },
  "& label.Mui-focused": { color: "#c0392b" },
};

export default function ContactContent({ pageData }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [officeOpen, setOfficeOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setOfficeOpen(isOpenNow());
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (form.message.trim().length < 20) e.message = "Message must be at least 20 characters";
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    
    setLoading(true);
    setSubmitError("");

    try {
      await saveContactMessage(form);
      setOpen(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      {pageData?.content && (
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 5 }}>
          <Box
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pageData.content, { ADD_ATTR: ['target'] }) }}
            sx={{
              "& h2, & h3, & h4": { fontFamily: "'Playfair Display', serif", fontWeight: 800, mt: 3, mb: 2, color: "#1e293b" },
              "& p": { fontSize: "1.05rem", lineHeight: 1.8, color: "text.secondary", mb: 2 },
              "& a": { color: "#c0392b", textDecoration: "none", fontWeight: 600, "&:hover": { textDecoration: "underline" } },
              "& ul, & ol": { pl: 3, mb: 2, color: "text.secondary", fontSize: "1.05rem", lineHeight: 1.8 }
            }}
          />
        </Paper>
      )}

      <Grid container spacing={5}>
        {/* ── Left: Info ── */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2.5} sx={{ mb: 4 }}>
            {INFO.map(({ Icon, label, value, href }) => (
              <Paper
                key={label}
                component="a"
                href={href}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.25s",
                  "&:hover": {
                    borderColor: "#c0392b",
                    transform: "translateX(4px)",
                    boxShadow: "0 4px 16px rgba(192,57,43,0.1)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    backgroundColor: "rgba(192,57,43,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ color: "#c0392b", fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.2 }}>
                    {value}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>

          {/* Office hours */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <AccessTimeIcon sx={{ color: "#c0392b", fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={800}>
                Editorial Hours
              </Typography>
              <Chip
                label={officeOpen ? "Open Now" : "Closed"}
                size="small"
                sx={{
                  ml: "auto",
                  height: 22,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  backgroundColor: officeOpen ? "rgba(39,174,96,0.1)" : "rgba(231,76,60,0.1)",
                  color: officeOpen ? "#27ae60" : "#e74c3c",
                }}
              />
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.2}>
              {OFFICE_SCHEDULE.map(({ day, hours }) => (
                <Stack key={day} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {day}
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color={hours === "Closed" ? "error" : "text.primary"}>
                    {hours}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* ── Right: Form ── */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h5" fontWeight={800} sx={{ fontFamily: "'Playfair Display', serif", mb: 0.5 }}>
              Send Us a Message
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              We typically respond within 24 hours on business days.
            </Typography>

            {submitError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {submitError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    required
                    value={form.name}
                    onChange={handleChange("name")}
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange("email")}
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    required
                    value={form.subject}
                    onChange={handleChange("subject")}
                    error={!!errors.subject}
                    helperText={errors.subject}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Your Message"
                    multiline
                    rows={5}
                    required
                    value={form.message}
                    onChange={handleChange("message")}
                    error={!!errors.message}
                    helperText={errors.message || `${form.message.length} / 20 chars minimum`}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={loading ? null : <SendIcon />}
                    disabled={loading}
                    sx={{
                      background: loading ? undefined : "linear-gradient(135deg, #c0392b, #e74c3c)",
                      px: 4,
                      py: 1.4,
                      fontWeight: 700,
                      borderRadius: 2.5,
                      textTransform: "none",
                      boxShadow: "0 4px 16px rgba(192,57,43,0.3)",
                      fontSize: "1rem",
                      "&:hover": {
                        background: "linear-gradient(135deg, #96281b, #c0392b)",
                        boxShadow: "0 6px 20px rgba(192,57,43,0.4)",
                      },
                    }}
                  >
                    {loading ? "Sending…" : "Send Message"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          icon={<CheckCircleIcon />}
          severity="success"
          variant="filled"
          onClose={() => setOpen(false)}
          sx={{ fontFamily: "'Inter', sans-serif" }}
        >
          Message sent! We&apos;ll get back to you within 24 hours.
        </Alert>
      </Snackbar>
    </Container>
  );
}
