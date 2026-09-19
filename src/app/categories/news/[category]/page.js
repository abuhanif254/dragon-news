import { getCategoryNews } from "@/utils/getCategoryNews";
import CategoryNewsClient from "./CategoryNewsClient";
import { SITE_NAME, SITE_URL, articleUrl } from "@/lib/site";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const category = decodeURIComponent(resolvedParams.category || "all-news");
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
  
  const { getSiteSettings } = await import("@/lib/firestore");
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || SITE_NAME;
  const categoryCanonical = `${SITE_URL}/categories/news/${encodeURIComponent(category.toLowerCase())}`;
  
  return {
    title: `${formattedCategory} News & Analysis | ${siteName}`,
    description: `Read the latest ${formattedCategory} reporting, independent analysis, and perspectives from ${siteName}.`,
    alternates: {
      canonical: categoryCanonical,
    },
    openGraph: {
      title: `${formattedCategory} News & Analysis | ${siteName}`,
      description: `Read the latest ${formattedCategory} reporting, independent analysis, and perspectives from ${siteName}.`,
      url: categoryCanonical,
      siteName,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${formattedCategory} News & Analysis | ${siteName}`,
      description: `Read the latest ${formattedCategory} reporting, independent analysis, and perspectives from ${siteName}.`,
    },
  };
}

export default async function DynamicNewsPage({ params }) {
  const resolvedParams = await params;
  const category = decodeURIComponent(resolvedParams.category || "all-news");
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
  const categoryCanonical = `${SITE_URL}/categories/news/${encodeURIComponent(category.toLowerCase())}`;
  
  const response = await getCategoryNews(category);
  
  if (!response.status) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: "#c0392b", fontWeight: 800 }}>Database Connection Error</h2>
        <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '24px' }}>
          The Brain was unable to retrieve this category from the database. This is usually caused by a network block or firewall on your local machine.
        </p>
        <code style={{ display: 'block', padding: '12px', background: '#f5f5f5', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '24px' }}>
          Error: {response.message}
        </code>
      </div>
    );
  }

  const data = response.data || [];

  // ── JSON-LD Structured Data: CollectionPage + ItemList + Breadcrumbs ──
  const categorySchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${categoryCanonical}#webpage`,
        url: categoryCanonical,
        name: `${formattedCategory} News & Analysis`,
        description: `Curated news and articles under the ${formattedCategory} category.`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: formattedCategory, item: categoryCanonical },
          ],
        },
      },
      {
        "@type": "ItemList",
        name: `${formattedCategory} Articles`,
        itemListElement: data.slice(0, 10).map((art, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: articleUrl(art),
          name: art.title,
        })),
      },
    ],
  };

  return (
    <>
      <script
        id="category-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />
      <CategoryNewsClient data={data} category={category} />
    </>
  );
}
