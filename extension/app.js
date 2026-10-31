// CardFlow AI Chrome Extension Controller

let currentDeck = null;
let currentArticle = null;
let activeSlideIndex = 0;

const DEFAULT_ARTICLE = {
  title: '글로벌 빅테크, 차세대 지능형 자율 AI 에이전트 동시 공개... "지시만 하면 스스로 코딩·업무 완결"',
  press: '테크타임스',
  publishDate: '2026.10.30',
  url: 'https://news.example.com',
  ogImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop',
  content: '글로벌 인공지능 연구팀들이 컴퓨터와 브라우저 환경을 직접 제어하며 복잡한 다단계 업무를 스스로 완결하는 차세대 AI 에이전트 아키텍처를 공식 공개했습니다. 단순 챗봇을 넘어 코드를 작성하고 실행하는 실질적 자율성이 특징입니다.'
};

const canvas = document.getElementById('cardCanvas');
const toastEl = document.getElementById('toast');

function showToast(msg) {
  toastEl.innerText = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2000);
}

// Render active slide to canvas
async function updateCanvas() {
  if (!currentDeck || !canvas) return;
  const slide = currentDeck.slides[activeSlideIndex];
  await renderCardToCanvas(canvas, slide, currentDeck, activeSlideIndex, currentDeck.slides.length);
  renderThumbnails();
  updateEditorFields();
}

// Render thumbnail strip
function renderThumbnails() {
  const container = document.getElementById('thumbnailsStrip');
  if (!container || !currentDeck) return;
  container.innerHTML = '';

  currentDeck.slides.forEach((s, idx) => {
    const card = document.createElement('div');
    card.className = `thumb-card ${idx === activeSlideIndex ? 'active' : ''}`;
    card.innerHTML = `
      <div style="font-weight:700; color:#a78bfa;">${String(idx + 1).padStart(2, '0')}</div>
      <div style="color:#e2e8f0; font-weight:600; line-height:1.1; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${s.title}</div>
      <div style="color:#64748b; font-size:8px;">${s.badge || '슬라이드'}</div>
    `;
    card.addEventListener('click', () => {
      activeSlideIndex = idx;
      updateCanvas();
    });
    container.appendChild(card);
  });
}

// Update Editor form
function updateEditorFields() {
  if (!currentDeck) return;
  const slide = currentDeck.slides[activeSlideIndex];
  const editBadgeEl = document.getElementById('editBadge');
  if (editBadgeEl) editBadgeEl.value = slide.badge || '';
  document.getElementById('editTitle').value = slide.title || '';
  document.getElementById('editSubtitle').value = slide.subtitle || '';
  document.getElementById('editBullets').value = (slide.bullets || []).join('\n');
  document.getElementById('overlaySlider').value = slide.overlay !== undefined ? slide.overlay : 0.65;
  document.getElementById('overlayVal').innerText = `${Math.round((slide.overlay ?? 0.65) * 100)}%`;
}

// Standalone in-page article extractor (executed in active tab context)
function extractArticleDirectly() {
  const url = window.location.href;
  const host = window.location.hostname;

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

  // 1. Title Extraction
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
  const headlineEl = document.querySelector('h1, #title_area, .media_end_head_headline, .tit_view, .article-head-title, .news_title');
  const h1Text = headlineEl?.innerText?.trim();
  const docTitle = document.title || '';

  const rawTitle = ogTitle || twitterTitle || h1Text || docTitle;
  const cleanTitle = (rawTitle || '뉴스 기사')
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
    '#newsct_article',                                // Naver News modern container
    '.newsct_article',                                // Naver News
    '.article_view',                                  // Daum News modern
    '#articleBody',                                   // Daum / Korean press
    '#articeBody',                                    // Daum typo fallback
    'section[dmcf-sid]',                              // Daum news content sections
    '#article-view-content-div',                      // General Korean Press
    '#article_body', '.article_body',                 // Chosun, Joongang
    '.article-body', '#article-body',                 // General press
    '.news_cnt', '#news_body_area',                   // Donga, Hankyung
    '.story-news', '.view_con',                       // YNA, Newsis
    '.article-content', '.article_text',              // SBS, MBC, KBS
    '#real-artcl', '#articleContnts',                 // Nate News
    '.art_body',                                      // Kyunghyang
    '.editor-content',                                // Hankook Ilbo
    '[itemprop="articleBody"]',
    'article',
    'main',
    '.post-content', '.entry-content'
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

  function cleanRawText(raw) {
    if (!raw) return '';
    return raw
      .replace(/\[(?:사진|자료사진|그래픽|도표|캡처|제공|출처|포토|단독|속보)[\s\S]*?\]/gi, ' ')
      .replace(/\((?:사진|자료사진|그래픽|도표|캡처|제공|출처|포토)[\s\S]*?\)/gi, ' ')
      .replace(/\[\s*[^\]]*(?:재판매|저작권자|무단\s*전재|DB|copyright)[\s\S]*?\]/gi, ' ')
      .replace(/\(\s*[^\)]*(?:재판매|저작권자|무단\s*전재|DB|copyright)[\s\S]*?\)/gi, ' ')
      .replace(/\([가-힣\s=]+(?:뉴스|통신|일보|신문|방송|연합뉴스)\)\s*[가-힣\s]{2,8}\s*(?:기자|특파원)?\s*=\s*/g, ' ')
      .replace(/^[가-힣\s]{2,8}\s*(?:기자|특파원)\s*=\s*/g, ' ')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/[ \u00a0\u2000-\u200b]+/g, ' ');
  }

  function isNoiseSentence(text) {
    if (!text || typeof text !== 'string') return true;
    const trimmed = text.trim();
    if (trimmed.length < 15) return true;

    // 1. Photo caption bullets or markers at start
    if (/^[▲△▼▽◆◇■□●○▶▷ⓒ\*\#\•\-]/.test(trimmed)) return true;

    // 2. Pure photo / graphic / copyright caption lines
    if (/^(사진|자료사진|그래픽|도표|출처|캡처)\s*(=|:|\/)/i.test(trimmed)) return true;
    if (/(기념촬영을 하고 있다|기념사진을 찍고 있다|포즈를 취하고 있다)\s*$/i.test(trimmed)) return true;
    if (/^(저작권자|무단\s*전재|재배포\s*금지|all rights reserved|copyright)/i.test(trimmed)) return true;

    // 3. Short standalone noise lines (< 60 chars)
    if (trimmed.length < 60) {
      if (/(연합뉴스\s*자료사진|뉴스1\s*DB|뉴시스\s*DB|게티이미지|gettyimages)/i.test(trimmed)) return true;
      if (/(모습이다|모습\.|전경이다|전경\.|장면이다|장면\.)\s*$/i.test(trimmed)) return true;
      if (/(기사와\s*직접적인\s*관련\s*없음|기사\s*내용과\s*무관)/i.test(trimmed)) return true;
      if (/(네이버\s*메인|채널\s*추가|플러스친구|앱\s*다운로드|뉴스레터\s*구독|소식받기)/i.test(trimmed)) return true;
      if (/(제보를\s*기다립니다|독자\s*제보|제보창구|02-\d{3,4}-\d{4})/i.test(trimmed)) return true;
      if (/(관련기사\s*더보기|추천기사|인기기사|많이\s*본\s*뉴스|실시간\s*인기|놓치지\s*마세요)/i.test(trimmed)) return true;
      if (/(무단\s*전재|재배포\s*금지|불펌\s*금지)/i.test(trimmed)) return true;
      if (/^[가-힣\s]{2,10}\s*(기자|특파원|논설위원)\s*(\[|\(|\/|<|@|\.|$)/i.test(trimmed)) return true;
      if (/^(공유|댓글|좋아요|인쇄|폰트|글자크기|스크랩|신고|수정|등록)/i.test(trimmed)) return true;
    }

    return false;
  }

  function extractCleanText(el) {
    if (!el) return '';
    const clone = el.cloneNode(true);
    
    // 1. Remove unwanted widgets, figures, captions, ads, banners
    const noise = clone.querySelectorAll(NOISE_SELECTORS.join(', '));
    noise.forEach(n => n.remove());

    // 2. Replace line break tags with newlines to keep paragraphs intact
    clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    clone.querySelectorAll('p, div, li, tr').forEach(b => {
      b.prepend('\n');
      b.append('\n');
    });

    const raw = clone.innerText || clone.textContent || '';
    const cleaned = cleanRawText(raw);

    return cleaned
      .split(/(?<=[.!?。])\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length >= 18 && !isNoiseSentence(s))
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

  // 6. Extract all real editorial images from the article body
  const articleImages = [];
  if (ogImage && !ogImage.includes('favicon') && !ogImage.includes('default')) {
    articleImages.push(ogImage);
  }

  for (const sel of bodySelectors) {
    const el = document.querySelector(sel);
    if (el) {
      const imgs = el.querySelectorAll('img');
      imgs.forEach(img => {
        let src = img.getAttribute('data-src') || 
                  img.getAttribute('data-original') || 
                  img.getAttribute('data-lazy-src') || 
                  img.getAttribute('src');
        if (!src) return;
        if (src.startsWith('//')) src = 'https:' + src;
        else if (src.startsWith('/')) src = window.location.origin + src;

        if (/icon|badge|logo|ad\.|banner|button|btn|blank|pixel|track|spinner|share|loading|emoticon|profile|avatar/i.test(src)) {
          return;
        }

        const baseSrc = src.split('?')[0];
        const exists = articleImages.some(existing => existing.split('?')[0] === baseSrc);
        if (!exists) {
          articleImages.push(src);
        }
      });
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
    images: articleImages,
    domain: host,
  };
}

// Extract article from active Chrome tab
async function extractFromActiveTab() {
  showToast('현재 탭 기사 분석 중...');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
      loadDeck(DEFAULT_ARTICLE);
      showToast('예시 기사 로드됨 (시스템 페이지)');
      return;
    }

    let articleData = null;

    // 1. Direct Script Execution (works directly in active tab context)
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractArticleDirectly
      });

      if (results && results[0]?.result && results[0].result.content && results[0].result.content.length > 50) {
        articleData = results[0].result;
      }
    } catch (scriptErr) {
      console.warn('executeScript failed, trying backend fallback:', scriptErr);
    }

    // 2. Local Backend Studio Fallback (/api/extract)
    if (!articleData && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
      try {
        const resp = await fetch('http://localhost:3000/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: tab.url })
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.content && data.content.length > 50) {
            articleData = data;
          }
        }
      } catch (backendErr) {
        console.warn('Backend extraction fallback notice:', backendErr);
      }
    }

    // 3. Content Script Messaging Fallback
    if (!articleData) {
      articleData = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_ARTICLE' }, (response) => {
          if (!chrome.runtime.lastError && response && response.success && response.data?.content && response.data.content.length > 50) {
            resolve(response.data);
          } else {
            resolve(null);
          }
        });
      });
    }

    if (articleData && articleData.content && articleData.content.length > 30) {
      loadDeck(articleData);
      showToast('현재 기사 본문 추출 및 요약 완료!');
    } else {
      loadDeck(DEFAULT_ARTICLE);
      showToast('본문 추출 불가로 예시 기사를 로드했습니다.');
    }
  } catch (err) {
    console.error('Extraction error:', err);
    loadDeck(DEFAULT_ARTICLE);
  }
}

function loadDeck(article, categoryOption = null) {
  currentArticle = article;
  document.getElementById('articleTitle').innerText = article.title;
  document.getElementById('articleMeta').innerText = `${article.press || '언론사'} • ${article.publishDate || '오늘'}`;

  const currentRatio = document.querySelector('.seg-btn.active')?.dataset.ratio || '4:5';
  const currentTheme = document.querySelector('.theme-dot.active')?.dataset.theme || 'modern-dark';
  const selectedCat = categoryOption !== null ? categoryOption : (document.getElementById('selectCategory')?.value || 'auto');

  currentDeck = generateDeckFromArticle(article, {
    aspectRatio: currentRatio,
    theme: currentTheme,
    channelHandle: '@today_news_pick',
    category: selectedCat
  });
  activeSlideIndex = 0;
  updateCanvas();
}

// Download canvas as image
function downloadCurrentCard() {
  const link = document.createElement('a');
  link.download = `card_${String(activeSlideIndex + 1).padStart(2, '0')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('현재 카드 저장 완료!');
}

// Batch export to ZIP
async function exportAllToZip() {
  if (!currentDeck || !window.JSZip) return;
  showToast('전체 카드 ZIP 생성 중...');

  const zip = new JSZip();
  const originalIndex = activeSlideIndex;
  const offscreenCanvas = document.createElement('canvas');

  for (let i = 0; i < currentDeck.slides.length; i++) {
    const s = currentDeck.slides[i];
    await renderCardToCanvas(offscreenCanvas, s, currentDeck, i, currentDeck.slides.length);
    const dataUrl = offscreenCanvas.toDataURL('image/png');
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    const num = String(i + 1).padStart(2, '0');
    zip.file(`${num}_slide.png`, base64, { base64: true });
  }

  zip.file('caption_and_tags.txt', `${currentDeck.caption}\n\n[출처] ${currentDeck.press}\nURL: ${currentDeck.url || ''}`);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `카드뉴스_${Date.now()}.zip`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);

  showToast('전체 ZIP 다운로드 완료!');
}

// Copy Instagram Caption
async function copyCaption() {
  if (!currentDeck) return;
  await navigator.clipboard.writeText(currentDeck.caption);
  showToast('SNS 캡션 및 해시태그 복사완료!');
}

// Init Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  extractFromActiveTab();

  document.getElementById('btnExtract').addEventListener('click', extractFromActiveTab);
  document.getElementById('btnOpenWeb').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });

  // Navigation Arrows
  document.getElementById('btnPrev').addEventListener('click', () => {
    if (activeSlideIndex > 0) {
      activeSlideIndex--;
      updateCanvas();
    }
  });

  document.getElementById('btnNext').addEventListener('click', () => {
    if (currentDeck && activeSlideIndex < currentDeck.slides.length - 1) {
      activeSlideIndex++;
      updateCanvas();
    }
  });

  // Aspect Ratio Buttons
  document.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDeck.aspectRatio = btn.dataset.ratio;
      updateCanvas();
    });
  });

  // Theme Dots
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      currentDeck.theme = dot.dataset.theme;
      updateCanvas();
    });
  });

  // Editor Inputs
  const editBadgeEl = document.getElementById('editBadge');
  if (editBadgeEl) {
    editBadgeEl.addEventListener('input', (e) => {
      if (currentDeck) {
        currentDeck.slides[activeSlideIndex].badge = e.target.value;
        updateCanvas();
      }
    });
  }

  const selectCatEl = document.getElementById('selectCategory');
  if (selectCatEl) {
    selectCatEl.addEventListener('change', (e) => {
      if (!currentDeck) return;
      const val = e.target.value;
      if (currentArticle) {
        loadDeck(currentArticle, val);
        showToast(`카테고리: ${val === 'auto' ? '자동 감지' : val}`);
      } else if (val !== 'auto') {
        currentDeck.slides[0].badge = val;
        if (activeSlideIndex === 0 && editBadgeEl) {
          editBadgeEl.value = val;
        }
        updateCanvas();
        showToast(`카테고리: ${val}`);
      }
    });
  }

  document.getElementById('editTitle').addEventListener('input', (e) => {
    if (currentDeck) {
      currentDeck.slides[activeSlideIndex].title = e.target.value;
      updateCanvas();
    }
  });

  document.getElementById('editSubtitle').addEventListener('input', (e) => {
    if (currentDeck) {
      currentDeck.slides[activeSlideIndex].subtitle = e.target.value;
      updateCanvas();
    }
  });

  document.getElementById('editBullets').addEventListener('input', (e) => {
    if (currentDeck) {
      currentDeck.slides[activeSlideIndex].bullets = e.target.value.split('\n').filter(Boolean);
      updateCanvas();
    }
  });

  document.getElementById('overlaySlider').addEventListener('input', (e) => {
    if (currentDeck) {
      const val = parseFloat(e.target.value);
      currentDeck.slides[activeSlideIndex].overlay = val;
      document.getElementById('overlayVal').innerText = `${Math.round(val * 100)}%`;
      updateCanvas();
    }
  });

  const btnCycleImg = document.getElementById('btnCycleArticleImage');
  if (btnCycleImg) {
    btnCycleImg.addEventListener('click', () => {
      if (!currentDeck || !currentArticle) return;
      const images = (Array.isArray(currentArticle.images) && currentArticle.images.length > 0)
        ? currentArticle.images
        : (currentArticle.ogImage ? [currentArticle.ogImage] : []);

      if (images.length === 0) {
        showToast('적용 가능한 기사 사진이 없습니다.');
        return;
      }

      const slide = currentDeck.slides[activeSlideIndex];
      const curIdx = images.indexOf(slide.imageUrl);
      const nextIdx = (curIdx + 1) % images.length;
      slide.imageUrl = images[nextIdx];
      updateCanvas();
      showToast(`기사 사진 ${nextIdx + 1}/${images.length} 적용됨`);
    });
  }

  document.getElementById('btnAiImage').addEventListener('click', () => {
    if (!currentDeck) return;
    const slide = currentDeck.slides[activeSlideIndex];
    const tagsStr = (currentDeck.tags || []).slice(0, 3).join(', ');
    const prompt = `${slide.title}, ${tagsStr}, editorial journalism photography, cinematic lighting, ultra-realistic, 4k`;
    const encoded = encodeURIComponent(prompt);
    slide.imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1350&nologo=true&seed=${Date.now()}`;
    showToast('본문 맞춤 AI 이미지 생성 중...');
    updateCanvas();
  });

  document.getElementById('btnAddSlide').addEventListener('click', () => {
    if (!currentDeck) return;
    currentDeck.slides.push({
      id: `s_${Date.now()}`,
      badge: '추가 포인트',
      title: '새로운 요약 슬라이드',
      subtitle: '서브타이틀을 입력하세요',
      bullets: ['핵심 요약 내용을 입력하세요.'],
      imageUrl: currentDeck.slides[0]?.imageUrl,
      overlay: 0.65
    });
    activeSlideIndex = currentDeck.slides.length - 1;
    updateCanvas();
  });

  // Action Buttons
  document.getElementById('btnExportSingle').addEventListener('click', downloadCurrentCard);
  document.getElementById('btnExportZip').addEventListener('click', exportAllToZip);
  document.getElementById('btnCopyCaption').addEventListener('click', copyCaption);
});
