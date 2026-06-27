import { Box, Container, Grid, Skeleton, Stack } from "@mui/material";
import { HeroSkeleton, GridSkeleton, ArticleCardSkeleton } from "@/components/ui/SkeletonLoaders/SkeletonLoaders";

export default function Loading() {
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: 1 }} animation="wave" />
      </Box>
      
      <HeroSkeleton />
      <GridSkeleton />
      
      <Grid container spacing={5} sx={{ mt: 4 }}>
        <Grid item xs={12} md={8}>
          <Stack spacing={4}>
            {[1, 2, 3].map((i) => (
              <ArticleCardSkeleton key={i} isHorizontal={true} />
            ))}
          </Stack>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 3, mb: 4 }} animation="wave" />
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 3 }} animation="wave" />
        </Grid>
      </Grid>
    </Box>
  );
}
