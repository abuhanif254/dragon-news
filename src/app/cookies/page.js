import { getPage, getSiteSettings } from "@/lib/firestore";
import { createExcerpt } from "@/lib/content-utils";
import LegalPageLayout from "@/components/ui/LegalPageLayout";

export const revalidate = 60;

export async function generateMetadata() {
  const [pageData, settings] = await Promise.all([
    getPage("cookies"),
    getSiteSettings()
  ]);

  const siteName = settings?.siteName || "The Brain";
  const title = pageData?.title || "Cookie Policy";
  const rawContent = pageData?.content || "";
  const description = createExcerpt(rawContent, 160) || `Cookie Policy for ${siteName}.`;

  return {
    title: `${title} | ${siteName}`,
    description,
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
    }
  };
}

export default async function CookiesPage() {
  const pageData = await getPage("cookies");
  
  const title = pageData?.title || "Cookie Policy";
  
  // Default HTML content if not found in CMS
  const defaultContent = `
    <h2>1. What Are Cookies?</h2>
    <p>Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.</p>
    
    <h2>2. How We Use Cookies</h2>
    <p>The Brain uses cookies in several ways to improve your experience on our site, including keeping you signed in, understanding how you use our site, and providing content that is relevant to you.</p>
    <ul>
      <li><strong>Necessary Cookies:</strong> Essential for the operation of our site.</li>
      <li><strong>Analytical Cookies:</strong> Help us understand how visitors interact with our website.</li>
      <li><strong>Functional Cookies:</strong> Remember choices you make to improve your experience.</li>
      <li><strong>Targeting Cookies:</strong> Record your visit and the pages you have followed.</li>
    </ul>

    <h2>3. Types of Cookies We Use</h2>
    <p>We use both first-party and third-party cookies on our website. First-party cookies are cookies set by the website you're visiting. Third-party cookies are set by other sites that provide content or services on the page you are viewing.</p>

    <h2>4. Managing Cookies</h2>
    <p>Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit www.aboutcookies.org or www.allaboutcookies.org.</p>

    <h2>5. Policy Updates</h2>
    <p>We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed.</p>

    <h2>6. More Information</h2>
    <p>If you have any questions about our use of cookies or other technologies, please email us at: mohammadbitullah@gmail.com or call +8801724010261.</p>
  `;

  const content = pageData?.content || defaultContent;
  const lastUpdated = pageData?.updatedAt ? new Date(pageData.updatedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently Updated";

  return <LegalPageLayout title={title} content={content} lastUpdated={lastUpdated} />;
}
