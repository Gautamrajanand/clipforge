import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clipforge.ai';
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ClipForge Blog</title>
    <link>${baseUrl}/blog</link>
    <description>AI-powered video repurposing for creators. Turn long videos into viral clips.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    
    <item>
      <title>Welcome to ClipForge</title>
      <link>${baseUrl}/blog/welcome-to-clipforge</link>
      <description>Discover how ClipForge helps creators turn long-form content into viral social media clips with AI.</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid>${baseUrl}/blog/welcome-to-clipforge</guid>
    </item>
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
