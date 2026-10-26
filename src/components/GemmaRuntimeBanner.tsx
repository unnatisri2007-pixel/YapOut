import React from 'react';
import { Cpu, Server, ShieldAlert, ChevronRight } from 'lucide-react';
import { GemmaRuntimeStatus } from '../types';

interface GemmaRuntimeBannerProps {
  status: GemmaRuntimeStatus | null;
  onOpenModal: () => void;
}

export const GemmaRuntimeBanner: React.FC<GemmaRuntimeBannerProps> = ({ status, onOpenModal }) => {
  const isLive = Boolean(status?.configured);

  return (
    <div
      className={`w-full px-4 py-3 rounded-2xl border transition-all ${
        isLive
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
          : 'bg-[#181512] border-amber-500/30 text-amber-200/90'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isLive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {isLive ? <Server className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white tracking-wide">
                Gemma 4 Engine:
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                  isLive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isLive ? 'Live' : 'Simulated'}
              </span>
            </div>
            <p className="text-gray-400 mt-0.5">
              {isLive
                ? `Connected to real Gemma 4 model (${status?.modelName || 'gemma-4-31b-it'}) via Gemini API.`
                : 'GEMINI_API_KEY missing or inactive. Running in simulated fallback mode.'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenModal}
          className="self-start sm:self-auto btn-genz-dark !rounded-xl !px-3.5 !py-1.5 text-xs flex items-center gap-1 shrink-0"
        >
          <span>Runtime Details</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#B99AFF] stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
