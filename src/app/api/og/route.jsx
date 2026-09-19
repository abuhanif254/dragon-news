import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "The Brain | Independent Global Journalism";
    const category = (searchParams.get("category") || "News & Analysis").toUpperCase();
    const author = searchParams.get("author") || "The Brain Editorial Team";
    const readTime = searchParams.get("readTime") || "4 min read";
    const host = request.headers.get("host") || new URL(request.url).host || "thebrain.media";

    // Truncate title if extremely long
    const displayTitle = title.length > 110 ? `${title.slice(0, 107)}...` : title;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 70px",
            backgroundColor: "#0d0d17",
            backgroundImage:
              "radial-gradient(circle at 90% 15%, rgba(192, 57, 43, 0.35) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(26, 26, 46, 0.8) 0%, transparent 50%)",
            color: "#ffffff",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {/* Top Brand Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#c0392b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "20px",
                  color: "#ffffff",
                }}
              >
                B
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  color: "#ffffff",
                }}
              >
                THE BRAIN<span style={{ color: "#c0392b" }}>.</span>
              </div>
            </div>

            {/* Category Pill */}
            <div
              style={{
                backgroundColor: "rgba(192, 57, 43, 0.2)",
                border: "1px solid rgba(192, 57, 43, 0.5)",
                color: "#ff6b6b",
                padding: "6px 18px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {category}
            </div>
          </div>

          {/* Main Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "1050px",
              my: "auto",
            }}
          >
            <div
              style={{
                fontSize: displayTitle.length > 70 ? "46px" : "56px",
                fontWeight: 900,
                lineHeight: 1.22,
                color: "#ffffff",
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            >
              {displayTitle}
            </div>
          </div>

          {/* Bottom Meta & Authority Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "16px",
                  color: "#ffffff",
                }}
              >
                {author.charAt(0)}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                  {author}
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" }}>
                  Verified Editorial Staff
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div
                style={{
                  fontSize: "15px",
                  color: "rgba(255, 255, 255, 0.7)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>⏱</span> {readTime}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.4)",
                  letterSpacing: "0.04em",
                }}
              >
                {host}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OpenGraph image generation error:", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
