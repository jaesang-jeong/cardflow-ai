// High-DPI HTML5 Canvas Renderer for CardFlow News

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

// Preload image helper
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function renderCardToCanvas(canvas, slide, deck, slideIndex, totalSlides) {
  const ctx = canvas.getContext('2d');
  
  // Determine standard high-res dimensions
  let width = 1080;
  let height = 1080;
  if (deck.aspectRatio === '4:5') {
    height = 1350;
  } else if (deck.aspectRatio === '9:16') {
    height = 1920;
  }

  canvas.width = width;
  canvas.height = height;

  const theme = THEMES[deck.theme] || THEMES['modern-dark'];
  const isCover = slideIndex === 0;
  const isLast = slideIndex === totalSlides - 1;

  // 1. Background Base
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Background Image
  const img = await loadImage(slide.imageUrl);
  if (img) {
    // Cover object-fit calculation
    const imgAspect = img.width / img.height;
    const canvasAspect = width / height;
    let renderW, renderH, offsetX, offsetY;

    if (imgAspect > canvasAspect) {
      renderH = height;
      renderW = height * imgAspect;
      offsetX = (width - renderW) / 2;
      offsetY = 0;
    } else {
      renderW = width;
      renderH = width / imgAspect;
      offsetX = 0;
      offsetY = (height - renderH) / 2;
    }
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }

  // 3. Dark Overlay
  const overlay = slide.overlay !== undefined ? slide.overlay : 0.65;
  ctx.fillStyle = theme.id === 'clean-white' ? `rgba(255, 255, 255, ${overlay})` : `rgba(0, 0, 0, ${overlay})`;
  ctx.fillRect(0, 0, width, height);

  // 4. Subtle Vignette Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  if (isCover) {
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
    grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.05)');
    grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.55)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  } else {
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 5. Top Bar: Channel handle & Page Counter
  const paddingX = 80;
  const topY = 90;

  // Channel Handle Pill
  if (deck.channelHandle) {
    ctx.font = 'bold 30px sans-serif';
    const handleText = deck.channelHandle;
    const handleW = ctx.measureText(handleText).width + 50;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(paddingX, topY - 35, handleW, 52, 26);
    ctx.fill();

    ctx.fillStyle = theme.accentColor;
    ctx.beginPath();
    ctx.arc(paddingX + 22, topY - 9, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(handleText, paddingX + 38, topY - 1);
  }

  // Page Counter Pill (e.g. 02 / 05)
  const pageText = `${String(slideIndex + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
  ctx.font = 'bold 30px sans-serif';
  const pageW = ctx.measureText(pageText).width + 40;
  const pageX = width - paddingX - pageW;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(pageX, topY - 35, pageW, 52, 26);
  ctx.fill();

  ctx.fillStyle = theme.accentColor;
  ctx.fillText(String(slideIndex + 1).padStart(2, '0'), pageX + 20, topY - 1);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('/', pageX + 65, topY - 1);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(String(totalSlides).padStart(2, '0'), pageX + 85, topY - 1);

  // 6. Middle Content
  let currentY = topY + 120;
  const maxTitleW = width - (paddingX * 2);

  // For Cover Slide: Anchor headline and summary firmly at the bottom
  if (isCover) {
    const badgeH = slide.badge ? 65 : 0;

    ctx.font = '900 54px sans-serif';
    const preTitleLines = wrapText(ctx, slide.title, maxTitleW);
    const titleH = preTitleLines.length * 68;

    let sumBoxH = 0;
    if (slide.oneLineSummary || slide.subtitle) {
      const summaryText = slide.oneLineSummary || slide.subtitle;
      ctx.font = '500 28px sans-serif';
      const preSumLines = wrapText(ctx, summaryText, maxTitleW - 60);
      sumBoxH = (preSumLines.length * 40) + 56 + 20;
    }

    const totalCoverContentH = badgeH + titleH + sumBoxH;
    const bottomBarLimit = (height - 80) - 25; // snug above bottom bar divider
    const targetY = bottomBarLimit - totalCoverContentH;
    currentY = Math.max(height * 0.52, targetY);
  }

  // Category Badge
  if (slide.badge) {
    ctx.font = 'bold 30px sans-serif';
    const badgeText = slide.badge;
    const badgeW = ctx.measureText(badgeText).width + 36;

    ctx.fillStyle = theme.badgeBg;
    ctx.beginPath();
    ctx.roundRect(paddingX, currentY, badgeW, 48, 14);
    ctx.fill();

    ctx.fillStyle = theme.badgeText;
    ctx.fillText(badgeText, paddingX + 18, currentY + 34);
    currentY += 65;
  }

  // Title (Headline)
  ctx.font = isCover ? '900 54px sans-serif' : 'bold 56px sans-serif';
  ctx.fillStyle = isCover ? '#ffffff' : theme.textColor;
  const titleLines = wrapText(ctx, slide.title, maxTitleW);

  for (const line of titleLines) {
    ctx.fillText(line, paddingX, currentY + 40);
    currentY += (isCover ? 68 : 72);
  }

  // Subtitle / One-Line Summary Box
  if (isCover && (slide.oneLineSummary || slide.subtitle)) {
    const summaryText = slide.oneLineSummary || slide.subtitle;
    ctx.font = '500 28px sans-serif';
    const sumLines = wrapText(ctx, summaryText, maxTitleW - 60);
    const boxH = (sumLines.length * 40) + 56;

    currentY += 20;

    // Summary Card Box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(paddingX, currentY, maxTitleW, boxH, 18);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Box Header
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#fcd34d'; // Amber
    ctx.fillText('✨ 기사 1줄 핵심 요약', paddingX + 25, currentY + 32);

    // Box Text
    ctx.font = '500 27px sans-serif';
    ctx.fillStyle = '#f8fafc';
    let lineY = currentY + 68;
    for (const line of sumLines) {
      ctx.fillText(line, paddingX + 25, lineY);
      lineY += 38;
    }
  } else if (slide.subtitle) {
    currentY += 15;
    ctx.font = '400 34px sans-serif';
    ctx.fillStyle = theme.subColor;
    const subLines = wrapText(ctx, slide.subtitle, maxTitleW);
    for (const line of subLines) {
      ctx.fillText(line, paddingX, currentY + 20);
      currentY += 50;
    }
  }

  // Bullets
  if (slide.bullets && slide.bullets.length > 0) {
    currentY += 25;
    for (const bullet of slide.bullets) {
      ctx.font = '500 32px sans-serif';
      const bulletLines = wrapText(ctx, bullet, maxTitleW - 80);
      const cardH = (bulletLines.length * 44) + 40;

      // Bullet card background
      ctx.fillStyle = theme.bulletBg;
      ctx.beginPath();
      ctx.roundRect(paddingX, currentY, maxTitleW, cardH, 20);
      ctx.fill();

      // Bullet point dot
      ctx.fillStyle = theme.accentColor;
      ctx.beginPath();
      ctx.arc(paddingX + 35, currentY + 38, 7, 0, Math.PI * 2);
      ctx.fill();

      // Bullet text
      ctx.fillStyle = theme.textColor;
      let lineY = currentY + 46;
      for (const line of bulletLines) {
        ctx.fillText(line, paddingX + 65, lineY);
        lineY += 44;
      }
      currentY += cardH + 18;
    }
  }

  // 7. Bottom Bar
  const bottomY = height - 80;
  
  // Divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(paddingX, bottomY - 30);
  ctx.lineTo(width - paddingX, bottomY - 30);
  ctx.stroke();

  // Source info
  ctx.font = '500 28px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  const srcText = `출처: ${deck.press} | ${deck.publishDate}`;
  ctx.fillText(srcText, paddingX, bottomY + 10);

  // Swipe hint
  if (!isLast) {
    const swipeText = '넘겨보기 👉';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = theme.accentColor;
    const swipeW = ctx.measureText(swipeText).width;
    ctx.fillText(swipeText, width - paddingX - swipeW, bottomY + 10);
  } else {
    const endText = '끝까지 읽어주셔서 감사합니다!';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#34d399';
    const endW = ctx.measureText(endText).width;
    ctx.fillText(endText, width - paddingX - endW, bottomY + 10);
  }
}
