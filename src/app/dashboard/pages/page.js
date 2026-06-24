"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  Grid,
  Chip,
  CircularProgress,
  Stack,
  Button
} from "@mui/material";
import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";
import ArticleIcon from "@mui/icons-material/Article";
import { getAllPages } from "@/lib/firestore";

const PREDEFINED_PAGES = [
  { slug: "about", title: "About Us", description: "The story behind The Brain." },
  { slug: "contact", title: "Contact Us", description: "How users can reach you." },
  { slug: "privacy-policy", title: "Privacy Policy", description: "Data collection and usage policy." },
  { slug: "terms", title: "Terms of Service", description: "Rules and terms for users." }
];

export default function PagesDashboard() {
  const [pages, setPages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const allPages = await getAllPages();
      const pageMap = {};
      allPages.forEach(p => {
        pageMap[p.slug] = p;
      });
      setPages(pageMap);
    } catch (err) {
      console.error("Error fetching pages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      setLoading(true);
      
      const seedPages = [
        {
          slug: "about",
          title: "About Us",
          content: `<h2>Our Story and Vision</h2>
<p>Welcome to The Brain. In an era saturated with misinformation and fleeting headlines, the need for deep, analytical, and uncompromising journalism has never been greater. We were founded on a singular, powerful premise: to deliver intelligence without fear or favour.</p>
<p>From our humble beginnings, The Brain has evolved into a premier digital destination for those who seek more than just the news. We are a collective of seasoned journalists, data scientists, industry experts, and critical thinkers who believe that access to the truth is a fundamental right.</p>
<h2>What Sets Us Apart</h2>
<h3>Uncompromising Editorial Independence</h3>
<p>We are not beholden to corporate sponsors, political action committees, or hidden agendas. Our loyalty lies entirely with you, the reader.</p>`
        },
        {
          slug: "privacy-policy",
          title: "Privacy Policy",
          content: `<h2>1. Introduction</h2>
<p>At The Brain, we respect your privacy and are committed to protecting your personal data.</p>
<h2>2. The Data We Collect About You</h2>
<p>Personal data, or personal information, means any information about an individual from which that person can be identified.</p>
<ul>
  <li><strong>Identity Data:</strong> includes first name, maiden name, last name, username or similar identifier, marital status, title, date of birth and gender.</li>
  <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
</ul>`
        },
        {
          slug: "terms",
          title: "Terms of Service",
          content: `<h2>1. Terms</h2>
<p>By accessing the website at The Brain, you are agreeing to be bound by these terms of service.</p>
<h2>2. Use License</h2>
<p>Permission is granted to temporarily download one copy of the materials (information or software) on The Brain's website for personal, non-commercial transitory viewing only.</p>`
        },
        {
          slug: "cookies",
          title: "Cookie Policy",
          content: `<h2>1. What Are Cookies?</h2>
<p>Cookies are small text files that are stored on your computer or mobile device when you visit a website.</p>
<h2>2. How We Use Cookies</h2>
<p>The Brain uses cookies in several ways to improve your experience on our site, including keeping you signed in, understanding how you use our site, and providing content that is relevant to you.</p>`
        },
        {
          slug: "contact",
          title: "Contact Us",
          content: `<h2>Get in Touch</h2>
<p>We'd love to hear from you. Whether you have a question about our reporting, want to pitch a story, or need assistance with your account, our team is ready to answer all your questions.</p>
<h2>Contact Information</h2>
<p><strong>Email Address:</strong><br/>
General Inquiries: info@thebrain.com<br/>
Editorial Team: editors@thebrain.com<br/>
Support: support@thebrain.com</p>`
        }
      ];

      const { savePage } = await import("@/lib/firestore");
      
      for (const p of seedPages) {
        await savePage(p.slug, {
          title: p.title,
          content: p.content,
          status: "published"
        });
      }
      
      alert("Pages seeded successfully!");
      fetchPages();
    } catch (err) {
      console.error(err);
      alert("Error seeding pages.");
    } finally {
      setLoading(false);
    }
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
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#1e293b", mb: 0.5 }}>
            Static Pages CMS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage the content of your core website pages.
          </Typography>
        </Box>
        <Button variant="outlined" color="primary" onClick={handleSeed}>
          Seed Default Content
        </Button>
      </Box>

      <Grid container spacing={3}>
        {PREDEFINED_PAGES.map((pageDef) => {
          const isPublished = !!pages[pageDef.slug];
          return (
            <Grid item xs={12} md={6} key={pageDef.slug}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: "100%", display: "flex", flexDirection: "column" }}>
                <Box sx={{ p: 3, flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ 
                        width: 40, height: 40, borderRadius: "50%", 
                        bgcolor: isPublished ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <ArticleIcon sx={{ color: isPublished ? "#10b981" : "#f59e0b" }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">{pageDef.title}</Typography>
                        <Typography variant="caption" color="text.secondary">/{pageDef.slug}</Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={isPublished ? "Published" : "Draft"} 
                      size="small" 
                      color={isPublished ? "success" : "warning"}
                      sx={{ fontWeight: "bold" }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {pageDef.description}
                  </Typography>
                </Box>
                <CardActionArea 
                  component={Link} 
                  href={`/dashboard/pages/edit/${pageDef.slug}`}
                  sx={{ 
                    bgcolor: "#f8fafc", 
                    p: 2, 
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "center",
                    color: "#3b82f6"
                  }}
                >
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="button" fontWeight="bold">
                    Edit Content
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
