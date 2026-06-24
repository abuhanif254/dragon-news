import { Box, Container, Divider, Grid, Typography, Stack, Avatar, Paper } from "@mui/material";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GavelIcon from "@mui/icons-material/Gavel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";

export const metadata = {
  title: "About Us | Dragon News",
  description:
    "Learn about Dragon News — your trusted source for Technology, Sports, Culture, and Entertainment news.",
};

const TEAM = [
  { name: "Alex Morgan", role: "Editor-in-Chief", initials: "AM" },
  { name: "Jamie Lee", role: "Technology Editor", initials: "JL" },
  { name: "Sam Rivera", role: "Sports Correspondent", initials: "SR" },
  { name: "Taylor Kim", role: "Culture & Arts", initials: "TK" },
];

const VALUES = [
  {
    icon: <GavelIcon sx={{ color: "#c0392b", fontSize: 28 }} />,
    title: "Integrity",
    desc: "We report the facts, free from bias or external influence.",
  },
  {
    icon: <VisibilityIcon sx={{ color: "#c0392b", fontSize: 28 }} />,
    title: "Transparency",
    desc: "Our sources and methods are always open to scrutiny.",
  },
  {
    icon: <AutoStoriesIcon sx={{ color: "#c0392b", fontSize: 28 }} />,
    title: "Depth",
    desc: "We go beyond headlines to deliver thoughtful analysis.",
  },
  {
    icon: <EmojiEventsIcon sx={{ color: "#c0392b", fontSize: 28 }} />,
    title: "Excellence",
    desc: "Award-winning journalism crafted with precision and care.",
  },
];

const STATS = [
  { Icon: NewspaperIcon, value: "12,000+", label: "Articles Published" },
  { Icon: GroupsIcon, value: "2.4M+", label: "Monthly Readers" },
  { Icon: EmojiEventsIcon, value: "18", label: "Press Awards" },
];

const AboutPage = () => {
  return (
    <Box sx={{ mb: 8 }}>
      {/* ── Hero Banner ── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #c0392b 100%)",
          borderRadius: { xs: 0, md: 3 },
          px: { xs: 3, md: 8 },
          py: { xs: 6, md: 9 },
          mb: 7,
          mt: 4,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 40%)",
          },
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.2em", display: "block", mb: 1 }}
        >
          Who We Are
        </Typography>
        <Typography
          variant="h2"
          fontWeight={900}
          sx={{
            fontFamily: "'Playfair Display', serif",
            color: "white",
            fontSize: { xs: "2rem", md: "3rem" },
            lineHeight: 1.2,
            mb: 2.5,
          }}
        >
          The Brain
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255,255,255,0.75)",
            maxWidth: 600,
            mx: "auto",
            lineHeight: 1.8,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Delivering accurate, fearless, and engaging journalism to readers worldwide since 2020.{" "}
          <em>Journalism Without Fear or Favour.</em>
        </Typography>
      </Box>

      <Container maxWidth="lg">
        {/* ── Stats Bar ── */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {STATS.map(({ Icon, value, label }) => (
            <Grid key={label} item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all 0.25s",
                  "&:hover": {
                    borderColor: "#c0392b",
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(192,57,43,0.12)",
                  },
                }}
              >
                <Icon sx={{ fontSize: 36, color: "#c0392b", mb: 1 }} />
                <Typography
                  variant="h4"
                  fontWeight={900}
                  sx={{ fontFamily: "'Playfair Display', serif", color: "#c0392b" }}
                >
                  {value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
                  {label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ── Our Mission ── */}
        <Grid container spacing={6} alignItems="center" sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <div className="section-header" style={{ marginBottom: 16 }}>Our Mission</div>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ fontFamily: "'Playfair Display', serif", lineHeight: 1.3, mb: 2.5 }}
            >
              Fearless Reporting for a Better-Informed World
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, mb: 2 }}>
              <strong>Dragon News</strong> was founded with a singular mission: to provide readers with
              news that is accurate, timely, and completely free of editorial bias. We believe an
              informed citizenry is the foundation of a healthy democracy.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
              Every article on Dragon News is vetted by our experienced editorial team. We follow strict
              journalistic standards and are committed to correcting any errors swiftly and transparently.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                background: "linear-gradient(135deg, #fff8f8 0%, #ffeaea 100%)",
                borderRadius: 4,
                p: 4,
                border: "1px solid rgba(192,57,43,0.12)",
              }}
            >
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ fontFamily: "'Playfair Display', serif", mb: 1.5, color: "#c0392b" }}
              >
                &ldquo;Journalism Without Fear or Favour&rdquo;
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontStyle: "italic" }}>
                This isn&apos;t just a tagline — it&apos;s the principle that guides every story we publish,
                every source we verify, and every decision we make in our newsroom.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 8 }} />

        {/* ── Values ── */}
        <Box sx={{ mb: 8 }}>
          <div className="section-header" style={{ marginBottom: 24 }}>Our Values</div>
          <Grid container spacing={3}>
            {VALUES.map(({ icon, title, desc }) => (
              <Grid key={title} item xs={12} sm={6} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                    transition: "all 0.25s",
                    "&:hover": {
                      borderColor: "#c0392b",
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(192,57,43,0.1)",
                    },
                  }}
                >
                  <Box sx={{ mb: 2 }}>{icon}</Box>
                  <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Playfair Display', serif", mb: 1 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ mb: 8 }} />

        {/* ── Team ── */}
        <Box>
          <div className="section-header" style={{ marginBottom: 24 }}>Meet the Team</div>
          <Grid container spacing={3}>
            {TEAM.map(({ name, role, initials }) => (
              <Grid key={name} item xs={6} sm={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.25s",
                    "&:hover": {
                      borderColor: "#c0392b",
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(192,57,43,0.1)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: "auto",
                      mb: 2,
                      background: "linear-gradient(135deg, #c0392b, #1a1a2e)",
                      fontSize: "1.2rem",
                      fontWeight: 800,
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={800}>
                    {name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {role}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPage;
