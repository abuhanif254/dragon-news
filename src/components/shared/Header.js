import { Box, Container, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/the-brain-landscape-logo.png";
import { getCurrentDate } from "@/utils/getCurrentDate";

const Header = () => {
  const currentDate = getCurrentDate();
  return (
    <Box className="w-full my-8">
      <Container className="flex flex-col items-center">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 1 }}>
            <Image 
              src={logo} 
              alt="The Brain" 
              priority 
              style={{ width: "80px", height: "auto" }} 
            />
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '4rem' }, 
                fontWeight: 900, 
                fontFamily: "'Playfair Display', serif", 
                color: '#1a1a2e', 
                textTransform: 'uppercase',
                letterSpacing: '-0.02em'
              }}
            >
              The Brain
            </Typography>
          </Box>
        </Link>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: "#f39c12", 
            textAlign: "center", 
            fontWeight: 700, 
            letterSpacing: '0.25em', 
            textTransform: 'uppercase', 
            fontSize: '0.75rem', 
            mb: 1 
          }}
        >
          Intelligence Without Fear or Favour
        </Typography>
        <Typography textAlign="center" sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 500 }}>
          {currentDate}
        </Typography>
      </Container>
    </Box>
  );
};

export default Header;
