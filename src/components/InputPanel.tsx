import React, { useState } from 'react';
import { 
  Link2, 
  FileText, 
  SlidersHorizontal, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon,
  Square,
  RectangleVertical,
  Smartphone,
  Hash,
  AtSign
} from 'lucide-react';
import { AspectRatio, CardThemeId, GenerationOptions, ScrapedArticle } from '../types';
import { CARD_THEMES } from '../utils/themes';
import { CATEGORY_LIST } from '../utils/nlpSummarizer';

interface InputPanelProps {
  onGenerateFromUrl: (url: string, options: GenerationOptions) => Promise<void>;
  onGenerateFromText: (
    title: string, 
    content: string, 
    press: string, 
    ogImage: string | undefined, 
    options: GenerationOptions
  ) => void;
  isLoading: boolean;
  loadingStep: string;
  activeDeckOptions: GenerationOptions;
  onChangeOptions: (opts: Partial<GenerationOptions>) => void;
  lastScrapedArticle?: ScrapedArticle | null;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  onGenerateFromUrl,
  onGenerateFromText,
  isLoading,
  loadingStep,
  activeDeckOptions,
  onChangeOptions,
  lastScrapedArticle,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'style'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [textPress, setTextPress] = useState('테크투데이');
  const [textContent, setTextContent] = useState('');
  const [textImage, setTextImage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const sampleUrls = [
    { label: '네이버 뉴스 (샘플)', url: 'https://n.news.naver.com/mnews/article/001/0014900000' },
    { label: '다음 뉴스 (샘플)', url: 'https://v.daum.net/v/20261030090000123' },
    { label: '연합뉴스 (샘플)', url: 'https://www.yna.co.kr/view/AKR20261030000000001' },
  ];

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!urlInput.trim()) {
      setErrorMessage('기사 링크(URL)를 입력해주세요.');
      return;
    }
    try {
      await onGenerateFromUrl(urlInput.trim(), activeDeckOptions);
    } catch (err: any) {
      setErrorMessage(err.message || '기사를 가져오는 중 오류가 발생했습니다.');
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!textTitle.trim()) {
      setErrorMessage('기사 제목(헤드라인)을 입력해주세요.');
      return;
    }
    if (!textContent.trim() || textContent.trim().length < 30) {
      setErrorMessage('기사 본문 내용을 30자 이상 입력해주세요.');
      return;
    }
    onGenerateFromText(
      textTitle.trim(),
      textContent.trim(),
      textPress.trim() || '뉴스 보도',
      textImage.trim() || undefined,
      activeDeckOptions
    );
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 shadow-xl flex flex-col h-full">
      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800/80 bg-slate-950/60 p-1.5">
        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'url'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>기사 링크 입력</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'text'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>직접 텍스트 입력</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'style'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>디자인 & 테마</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">오류 안내</p>
              <p className="mt-0.5 text-rose-200/90">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Tab 1: URL Input */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                뉴스 기사 링크 (URL)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://n.news.naver.com/... 또는 기사 링크 붙여넣기"
                  className="w-full pl-9 pr-20 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
                  disabled={isLoading}
                />
                <Link2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                {urlInput && (
                  <button
                    type="button"
                    onClick={() => setUrlInput('')}
                    className="absolute right-2.5 top-2.5 text-[11px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded bg-slate-800/80"
                  >
                    지우기
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                💡 네이버, 다음, 조선, 연합, BBC, 테크크런치 등 모든 뉴스 웹사이트 지원
              </p>
            </div>

            {/* Quick Sample Links helper */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400">
                빠른 테스트 샘플 URL:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleUrls.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUrlInput(s.url)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Badge Selection */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  카테고리 뱃지 설정
                </label>
                <span className="text-[11px] text-brand-400 font-medium">
                  {activeDeckOptions.selectedCategory === 'auto' || !activeDeckOptions.selectedCategory
                    ? '🎯 자동 감지 모드'
                    : '수동 지정 모드'}
                </span>
              </div>
              <select
                value={activeDeckOptions.selectedCategory || 'auto'}
                onChange={(e) => onChangeOptions({ selectedCategory: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="auto">🎯 기사 내용에 따라 자동 감지 (추천)</option>
                {CATEGORY_LIST.map((cat) => (
                  <option key={cat.key} value={cat.badge}>
                    {cat.icon} {cat.badge}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                카테고리 뱃지
              </label>
              <select
                value={activeDeckOptions.selectedCategory || 'auto'}
                onChange={(e) => onChangeOptions({ selectedCategory: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="auto">🎯 본문 내용에 따라 자동 감지 (추천)</option>
                {CATEGORY_LIST.map((cat) => (
                  <option key={cat.key} value={cat.badge}>
                    {cat.icon} {cat.badge}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-lg shadow-brand-600/30 transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{loadingStep || '기사 분석 및 카드뉴스 생성 중...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>카드뉴스 자동 생성하기</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Direct Text Input */}
        {activeTab === 'text' && (
          <form onSubmit={handleTextSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                기사 제목 (헤드라인) *
              </label>
              <input
                type="text"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                placeholder="예: 현대차, 1회 충전 1000km 전고체 배터리 양산 착수"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  언론사 / 출처
                </label>
                <input
                  type="text"
                  value={textPress}
                  onChange={(e) => setTextPress(e.target.value)}
                  placeholder="예: 연합뉴스"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  대표 이미지 URL (선택)
                </label>
                <input
                  type="url"
                  value={textImage}
                  onChange={(e) => setTextImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  기사 본문 내용 *
                </label>
                <span className="text-[11px] text-slate-400">
                  {textContent.length}자
                </span>
              </div>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={5}
                placeholder="기사 본문 또는 요약하고 싶은 텍스트를 붙여넣으세요..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                카테고리 뱃지
              </label>
              <select
                value={activeDeckOptions.selectedCategory || 'auto'}
                onChange={(e) => onChangeOptions({ selectedCategory: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="auto">🎯 본문 내용에 따라 자동 감지 (추천)</option>
                {CATEGORY_LIST.map((cat) => (
                  <option key={cat.key} value={cat.badge}>
                    {cat.icon} {cat.badge}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 text-white shadow-lg shadow-brand-600/30 transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>텍스트로 카드뉴스 만들기</span>
            </button>
          </form>
        )}

        {/* Tab 3: Style & Layout Options */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                카드 규격 및 비율 (Aspect Ratio)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '1:1', label: '1:1 정방형', desc: '인스타 피드 기본', icon: Square },
                  { id: '4:5', label: '4:5 세로형', desc: '피드 최적 몰입형', icon: RectangleVertical },
                  { id: '9:16', label: '9:16 스토리', desc: '릴스 / 스토리용', icon: Smartphone },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeDeckOptions.aspectRatio === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onChangeOptions({ aspectRatio: item.id as AspectRatio })}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center justify-center text-center ${
                        isActive
                          ? 'bg-brand-600/20 border-brand-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-semibold">{item.label}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                디자인 컬러 테마
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CARD_THEMES).map((theme) => {
                  const isActive = activeDeckOptions.themeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onChangeOptions({ themeId: theme.id as CardThemeId })}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                        isActive
                          ? 'border-brand-500 bg-brand-500/10 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg bg-gradient-to-br ${theme.previewGradient} border border-white/20 shrink-0`}
                      />
                      <div className="overflow-hidden">
                        <div className="text-xs font-medium truncate">{theme.nameKo}</div>
                        <div className="text-[10px] text-slate-500 truncate">{theme.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slide Count Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  생성 슬라이드 매수
                </label>
                <span className="text-xs font-bold text-brand-400">
                  {activeDeckOptions.slideCount}장
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="7"
                step="1"
                value={activeDeckOptions.slideCount}
                onChange={(e) => onChangeOptions({ slideCount: parseInt(e.target.value) })}
                className="w-full accent-brand-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>4장 (핵심만)</span>
                <span>5장 (추천)</span>
                <span>6장 (상세)</span>
                <span>7장 (심층)</span>
              </div>
            </div>

            {/* Channel Handle Watermark */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                내 채널 / 브랜드 워터마크 (@계정명)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={activeDeckOptions.channelHandle || ''}
                  onChange={(e) => onChangeOptions({ channelHandle: e.target.value })}
                  placeholder="@today_news_pick"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <AtSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>
        )}

        {/* Scraped Article Preview Card */}
        {lastScrapedArticle && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>기사 추출 완료</span>
              </span>
              <span className="text-[11px]">{lastScrapedArticle.press}</span>
            </div>
            <p className="font-medium text-slate-200 line-clamp-2">
              {lastScrapedArticle.title}
            </p>
            {lastScrapedArticle.ogImage && (
              <div className="h-20 rounded-lg overflow-hidden relative">
                <img
                  src={lastScrapedArticle.ogImage}
                  alt="Scraped"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white">
                  대표 이미지 자동 감지
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
