import React from "react";
import { 
  Box, Container, Typography, Stack, Paper, Divider, 
  List, ListItem, ListItemText, Grid 
} from "@mui/material";
import CookieIcon from "@mui/icons-material/Cookie";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import SecurityIcon from "@mui/icons-material/Security";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export const metadata = {
  title: "Cookie Policy | The Brain - Intelligence Without Fear or Favour",
  description: "Learn how The Brain uses cookies to improve your news experience. This policy explains what cookies are and how you can manage your preferences.",
  keywords: ["cookie policy", "browser cookies", "the brain news", "data tracking", "privacy settings"],
};

const CookiePolicyPage = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const SECTIONS = [
    {
      title: "1. What Are Cookies?",
      icon: <CookieIcon color="error" />,
      content: "Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site."
    },
    {
      title: "2. How We Use Cookies",
      icon: <SettingsIcon color="error" />,
      content: "The Brain uses cookies in several ways to improve your experience on our site, including keeping you signed in, understanding how you use our site, and providing content that is relevant to you.",
      list: [
        "Necessary Cookies: Essential for the operation of our site.",
        "Analytical Cookies: Help us understand how visitors interact with our website.",
        "Functional Cookies: Remember choices you make to improve your experience.",
        "Targeting Cookies: Record your visit and the pages you have followed."
      ]
    },
    {
      title: "3. Types of Cookies We Use",
      icon: <BarChartIcon color="error" />,
      content: "We use both first-party and third-party cookies on our website. First-party cookies are cookies set by the website you're visiting. Third-party cookies are set by other sites that provide content or services on the page you are viewing."
    },
    {
      title: "4. Managing Cookies",
      icon: <SecurityIcon color="error" />,
      content: "Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit www.aboutcookies.org or www.allaboutcookies.org."
    },
    {
      title: "5. Policy Updates",
      icon: <VerifiedUserIcon color="error" />,
      content: "We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed."
    },
    {
      title: "6. More Information",
      icon: <HelpOutlineIcon color="error" />,
      content: "If you have any questions about our use of cookies or other technologies, please email us at:",
      list: [
        "Email: mohammadbitullah@gmail.com",
        "Phone: +8801724010261",
        "Address: 2300 Kishoreganj Sadar, Dhaka"
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography 
          variant="h2" 
          fontWeight={900} 
          sx={{ 
            fontFamily: "'Playfair Display', serif", 
            mb: 2,
            background: "linear-gradient(90deg, #1a1a2e, #c0392b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Cookie Policy
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Last Updated: {lastUpdated}
        </Typography>
        <Divider sx={{ mt: 4, width: "60px", mx: "auto", borderBottomWidth: 3, borderColor: "error.main" }} />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Stack spacing={4}>
            {SECTIONS.map((section, index) => (
              <Paper 
                key={index} 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: 4, 
                  border: "1px solid", 
                  borderColor: "divider",
                  transition: "0.3s",
                  "&:hover": { boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  {section.icon}
                  <Typography variant="h5" fontWeight={800} sx={{ fontFamily: "'Playfair Display', serif" }}>
                    {section.title}
                  </Typography>
                </Stack>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: section.list ? 2 : 0 }}>
                  {section.content}
                </Typography>
                {section.list && (
                  <List sx={{ pl: 2 }}>
                    {section.list.map((item, i) => (
                      <ListItem key={i} sx={{ display: "list-item", listStyleType: "disc", color: "text.secondary", py: 0.5 }}>
                        <ListItemText 
                          primary={item} 
                          primaryTypographyProps={{ variant: "body2", sx: { lineHeight: 1.6 } }} 
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ position: "sticky", top: 100 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: 4, 
                background: "rgba(26, 26, 46, 0.02)", 
                border: "1px solid", 
                borderColor: "divider" 
              }}
            >
              <Typography variant="h6" fontWeight={800} sx={{ mb: 3, fontFamily: "'Playfair Display', serif" }}>
                Quick Info
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                We use cookies to ensure you get the best experience on our website. You can adjust your browser settings to decline cookies at any time.
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 1, textTransform: "uppercase" }}>
                Cookie Usage
              </Typography>
              <Stack spacing={2}>
                {[
                  "Essential Functions",
                  "Analytics & Traffic",
                  "User Preferences",
                  "Session Security"
                ].map((item) => (
                  <Stack key={item} direction="row" alignItems="center" spacing={1}>
                    <VerifiedUserIcon sx={{ fontSize: 16, color: "success.main" }} />
                    <Typography variant="body2" fontWeight={600}>{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CookiePolicyPage;
