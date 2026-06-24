import React from "react";
import { 
  Box, Container, Typography, Stack, Paper, Divider, 
  List, ListItem, ListItemText, Grid 
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import ArticleIcon from "@mui/icons-material/Article";
import PersonIcon from "@mui/icons-material/Person";
import CopyrightIcon from "@mui/icons-material/Copyright";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export const metadata = {
  title: "Terms of Service | The Brain - Intelligence Without Fear or Favour",
  description: "Read the Terms of Service for The Brain. This document outlines the rules and regulations for using our news platform and services.",
  keywords: ["terms of service", "user agreement", "the brain news", "legal terms", "usage rules"],
};

const TermsOfServicePage = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const SECTIONS = [
    {
      title: "1. Acceptance of Terms",
      icon: <VerifiedUserIcon color="error" />,
      content: "By accessing and using The Brain, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services."
    },
    {
      title: "2. Description of Service",
      icon: <ArticleIcon color="error" />,
      content: "The Brain provides users with access to a rich collection of resources, including various news reporting tools, forums, search services, and personalized content through its network of properties which may be accessed through any various medium or device now known or hereafter developed."
    },
    {
      title: "3. User Conduct",
      icon: <PersonIcon color="error" />,
      content: "You understand that all information, data, text, software, music, sound, photographs, graphics, video, messages or other materials, whether publicly posted or privately transmitted, are the sole responsibility of the person from whom such Content originated.",
      list: [
        "You agree not to use the Service to upload, post, or otherwise transmit any Content that is unlawful, harmful, threatening, or abusive.",
        "You agree not to impersonate any person or entity, including, but not limited to, a The Brain official.",
        "You agree not to forge headers or otherwise manipulate identifiers in order to disguise the origin of any Content transmitted through the Service."
      ]
    },
    {
      title: "4. Intellectual Property",
      icon: <CopyrightIcon color="error" />,
      content: "All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of The Brain or its content suppliers and protected by international copyright laws."
    },
    {
      title: "5. Termination",
      icon: <ErrorOutlineIcon color="error" />,
      content: "You agree that The Brain may, under certain circumstances and without prior notice, immediately terminate your account, any associated email address, and access to the Service. Cause for such termination shall include, but not be limited to, breaches or violations of the TOS or other incorporated agreements."
    },
    {
      title: "6. Disclaimer of Warranties",
      icon: <GavelIcon color="error" />,
      content: "You expressly understand and agree that your use of the service is at your sole risk. The service is provided on an 'as is' and 'as available' basis. The Brain expressly disclaims all warranties of any kind, whether express or implied, including, but not limited to the implied warranties of merchantability and fitness for a particular purpose."
    },
    {
      title: "7. Limitation of Liability",
      icon: <ErrorOutlineIcon color="error" />,
      content: "You expressly understand and agree that The Brain shall not be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses."
    },
    {
      title: "8. Contact Information",
      icon: <ContactSupportIcon color="error" />,
      content: "If you have any questions regarding these Terms of Service, please contact us at:",
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
          Terms of Service
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
                Quick Summary
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                By using The Brain, you agree to follow our rules and respect our community. We provide news as-is and expect all users to engage respectfully and lawfully.
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 1, textTransform: "uppercase" }}>
                Essential Rules
              </Typography>
              <Stack spacing={2}>
                {[
                  "Respect Copyright",
                  "No Illegal Content",
                  "Accurate Information",
                  "Lawful Usage Only"
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

export default TermsOfServicePage;
