import React from 'react';
import { Slide, CardDeck } from '../types';
import { Plus, Trash2, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideCarouselProps {
  deck: CardDeck;
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onDeleteSlide: (index: number) => void;
  onDuplicateSlide: (index: number) => void;
  onMoveSlide: (fromIndex: number, toIndex: number) => void;
}

export const SlideCarousel: React.FC<SlideCarouselProps> = ({
  deck,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onMoveSlide,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
          <span>슬라이드 시퀀스 ({deck.slides.length}장)</span>
          <span className="text-[10px] text-slate-500 font-normal">
            클릭하여 선택 / 순서 변경 가능
          </span>
        </span>
        <button
          onClick={onAddSlide}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-600/20 text-brand-400 border border-brand-500/30 hover:bg-brand-600/30 transition flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>슬라이드 추가</span>
        </button>
      </div>

      <div className="flex items-center space-x-3 overflow-x-auto pb-3 pt-1 px-1 scrollbar-thin">
        {deck.slides.map((slide, index) => {
          const isActive = index === activeSlideIndex;
          return (
            <div
              key={slide.id}
              onClick={() => onSelectSlide(index)}
              className={`group relative shrink-0 w-28 sm:w-32 aspect-[4/5] rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 select-none ${
                isActive
                  ? 'border-brand-500 shadow-glow scale-105 ring-2 ring-brand-500/30'
                  : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
              }`}
            >
              {/* Thumbnail Background */}
              {slide.imageUrl ? (
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900" />
              )}

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition" />

              {/* Thumbnail Content */}
              <div className="absolute inset-0 p-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-brand-300 border border-white/10">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-white/70 truncate max-w-[60px]">
                    {slide.badge || (index === 0 ? '표지' : '내용')}
                  </span>
                </div>

                <p className="text-[10px] font-bold text-white line-clamp-2 leading-tight">
                  {slide.title}
                </p>

                <div className="text-[8px] text-slate-400 truncate">
                  {slide.bullets.length > 0 ? `${slide.bullets.length}개 항목` : '헤드라인'}
                </div>
              </div>

              {/* Action buttons on hover */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition flex items-center space-x-1 z-30">
                <button
                  title="복제"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSlide(index);
                  }}
                  className="p-1 rounded bg-black/80 hover:bg-slate-800 text-slate-300"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {deck.slides.length > 2 && (
                  <button
                    title="삭제"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSlide(index);
                    }}
                    className="p-1 rounded bg-black/80 hover:bg-rose-900 text-rose-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
