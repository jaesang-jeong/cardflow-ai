import React, { useState } from 'react';
import { Slide } from '../types';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Sliders, 
  Wand2, 
  RefreshCw,
  Eye,
  Type
} from 'lucide-react';

interface SlideEditorProps {
  slide: Slide;
  slideIndex: number;
  totalSlides: number;
  onUpdateSlide: (updatedSlide: Partial<Slide>) => void;
  originalArticleImage?: string;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({
  slide,
  slideIndex,
  totalSlides,
  onUpdateSlide,
  originalArticleImage,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'image'>('content');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);

  // Quick Curated Image Recommendations based on slide content
  const curatedStockImages = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
  ];

  const handleAddBullet = () => {
    const newBullets = [...(slide.bullets || []), '새로운 요약 포인트를 입력하세요.'];
    onUpdateSlide({ bullets: newBullets });
  };

  const handleUpdateBullet = (idx: number, text: string) => {
    const newBullets = [...slide.bullets];
    newBullets[idx] = text;
    onUpdateSlide({ bullets: newBullets });
  };

  const handleDeleteBullet = (idx: number) => {
    const newBullets = slide.bullets.filter((_, i) => i !== idx);
    onUpdateSlide({ bullets: newBullets });
  };

  // Generate AI Image using Pollinations AI
  const handleGenerateAiImage = () => {
    setIsGeneratingAiImage(true);
    const prompt = slide.imagePrompt || `${slide.title}, modern editorial news photography, 4k`;
    const encoded = encodeURIComponent(prompt);
    const newUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1080&nologo=true&seed=${Date.now()}`;
    
    // Preload image
    const img = new Image();
    img.onload = () => {
      onUpdateSlide({ imageUrl: newUrl });
      setIsGeneratingAiImage(false);
    };
    img.onerror = () => {
      onUpdateSlide({ imageUrl: newUrl });
      setIsGeneratingAiImage(false);
    };
    img.src = newUrl;
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customImageUrl.trim()) {
      onUpdateSlide({ imageUrl: customImageUrl.trim() });
      setCustomImageUrl('');
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl flex flex-col h-full">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-4 py-2.5">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-brand-600/30 text-brand-300 border border-brand-500/30">
            슬라이드 #{slideIndex + 1}
          </span>
          <span className="text-xs text-slate-400 font-medium truncate max-w-[150px]">
            {slide.title}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
              activeTab === 'content'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>텍스트 내용</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
              activeTab === 'image'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>이미지 & 효과</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
        {activeTab === 'content' && (
          <div className="space-y-3.5">
            {/* Badge & Highlight Tag */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    카테고리 / 배지
                  </label>
                  <input
                    type="text"
                    value={slide.badge}
                    onChange={(e) => onUpdateSlide({ badge: e.target.value })}
                    placeholder="예: 01 | ISSUE SUMMARY"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    해시태그 / 하이라이트
                  </label>
                  <input
                    type="text"
                    value={slide.highlightTag || ''}
                    onChange={(e) => onUpdateSlide({ highlightTag: e.target.value })}
                    placeholder="예: HOT ISSUE"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Quick Badge Presets */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] text-slate-500 shrink-0 mr-0.5">빠른 선택:</span>
                {[
                  '🤖 AI & 미래기술',
                  '💻 IT & 테크',
                  '📈 경제 & 금융',
                  '🏢 기업 & 산업',
                  '🌱 환경 & 모빌리티',
                  '🏛️ 정치 & 정책',
                  '⚖️ 사회 & 이슈',
                  '🏥 바이오 & 건강',
                  '🎬 문화 & 엔터',
                  '⚽ 스포츠',
                  '💡 라이프',
                  '01 | ISSUE',
                  '02 | KEY POINT',
                  'HOT ISSUE'
                ].map((badgeText) => (
                  <button
                    key={badgeText}
                    type="button"
                    onClick={() => onUpdateSlide({ badge: badgeText })}
                    className="shrink-0 text-[10px] px-2 py-0.5 rounded-md bg-slate-900 hover:bg-brand-600/30 text-slate-400 hover:text-brand-300 border border-slate-800 hover:border-brand-500/40 transition"
                  >
                    {badgeText}
                  </button>
                ))}
              </div>
            </div>

            {/* Headline / Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                슬라이드 제목 (헤드라인)
              </label>
              <textarea
                value={slide.title}
                onChange={(e) => onUpdateSlide({ title: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            {/* Subtitle / One Line Summary */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  {slideIndex === 0 ? '📌 전체 기사 1줄 핵심 요약' : '서브타이틀 / 보조 설명'}
                </label>
                {slideIndex === 0 && (
                  <span className="text-[10px] text-amber-300 font-medium">
                    첫 표지 강조 카드에 표시됩니다
                  </span>
                )}
              </div>
              <textarea
                value={slide.oneLineSummary || slide.subtitle || ''}
                onChange={(e) => onUpdateSlide({ 
                  subtitle: e.target.value,
                  oneLineSummary: e.target.value 
                })}
                rows={slideIndex === 0 ? 3 : 2}
                placeholder={slideIndex === 0 ? '기사 전체의 핵심을 관통하는 1줄 요약문' : '핵심 보조 문구'}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
              />
            </div>

            {/* Bullet Points */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  세부 핵심 포인트 ({slide.bullets.length}개)
                </label>
                <button
                  onClick={handleAddBullet}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>항목 추가</span>
                </button>
              </div>

              <div className="space-y-2">
                {slide.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="text-xs text-slate-500 font-bold mt-2 select-none">
                      •
                    </span>
                    <textarea
                      value={bullet}
                      onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                      rows={2}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
                    />
                    <button
                      onClick={() => handleDeleteBullet(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition mt-1"
                      title="항목 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'image' && (
          <div className="space-y-4">
            {/* Current Image & AI Generator */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  현재 배경 이미지
                </span>
                <button
                  type="button"
                  onClick={handleGenerateAiImage}
                  disabled={isGeneratingAiImage}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isGeneratingAiImage ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAiImage ? '생성 중...' : 'AI 새 이미지 생성'}</span>
                </button>
              </div>

              {slide.imageUrl && (
                <div className="relative h-28 rounded-lg overflow-hidden border border-slate-800">
                  <img
                    src={slide.imageUrl}
                    alt="Current"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white">
                    적용됨
                  </span>
                </div>
              )}
            </div>

            {/* Overlay Darkness Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>배경 어둡기 조절 (텍스트 가독성)</span>
                </label>
                <span className="text-xs font-bold text-brand-400">
                  {Math.round((slide.imageOverlayOpacity ?? 0.6) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={slide.imageOverlayOpacity ?? 0.6}
                onChange={(e) => onUpdateSlide({ imageOverlayOpacity: parseFloat(e.target.value) })}
                className="w-full accent-brand-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Blur toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-medium text-slate-300">
                배경 은은한 블러(흐림) 효과
              </span>
              <button
                type="button"
                onClick={() => onUpdateSlide({ imageBlur: !slide.imageBlur })}
                className={`w-10 h-5 rounded-full p-0.5 transition ${
                  slide.imageBlur ? 'bg-brand-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition transform ${
                    slide.imageBlur ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Original Article Image (if available) */}
            {originalArticleImage && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  기사 원문 대표 이미지:
                </label>
                <div
                  onClick={() => onUpdateSlide({ imageUrl: originalArticleImage })}
                  className="h-16 rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-brand-500 transition relative group"
                >
                  <img
                    src={originalArticleImage}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded">
                      원문 사진으로 교체
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Curated Stock Photos */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                추천 고화질 사진 선택:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {curatedStockImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => onUpdateSlide({ imageUrl: img })}
                    className="h-14 rounded-lg overflow-hidden cursor-pointer border border-slate-800 hover:border-brand-500 transition relative group"
                  >
                    <img
                      src={img}
                      alt="Stock"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Image URL input */}
            <form onSubmit={handleApplyCustomUrl} className="pt-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                직접 이미지 URL 입력
              </label>
              <div className="flex space-x-1.5">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
                >
                  적용
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
