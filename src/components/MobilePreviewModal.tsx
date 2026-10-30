import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Volume2
} from 'lucide-react';
import { CardDeck } from '../types';
import { CardCanvas } from './CardCanvas';

interface MobilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: CardDeck;
}

export const MobilePreviewModal: React.FC<MobilePreviewModalProps> = ({
  isOpen,
  onClose,
  deck,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [expandCaption, setExpandCaption] = useState(false);

  if (!isOpen) return null;

  const total = deck.slides.length;
  const currentSlide = deck.slides[currentSlideIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev < total - 1 ? prev + 1 : prev));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition z-50"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Smartphone Device Frame */}
      <div className="w-full max-w-[390px] h-[92vh] max-h-[820px] bg-black rounded-[46px] p-3 shadow-2xl border-4 border-slate-700/80 relative flex flex-col overflow-hidden">
        {/* Dynamic Island / Speaker notch */}
        <div className="w-28 h-5 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center space-x-2 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
        </div>

        {/* Instagram App Header */}
        <div className="px-3 py-2 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-bold text-white">
                뉴스
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-white">
                  {deck.channelHandle.replace('@', '') || 'today_news'}
                </span>
                <span className="w-3 h-3 rounded-full bg-sky-500 flex items-center justify-center text-[8px] text-white">
                  ✓
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{deck.pressName}</p>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </div>

        {/* Post Card News Visual Container */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden my-auto">
          <div className="w-full">
            <CardCanvas
              slide={currentSlide}
              deck={deck}
              slideIndex={currentSlideIndex}
              totalSlides={total}
            />
          </div>

          {/* Navigation Arrows */}
          {currentSlideIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition backdrop-blur-sm z-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {currentSlideIndex < total - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition backdrop-blur-sm z-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Carousel Dots & Interaction Bar */}
        <div className="px-3 pt-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-white">
              <button onClick={() => setIsLiked(!isLiked)}>
                <Heart
                  className={`w-6 h-6 transition ${
                    isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'
                  }`}
                />
              </button>
              <MessageCircle className="w-6 h-6 text-white" />
              <Send className="w-6 h-6 text-white" />
            </div>

            {/* Dots */}
            <div className="flex items-center space-x-1">
              {deck.slides.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-200 ${
                    i === currentSlideIndex
                      ? 'w-2 h-2 bg-sky-500'
                      : 'w-1.5 h-1.5 bg-white/30'
                  }`}
                />
              ))}
            </div>

            <button onClick={() => setIsSaved(!isSaved)}>
              <Bookmark
                className={`w-6 h-6 transition ${
                  isSaved ? 'fill-white text-white' : 'text-white'
                }`}
              />
            </button>
          </div>

          <div className="text-xs font-bold text-white mt-2">
            좋아요 {isLiked ? '1,483개' : '1,482개'}
          </div>

          {/* Caption Snippet */}
          <div className="text-xs text-slate-300 mt-1 max-h-24 overflow-y-auto scrollbar-thin">
            <span className="font-bold text-white mr-1.5">
              {deck.channelHandle.replace('@', '') || 'today_news'}
            </span>
            <span className="whitespace-pre-line leading-relaxed">
              {expandCaption
                ? deck.caption
                : `${deck.slides[0]?.title} ...`}
            </span>
            <button
              onClick={() => setExpandCaption(!expandCaption)}
              className="text-[11px] text-slate-400 hover:text-white ml-1 font-semibold"
            >
              {expandCaption ? '접기' : '더 보기'}
            </button>
          </div>
        </div>

        {/* Home Indicator Bar */}
        <div className="w-32 h-1 bg-white/40 rounded-full mx-auto mt-2 shrink-0" />
      </div>
    </div>
  );
};
