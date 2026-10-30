// CardFlow AI Chrome Extension Controller

let currentDeck = null;
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

// Extract article from active Chrome tab
async function extractFromActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      loadDeck(DEFAULT_ARTICLE);
      return;
    }

    // Try messaging content script
    chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_ARTICLE' }, async (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        // Fallback: execute script directly
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
              const title = ogTitle || document.title || '뉴스 기사';
              const ogSite = document.querySelector('meta[property="og:site_name"]')?.content;
              const ogImg = document.querySelector('meta[property="og:image"]')?.content;
              const ps = Array.from(document.querySelectorAll('article p, #dic_area p, #articeBody p, p'))
                .map(p => p.innerText.trim())
                .filter(t => t.length > 25);
              return {
                title,
                press: ogSite || window.location.hostname,
                publishDate: new Date().toISOString().split('T')[0],
                url: window.location.href,
                ogImage: ogImg,
                content: ps.slice(0, 10).join('\n\n') || title
              };
            }
          });
          if (results && results[0]?.result) {
            loadDeck(results[0].result);
            showToast('현재 기사 추출 완료!');
          } else {
            loadDeck(DEFAULT_ARTICLE);
          }
        } catch (e) {
          loadDeck(DEFAULT_ARTICLE);
        }
      } else {
        loadDeck(response.data);
        showToast('현재 기사 추출 완료!');
      }
    });
  } catch (err) {
    loadDeck(DEFAULT_ARTICLE);
  }
}

function loadDeck(article) {
  document.getElementById('articleTitle').innerText = article.title;
  document.getElementById('articleMeta').innerText = `${article.press || '언론사'} • ${article.publishDate || '오늘'}`;

  currentDeck = generateDeckFromArticle(article, {
    aspectRatio: '4:5',
    theme: 'modern-dark',
    channelHandle: '@today_news_pick'
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
      if (val !== 'auto') {
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

  document.getElementById('btnAiImage').addEventListener('click', () => {
    if (!currentDeck) return;
    const slide = currentDeck.slides[activeSlideIndex];
    const encoded = encodeURIComponent(`${slide.title}, modern editorial news photography, 4k`);
    slide.imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1080&seed=${Date.now()}`;
    showToast('AI 이미지 생성 중...');
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
