import { NextResponse } from "next/server";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import { getSiteSettings } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || SITE_NAME;
  const siteDescription = settings?.siteDescription || SITE_DESCRIPTION;

  const content = `# ${siteName}

> ${siteDescription}

## About This Platform
${siteName} is an independent, international publishing platform dedicated to investigative journalism, science, technology, ethics, human rights, and critical philosophy. Content is published in both English and Bengali, adhering to the highest standards of journalistic verification, transparency, and editorial freedom.

## Core Content Hubs
- [All Articles](${SITE_URL}/news): Full chronological index of published stories and investigative essays.
- [World News](${SITE_URL}/categories/news/world): Global geopolitical reporting, diplomatic developments, and international analysis.
- [Science & Technology](${SITE_URL}/categories/news/technology): Discoveries in neuroscience, artificial intelligence, cosmology, and digital culture.
- [Philosophy & Ethics](${SITE_URL}/categories/news/philosophy): Rationalist philosophy, secular thought, critical inquiry, and ethical discourse.
- [Human Rights & Activism](${SITE_URL}/categories/news/activism): Free speech advocacy, secular activism, and human rights monitoring.
- [Society & Culture](${SITE_URL}/categories/news/culture): Social critique, literature, art, and modern lifestyle debates.

## Publisher & Editorial Information
- [About Us](${SITE_URL}/about): Editorial mission, ethics statement, and masthead.
- [Contact Editorial](${SITE_URL}/contact): Secure contact form and editorial office communications.
- [Privacy Policy](${SITE_URL}/privacy-policy): Reader data protection practices and GDPR/CCPA disclosures.
- [Terms of Service](${SITE_URL}/terms): Platform terms of use and syndication rights.
- [Cookie Policy](${SITE_URL}/cookies): Technical and analytical cookie transparency.

## Syndication & Feeds
- RSS 2.0 with WebSub (PubSubHubbub): ${SITE_URL}/rss.xml
- Google News Sitemap: ${SITE_URL}/news-sitemap.xml
- Standard XML Sitemap: ${SITE_URL}/sitemap.xml

## Multilingual Support
Articles are published bilingually (English and Bengali). Each article declares appropriate \`hreflang\` attributes and localized OpenGraph metadata.
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
