// Content script for extracting article DOM directly in the active tab

function extractArticleFromCurrentPage() {
  const url = window.location.href;
  const host = window.location.hostname;

  // 1. Title Extraction
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
  const h1Text = document.querySelector('h1')?.innerText?.trim();
  const docTitle = document.title || '';

  const rawTitle = ogTitle || twitterTitle || h1Text || docTitle;
  const cleanTitle = rawTitle
    .replace(/^\[.*?\]\s*/, '')
    .replace(/\s*-\s*[가-힣A-Za-z0-9\s]+뉴스.*$/, '')
    .trim();

  // 2. Press / Source Extraction
  const siteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
                   document.querySelector('meta[name="publisher"]')?.getAttribute('content');

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

  let press = siteName || '';
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
                   document.querySelector('time')?.getAttribute('datetime') ||
                   document.querySelector('time')?.innerText?.trim() ||
                   new Date().toISOString().split('T')[0];

  // 5. Body Text
  const selectors = [
    '#dic_area', // Naver
    '#articeBody', // Daum
    '#article-view-content-div',
    '.article_body',
    '.news_cnt',
    'article',
    '.article-content',
    'main'
  ];

  let bodyText = '';
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      const ps = Array.from(el.querySelectorAll('p'))
        .map(p => p.innerText.trim())
        .filter(t => t.length > 20 && !t.includes('저작권') && !t.includes('무단전재'));
      if (ps.length > 0) {
        bodyText = ps.join('\n\n');
        break;
      }
    }
  }

  if (!bodyText) {
    const allP = Array.from(document.querySelectorAll('p'))
      .map(p => p.innerText.trim())
      .filter(t => t.length > 25 && !t.includes('저작권') && !t.includes('구독'))
      .slice(0, 15);
    bodyText = allP.join('\n\n');
  }

  const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                 document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  return {
    url,
    title: cleanTitle,
    press,
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
