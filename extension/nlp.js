// Client-side NLP Summarizer for Chrome Extension

const CATEGORY_LIST = [
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

const TOPIC_IMAGES = {
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop',
  ],
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop',
  ],
  economy: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop',
  ],
  business: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
  ],
  politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
  ],
  society: [
    'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=1200&auto=format&fit=crop',
  ],
  global: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
  ],
  climate: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop',
  ],
  bio: [
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1200&auto=format&fit=crop',
  ],
  culture: [
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
  ],
  sports: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
  ],
  lifestyle: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
  ]
};

const CATEGORY_RULES = [
  {
    key: 'ai',
    patterns: [
      /\b(ai|llm|gpt|chatgpt|claude|gemini|deepmind|openai|sora|copilot)\b/i,
      /인공지능|생성형\s*ai|챗봇|거대언어모델|초거대\s*ai|딥러닝|머신러닝|휴머노이드|로봇공학/i,
    ]
  },
  {
    key: 'tech',
    patterns: [
      /\b(it|pc|vr|ar|xr|os|app|api|cpu|gpu|chip|tech)\b/i,
      /스마트폰|반도체|파운드리|hbm|메모리|디스플레이|소프트웨어|사이버보안|클라우드|서버|애플|아이폰|갤럭시/i,
    ]
  },
  {
    key: 'economy',
    patterns: [
      /\b(fed|etf|cpi|ipo)\b/i,
      /금리|기준금리|한국은행|연준|환율|원·달러|증시|주가|코스피|코스닥|나스닥|부동산|아파트|청약|물가|인플레이션|채권|가계부채|비트코인|주식/i,
    ]
  },
  {
    key: 'business',
    patterns: [
      /\b(ceo|m&a)\b/i,
      /영업이익|매출|실적|분기|흑자|적자|상장|인수합병|스타트업|대표이사|회장|구조조정|투자유치|시가총액/i,
    ]
  },
  {
    key: 'politics',
    patterns: [
      /국회|대통령|총리|여당|야당|국민의힘|더불어민주당|국정감사|청문회|법안|국회의원|선거|투표|장관|정부|정치/i,
    ]
  },
  {
    key: 'climate',
    patterns: [
      /\b(ev|esg)\b/i,
      /기후|기후변화|온난화|탄소|탄소중립|친환경|전기차|배터리|이차전지|전고체|신재생|태양광|풍력|에너지|폭염|한파/i,
    ]
  },
  {
    key: 'bio',
    patterns: [
      /\b(fda)\b/i,
      /신약|임상|제약|바이오|치료제|백신|병원|의사|간호사|질병|암|의학|식약처|헬스케어|의료대란/i,
    ]
  },
  {
    key: 'culture',
    patterns: [
      /\b(k-pop|kpop|ott)\b/i,
      /영화|드라마|배우|감독|아이돌|가수|음악|앨범|빌보드|넷플릭스|콘서트|웹툰|예술|뮤지컬|연예/i,
    ]
  },
  {
    key: 'sports',
    patterns: [
      /\b(kbo|epl|nba|mlb)\b/i,
      /축구|야구|골프|농구|배구|손흥민|이강인|김하성|오타니|올림픽|월드컵|프리미어리그|경기|승리|우승|선수/i,
    ]
  },
  {
    key: 'global',
    patterns: [
      /\b(un|nato)\b/i,
      /미국|중국|일본|러시아|우크라이나|이스라엘|중동|유럽|외교|정상회담|백악관|나토|관세|무역분쟁/i,
    ]
  },
  {
    key: 'society',
    patterns: [
      /경찰|검찰|법원|판결|구속|기소|재판|수사|교통|사고|화재|소방|지하철|교육|입시|노동|파업|노조/i,
    ]
  },
  {
    key: 'lifestyle',
    patterns: [
      /워라밸|주 4.5일|주 4일|직장인|퇴근|여행|맛집|소비|트렌드|mz|취미|반려동물|휴가|꿀팁/i,
    ]
  }
];

function detectCategory(text, title = '') {
  const scores = {};

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const pat of rule.patterns) {
      if (title) {
        const titleMatches = title.match(new RegExp(pat.source, 'gi'));
        if (titleMatches) score += titleMatches.length * 5;
      }
      const contentMatches = text.match(new RegExp(pat.source, 'gi'));
      if (contentMatches) score += contentMatches.length;
    }
    if (score > 0) scores[rule.key] = score;
  }

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

function extractKeywords(text, title) {
  const combined = `${title} ${text}`;
  const words = combined.match(/[가-힣a-zA-Z0-9]{2,12}/g) || [];
  const stopWords = new Set(['기자', '뉴스', '보도', '통해', '이번', '지난', '있는', '것으로', '따르면', '위해', '하는', '에서', '으로', '했다', '된다']);
  const freq = {};
  for (const w of words) {
    if (stopWords.has(w) || w.length < 2) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 6).map(([w]) => w);
}

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

function splitSentences(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.!?。])\s+|\n+/)
    .map(s => s
      .replace(/^\[.*?\]\s*/, '')
      .replace(/^\(.*?\)\s*/, '')
      .replace(/^[가-힣\s]{2,10}\s*(기자|특파원)\s*=\s*/, '')
      .trim()
    )
    .filter(s => s.length >= 18 && s.length <= 250 && !isNoiseSentence(s));
}

function generateOneLineSummary(article, sentences) {
  const { title = '', content = '' } = article;
  const cleanTitle = title
    .replace(/^\[.*?\]\s*/, '')
    .replace(/\s*-\s*[가-힣A-Za-z0-9\s]+뉴스.*$/, '')
    .trim();

  if (!content || sentences.length === 0) {
    return `${cleanTitle}에 대한 핵심 요약 브리핑입니다.`;
  }

  const words = content.match(/[가-힣a-zA-Z0-9]{2,12}/g) || [];
  const stopWords = new Set([
    '기자', '뉴스', '보도', '통해', '이번', '지난', '관련', '대한', '있는', '것으로', '따르면', 
    '위해', '하는', '에서', '으로', '부터', '또한', '하지만', '그리고', '이날', '오전', '오후', 
    '현재', '경우', '있다', '했다', '된다', '됐다', '무단', '전재', '재배포', '금지', '사진',
    '밝혔다', '설명했다', '말했다', '전했다', '강조했다'
  ]);

  const freq = {};
  for (const w of words) {
    if (!stopWords.has(w) && w.length >= 2) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }

  const topKeywords = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 10).map(([w]) => w);
  const titleWords = cleanTitle.match(/[가-힣a-zA-Z0-9]{2,12}/g) || [];

  const cleanSentences = sentences
    .map(s => s
      .replace(/^\[.*?\]\s*/, '')
      .replace(/^\(.*?\)\s*/, '')
      .replace(/^[가-힣\s]{2,10}\s*(기자|특파원)\s*=\s*/, '')
      .replace(/\([가-힣\s=]+기자\)/, '')
      .replace(/사진\s*=\s*[가-힣\s]+/, '')
      .trim()
    )
    .filter(s => 
      s.length >= 20 && 
      s.length <= 160 &&
      !isNoiseSentence(s)
    );

  if (cleanSentences.length === 0) {
    return `${cleanTitle}에 대한 핵심 뉴스 요약입니다.`;
  }

  const scored = cleanSentences.map((sent, idx) => {
    let score = 0;
    for (const tw of titleWords) {
      if (sent.includes(tw)) score += 3;
    }
    for (const kw of topKeywords) {
      if (sent.includes(kw)) score += 2;
    }
    if (/발표|공개|착수|돌파|도입|확정|합의|출시|성공|전망|결정|본격화|개선|증가|확대|기록/i.test(sent)) {
      score += 4;
    }
    if (/[0-9]+(\.[0-9]+)?(%|원|억|조|km|만|배)/i.test(sent)) {
      score += 3;
    }

    const total = cleanSentences.length;
    let position = 'body';
    if (idx < Math.ceil(total * 0.35)) {
      position = 'intro';
      score += 2;
    } else if (idx >= Math.floor(total * 0.65)) {
      position = 'conclusion';
      score += 2;
    }
    return { sentence: sent, score, position, index: idx };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  if (best && best.sentence.length >= 40 && best.sentence.length <= 130 && best.score >= 12) {
    let clean = best.sentence;
    clean = clean.replace(/했다\.$/, '했습니다.').replace(/됐다\.$/, '됐습니다.').replace(/밝혔다\.$/, '밝혔습니다.');
    if (!clean.endsWith('.')) clean += '.';
    return clean;
  }

  const bestIntro = scored.find(s => s.position === 'intro') || scored[0];
  const bestConclusion = scored.find(s => (s.position === 'conclusion' || s.position === 'body') && s.index !== bestIntro.index);

  if (bestIntro && bestConclusion) {
    let part1 = bestIntro.sentence
      .replace(/\s*(밝혔다|전했다|말했다|설명했다|발표했다)\.$/, '')
      .replace(/했다\.$/, '하며')
      .replace(/다\.$/, '며')
      .trim();
    if (!part1.endsWith('며') && !part1.endsWith('고')) {
      part1 += '며,';
    }
    let part2 = bestConclusion.sentence
      .replace(/^[가-힣\s]+는\s*/, '')
      .replace(/했다\.$/, '했습니다.')
      .replace(/됐다\.$/, '됐습니다.');
    if (!part2.endsWith('.')) part2 += '.';
    const synthesized = `${part1} ${part2}`;
    if (synthesized.length <= 150) {
      return synthesized;
    }
  }

  let fallback = best ? best.sentence : cleanSentences[0];
  fallback = fallback.replace(/했다\.$/, '했습니다.').replace(/됐다\.$/, '됐습니다.');
  if (!fallback.endsWith('.')) fallback += '.';
  return fallback;
}

function generateDeckFromArticle(article, options = {}) {
  const title = article.title || '뉴스 헤드라인';
  const content = article.content || title;
  const press = article.press || '보도매체';
  const publishDate = article.publishDate || new Date().toISOString().split('T')[0];
  const ogImage = article.ogImage;
  const channelHandle = options.channelHandle || '@today_news_pick';

  let category = detectCategory(content, title);
  if (options.category && options.category !== 'auto') {
    const customMatch = CATEGORY_LIST.find(c => c.key === options.category || c.badge === options.category);
    if (customMatch) {
      category = { key: customMatch.key, badge: customMatch.badge, icon: customMatch.icon };
    } else {
      category = { key: 'custom', badge: options.category, icon: '📌' };
    }
  }

  const keywords = extractKeywords(content, title);
  const sentences = splitSentences(content);
  const oneLineSummary = generateOneLineSummary(article, sentences);

  const topicImages = TOPIC_IMAGES[category.key] || TOPIC_IMAGES.society;
  const coverImg = ogImage || topicImages[0];

  // Distribute sentences intelligently so every slide has 2 solid points
  const total = sentences.length;
  let issueBullets = [];
  let pointBullets = [];
  let impactBullets = [];

  if (total >= 6) {
    issueBullets = sentences.slice(0, 2);
    pointBullets = sentences.slice(2, 4);
    impactBullets = sentences.slice(4, 6);
  } else if (total >= 4) {
    issueBullets = [sentences[0], sentences[1]];
    pointBullets = [sentences[2], sentences[3]];
    impactBullets = [
      '관련 업계 및 시장 참여자들의 관심이 집중되며 주요 화두로 떠오르고 있습니다.',
      '향후 후속 가이드라인과 시장 대응 조치에 이목이 쏠리고 있습니다.'
    ];
  } else if (total >= 2) {
    issueBullets = [sentences[0]];
    pointBullets = [sentences[1]];
    impactBullets = [
      '소비자와 시장 사이에서 긍정적 기대와 우려가 교차하며 주목받고 있습니다.',
      '관련 트렌드가 지속적으로 확대될지 업계의 시선이 집중되고 있습니다.'
    ];
  } else {
    issueBullets = [`${title}에 대한 새로운 소식이 전해졌습니다.`];
    pointBullets = ['전문가들은 이번 조치가 가져올 파급력과 변화에 주목하고 있습니다.'];
    impactBullets = ['향후 추가적인 공식 발표와 후속 보도가 이어질 전망입니다.'];
  }

  const slides = [];

  // 1. Cover Slide
  slides.push({
    id: 's1',
    badge: `${category.icon} ${category.badge}`,
    title: title,
    subtitle: oneLineSummary,
    oneLineSummary: oneLineSummary,
    bullets: [],
    imageUrl: coverImg,
    overlay: 0.65,
    tag: 'HOT ISSUE'
  });

  // 2. Summary
  slides.push({
    id: 's2',
    badge: '01 | ISSUE SUMMARY',
    title: '무슨 일이 일어났나요?',
    subtitle: '사건의 발단과 핵심 배경',
    bullets: issueBullets,
    imageUrl: topicImages[1 % topicImages.length],
    overlay: 0.65,
    tag: '발단 요약'
  });

  // 3. Key Point
  slides.push({
    id: 's3',
    badge: '02 | KEY POINT',
    title: '주목해야 할 핵심 변화',
    subtitle: '주요 인사이트와 달라지는 점',
    bullets: pointBullets,
    imageUrl: topicImages[2 % topicImages.length],
    overlay: 0.65,
    tag: '핵심 쟁점'
  });

  // 4. Market / Reaction
  slides.push({
    id: 's4',
    badge: '03 | MARKET & IMPACT',
    title: '시장과 대중의 반응은?',
    subtitle: '관련 업계의 시선과 파급 효과',
    bullets: impactBullets,
    imageUrl: topicImages[0],
    overlay: 0.65,
    tag: '파급 효과'
  });

  // 5. Conclusion
  slides.push({
    id: 's5',
    badge: '04 | CONCLUSION',
    title: '앞으로 어떻게 될까요?',
    subtitle: '요약 정리 & 여러분의 생각은?',
    bullets: [
      '단기적 이슈를 넘어 중장기적 트렌드로 안착할지 주목됩니다.',
      '💬 여러분은 이번 변화에 대해 어떻게 생각하시나요? 댓글로 의견을 나눠보세요!'
    ],
    imageUrl: topicImages[1 % topicImages.length],
    overlay: 0.7,
    tag: '독자 토론'
  });

  const baseTags = ['카드뉴스', '뉴스요약', category.badge.replace(/\s+/g, '')];
  const allTags = [...baseTags, ...keywords];

  const caption = `📰 [${category.badge}] ${title}\n\n` +
    `바쁜 일상 속 꼭 알아야 할 핵심 뉴스 요약입니다! 👇\n\n` +
    slides.slice(1, 4).map(s => `• ${s.title}: ${s.bullets[0] || s.subtitle}`).join('\n') +
    `\n\n💬 여러분의 생각은 어떠신가요? 댓글로 자유롭게 남겨주세요!\n` +
    `[출처] ${press} (${publishDate})\n\n` +
    allTags.map(t => `#${t}`).join(' ');

  return {
    title,
    press,
    publishDate,
    url: article.url,
    channelHandle,
    slides,
    tags: allTags,
    caption,
    aspectRatio: options.aspectRatio || '4:5',
    theme: options.theme || 'modern-dark'
  };
}
