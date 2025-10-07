import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Generate screenshot using Vercel's screenshot API
    const screenshotUrl = await generateScreenshot(url);

    if (!screenshotUrl) {
      return NextResponse.json({ error: 'Failed to generate screenshot' }, { status: 500 });
    }

    return NextResponse.json({ screenshotUrl });
  } catch (error) {
    console.error('Error generating screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to generate screenshot' },
      { status: 500 }
    );
  }
}

async function generateScreenshot(url: string): Promise<string | null> {
  try {
    // Use Vercel's screenshot API
    const screenshotApiUrl = `https://api.vercel.com/v1/screenshots`;
    
    const response = await fetch(screenshotApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        width: 1200,
        height: 800,
        format: 'png',
        quality: 80,
        fullPage: false,
        deviceScaleFactor: 1,
        waitUntil: 'networkidle0',
        timeout: 30000,
      }),
    });

    if (!response.ok) {
      console.error('Vercel screenshot API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error('Error calling Vercel screenshot API:', error);
    
    // Fallback to alternative screenshot service
    return await generateScreenshotFallback(url);
  }
}

async function generateScreenshotFallback(url: string): Promise<string | null> {
  try {
    // Alternative: Use a free screenshot service as fallback
    const screenshotApiUrl = `https://api.screenshotone.com/take`;
    const apiKey = process.env.SCREENSHOTONE_API_KEY;
    
    if (!apiKey) {
      console.log('No fallback screenshot API key available');
      return null;
    }

    const params = new URLSearchParams({
      access_key: apiKey,
      url: url,
      viewport_width: '1200',
      viewport_height: '800',
      device_scale_factor: '1',
      format: 'png',
      image_quality: '80',
      block_ads: 'true',
      block_cookie_banners: 'true',
      block_trackers: 'true',
      block_banners_by_heuristics: 'true',
      delay: '3',
      timeout: '30',
    });

    const response = await fetch(`${screenshotApiUrl}?${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('Fallback screenshot API error:', response.status, response.statusText);
      return null;
    }

    // Convert response to base64 data URL
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error with fallback screenshot service:', error);
    return null;
  }
}

// Alternative implementation using Puppeteer (if Vercel API is not available)
async function generateScreenshotWithPuppeteer(url: string): Promise<string | null> {
  try {
    // This would require puppeteer-core and @vercel/og
    // For now, we'll use the API approach above
    return null;
  } catch (error) {
    console.error('Puppeteer screenshot error:', error);
    return null;
  }
}
