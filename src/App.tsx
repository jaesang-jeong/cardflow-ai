import React, { useState, useRef, useEffect } from 'react';
import { CardDeck, Slide, GenerationOptions, ScrapedArticle } from './types';
import { generateCardDeckFromText } from './utils/nlpSummarizer';
import { SAMPLE_NEWS_LIST, SampleNews } from './utils/sampleData';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { CardCanvas } from './components/CardCanvas';
import { SlideEditor } from './components/SlideEditor';
import { SlideCarousel } from './components/SlideCarousel';
import { ExportToolbar } from './components/ExportToolbar';
import { MobilePreviewModal } from './components/MobilePreviewModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { downloadSingleCardAsPng, exportAllCardsToZip } from './utils/exportHelper';
import { toPng } from 'html-to-image';
import axios from 'axios';
import { Sparkles, ArrowLeft, ArrowRight, Eye } from 'lucide-react';

export const App: React.FC = () => {
  // Default Deck Options
  const [deckOptions, setDeckOptions] = useState<GenerationOptions>({
    tone: 'news',
    slideCount: 5,
    aspectRatio: '4:5',
    themeId: 'modern-dark',
    channelHandle: '@today_news_pick',
  });

  // Current Card Deck (initialized with first sample for instant rich view)
  const [deck, setDeck] = useState<CardDeck>(() => {
    const initialSample = SAMPLE_NEWS_LIST[0];
    return generateCardDeckFromText({
      title: initialSample.title,
      content: initialSample.content,
      pressName: initialSample.press,
      publishDate: initialSample.publishDate,
      sourceUrl: initialSample.url,
      ogImage: initialSample.ogImage,
      images: [initialSample.ogImage],
      description: initialSample.summary,
      options: {
        slideCount: 5,
        aspectRatio: '4:5',
        themeId: 'modern-dark',
        channelHandle: '@today_news_pick',
      },
    });
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [lastScrapedArticle, setLastScrapedArticle] = useState<ScrapedArticle | null>(null);

  // API Key State
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('GEMINI_API_KEY') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Modals & Export State
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState({ current: 0, total: 0 });

  const cardCanvasRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation for slides (Left/Right arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'ArrowRight') {
        setActiveSlideIndex((prev) => (prev < deck.slides.length - 1 ? prev + 1 : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck.slides.length]);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('GEMINI_API_KEY', key);
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
    }
  };

  // Generate from URL Handler
  const handleGenerateFromUrl = async (url: string, options: GenerationOptions) => {
    setIsLoading(true);
    setLoadingStep('기사 웹페이지 접속 및 본문 추출 중...');

    try {
      const res = await axios.post('/api/extract', { url });
      const article: ScrapedArticle = res.data;
      setLastScrapedArticle(article);

      setLoadingStep('핵심 요약 및 맞춤형 카드뉴스 제작 중...');
      await new Promise((r) => setTimeout(r, 400));

      const newDeck = generateCardDeckFromText({
        title: article.title,
        content: article.content,
        pressName: article.press,
        publishDate: article.publishDate,
        sourceUrl: article.url,
        ogImage: article.ogImage,
        images: article.images,
        description: article.description,
        options,
      });

      // If user has Gemini API Key, enhance the 1-line summary via Gemini API
      if (apiKey) {
        try {
          setLoadingStep('AI 에디터가 전체 기사 1줄 요약 정밀 생성 중...');
          const aiRes = await axios.post('/api/summarize-ai', {
            title: article.title,
            content: article.content,
            apiKey,
          });
          if (aiRes.data?.oneLineSummary) {
            newDeck.slides[0].oneLineSummary = aiRes.data.oneLineSummary;
            newDeck.slides[0].subtitle = aiRes.data.oneLineSummary;
          }
        } catch (e) {
          console.warn('AI summary call fallback:', e);
        }
      }

      setDeck(newDeck);
      setActiveSlideIndex(0);
    } catch (err: any) {
      console.error(err);
      throw new Error(
        err.response?.data?.error || err.message || '기사 내용을 가져오지 못했습니다. URL을 확인해주세요.'
      );
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Generate from Direct Text Handler
  const handleGenerateFromText = async (
    title: string,
    content: string,
    press: string,
    ogImage: string | undefined,
    options: GenerationOptions
  ) => {
    setIsLoading(true);
    setLoadingStep('기사 전체 내용 분석 및 핵심 1줄 요약 생성 중...');

    try {
      const newDeck = generateCardDeckFromText({
        title,
        content,
        pressName: press,
        publishDate: new Date().toISOString().split('T')[0],
        ogImage,
        options,
      });

      if (apiKey) {
        try {
          const aiRes = await axios.post('/api/summarize-ai', {
            title,
            content,
            apiKey,
          });
          if (aiRes.data?.oneLineSummary) {
            newDeck.slides[0].oneLineSummary = aiRes.data.oneLineSummary;
            newDeck.slides[0].subtitle = aiRes.data.oneLineSummary;
          }
        } catch (e) {
          console.warn('AI summary call fallback:', e);
        }
      }

      setDeck(newDeck);
      setActiveSlideIndex(0);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Sample Selector Handler
  const handleSelectSample = (sample: SampleNews) => {
    setLastScrapedArticle({
      url: sample.url,
      title: sample.title,
      press: sample.press,
      publishDate: sample.publishDate,
      description: sample.summary,
      content: sample.content,
      ogImage: sample.ogImage,
      domain: 'sample.news',
      tags: [],
    });

    const newDeck = generateCardDeckFromText({
      title: sample.title,
      content: sample.content,
      pressName: sample.press,
      publishDate: sample.publishDate,
      sourceUrl: sample.url,
      ogImage: sample.ogImage,
      images: [sample.ogImage],
      description: sample.summary,
      options: deckOptions,
    });

    setDeck(newDeck);
    setActiveSlideIndex(0);
  };

  // Update Active Slide
  const handleUpdateActiveSlide = (updated: Partial<Slide>) => {
    setDeck((prev) => {
      const newSlides = [...prev.slides];
      newSlides[activeSlideIndex] = {
        ...newSlides[activeSlideIndex],
        ...updated,
      };
      return { ...prev, slides: newSlides };
    });
  };

  // Options change
  const handleChangeOptions = (opts: Partial<GenerationOptions>) => {
    setDeckOptions((prev) => {
      const updated = { ...prev, ...opts };
      // Also apply theme, aspect ratio, or handle directly to current deck
      setDeck((d) => ({
        ...d,
        aspectRatio: updated.aspectRatio,
        themeId: updated.themeId,
        channelHandle: updated.channelHandle || d.channelHandle,
      }));
      return updated;
    });
  };

  // Slide sequence operations
  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      type: 'point',
      badge: `0${deck.slides.length} | POINT`,
      title: '새로운 슬라이드 제목을 입력하세요',
      subtitle: '서브타이틀 및 부연 설명',
      bullets: ['첫 번째 핵심 요약 포인트', '두 번째 핵심 요약 포인트'],
      imageUrl: deck.slides[0]?.imageUrl,
      imageOverlayOpacity: 0.65,
      layout: 'bullet-list',
    };
    setDeck((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
    setActiveSlideIndex(deck.slides.length);
  };

  const handleDeleteSlide = (idx: number) => {
    if (deck.slides.length <= 2) return;
    setDeck((prev) => {
      const newSlides = prev.slides.filter((_, i) => i !== idx);
      return { ...prev, slides: newSlides };
    });
    if (activeSlideIndex >= idx && activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  const handleDuplicateSlide = (idx: number) => {
    const target = deck.slides[idx];
    const clone: Slide = {
      ...target,
      id: `slide-${Date.now()}`,
      title: `${target.title} (복제본)`,
    };
    const newSlides = [...deck.slides];
    newSlides.splice(idx + 1, 0, clone);
    setDeck((prev) => ({ ...prev, slides: newSlides }));
    setActiveSlideIndex(idx + 1);
  };

  const handleMoveSlide = (from: number, to: number) => {
    if (to < 0 || to >= deck.slides.length) return;
    const newSlides = [...deck.slides];
    const [moved] = newSlides.splice(from, 1);
    newSlides.splice(to, 0, moved);
    setDeck((prev) => ({ ...prev, slides: newSlides }));
    setActiveSlideIndex(to);
  };

  // Export Single Slide to PNG
  const handleExportCurrentSlide = async () => {
    if (!cardCanvasRef.current) return;
    const filename = `card_${String(activeSlideIndex + 1).padStart(2, '0')}.png`;
    await downloadSingleCardAsPng(cardCanvasRef.current, filename);
  };

  // Batch Export all cards in Deck to ZIP
  const handleExportAllZip = async () => {
    setIsExportingZip(true);
    setZipProgress({ current: 1, total: deck.slides.length });

    const originalActive = activeSlideIndex;

    try {
      await exportAllCardsToZip(
        deck,
        async (slideIdx: number) => {
          setActiveSlideIndex(slideIdx);
          // Wait for DOM re-render & image paint
          await new Promise((resolve) => setTimeout(resolve, 300));
          if (!cardCanvasRef.current) {
            throw new Error('Canvas ref not available');
          }
          return await toPng(cardCanvasRef.current, {
            pixelRatio: 2,
            quality: 0.95,
            cacheBust: true,
          });
        },
        (current, total) => {
          setZipProgress({ current, total });
        }
      );
    } catch (err) {
      console.error('Batch export failed:', err);
      alert('카드뉴스 일괄 내보내기 중 문제가 발생했습니다.');
    } finally {
      setIsExportingZip(false);
      setActiveSlideIndex(originalActive);
    }
  };

  const activeSlide = deck.slides[activeSlideIndex] || deck.slides[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Navigation */}
      <Header
        onSelectSample={handleSelectSample}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={Boolean(apiKey)}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Panel & Options (5 cols) */}
          <div className="lg:col-span-5 h-[620px] lg:h-[720px] flex flex-col">
            <InputPanel
              onGenerateFromUrl={handleGenerateFromUrl}
              onGenerateFromText={handleGenerateFromText}
              isLoading={isLoading}
              loadingStep={loadingStep}
              activeDeckOptions={deckOptions}
              onChangeOptions={handleChangeOptions}
              lastScrapedArticle={lastScrapedArticle}
            />
          </div>

          {/* Right Column: Live Card Studio Canvas & Slide Editor (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            {/* Upper Section: Canvas on Left & Quick Slide Editor on Right */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Card Canvas Container (7 cols) */}
              <div className="md:col-span-7 flex flex-col items-center">
                <div className="w-full max-w-[420px] relative group">
                  <CardCanvas
                    ref={cardCanvasRef}
                    slide={activeSlide}
                    deck={deck}
                    slideIndex={activeSlideIndex}
                    totalSlides={deck.slides.length}
                  />

                  {/* Navigation overlay arrows on canvas */}
                  {activeSlideIndex > 0 && (
                    <button
                      onClick={() => setActiveSlideIndex((prev) => prev - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition opacity-0 group-hover:opacity-100 z-30"
                      title="이전 카드 (←)"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}

                  {activeSlideIndex < deck.slides.length - 1 && (
                    <button
                      onClick={() => setActiveSlideIndex((prev) => prev + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition opacity-0 group-hover:opacity-100 z-30"
                      title="다음 카드 (→)"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Aspect Ratio & Page Quick Indicator */}
                <div className="w-full max-w-[420px] mt-2 px-1 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">
                    규격: {deck.aspectRatio} ({deck.aspectRatio === '1:1' ? '정방형' : deck.aspectRatio === '4:5' ? '피드 세로형' : '스토리'})
                  </span>
                  <span>
                    슬라이드 {activeSlideIndex + 1} / {deck.slides.length}
                  </span>
                </div>
              </div>

              {/* Slide Detail Editor (5 cols) */}
              <div className="md:col-span-5 h-[480px] sm:h-[540px]">
                <SlideEditor
                  slide={activeSlide}
                  slideIndex={activeSlideIndex}
                  totalSlides={deck.slides.length}
                  onUpdateSlide={handleUpdateActiveSlide}
                  originalArticleImage={lastScrapedArticle?.ogImage}
                />
              </div>
            </div>

            {/* Slide Carousel Sequence Strip */}
            <SlideCarousel
              deck={deck}
              activeSlideIndex={activeSlideIndex}
              onSelectSlide={setActiveSlideIndex}
              onAddSlide={handleAddSlide}
              onDeleteSlide={handleDeleteSlide}
              onDuplicateSlide={handleDuplicateSlide}
              onMoveSlide={handleMoveSlide}
            />

            {/* Export & Actions Toolbar */}
            <ExportToolbar
              deck={deck}
              onExportCurrentSlide={handleExportCurrentSlide}
              onExportAllZip={handleExportAllZip}
              onOpenMobilePreview={() => setIsMobilePreviewOpen(true)}
              isExportingZip={isExportingZip}
              zipProgress={zipProgress}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <p>
          CardFlow News Studio AI • 기사 링크를 소셜 미디어 맞춤형 카드뉴스로 자동 변환합니다.
        </p>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <MobilePreviewModal
        isOpen={isMobilePreviewOpen}
        onClose={() => setIsMobilePreviewOpen(false)}
        deck={deck}
      />
    </div>
  );
};
