import { Box, Container, Grid, Skeleton, Stack } from "@mui/material";

export default function Loading() {
  return (
    <Container sx={{ py: 4 }}>
      {/* Hero card skeleton */}
      <Skeleton
        variant="rectangular"
        width="100%"
        sx={{ height: { xs: 220, md: 440 }, borderRadius: 3, mb: 3 }}
        animation="wave"
      />

      {/* Section label */}
      <Skeleton variant="text" width={140} height={20} sx={{ mb: 2 }} animation="wave" />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2.5, mb: 1 }} animation="wave" />
                <Skeleton variant="text" width="80%" height={28} animation="wave" />
                <Skeleton variant="text" width="50%" height={18} animation="wave" />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2.5, mb: 2 }} animation="wave" />
          <Skeleton variant="text" width={120} height={20} sx={{ mb: 1.5 }} animation="wave" />
          <Stack spacing={1.5}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                <Skeleton variant="rectangular" width={26} height={26} sx={{ borderRadius: 1, flexShrink: 0 }} animation="wave" />
                <Skeleton variant="rectangular" width={90} height={72} sx={{ borderRadius: 1.5, flexShrink: 0 }} animation="wave" />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="90%" height={22} animation="wave" />
                  <Skeleton variant="text" width="60%" height={16} animation="wave" />
                </Box>
              </Stack>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
