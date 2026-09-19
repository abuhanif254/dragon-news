/**
 * Centralized Advertising Configuration
 * 
 * Defines all ad placements, dimensions, keys, and global controls.
 * To pause all ads sitewide, toggle `enabled: false`.
 */
export const ADS_CONFIG = {
  // Global kill switch for all advertising
  enabled: true,

  // Display discreet "ADVERTISEMENT" label above/below banners
  showLabel: true,

  // Adsterra Banner Placements
  adsterra: {
    // Desktop Leaderboard on Homepage
    homeLeaderboard: {
      key: "c2aa037e57084facffa3af8c79667de9",
      width: 728,
      height: 90,
      format: "iframe",
      title: "Homepage Top Leaderboard",
    },

    // Desktop Leaderboard on Article Detail Page
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

    // 300x250 Medium Rectangle injected into Article Body
    articleInContent: {
      key: "7b4ab590c7e6c0ec63293079a2da40bd",
      width: 300,
      height: 250,
      format: "iframe",
      title: "In-Article Content Banner",
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
