import { CardDeck, Slide, GenerationOptions, AspectRatio, CardThemeId } from '../types';

export interface CategoryInfo {
  key: string;
  badge: string;
  icon: string;
  name: string;
}

export const CATEGORY_LIST: CategoryInfo[] = [
  { key: 'ai', badge: 'AI & 미래기술', icon: '🤖', name: 'AI & 미래기술' },
  { key: 'tech', badge: 'IT & 테크', icon: '💻', name: 'IT & 테크' },
  { key: 'economy', badge: '경제 & 금융', icon: '📈', name: '경제 & 금융' },
  { key: 'business', badge: '기업 & 산업', icon: '🏢', name: '기업 & 산업' },
  { key: 'politics', badge: '정치 & 정책', icon: '🏛️', name: '정치 & 정책' },
  { key: 'society', badge: '사회 & 이슈', icon: '⚖️', name: '사회 & 이슈' },
  { key: 'global', badge: '국제 & 지구촌', icon: '🌍', name: '국제 & 지구촌' },
  { key: 'climate', badge: '환경 & 에너지', icon: '🌱', name: '환경 & 에너지' },
  { key: 'bio', badge: '바이오 & 건강', icon: '🏥', name: '바이오 & 건강' },
  { key: 'culture', badge: '문화 & 엔터', icon: '🎬', name: '문화 & 엔터' },
  { key: 'sports', badge: '스포츠 & 레저', icon: '⚽', name: '스포츠 & 레저' },
  { key: 'lifestyle', badge: '라이프 & 트렌드', icon: '💡', name: '라이프 & 트렌드' },
];

// Curated high quality royalty-free image pool categorized by topic
const TOPIC_IMAGES: Record<string, string[]> = {
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=1200&auto=format&fit=crop',
  ],
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
  ],
  economy: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
  ],
  business: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
  ],
  politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1200&auto=format&fit=crop',
  ],
  society: [
    'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1200&auto=format&fit=crop',
  ],
  global: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop',
  ],
  climate: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop',
  ],
  bio: [
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
  ],
  culture: [
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
  ],
  sports: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
  ],
  lifestyle: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop',
  ],
  default: [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop',
  ]
};

// Category keyword definition & scoring rules
const CATEGORY_RULES: { key: string; patterns: RegExp[] }[] = [
  {
    key: 'ai',
    patterns: [
      /\b(ai|llm|gpt|chatgpt|claude|gemini|deepmind|openai|sora|copilot)\b/i,
      /인공지능|생성형\s*ai|챗봇|거대언어모델|초거대\s*ai|딥러닝|머신러닝|휴머노이드|로봇공학|지능형\s*에이전트/i,
    ]
  },
  {
    key: 'tech',
    patterns: [
      /\b(it|pc|vr|ar|xr|os|app|api|cpu|gpu|chip|tech)\b/i,
      /스마트폰|반도체|파운드리|hbm|메모리|디스플레이|소프트웨어|사이버보안|해킹|클라우드|서버|애플|아이폰|갤럭시|마이크로소프트|인텔|엔비디아|빅테크/i,
    ]
  },
  {
    key: 'economy',
    patterns: [
      /\b(fed|etf|cpi|ipo)\b/i,
      /금리|기준금리|한국은행|연준|환율|원·달러|증시|주가|코스피|코스닥|나스닥|다우|부동산|아파트|청약|물가|인플레이션|채권|가계부채|예금|적금|비트코인|주식|배당/i,
    ]
  },
  {
    key: 'business',
    patterns: [
      /\b(ceo|m&a|b2b|b2c)\b/i,
      /영업이익|매출|실적|분기|흑자|적자|상장|인수합병|스타트업|대표이사|회장|구조조정|지배구조|투자유치|시가총액/i,
    ]
  },
  {
    key: 'politics',
    patterns: [
      /국회|대통령|총리|여당|야당|국민의힘|더불어민주당|국정감사|청문회|법안|국회의원|선거|투표|장관|정부|기재부|외교부|법무부|정치/i,
    ]
  },
  {
    key: 'climate',
    patterns: [
      /\b(ev|esg)\b/i,
      /기후|기후변화|온난화|탄소|탄소중립|친환경|전기차|배터리|이차전지|전고체|신재생|태양광|풍력|에너지|폭염|한파|이상기후/i,
    ]
  },
  {
    key: 'bio',
    patterns: [
      /\b(fda)\b/i,
      /신약|임상|제약|바이오|치료제|백신|병원|의사|간호사|질병|암|의학|식약처|헬스케어|의료대란|건강검진/i,
    ]
  },
  {
    key: 'culture',
    patterns: [
      /\b(k-pop|kpop|ott)\b/i,
      /영화|드라마|배우|감독|아이돌|가수|음악|앨범|빌보드|넷플릭스|콘서트|웹툰|예술|전시회|뮤지컬|연예/i,
    ]
  },
  {
    key: 'sports',
    patterns: [
      /\b(kbo|epl|nba|mlb)\b/i,
      /축구|야구|골프|농구|배구|손흥민|이강인|김하성|오타니|올림픽|월드컵|프리미어리그|경기|승리|우승|메달|국가대표/i,
    ]
  },
  {
    key: 'global',
    patterns: [
      /\b(un|nato)\b/i,
      /미국|중국|일본|러시아|우크라이나|이스라엘|중동|유럽|외교|정상회담|백악관|나토|관세|무역분쟁|지정학/i,
    ]
  },
  {
    key: 'society',
    patterns: [
      /경찰|검찰|법원|판결|구속|기소|재판|수사|교통|사고|화재|소방|지하철|교육|입시|노동|파업|노조|사기/i,
    ]
  },
  {
    key: 'lifestyle',
    patterns: [
      /워라밸|주 4.5일|주 4일|직장인|퇴근|여행|맛집|소비|트렌드|mz|취미|반려동물|휴가|꿀팁|라이프/i,
    ]
  }
];

// Detect category with multi-keyword frequency scoring
export function detectCategory(text: string, title: string = ''): { key: string; badge: string; icon: string } {
  const scores: Record<string, number> = {};

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const pat of rule.patterns) {
      // Title match gives 5x weight
      if (title) {
        const titleMatches = title.match(new RegExp(pat.source, 'gi'));
        if (titleMatches) {
          score += titleMatches.length * 5;
        }
      }
      // Content match gives 1x weight
      const contentMatches = text.match(new RegExp(pat.source, 'gi'));
      if (contentMatches) {
        score += contentMatches.length;
      }
    }
    if (score > 0) {
      scores[rule.key] = score;
    }
  }

  // Find the category with highest score
  let bestKey = 'society';
  let maxScore = 0;
  for (const [key, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestKey = key;
    }
  }

  const found = CATEGORY_LIST.find(c => c.key === bestKey) || CATEGORY_LIST[5];
  return { key: found.key, badge: found.badge, icon: found.icon };
}

// Extract keywords for hashtags and images
export function extractKeywords(text: string, title: string): string[] {
  const combined = `${title} ${text}`;
  const words = combined.match(/[가-힣a-zA-Z0-9]{2,12}/g) || [];
  
  const stopWords = new Set([
    '기자', '뉴스', '보도', '통해', '이번', '지난', '관련', '대한', '있는', '것으로', '따르면', 
    '위해', '하는', '에서', '으로', '부터', '또한', '하지만', '그리고', '이날', '오전', '오후', 
    '현재', '경우', '있다', '했다', '된다', '됐다', '무단', '전재', '재배포', '금지'
  ]);

  const freq: Record<string, number> = {};
  for (const w of words) {
    if (stopWords.has(w) || w.length < 2) continue;
    freq[w] = (freq[w] || 0) + 1;
  }

  // Weight words in title higher
  const titleWords = title.match(/[가-힣a-zA-Z0-9]{2,12}/g) || [];
  for (const tw of titleWords) {
    if (!stopWords.has(tw) && tw.length >= 2) {
      freq[tw] = (freq[tw] || 0) + 5;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);
}

// Clean and split article into logical sentences
export function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\[.*?\]|\(.*?\)|<.*?>/g, '') // remove brackets
    .split(/(?<=[.!?。])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length >= 15 && s.length <= 250);
}

// Generate high quality one-line summary of the entire article
export function generateOneLineSummary(params: {
  title: string;
  content: string;
  description?: string;
  sentences: string[];
}): string {
  const { title, description, sentences } = params;

  // 1. If description exists and is a good concise summary (between 30 and 160 chars, not identical to title)
  if (description) {
    const cleanDesc = description
      .replace(/^\[.*?\]\s*/, '')
      .replace(/\s*-\s*[가-힣A-Za-z0-9\s]+뉴스.*$/, '')
      .replace(/[가-힣\s]+기자\s*=\s*/, '')
      .replace(/기자입니다|기자|구독|무단\s*전재/g, '')
      .trim();
    if (cleanDesc.length >= 30 && cleanDesc.length <= 160 && cleanDesc !== title) {
      return cleanDesc.endsWith('.') ? cleanDesc : `${cleanDesc}.`;
    }
  }

  // 2. Score sentences from article lead
  if (sentences.length > 0) {
    const candidates = sentences.slice(0, 4);
    let bestSentence = candidates[0];
    let bestScore = -1;

    const titleWords = title.match(/[가-힣a-zA-Z0-9]{2,}/g) || [];

    for (const sent of candidates) {
      if (sent.length < 25 || sent.length > 160) continue;
      if (sent.includes('기자') || sent.includes('무단전재') || sent.includes('구독')) continue;

      let score = 0;
      for (const tw of titleWords) {
        if (sent.includes(tw)) score += 3;
      }
      if (/발표|공개|착수|돌파|도입|확정|합의|출시|성공|전망|결정|강조|밝혔다|나타났다/i.test(sent)) {
        score += 4;
      }
      if (score > bestScore) {
        bestScore = score;
        bestSentence = sent;
      }
    }

    if (bestSentence) {
      let clean = bestSentence
        .replace(/^\[.*?\]\s*/, '')
        .replace(/^[가-힣\s]+기자\s*=\s*/, '')
        .replace(/^[가-힣\s]+특파원\s*=\s*/, '')
        .trim();
      return clean.endsWith('.') ? clean : `${clean}.`;
    }
  }

  return `${title}에 대한 핵심 요약 및 주요 변화 포인트 브리핑입니다.`;
}

// Generate Card Deck from Article Data
export function generateCardDeckFromText(params: {
  title: string;
  content: string;
  pressName: string;
  publishDate?: string;
  sourceUrl?: string;
  ogImage?: string;
  description?: string;
  options?: Partial<GenerationOptions>;
}): CardDeck {
  const {
    title,
    content,
    pressName,
    publishDate = new Date().toISOString().split('T')[0],
    sourceUrl,
    ogImage,
    description,
    options = {}
  } = params;

  const slideCount = options.slideCount || 5;
  const aspectRatio: AspectRatio = options.aspectRatio || '4:5';
  const themeId: CardThemeId = options.themeId || 'modern-dark';
  const channelHandle = options.channelHandle || '@today_news_pick';

  let category = detectCategory(content, title);
  if (options.selectedCategory && options.selectedCategory !== 'auto') {
    const customMatch = CATEGORY_LIST.find(
      c => c.key === options.selectedCategory || c.badge === options.selectedCategory || c.name === options.selectedCategory
    );
    if (customMatch) {
      category = { key: customMatch.key, badge: customMatch.badge, icon: customMatch.icon };
    } else {
      category = { key: 'custom', badge: options.selectedCategory, icon: '📌' };
    }
  }

  const keywords = extractKeywords(content, title);
  const sentences = splitSentences(content);

  // Fallback image pool
  const topicImageList = TOPIC_IMAGES[category.key] || TOPIC_IMAGES.default;
  const coverImage = ogImage || topicImageList[0];

  // Clean headline
  let cleanTitle = title
    .replace(/^\[.*?\]\s*/, '')
    .replace(/\s*-\s*[가-힣]+뉴스.*$/, '')
    .trim();

  // Divide sentences into sections
  const primarySentences = sentences.slice(0, 8);
  const oneLineSummary = generateOneLineSummary({ title, content, description, sentences });

  const slides: Slide[] = [];

  // 1. Cover Slide
  slides.push({
    id: 'slide-1',
    type: 'cover',
    badge: `${category.icon} ${category.badge}`,
    title: cleanTitle,
    subtitle: oneLineSummary,
    oneLineSummary: oneLineSummary,
    bullets: [],
    imageUrl: coverImage,
    imagePrompt: `${keywords.slice(0, 3).join(', ')}, high quality journalism photography`,
    imageOverlayOpacity: 0.65,
    layout: 'hero',
    highlightTag: 'HOT ISSUE',
  });

  // 2. Issue Background / "무슨 일인가요?"
  const issueBullets = primarySentences.slice(0, 2).map(s => s.replace(/다\.$/, '음.').replace(/했다\.$/, '함.'));
  slides.push({
    id: 'slide-2',
    type: 'intro',
    badge: '01 | ISSUE SUMMARY',
    title: '무슨 일이 일어났나요?',
    subtitle: '한눈에 파악하는 사건의 발단과 핵심 배경',
    bullets: issueBullets.length > 0 ? issueBullets : [
      '관련 분야에서 새로운 정책 및 시장 변화가 본격화되었습니다.',
      '업계 및 소비자들의 관심이 집중되며 주요 화두로 부상하고 있습니다.'
    ],
    imageUrl: topicImageList[1 % topicImageList.length],
    imageOverlayOpacity: 0.6,
    layout: 'bullet-list',
    highlightTag: '핵심 쟁점',
  });

  // 3. Key Detail 1 / Core Point
  const point1Sentences = sentences.slice(2, 4);
  slides.push({
    id: 'slide-3',
    type: 'point',
    badge: '02 | KEY POINT',
    title: '주요 변화와 주목할 부분',
    subtitle: '기존과 달라지는 점 & 핵심 인사이트',
    bullets: point1Sentences.length > 0
      ? point1Sentences.map(s => s.replace(/다\.$/, '며 시장 영향력이 확대되는 중입니다.'))
      : [
          '전문가들은 이번 조치가 가져올 파급력에 주목하고 있습니다.',
          '기존 생태계와의 차별화된 전략이 중요한 분기점이 될 전망입니다.'
        ],
    imageUrl: topicImageList[2 % topicImageList.length],
    imageOverlayOpacity: 0.6,
    layout: 'bullet-list',
    highlightTag: '변화 포인트',
  });

  // 4. Key Detail 2 or Impact (if slide count >= 5)
  if (slideCount >= 5) {
    const point2Sentences = sentences.slice(4, 6);
    slides.push({
      id: 'slide-4',
      type: 'point',
      badge: '03 | MARKET & IMPACT',
      title: '시장과 대중의 반응은?',
      subtitle: '관련 업계의 시선과 파급 효과',
      bullets: point2Sentences.length > 0
        ? point2Sentences.map(s => s)
        : [
            '소비자와 시장 참여자들 사이에서 긍정적 기대와 우려가 교차하고 있습니다.',
            '향후 관련 가이드라인과 후속 대책 발표에 이목이 쏠립니다.'
          ],
      imageUrl: topicImageList[3 % topicImageList.length],
      imageOverlayOpacity: 0.6,
      layout: 'bullet-list',
      highlightTag: '파급 효과',
    });
  }

  // 5. Conclusion & Discussion Slide
  slides.push({
    id: `slide-${slides.length + 1}`,
    type: 'conclusion',
    badge: '04 | CONCLUSION',
    title: '앞으로 어떻게 될까요?',
    subtitle: '요약 정리 & 여러분의 생각은?',
    bullets: [
      '단기적 관심에 그치지 않고 장기적 트렌드로 자리잡을지 주목됩니다.',
      '관련 소식은 지속적으로 업데이트될 예정입니다.',
      '💬 여러분은 이번 변화에 대해 어떻게 생각하시나요? 댓글로 남겨주세요!'
    ],
    imageUrl: topicImageList[4 % topicImageList.length],
    imageOverlayOpacity: 0.7,
    layout: 'left',
    highlightTag: '토론 & 질문',
  });

  // 6. Source Slide (if requested)
  if (slideCount >= 6) {
    slides.push({
      id: `slide-${slides.length + 1}`,
      type: 'source',
      badge: 'SOURCE & INFO',
      title: '출처 및 기사 정보',
      subtitle: cleanTitle,
      bullets: [
        `언론사: ${pressName || '주요 보도매체'}`,
        `보도일자: ${publishDate}`,
        sourceUrl ? `원문 링크: ${sourceUrl}` : '정확하고 신속한 정보 전달을 지향합니다.',
        '본 카드뉴스는 원문 보도를 바탕으로 요약 제작되었습니다.'
      ],
      imageUrl: coverImage,
      imageOverlayOpacity: 0.8,
      layout: 'center',
      highlightTag: '보도 출처',
    });
  }

  // Generate Hashtags
  const baseTags = ['카드뉴스', '뉴스요약', '이슈브리핑', category.badge.replace(/\s+/g, '')];
  const dynamicTags = keywords.slice(0, 5).map(k => k.replace(/[^가-힣a-zA-Z0-9]/g, ''));
  const allTags = Array.from(new Set([...baseTags, ...dynamicTags])).filter(Boolean);

  // Generate Social Caption for Instagram / Threads
  const caption = `📰 [${category.badge}] ${cleanTitle}\n\n` +
    `바쁜 일상 속 꼭 챙겨봐야 할 오늘의 핵심 이슈를 정리해 드립니다! 👇\n\n` +
    `📌 핵심 요약 포인트:\n` +
    slides.slice(1, 4).map(s => `• ${s.title}: ${s.bullets[0] || s.subtitle}`).join('\n') +
    `\n\n💬 여러분의 생각은 어떠신가요? 댓글로 자유롭게 의견을 나눠주세요!\n` +
    `👉 유익하셨다면 [좋아요 & 저장 & 공유] 부탁드립니다!\n\n` +
    `[출처] ${pressName || '언론사 보도'} (${publishDate})\n\n` +
    allTags.map(t => `#${t}`).join(' ');

  return {
    id: `deck-${Date.now()}`,
    originalUrl: sourceUrl,
    pressName: pressName || '보도매체',
    publishDate,
    originalTitle: title,
    slides,
    themeId,
    aspectRatio,
    channelHandle,
    showWatermark: true,
    showPageNumbers: true,
    showSourceBadge: true,
    showSwipeHint: true,
    tags: allTags,
    caption,
  };
}
