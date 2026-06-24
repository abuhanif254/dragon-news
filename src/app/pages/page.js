import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import Link from "next/link";
import { NAV_ITEMS } from "@/utils/navItems";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export const metadata = {
  title: "Site Directory | The Brain",
  description: "Directory of all active pages on The Brain portal.",
};

const PagesDirectory = () => {
  return (
    <Container className="my-10 min-h-[60vh] py-10">
      <Typography
        variant="h3"
        fontWeight={700}
        gutterBottom
        align="center"
        className="mb-10 text-gray-800"
      >
        Site Directory
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" className="mb-10 max-w-2xl mx-auto">
        Explore all sections of The Brain portal. From our latest breaking stories to our contact and about pages, find exactly what you're looking for below.
      </Typography>

      <Grid container spacing={4} className="mt-4">
        {NAV_ITEMS.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.route}>
            <Link href={item.pathname} style={{ textDecoration: "none" }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "0.2s",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 4, borderLeft: "4px solid #ef4444" },
                }}
              >
                <CardActionArea sx={{ flexGrow: 1, p: 3 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {item.route}
                    </Typography>
                    <ArrowForwardIosIcon fontSize="small" sx={{ color: "#ef4444" }} />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    Access the {item.route.toLowerCase()} section to view {item.route === 'Home' ? 'top headlines' : 'related content'}.
                  </Typography>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PagesDirectory;
