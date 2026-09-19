/**
 * Generates an elegant, mobile-responsive HTML email template for The Brain newsletter digests.
 * Compatible with major email clients (Gmail, Apple Mail, Outlook, Yahoo).
 */

export function generateNewsletterHtml({
  subject = "The Brain Editorial Digest",
  editorNote = "",
  stories = [],
  siteUrl = "https://dragonnews.com",
  issueDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }),
}) {
  const storiesHtml = stories
    .map((story, idx) => {
      const storyUrl = story.url || `${siteUrl}/news/${story.slug || story.id}`;
      const imageUrl = story.thumbnail_url || story.image_url || "";
      const category = story.category || "In-Depth";
      const title = story.title || "Untitled Story";
      const excerpt =
        story.details
          ? story.details.replace(/<[^>]*>?/gm, "").slice(0, 160) + "..."
          : "";
      const authorName = story.author?.name || "The Brain Editorial Team";

      return `
        <!-- Story Card ${idx + 1} -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          ${
            imageUrl
              ? `
          <tr>
            <td>
              <a href="${storyUrl}" target="_blank" style="text-decoration: none; display: block;">
                <img src="${imageUrl}" alt="${title}" width="600" style="width: 100%; max-height: 260px; object-fit: cover; display: block; border: 0;" />
              </a>
            </td>
          </tr>
          `
              : ""
          }
          <tr>
            <td style="padding: 20px 24px;">
              <span style="display: inline-block; background-color: #fee2e2; color: #dc2626; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 4px; margin-bottom: 10px;">
                ${category}
              </span>
              <h2 style="margin: 0 0 10px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; line-height: 1.35; color: #0f172a; font-weight: 700;">
                <a href="${storyUrl}" target="_blank" style="color: #0f172a; text-decoration: none;">
                  ${title}
                </a>
              </h2>
              <p style="margin: 0 0 14px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #475569;">
                ${excerpt}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #94a3b8;">
                    By <strong>${authorName}</strong>
                  </td>
                  <td align="right">
                    <a href="${storyUrl}" target="_blank" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; text-decoration: none; padding: 8px 16px; border-radius: 6px;">
                      Read Story &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    img { max-width: 100%; height: auto; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; }
      .mobile-padding { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          
          <!-- Publication Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 32px 24px; text-align: center; border-bottom: 3px solid #ef4444;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(135deg, #ef4444, #f97316); border-radius: 8px; line-height: 36px; text-align: center; color: #ffffff; font-weight: 900; font-size: 18px; margin-bottom: 8px;">
                      B
                    </div>
                    <h1 style="margin: 0 0 4px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: 0.05em;">
                      THE BRAIN
                    </h1>
                    <p style="margin: 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; font-weight: 700;">
                      Intelligence Without Fear or Favour • ${issueDate}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td class="mobile-padding" style="padding: 32px 24px 16px 24px;">
              
              ${
                editorNote
                  ? `
              <!-- Editor Note -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-left: 4px solid #ef4444; border-radius: 4px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #ef4444; letter-spacing: 0.08em;">
                      Note from the Editorial Desk
                    </p>
                    <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 15px; line-height: 1.6; color: #334155; font-style: italic;">
                      "${editorNote}"
                    </p>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              <!-- Stories Header -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td>
                    <h3 style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b;">
                      Featured Stories & Analysis
                    </h3>
                  </td>
                </tr>
              </table>

              <!-- Featured Stories -->
              ${storiesHtml}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 24px; text-align: center; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 10px 0; color: #cbd5e1; font-weight: 600;">
                You are receiving this digest because you subscribed to The Brain newsletter.
              </p>
              <p style="margin: 0 0 16px 0;">
                The Brain Headquarters • 2300 Kishoreganj Sadar, Dhaka, Bangladesh
              </p>
              <p style="margin: 0;">
                <a href="${siteUrl}" target="_blank" style="color: #ef4444; text-decoration: none; font-weight: 700; margin: 0 8px;">Visit Publication</a> •
                <a href="${siteUrl}/privacy-policy" target="_blank" style="color: #94a3b8; text-decoration: none; margin: 0 8px;">Privacy Policy</a> •
                <a href="${siteUrl}/contact" target="_blank" style="color: #94a3b8; text-decoration: none; margin: 0 8px;">Unsubscribe / Preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
