import React, { useState } from 'react';
import { 
  Download, 
  Archive, 
  Copy, 
  Check, 
  Smartphone, 
  Share2, 
  Loader2 
} from 'lucide-react';
import { CardDeck } from '../types';
import { copyCaptionToClipboard } from '../utils/exportHelper';

interface ExportToolbarProps {
  deck: CardDeck;
  onExportCurrentSlide: () => Promise<void>;
  onExportAllZip: () => Promise<void>;
  onOpenMobilePreview: () => void;
  isExportingZip: boolean;
  zipProgress: { current: number; total: number };
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  deck,
  onExportCurrentSlide,
  onExportAllZip,
  onOpenMobilePreview,
  isExportingZip,
  zipProgress,
}) => {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isExportingSingle, setIsExportingSingle] = useState(false);

  const handleCopyCaption = async () => {
    const success = await copyCaptionToClipboard(deck.caption);
    if (success) {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  const handleSingleExport = async () => {
    setIsExportingSingle(true);
    try {
      await onExportCurrentSlide();
    } finally {
      setIsExportingSingle(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800/80 shadow-xl flex flex-wrap items-center justify-between gap-3">
      {/* Left: Mobile Simulator & Caption Copy */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenMobilePreview}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition flex items-center space-x-1.5 shadow-sm"
        >
          <Smartphone className="w-4 h-4 text-brand-400" />
          <span>모바일 피드 미리보기</span>
        </button>

        <button
          onClick={handleCopyCaption}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 ${
            copiedCaption
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
          }`}
        >
          {copiedCaption ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>캡션 복사완료!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>SNS 캡션·태그 복사</span>
            </>
          )}
        </button>
      </div>

      {/* Right: High-Res Downloads */}
      <div className="flex items-center space-x-2">
        {/* Single PNG */}
        <button
          onClick={handleSingleExport}
          disabled={isExportingSingle || isExportingZip}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition flex items-center space-x-1.5 disabled:opacity-50"
        >
          {isExportingSingle ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Download className="w-4 h-4 text-slate-300" />
          )}
          <span>현재 카드 PNG</span>
        </button>

        {/* All ZIP */}
        <button
          onClick={onExportAllZip}
          disabled={isExportingZip || isExportingSingle}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 text-white shadow-lg shadow-brand-600/30 transition flex items-center space-x-2 disabled:opacity-50"
        >
          {isExportingZip ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>
                ZIP 생성 중 ({zipProgress.current}/{zipProgress.total})
              </span>
            </>
          ) : (
            <>
              <Archive className="w-4 h-4 text-amber-300" />
              <span>전체 카드 ZIP 다운로드</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
