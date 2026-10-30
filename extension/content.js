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

  function extractCleanText(el) {
    if (!el) return '';
    const clone = el.cloneNode(true);
    
    // Remove unwanted widgets, figures, captions, ads, share buttons
    const noise = clone.querySelectorAll(
      'script, style, noscript, iframe, svg, figure, figcaption, button, select, ' +
      '.ad, .ads, .advertisement, .reporter_area, .byline, .sns_share, .sns-share, ' +
      '.copyright, #comment, .comment, .article_footer, .news_notice, .end_photo_org, ' +
      '.media_end_linked_more'
    );
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
      .map(s => s.trim())
      .filter(s => s.length >= 15 && !s.includes('기자') && !s.includes('무단전재') && !s.includes('재배포') && !s.includes('구독'))
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
      .filter(t => t.length > 20 && !t.includes('기자') && !t.includes('저작권') && !t.includes('구독'))
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
