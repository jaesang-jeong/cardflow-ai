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

const NOISE_SELECTORS = [
  'script', 'style', 'noscript', 'iframe', 'svg', 'button', 'select', 'table',
  'figure', 'figcaption',
  'em.img_desc', '.img_desc', '.photo_caption', '.caption', '[class*="caption"]', '[class*="Caption"]',
  '.end_photo_org', '[class*="photo_desc"]', '[class*="image_desc"]', '[class*="summary_img"]',
  '.ad', '.ads', '.advertisement', '[class*="banner"]', '[class*="Banner"]', '[id*="banner"]', '[id*="Banner"]',
  '[class*="promotion"]', '[class*="Promotion"]',
  '.reporter_area', '.byline', '[class*="byline"]', '[class*="journalist"]', '[class*="reporter"]',
  '.sns_share', '.sns-share', '[class*="share"]',
  '.copyright', '[class*="copyright"]', '#comment', '.comment', '[class*="comment"]',
  '.article_footer', '.news_notice', '.media_end_linked_more',
  '[class*="vod"]', '[class*="player"]', '[class*="video_area"]',
  '[class*="relation"]', '[class*="recommend"]', '[class*="popular"]',
  '[class*="subscribe"]', '[class*="channel"]'
];

const BODY_SELECTORS = [
  '#dic_area', // Naver News
  '#articeBody', // Daum News
  '#article_body',
  '.article_body',
  '#article-view-content-div',
  '.news_cnt',
  '#news_body_area',
  'article',
  '.article-content',
  '.story-news',
  '.view_con',
  '.post-content',
  'main'
];

function isNoiseSentence(text) {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (trimmed.length < 15) return true;

  // 1. Photo caption bullets or markers at start
  if (/^[▲△▼▽◆◇■□●○▶▷ⓒ\*\#\•\-]/.test(trimmed)) return true;

  // 2. Photo / Image / Graphic / Video markers
  if (/사진\s*(=|:|\/|제공|출처|캡처)/i.test(trimmed)) return true;
  if (/\[(사진|자료사진|그래픽|도표|캡처|제공|출처|포토).*?\]/i.test(trimmed)) return true;
  if (/\((사진|자료사진|그래픽|도표|캡처|제공|출처|포토).*?\)/i.test(trimmed)) return true;
  if (/(연합뉴스\s*자료사진|뉴스1\s*DB|뉴시스\s*DB|게티이미지|gettyimages|공동취재단|로이터연합뉴스|AP연합뉴스|AFP연합뉴스)/i.test(trimmed)) return true;
  if (/(유튜브|인스타그램|페이스북|방송|화면|홈페이지)\s*캡처/i.test(trimmed)) return true;
  if (/\b(DB|캡처|자료사진)\b/i.test(trimmed)) return true;
  if (/기사와\s*(직접적인\s*)?관련\s*(없음|이\s*없습니다)/i.test(trimmed)) return true;
  if (/기사\s*내용과\s*(직접\s*)?무관/i.test(trimmed)) return true;

  // 3. Typical photo description endings
  if (/(모습이다|모습\.|전경이다|전경\.|장면이다|장면\.|포즈를 취하고 있다|기념촬영을 하고 있다|기념사진을 찍고 있다)\s*$/i.test(trimmed)) return true;

  // 4. Banners, marketing, subscription, newsletters, channels, apps
  if (/(구독|네이버\s*메인|채널\s*추가|카카오톡|플러스친구|친구\s*추가|앱\s*다운로드|뉴스레터|팟캐스트|팔로우|소식받기)/i.test(trimmed)) return true;
  if (/(제보|제보하기|제보를\s*기다립니다|독자\s*제보|제보창구|이메일|02-\d{3,4}-\d{4})/i.test(trimmed)) return true;
  if (/(바로가기|더보기|관련기사|추천기사|인기기사|많이\s*본\s*뉴스|실시간\s*인기|놓치지\s*마세요|인기\s*뉴스|오픈채팅)/i.test(trimmed)) return true;
  if (/(무단\s*전재|재배포|저작권자|copyright|all\s*rights\s*reserved|불펌)/i.test(trimmed)) return true;

  // 5. Reporter bylines / email signatures
  if (/([가-힣]{2,5}\s*(기자|특파원|논설위원|연구원|PD|작가|팀장|국장))\s*(\[|\(|\/|<|@|\.|$)/i.test(trimmed)) return true;
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) return true;

  // 6. Navigation / UI noise
  if (/^(공유|댓글|좋아요|인쇄|폰트|글자크기|스크랩|신고|수정|등록)/i.test(trimmed)) return true;

  return false;
}

// Sample / Demo fallback dataset for sample buttons
const SAMPLE_ARTICLES = {
  '0014900000': {
    title: '글로벌 빅테크, 차세대 지능형 자율 AI 에이전트 동시 공개... "업무 스스로 완결"',
    press: '연합뉴스',
    description: '글로벌 인공지능 연구팀들이 컴퓨터와 브라우저 환경을 제어하며 복잡한 업무를 스스로 완결하는 차세대 AI 에이전트 기술을 공개했습니다.',
    content: '글로벌 주요 테크 기업들이 단순 대화형 챗봇을 넘어 사용자의 컴퓨터 환경을 직접 제어하며 복잡한 다단계 업무를 스스로 완결하는 차세대 지능형 자율 AI 에이전트를 동시 공개했다.\n\n이번에 공개된 AI 에이전트는 사용자가 내린 자연어 지시를 바탕으로 필요한 프로그램을 실행하고 웹 브라우징과 데이터 분석, 보고서 작성까지 전 과정을 자율적으로 수행한다.\n\n업계 전문가들은 이번 기술 혁신이 사무직 노동 생산성을 획기적으로 개선하고 엔터프라이즈 업무 자동화의 새로운 전기를 마련할 것으로 전망했다.\n\n글로벌 소프트웨어 기업들은 자사 플랫폼에 해당 에이전트 기능을 전면 도입하여 하반기부터 기업 고객을 대상으로 서비스 확장에 나설 방침이다.',
    ogImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'
    ],
    domain: 'naver.com'
  },
  '20261030090000123': {
    title: '한국은행 기준금리 0.25%p 인하 단행... "경기 회복과 물가 안정 종합 고려"',
    press: '다음 뉴스',
    description: '한국은행 금융통화위원회가 통화정책방향 회의를 열고 기준금리를 연 3.25%로 0.25%포인트 인하했습니다.',
    content: '한국은행 금융통화위원회가 통화정책방향 회의를 열고 기준금리를 기존 연 3.50%에서 연 3.25%로 0.25%포인트 전격 인하했다.\n\n이번 기준금리 인하는 최근 둔화세를 보이고 있는 내수 경기 회복을 뒷받침하는 동시에 안정세를 찾은 소비자물가 흐름을 종합적으로 고려한 결정이다.\n\n시중은행의 주택담보대출 및 신용대출 금리도 연쇄적으로 하향 조정될 것으로 보이며 금융 시장의 유동성 완화 효과가 기대된다.\n\n금융당국은 금리 인하에 따른 가계부채 증가세를 면밀히 모니터링하며 부동산 시장 과열 방지를 위한 거시건전성 관리를 지속할 방침이라고 밝혔다.',
    ogImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop'
    ],
    domain: 'daum.net'
  },
  'AKR20261030000000001': {
    title: '국내 연구진, 화재 위험 없는 차세대 전고체 배터리 핵심 전해질 개발 성공',
    press: '연합뉴스',
    description: '화재 위험이 없고 주행거리를 대폭 늘릴 수 있는 전고체 배터리용 황화물계 고체 전해질이 개발되었습니다.',
    content: '국내 연구진이 기존 리튬이온 배터리의 고질적인 화재 위험을 없애고 에너지 밀도를 2배 이상 높일 수 있는 차세대 전고체 배터리 핵심 전해질 개발에 성공했다.\n\n연구팀이 개발한 황화물계 고체 전해질은 기존 액체 전해질 수준의 높은 이온 전도도를 구현하면서도 저온 환경에서의 출력 저하 문제를 극복했다.\n\n전기차 업계는 이번 신소재가 상용화되면 1회 충전 시 800km 이상 주행이 가능한 안전한 전기차 배터리 양산이 앞당겨질 것으로 기대하고 있다.\n\n연구진은 국내 주요 배터리 제조사들과 함께 파일럿 검증을 거쳐 향후 3년 내 대량 양산 기술을 확보할 계획이라고 설명했다.',
    ogImage: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop'
    ],
    domain: 'yna.co.kr'
  }
};

// 1. Article Extractor API
app.post('/api/extract', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: '유효한 기사 URL을 입력해주세요.' });
  }

  const targetUrl = url.trim();

  // Instant response for demo / sample URLs
  for (const [key, sample] of Object.entries(SAMPLE_ARTICLES)) {
    if (targetUrl.includes(key)) {
      return res.json({
        url: targetUrl,
        title: sample.title,
        press: sample.press,
        publishDate: new Date().toISOString().split('T')[0],
        description: sample.description,
        content: sample.content,
        ogImage: sample.ogImage,
        images: sample.images,
        domain: sample.domain
      });
    }
  }

  try {
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

    // Extract editorial article images before removing photo caption wrappers
    const articleImages = [];
    if (ogImage && !ogImage.includes('favicon') && !ogImage.includes('default')) {
      articleImages.push(ogImage);
    }

    for (const selector of BODY_SELECTORS) {
      const el = $(selector);
      if (el.length > 0) {
        el.find('img').each((_, imgEl) => {
          let src = $(imgEl).attr('data-src') || $(imgEl).attr('data-original') || $(imgEl).attr('src');
          if (!src) return;
          if (src.startsWith('//')) src = 'https:' + src;
          else if (src.startsWith('/')) {
            try {
              const u = new URL(targetUrl);
              src = `${u.origin}${src}`;
            } catch (e) {}
          }
          if (!/icon|badge|logo|ad\.|banner|button|btn|blank|pixel|track|spinner|share|loading|emoticon|profile/i.test(src)) {
            const baseSrc = src.split('?')[0];
            if (!articleImages.some(img => img.split('?')[0] === baseSrc)) {
              articleImages.push(src);
            }
          }
        });
      }
    }

    // Remove noise elements
    $(NOISE_SELECTORS.join(', ')).remove();

    // Collect article text from primary news selectors
    let articleText = '';

    for (const selector of BODY_SELECTORS) {
      const el = $(selector);
      if (el.length > 0) {
        const clone = el.clone();
        clone.find(NOISE_SELECTORS.join(', ')).remove();
        clone.find('br').replaceWith('\n');
        clone.find('p, div, li, tr').prepend('\n').append('\n');
        const text = clone.text()
          .split('\n')
          .map(s => s
            .replace(/^\[.*?\]\s*/, '')
            .replace(/^\(.*?\)\s*/, '')
            .replace(/^[가-힣\s]{2,10}\s*(기자|특파원)\s*=\s*/, '')
            .trim()
          )
          .filter(s => s.length >= 15 && !isNoiseSentence(s))
          .join('\n\n');
        if (text.length > articleText.length) {
          articleText = text;
        }
      }
    }

    // Fallback: general paragraphs if specific selectors fail
    if (!articleText || articleText.length < 80) {
      articleText = $('p')
        .map((_, el) => $(el).text().trim())
        .get()
        .map(s => s
          .replace(/^\[.*?\]\s*/, '')
          .replace(/^\(.*?\)\s*/, '')
          .replace(/^[가-힣\s]{2,10}\s*(기자|특파원)\s*=\s*/, '')
          .trim()
        )
        .filter(t => t.length >= 15 && !isNoiseSentence(t))
        .slice(0, 20)
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
      images: articleImages,
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

// 4. Gemini AI Whole-Article One-Line Summarizer
app.post('/api/summarize-ai', async (req, res) => {
  const { title, content, apiKey } = req.body;
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    return res.status(400).json({ error: 'Gemini API Key is required' });
  }

  try {
    const prompt = `당신은 소셜 미디어 카드뉴스 전문 수석 에디터입니다.
아래 뉴스 기사의 전체 내용을 꼼꼼히 파악한 뒤, 기사 전체의 [핵심 주체 + 핵심 사건 + 주요 결과/전망]을 관통하는 완벽한 1문장 핵심 요약(60~90자 내외)을 작성해 주세요.
독자가 첫 표지만 보고도 전체 내용을 한눈에 이해할 수 있어야 합니다.
존댓말(~했습니다, ~전망입니다)로 작성하고, 다른 부연 설명이나 따옴표 없이 오직 완성된 요약문 한 문장만 출력하세요.

기사 제목: ${title}
기사 본문:
${(content || title).substring(0, 3000)}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const apiRes = await axios.post(
      geminiUrl,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 120,
        },
      },
      { timeout: 10000 }
    );

    const summaryText = apiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (summaryText) {
      return res.json({ oneLineSummary: summaryText.replace(/^["']|["']$/g, '').trim() });
    }
    return res.status(500).json({ error: 'Failed to generate AI summary' });
  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    return res.status(500).json({ error: err.message });
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
