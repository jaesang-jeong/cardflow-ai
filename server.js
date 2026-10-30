import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Known press domain dictionary for accurate press branding
const PRESS_DOMAINS = {
  'yna.co.kr': '연합뉴스',
  'yonhapnewstv.co.kr': '연합뉴스TV',
  'chosun.com': '조선일보',
  'donga.com': '동아일보',
  'hani.co.kr': '한겨레',
  'khan.co.kr': '경향신문',
  'joongang.co.kr': '중앙일보',
  'mk.co.kr': '매일경제',
  'hankyung.com': '한국경제',
  'sedaily.com': '서울경제',
  'etnews.com': '전자신문',
  'zdnet.co.kr': 'ZDNet Korea',
  'bloter.net': '블로터',
  'newsis.com': '뉴시스',
  'news1.kr': '뉴스1',
  'sbs.co.kr': 'SBS 뉴스',
  'kbs.co.kr': 'KBS 뉴스',
  'imbc.com': 'MBC 뉴스',
  'ytn.co.kr': 'YTN',
  'jtbc.co.kr': 'JTBC 뉴스',
  'bbc.com': 'BBC News',
  'cnn.com': 'CNN',
  'reuters.com': '로이터(Reuters)',
  'bloomberg.com': '블룸버그(Bloomberg)',
  'techcrunch.com': 'TechCrunch',
  'theverge.com': 'The Verge',
  'wired.com': 'Wired',
  'nytimes.com': 'New York Times'
};

function getPressFromUrl(urlStr, parsedSiteName) {
  if (parsedSiteName && parsedSiteName.trim().length > 0) {
    return parsedSiteName.trim();
  }
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.replace(/^www\./, '');
    for (const [domain, name] of Object.entries(PRESS_DOMAINS)) {
      if (host.includes(domain)) return name;
    }
    // Fallback: capitalize hostname part
    const parts = host.split('.');
    if (parts.length >= 2) {
      return parts[parts.length - 2].toUpperCase();
    }
    return host;
  } catch (e) {
    return '언론사 보도';
  }
}

// 1. Article Extractor API
app.post('/api/extract', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: '유효한 기사 URL을 입력해주세요.' });
  }

  try {
    const targetUrl = url.trim();
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 10000,
      maxRedirects: 5,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract OpenGraph & Meta Data
    const ogTitle = $('meta[property="og:title"]').attr('content') ||
                    $('meta[name="twitter:title"]').attr('content') ||
                    $('title').text() || '';

    const ogDesc = $('meta[property="og:description"]').attr('content') ||
                   $('meta[name="description"]').attr('content') ||
                   $('meta[name="twitter:description"]').attr('content') || '';

    let ogImage = $('meta[property="og:image"]').attr('content') ||
                  $('meta[name="twitter:image"]').attr('content') || '';

    if (ogImage && ogImage.startsWith('//')) {
      ogImage = 'https:' + ogImage;
    } else if (ogImage && ogImage.startsWith('/')) {
      try {
        const u = new URL(targetUrl);
        ogImage = `${u.origin}${ogImage}`;
      } catch (e) {}
    }

    const siteName = $('meta[property="og:site_name"]').attr('content') ||
                     $('meta[name="publisher"]').attr('content') || '';

    const publishDateMeta = $('meta[property="article:published_time"]').attr('content') ||
                            $('meta[name="pubdate"]').attr('content') ||
                            $('meta[name="date"]').attr('content') ||
                            $('time').attr('datetime') ||
                            $('time').text().trim() ||
                            new Date().toISOString().split('T')[0];

    const press = getPressFromUrl(targetUrl, siteName);

    // Remove noise elements
    $('script, style, noscript, nav, header, footer, aside, .ad, .ads, .comment, #comment, .sns-share, .reporter_area, .byline').remove();

    // Collect article text from primary news selectors
    let articleText = '';
    const bodySelectors = [
      '#dic_area', // Naver News
      '#articeBody', // Daum News
      '#article-view-content-div',
      '.article_body',
      '.news_cnt',
      'article',
      '.article-content',
      '.story-news',
      '.post-content',
      'main'
    ];

    for (const selector of bodySelectors) {
      const el = $(selector);
      if (el.length > 0) {
        const text = el.find('p').map((_, p) => $(p).text().trim()).get().filter(t => t.length > 15).join('\n\n');
        if (text.length > articleText.length) {
          articleText = text;
        }
      }
    }

    // Fallback: general paragraphs if specific selectors fail
    if (!articleText || articleText.length < 100) {
      articleText = $('p')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(t => t.length > 20 && !t.includes('구독') && !t.includes('저작권'))
        .slice(0, 15)
        .join('\n\n');
    }

    // If still empty, use description
    if (!articleText && ogDesc) {
      articleText = ogDesc;
    }

    const cleanTitle = ogTitle
      .replace(/\s*-\s*[가-힣A-Za-z0-9\s]+뉴스.*$/, '')
      .replace(/\[.*?\]\s*/g, '')
      .trim();

    return res.json({
      url: targetUrl,
      title: cleanTitle || '기사 제목',
      press,
      publishDate: typeof publishDateMeta === 'string' ? publishDateMeta.substring(0, 10) : new Date().toISOString().split('T')[0],
      description: ogDesc,
      content: articleText || ogDesc || cleanTitle,
      ogImage: ogImage || undefined,
      domain: new URL(targetUrl).hostname,
    });
  } catch (error) {
    console.error('Scraping error:', error.message);
    return res.status(500).json({
      error: `기사를 불러오는 중 오류가 발생했습니다: ${error.message}. 직접 텍스트를 입력하시거나 샘플을 이용해주세요.`
    });
  }
});

// 2. CORS Proxy for Images (prevents canvas tainting on export)
app.get('/api/proxy-image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl || typeof imageUrl !== 'string') {
    return res.status(400).send('Image URL is required');
  }

  try {
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Referer': imageUrl,
      },
      timeout: 10000,
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(Buffer.from(response.data));
  } catch (err) {
    console.error('Image proxy error:', err.message);
    return res.status(502).send('Failed to fetch image');
  }
});

// 3. Image Search / AI Image Generator Helper
app.get('/api/search-images', async (req, res) => {
  const query = req.query.q || 'news';
  try {
    // Generate Pollinations AI image URL with high quality style modifiers
    const encodedPrompt = encodeURIComponent(`${query}, professional news illustration, high resolution, 4k editorial photo, cinematic lighting`);
    const aiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&nologo=true&enhance=true`;

    const stockImages = [
      `https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop`,
    ];

    return res.json({
      aiImageUrl,
      stockImages,
    });
  } catch (e) {
    return res.json({ stockImages: [] });
  }
});

// Setup Vite Dev Middleware in Development
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CardFlow News Studio running at http://localhost:${PORT}`);
  });
}

startServer();
