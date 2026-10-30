import React, { useState } from 'react';
import { X, Key, Sparkles, Check, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI 요약 엔진 설정</h3>
            <p className="text-xs text-slate-400">Gemini 또는 자체 스마트 NLP 엔진 선택</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>기본 무료 스마트 엔진 탑재</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              API 키가 없어도 한국어 뉴스 분석 및 카드뉴스 자동 요약 기능이 100% 무료로 완벽하게 작동합니다.
            </p>
            <p className="leading-relaxed text-slate-400">
              더욱 창의적인 카피라이팅 및 심층 요약을 원하시면 Google Gemini API 키를 입력해주세요.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Google Gemini API Key (선택사항)
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
            />
            <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
              <span>키는 브라우저 로컬 저장소에만 안전하게 보관됩니다.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:underline flex items-center space-x-0.5"
              >
                <span>무료 발급받기</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
              >
                키 초기화
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition flex items-center space-x-1.5 shadow-lg shadow-brand-600/30"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>저장 완료!</span>
                </>
              ) : (
                <span>설정 저장하기</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
