// Content script for extracting article DOM directly in the active tab

const PRESS_DOMAINS = {
  'yna.co.kr': '연합뉴스',
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
  'newsis.com': '뉴시스',
  'news1.kr': '뉴스1',
  'sbs.co.kr': 'SBS 뉴스',
  'kbs.co.kr': 'KBS 뉴스',
  'imbc.com': 'MBC 뉴스',
  'ytn.co.kr': 'YTN',
  'jtbc.co.kr': 'JTBC 뉴스',
  'bbc.com': 'BBC 뉴스',
  'cnn.com': 'CNN',
  'techcrunch.com': 'TechCrunch',
  'theverge.com': 'The Verge',
  'naver.com': '네이버 뉴스',
  'daum.net': '다음 뉴스'
};

function extractArticleFromCurrentPage() {
  const url = window.location.href;
  const host = window.location.hostname;

  // 1. Title Extraction
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
  const headlineEl = document.querySelector('h1, #title_area, .media_end_head_headline, .tit_view, .article-head-title');
  const h1Text = headlineEl?.innerText?.trim();
  const docTitle = document.title || '';

  const rawTitle = ogTitle || twitterTitle || h1Text || docTitle;
  const cleanTitle = rawTitle
    .replace(/^\[.*?\]\s*/, '')
    .replace(/\s*-\s*[가-힣A-Za-z0-9\s]+뉴스.*$/, '')
    .replace(/\s*\|\s*.*$/, '')
    .trim();

  // 2. Press / Source Extraction
  const siteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
                   document.querySelector('meta[name="publisher"]')?.getAttribute('content');

  let press = siteName || '';
  if (!press) {
    const pressLogo = document.querySelector('.media_end_head_top_logo img, .press_logo img')?.getAttribute('alt');
    if (pressLogo) press = pressLogo;
  }
  if (!press) {
    for (const [d, name] of Object.entries(PRESS_DOMAINS)) {
      if (host.includes(d)) {
        press = name;
        break;
      }
    }
  }
  if (!press) {
    const parts = host.replace(/^www\./, '').split('.');
    press = parts[0]?.toUpperCase() || '보도매체';
  }

  // 3. Representative Image
  let ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
  if (ogImage && ogImage.startsWith('//')) {
    ogImage = 'https:' + ogImage;
  } else if (ogImage && ogImage.startsWith('/')) {
    ogImage = window.location.origin + ogImage;
  }

  // 4. Publish Date
  const dateMeta = document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
                   document.querySelector('meta[name="pubdate"]')?.getAttribute('content') ||
                   document.querySelector('.media_end_head_info_datestamp_time')?.getAttribute('data-date-time') ||
                   document.querySelector('.media_end_head_info_datestamp_time')?.innerText?.trim() ||
                   document.querySelector('time')?.getAttribute('datetime') ||
                   document.querySelector('time')?.innerText?.trim() ||
                   new Date().toISOString().split('T')[0];

  // 5. Body Text Extraction (Handling Naver, Daum, Chosun, YNA, etc.)
  const bodySelectors = [
    '#dic_area',                                      // Naver News
    '#articeBody',                                    // Daum News
    '#article_body', '.article_body',                 // Chosun, Joongang
    '#article-view-content-div',                      // General Korean Press
    '.news_cnt', '#news_body_area',                   // Donga, Hankyung
    '.story-news', '.view_con',                       // YNA, Newsis
    '.article-content', '.article_text',              // SBS, MBC, KBS
    'article', '[itemprop="articleBody"]',
    'main', '.post-content', '.entry-content'
  ];

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

  function extractCleanText(el) {
    if (!el) return '';
    const clone = el.cloneNode(true);
    
    // Remove unwanted widgets, figures, captions, ads, banners
    const noise = clone.querySelectorAll(NOISE_SELECTORS.join(', '));
    noise.forEach(n => n.remove());

    // Replace line break tags with newlines
    clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    clone.querySelectorAll('p, div, li, tr').forEach(b => {
      b.prepend('\n');
      b.append('\n');
    });

    const raw = clone.innerText || clone.textContent || '';
    return raw
      .split('\n')
      .map(s => s
        .replace(/^\[.*?\]\s*/, '')
        .replace(/^\(.*?\)\s*/, '')
        .replace(/^[가-힣\s]{2,10}\s*(기자|특파원)\s*=\s*/, '')
        .trim()
      )
      .filter(s => s.length >= 15 && !isNoiseSentence(s))
      .join('\n\n');
  }

  let bodyText = '';
  for (const sel of bodySelectors) {
    const el = document.querySelector(sel);
    if (el) {
      const text = extractCleanText(el);
      if (text.length > bodyText.length && text.length > 50) {
        bodyText = text;
      }
    }
  }

  // Fallback: search all paragraphs if specific selector failed
  if (!bodyText || bodyText.length < 80) {
    const allP = Array.from(document.querySelectorAll('p'))
      .map(p => p.innerText.trim())
      .map(s => s
        .replace(/^\[.*?\]\s*/, '')
        .replace(/^\(.*?\)\s*/, '')
        .replace(/^[가-힣\s]{2,10}\s*(기자|특파원)\s*=\s*/, '')
        .trim()
      )
      .filter(s => s.length >= 15 && !isNoiseSentence(s))
      .slice(0, 25);
    if (allP.length > 0) {
      bodyText = allP.join('\n\n');
    }
  }

  const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                 document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  return {
    url,
    title: cleanTitle,
    press: typeof press === 'string' ? press.trim() : '보도매체',
    publishDate: typeof dateMeta === 'string' ? dateMeta.substring(0, 10) : new Date().toISOString().split('T')[0],
    description: ogDesc,
    content: bodyText || ogDesc || cleanTitle,
    ogImage: ogImage || undefined,
    domain: host,
  };
}

// Listen for message from popup or sidepanel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_ARTICLE') {
    try {
      const data = extractArticleFromCurrentPage();
      sendResponse({ success: true, data });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  }
  return true;
});
