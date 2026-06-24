import React from "react";
import { 
  Box, Container, Typography, Stack, Paper, Divider, 
  List, ListItem, ListItemText, ListItemIcon, Grid
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CookieIcon from "@mui/icons-material/Cookie";
import GavelIcon from "@mui/icons-material/Gavel";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export const metadata = {
  title: "Privacy Policy | The Brain - Intelligence Without Fear or Favour",
  description: "Learn how The Brain collects, uses, and protects your personal data. Our privacy policy outlines our commitment to transparency and user security.",
  keywords: ["privacy policy", "data protection", "the brain news", "user security", "GDPR compliance"],
};

const PrivacyPolicyPage = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const SECTIONS = [
    {
      title: "1. Introduction",
      icon: <VisibilityIcon color="error" />,
      content: "Welcome to The Brain. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you."
    },
    {
      title: "2. The Data We Collect",
      icon: <VerifiedUserIcon color="error" />,
      content: "We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:",
      list: [
        "Identity Data: Includes first name, last name, username or similar identifier.",
        "Contact Data: Includes email address and telephone numbers.",
        "Technical Data: Includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.",
        "Usage Data: Includes information about how you use our website, products and services."
      ]
    },
    {
      title: "3. How We Use Your Data",
      icon: <SecurityIcon color="error" />,
      content: "We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:",
      list: [
        "To provide and maintain our Service, including to monitor the usage of our Service.",
        "To manage your Account: to manage your registration as a user of the Service.",
        "To contact You: To contact you by email or other equivalent forms of electronic communication.",
        "To provide You with news, special offers and general information about other goods, services and events."
      ]
    },
    {
      title: "4. Cookies and Tracking",
      icon: <CookieIcon color="error" />,
      content: "We use cookies and similar tracking technologies to track the activity on our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service."
    },
    {
      title: "5. Data Security",
      icon: <SecurityIcon color="error" />,
      content: "We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know."
    },
    {
      title: "6. Your Legal Rights",
      icon: <GavelIcon color="error" />,
      content: "Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent."
    },
    {
      title: "7. Contact Us",
      icon: <ContactSupportIcon color="error" />,
      content: "If you have any questions about this privacy policy or our privacy practices, please contact our data privacy manager in the following ways:",
      list: [
        "Email address: mohammadbitullah@gmail.com",
        "Phone number: +8801724010261",
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
          Privacy Policy
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Last Updated: {lastUpdated}
        </Typography>
        <Divider sx={{ mt: 4, width: "60px", mx: "auto", borderBottomWidth: 3, borderColor: "error.main" }} />
      </Box>

      {/* Content Section */}
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

        {/* Sidebar / Quick Links */}
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
                Summary
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                At The Brain, your privacy is our priority. We only collect essential data to improve your news experience and we never sell your information to third parties.
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 1, textTransform: "uppercase" }}>
                Key Commitments
              </Typography>
              <Stack spacing={2}>
                {[
                  "No Data Selling",
                  "Top-Tier Encryption",
                  "Complete Transparency",
                  "GDPR & CCPA Compliant"
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

export default PrivacyPolicyPage;
