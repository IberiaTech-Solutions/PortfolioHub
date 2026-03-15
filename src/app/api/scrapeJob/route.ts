import { NextRequest, NextResponse } from "next/server";

// Attempts to extract job description from a URL
// Works best with public job pages; LinkedIn may block some requests
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Validate URL
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // SSRF protection — block internal/private IPs
    const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "169.254", "10.", "172.16", "192.168"];
    if (blockedHosts.some((h) => parsed.hostname.includes(h)) || parsed.protocol !== "https:") {
      return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
    }

    // Attempt to fetch the page
    const response = await fetch(parsed.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json({
        error: "Could not fetch the page. Try pasting the job description text directly instead.",
        fallback: true,
      });
    }

    const html = await response.text();

    // Extract text content — strip HTML tags
    const text = html
      // Remove script and style tags with content
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      // Remove HTML tags
      .replace(/<[^>]+>/g, " ")
      // Decode HTML entities
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      // Clean up whitespace
      .replace(/\s+/g, " ")
      .trim();

    // Try to extract job-specific content from common patterns
    let jobDescription = "";

    // LinkedIn pattern: look for job description markers
    const linkedinPatterns = [
      /About the job\s*([\s\S]{100,3000}?)(?:Show more|About the company|Skills|See more)/i,
      /Job Description\s*([\s\S]{100,3000}?)(?:Qualifications|Requirements|About|Benefits)/i,
      /Description\s*([\s\S]{100,3000}?)(?:Qualifications|Requirements|About|Benefits)/i,
    ];

    for (const pattern of linkedinPatterns) {
      const match = text.match(pattern);
      if (match) {
        jobDescription = match[1].trim();
        break;
      }
    }

    // If no specific extraction worked, try to find the most content-dense section
    if (!jobDescription) {
      // Split into paragraphs and find the longest cluster
      const sentences = text.split(/\.\s+/).filter((s) => s.length > 30);
      if (sentences.length > 3) {
        jobDescription = sentences.slice(0, Math.min(30, sentences.length)).join(". ");
      }
    }

    // Fallback: just use the full text (trimmed)
    if (!jobDescription) {
      jobDescription = text.slice(0, 5000);
    }

    // Try to extract job title from meta tags or common patterns
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const jobTitle = titleMatch
      ? titleMatch[1]
          .replace(/\s*\|.*$/, "")
          .replace(/\s*-\s*LinkedIn.*$/i, "")
          .replace(/\s*-\s*Indeed.*$/i, "")
          .replace(/\s*-\s*Glassdoor.*$/i, "")
          .trim()
      : "";

    if (jobDescription.length < 50) {
      return NextResponse.json({
        error:
          "Could not extract enough content from this URL. LinkedIn and some sites block automated access. Try copying and pasting the job description text directly.",
        fallback: true,
      });
    }

    return NextResponse.json({
      jobDescription: jobDescription.slice(0, 5000),
      jobTitle,
      source: parsed.hostname,
    });
  } catch (error) {
    console.error("Scrape job error:", error);
    return NextResponse.json({
      error: "Could not fetch the job page. Try pasting the job description text directly instead.",
      fallback: true,
    });
  }
}
