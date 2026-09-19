/**
 * Centralized Advertising Configuration
 * 
 * Defines all ad placements, dimensions, keys, domains, and global controls.
 * To pause all ads sitewide, toggle `enabled: false`.
 */
export const ADS_CONFIG = {
  // Global kill switch for all advertising
  enabled: true,

  // Display discreet "ADVERTISEMENT" label above/below banners
  showLabel: true,

  // Adsterra invoke domain
  scriptHost: "www.highrevenueformat.com",

  // Adsterra Banner Placements
  adsterra: {
    // Desktop Leaderboard on Homepage (728x90)
    homeLeaderboard: {
      key: "c2aa037e57084facffa3af8c79667de9",
      width: 728,
      height: 90,
      format: "iframe",
      title: "Homepage Top Leaderboard",
    },

    // Desktop Leaderboard on Article Detail Page (728x90)
    articleLeaderboard: {
      key: "c2aa037e57084facffa3af8c79667de9",
      width: 728,
      height: 90,
      format: "iframe",
      title: "Article Top Leaderboard",
    },

    // 300x250 Medium Rectangle in Article Sticky Sidebar
    articleSidebar: {
      key: "7b4ab590c7e6c0ec63293079a2da40bd",
      width: 300,
      height: 250,
      format: "iframe",
      title: "Article Sidebar Banner",
    },

    // 300x250 Medium Rectangle injected into Article Body (Primary - Top 1/3)
    articleInContent: {
      key: "7b4ab590c7e6c0ec63293079a2da40bd",
      width: 300,
      height: 250,
      format: "iframe",
      title: "In-Article Primary Banner",
    },

    // 300x250 Medium Rectangle for Long Articles (Secondary - Mid-to-Bottom)
    articleInContentSecondary: {
      key: "7b4ab590c7e6c0ec63293079a2da40bd",
      width: 300,
      height: 250,
      format: "iframe",
      title: "In-Article Secondary Banner",
    },

    // 320x50 Mobile Sticky Footer Ad
    mobileStickyFooter: {
      key: "fd2f33caedbe45d52eae1cc1324603f3",
      width: 320,
      height: 50,
      format: "iframe",
      title: "Mobile Sticky Footer",
    },
  },
};
