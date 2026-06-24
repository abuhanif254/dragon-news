import { getCategoryNews } from "@/utils/getCategoryNews";
import CategoryNewsClient from "./CategoryNewsClient";
import { SITE_NAME } from "@/lib/site";

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category || "all-news";
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
  
  const { getSiteSettings } = await import("@/lib/firestore");
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || SITE_NAME;
  
  return {
    title: `${formattedCategory} News`,
    description: `Latest news, analysis, and activism reporting on ${formattedCategory} from ${siteName}.`,
    alternates: {
      canonical: `/categories/news?category=${encodeURIComponent(category)}`,
    },
    openGraph: {
      title: `${formattedCategory} News | ${siteName}`,
      description: `Latest news, analysis, and activism reporting on ${formattedCategory} from ${siteName}.`,
    }
  };
}

export default async function DynamicNewsPage({ params, searchParams }) {
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category || "all-news";
  
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

  return <CategoryNewsClient data={data} category={category} />;
}
