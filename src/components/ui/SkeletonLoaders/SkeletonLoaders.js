import React from "react";
import { Box, Card, CardContent, Skeleton, Stack } from "@mui/material";

export function HeroSkeleton() {
  return (
    <Box sx={{ position: "relative", mb: 6, borderRadius: 4, overflow: "hidden", height: { xs: 450, md: 600 } }}>
      <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: { xs: 3, md: 6 } }}>
        <Skeleton variant="text" width="15%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="80%" height={80} />
        <Skeleton variant="text" width="60%" height={80} sx={{ mb: 3 }} />
        <Stack direction="row" alignItems="center" spacing={2}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box>
            <Skeleton variant="text" width={100} />
            <Skeleton variant="text" width={150} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export function ArticleCardSkeleton({ isHorizontal = false }) {
  return (
    <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: isHorizontal ? { xs: 'column', sm: 'row' } : 'column' }}>
      <Box sx={{ width: isHorizontal ? { xs: '100%', sm: '40%' } : '100%', minHeight: isHorizontal ? { xs: 200, sm: 'auto' } : 240, flexShrink: 0 }}>
        <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
      </Box>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Skeleton variant="text" width="25%" height={32} sx={{ mb: 1.5 }} />
        <Skeleton variant="text" width="90%" height={40} />
        <Skeleton variant="text" width="70%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto', pt: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="text" width={80} />
          </Stack>
          <Skeleton variant="text" width={50} />
        </Stack>
      </CardContent>
    </Card>
  );
}

export function GridSkeleton() {
  return (
    <Box sx={{ mb: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, pb: 2 }}>
        <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1.5 }} />
        <Skeleton variant="text" width={250} height={50} />
      </Box>
      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 66.666%' } }}>
          <ArticleCardSkeleton />
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 33.333%' }, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box sx={{ flex: 1 }}><ArticleCardSkeleton /></Box>
          <Box sx={{ flex: 1 }}><ArticleCardSkeleton /></Box>
        </Box>
      </Box>
    </Box>
  );
}
