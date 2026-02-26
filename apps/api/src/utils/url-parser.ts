import * as cheerio from 'cheerio';

/* ================================================================== */
/* URL Content Extractor                                               */
/* Supports: Google Docs, Google Slides, generic web pages             */
/* ================================================================== */

export interface ParseResult {
  content: string;
  sourceType: 'google-docs' | 'google-slides' | 'webpage';
  title?: string;
}

const MAX_CONTENT_LENGTH = 50_000;
const FETCH_TIMEOUT = 15_000;

// ── SSRF Protection ─────────────────────────────────────────────────

function isAllowedUrl(url: string): boolean {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) return false;

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') return false;
  if (hostname.startsWith('10.') || hostname.startsWith('192.168.')) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return false;
  if (hostname.endsWith('.local') || hostname.endsWith('.internal')) return false;

  return true;
}

// ── Google Docs / Slides ID extractors ──────────────────────────────

function extractGoogleDocId(url: string): string | null {
  const match = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function extractGoogleSlidesId(url: string): string | null {
  const match = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// ── Fetchers ────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'FutureUp-Bot/1.0' },
      redirect: 'follow',
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchGoogleDocContent(docId: string): Promise<string> {
  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
  const response = await fetchWithTimeout(exportUrl);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Cannot access this document. Make sure link sharing is enabled (anyone with the link can view).');
    }
    throw new Error(`Failed to fetch Google Doc: ${response.status}`);
  }

  return await response.text();
}

async function fetchGoogleSlidesContent(presentationId: string): Promise<string> {
  const exportUrl = `https://docs.google.com/presentation/d/${presentationId}/export?format=txt`;
  const response = await fetchWithTimeout(exportUrl);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Cannot access this presentation. Make sure link sharing is enabled (anyone with the link can view).');
    }
    throw new Error(`Failed to fetch Google Slides: ${response.status}`);
  }

  return await response.text();
}

async function fetchWebpageContent(url: string): Promise<{ text: string; title?: string }> {
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove non-content elements
  $('script, style, nav, footer, header, aside, iframe, noscript, svg, form').remove();

  const title = $('title').text().trim() || undefined;

  // Try to find main content area
  let text = '';
  const mainSelectors = ['article', 'main', '[role="main"]', '.content', '#content', '.post-content', '.entry-content'];
  for (const selector of mainSelectors) {
    const el = $(selector);
    if (el.length && el.text().trim().length > 100) {
      text = el.text();
      break;
    }
  }

  // Fallback to body
  if (!text) {
    text = $('body').text();
  }

  // Clean up whitespace
  text = text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n /g, '\n')
    .trim();

  return { text, title };
}

// ── Main Export ─────────────────────────────────────────────────────

export async function extractContentFromUrl(url: string): Promise<ParseResult> {
  // Validate URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL provided');
  }

  // SSRF check
  if (!isAllowedUrl(url)) {
    throw new Error('URL is not allowed');
  }

  // Google Docs
  const googleDocId = extractGoogleDocId(url);
  if (googleDocId) {
    let content = await fetchGoogleDocContent(googleDocId);
    if (content.length > MAX_CONTENT_LENGTH) {
      content = content.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated — original document is too large]';
    }
    return { content, sourceType: 'google-docs' };
  }

  // Google Slides
  const googleSlidesId = extractGoogleSlidesId(url);
  if (googleSlidesId) {
    let content = await fetchGoogleSlidesContent(googleSlidesId);
    if (content.length > MAX_CONTENT_LENGTH) {
      content = content.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated — original presentation is too large]';
    }
    return { content, sourceType: 'google-slides' };
  }

  // Generic webpage
  const { text, title } = await fetchWebpageContent(url);
  if (!text || text.length < 10) {
    throw new Error('Could not extract meaningful content from the URL. The page might require login or be JavaScript-rendered.');
  }

  let content = text;
  if (content.length > MAX_CONTENT_LENGTH) {
    content = content.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated]';
  }

  return { content, sourceType: 'webpage', title };
}
