import React from 'react';
import { Newspaper, Sparkles, Key, Layers, RefreshCw } from 'lucide-react';
import { SAMPLE_NEWS_LIST, SampleNews } from '../utils/sampleData';

interface HeaderProps {
  onSelectSample: (sample: SampleNews) => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectSample,
  onOpenApiKeyModal,
  hasApiKey,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-pink-500 p-0.5 shadow-glow flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
                CardFlow
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">
                AI Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              기사 링크 한 줄로 완성되는 고품질 카드뉴스
            </p>
          </div>
        </div>

        {/* Quick Sample News Buttons */}
        <div className="hidden lg:flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium flex items-center mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1" />
            빠른 샘플 테스트:
          </span>
          {SAMPLE_NEWS_LIST.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition flex items-center space-x-1"
              title={sample.title}
            >
              <span>{sample.category.split(' ')[0]}</span>
              <span className="truncate max-w-[90px]">{sample.category.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenApiKeyModal}
            className={`text-xs px-3 py-1.5 rounded-lg border transition flex items-center space-x-1.5 ${
              hasApiKey
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {hasApiKey ? 'Gemini AI 연결됨' : 'AI 엔진 설정'}
            </span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden md:inline font-medium text-emerald-400">엔진 준비완료</span>
          </div>
        </div>
      </div>
    </header>
  );
};
