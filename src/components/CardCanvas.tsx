import React, { forwardRef } from 'react';
import { Slide, CardDeck } from '../types';
import { CARD_THEMES } from '../utils/themes';
import { ChevronRight, ArrowRight, Sparkles, Quote } from 'lucide-react';
import { getProxiedImageUrl } from '../utils/exportHelper';

interface CardCanvasProps {
  slide: Slide;
  deck: CardDeck;
  slideIndex: number;
  totalSlides: number;
  scale?: number; // for fitting responsive containers
}

export const CardCanvas = forwardRef<HTMLDivElement, CardCanvasProps>(
  ({ slide, deck, slideIndex, totalSlides }, ref) => {
    const theme = CARD_THEMES[deck.themeId] || CARD_THEMES['modern-dark'];

    // Aspect ratio dimensions in standard pixels
    let aspectClass = 'aspect-square';
    if (deck.aspectRatio === '4:5') {
      aspectClass = 'aspect-[4/5]';
    } else if (deck.aspectRatio === '9:16') {
      aspectClass = 'aspect-[9/16]';
    }

    const proxiedImg = getProxiedImageUrl(slide.imageUrl);
    const overlayOpacity = slide.imageOverlayOpacity ?? theme.defaultOverlay;
    const isCover = slide.type === 'cover' || slideIndex === 0;
    const isLast = slideIndex === totalSlides - 1;

    return (
      <div
        ref={ref}
        id="card-news-canvas"
        className={`relative w-full ${aspectClass} overflow-hidden rounded-2xl shadow-2xl select-none transition-all duration-300 font-sans flex flex-col justify-between`}
        style={{
          backgroundColor: theme.cardBg,
          color: theme.textPrimary,
        }}
      >
        {/* Background Image Layer */}
        {proxiedImg && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={proxiedImg}
              alt="Card Background"
              crossOrigin="anonymous"
              className={`w-full h-full object-cover transition duration-500 scale-105 ${
                slide.imageBlur ? 'blur-sm' : ''
              }`}
            />
          </div>
        )}

        {/* Fallback Mesh Gradient if no image */}
        {!proxiedImg && (
          <div
            className={`absolute inset-0 z-0 bg-gradient-to-br ${theme.bgClass}`}
          />
        )}

        {/* Dark / Contrast Overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity"
          style={{
            backgroundColor: theme.id === 'clean-white' ? '#ffffff' : '#000000',
            opacity: overlayOpacity,
          }}
        />

        {/* Subtle Vignette Gradient for Depth */}
        <div
          className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40"
          style={{
            opacity: theme.id === 'clean-white' ? 0.05 : 0.7,
          }}
        />

        {/* ================= TOP BAR ================= */}
        <div className="relative z-20 p-6 sm:p-8 flex items-center justify-between">
          {/* Watermark / Channel Handle */}
          {deck.showWatermark && deck.channelHandle && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-medium text-white/90">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              <span>{deck.channelHandle}</span>
            </div>
          )}

          {/* Page Counter */}
          {deck.showPageNumbers && (
            <div className="ml-auto px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold text-white/90 flex items-center space-x-1 tracking-wider">
              <span className="text-brand-400">{String(slideIndex + 1).padStart(2, '0')}</span>
              <span className="text-white/40">/</span>
              <span>{String(totalSlides).padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* ================= MIDDLE CONTENT ================= */}
        <div className="relative z-20 px-6 sm:px-9 py-4 flex-1 flex flex-col justify-center">
          {/* Category Badge / Highlight Tag */}
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            {slide.badge && (
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm ${theme.accentBadge}`}
              >
                {slide.badge}
              </span>
            )}
            {slide.highlightTag && !isCover && (
              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold backdrop-blur-sm ${theme.tagBg}`}
              >
                #{slide.highlightTag}
              </span>
            )}
          </div>

          {/* Main Title / Headline */}
          <h2
            className={`font-black tracking-tight leading-snug drop-shadow-md break-keep ${
              isCover
                ? 'text-2xl sm:text-3xl md:text-4xl text-white'
                : 'text-xl sm:text-2xl md:text-3xl'
            }`}
            style={{
              color: isCover ? '#ffffff' : theme.textPrimary,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {slide.title}
          </h2>

          {/* One-Line Summary Box on Cover Slide */}
          {isCover && (slide.oneLineSummary || slide.subtitle) && (
            <div className="mt-4 sm:mt-5 p-3.5 sm:p-4 rounded-xl bg-black/45 backdrop-blur-md border border-white/20 shadow-lg">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>기사 1줄 핵심 요약</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed break-keep">
                {slide.oneLineSummary || slide.subtitle}
              </p>
            </div>
          )}

          {/* Subtitle (for non-cover slides) */}
          {!isCover && slide.subtitle && (
            <p
              className="mt-2.5 sm:mt-3 leading-relaxed break-keep font-medium text-xs sm:text-sm"
              style={{ color: theme.textSecondary }}
            >
              {slide.subtitle}
            </p>
          )}

          {/* Bullet Points / Content Body */}
          {slide.bullets && slide.bullets.length > 0 && (
            <div className="mt-4 sm:mt-5 space-y-2.5">
              {slide.bullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 hover:border-white/20 transition"
                >
                  <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                  </div>
                  <p
                    className="text-xs sm:text-sm font-medium leading-relaxed break-keep flex-1"
                    style={{ color: theme.textPrimary }}
                  >
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Call-to-action on conclusion slide */}
          {slide.type === 'conclusion' && (
            <div className="mt-4 p-3 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
              <p className="text-xs text-brand-200 font-semibold">
                이 소식이 유익하셨다면 [좋아요]와 [저장]을 눌러주세요!
              </p>
            </div>
          )}
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="relative z-20 p-6 sm:p-8 pt-2 flex items-center justify-between border-t border-white/10 bg-black/20 backdrop-blur-sm">
          {/* Press / Source Badge */}
          {deck.showSourceBadge && (
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span className="font-semibold text-white/90">
                출처: {deck.pressName}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white/60">{deck.publishDate}</span>
            </div>
          )}

          {/* Swipe Hint (hidden on final card) */}
          {deck.showSwipeHint && !isLast && (
            <div className="flex items-center space-x-1 text-xs font-semibold text-brand-400 animate-pulse">
              <span>넘겨보기</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          )}

          {isLast && (
            <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-400">
              <span>끝까지 읽어주셔서 감사합니다!</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

CardCanvas.displayName = 'CardCanvas';
