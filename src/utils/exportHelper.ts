import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { CardDeck } from '../types';

// Convert image URL to proxied URL if it's an external HTTP/HTTPS URL
export function getProxiedImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
    return url;
  }
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

// Download a single card element as PNG
export async function downloadSingleCardAsPng(
  element: HTMLElement,
  filename: string = 'card_news.png'
): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      pixelRatio: 2, // High resolution crisp output (e.g. 2160x2160 for 1080x1080)
      cacheBust: true,
      quality: 0.95,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export single card:', error);
    throw error;
  }
}

// Batch export all cards in the deck into a single ZIP file
export async function exportAllCardsToZip(
  deck: CardDeck,
  renderSlideToDataUrl: (slideIndex: number) => Promise<string>,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  const total = deck.slides.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) {
      onProgress(i + 1, total);
    }
    const dataUrl = await renderSlideToDataUrl(i);
    // Strip data:image/png;base64,
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const slideNumber = String(i + 1).padStart(2, '0');
    const slideName = deck.slides[i].title
      ? deck.slides[i].title.replace(/[^a-zA-Z0-9가-힣]/g, '_').substring(0, 15)
      : 'slide';
    
    zip.file(`${slideNumber}_${slideName}.png`, base64Data, { base64: true });
  }

  // Include social media caption text file
  const captionContent = `[인스타그램 / SNS 업로드용 캡션]\n\n${deck.caption}\n\n` +
    `-----------------------------------------\n` +
    `원문 기사: ${deck.originalTitle}\n` +
    `출처: ${deck.pressName} (${deck.publishDate})\n` +
    (deck.originalUrl ? `URL: ${deck.originalUrl}\n` : '') +
    `제작: CardFlow News Studio AI`;

  zip.file('caption_and_tags.txt', captionContent);

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);

  const cleanTitle = (deck.originalTitle || 'card_news')
    .replace(/[^a-zA-Z0-9가-힣]/g, '_')
    .substring(0, 20);

  const link = document.createElement('a');
  link.download = `카드뉴스_${cleanTitle}_${Date.now()}.zip`;
  link.href = downloadUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

// Copy Instagram caption to clipboard
export async function copyCaptionToClipboard(caption: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(caption);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
