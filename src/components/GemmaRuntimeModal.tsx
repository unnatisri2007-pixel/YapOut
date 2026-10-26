import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Copy, Terminal, Server, ShieldAlert, Cpu, Sparkles, Key } from 'lucide-react';
import { GemmaRuntimeStatus } from '../types';

interface GemmaRuntimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: GemmaRuntimeStatus | null;
}

export const GemmaRuntimeModal: React.FC<GemmaRuntimeModalProps> = ({ isOpen, onClose, status }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  const isLive = Boolean(status?.configured);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-[#141620] border border-[#2d3246] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232736] bg-[#0f1118]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-lime-400 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#141620] rounded-[6px] flex items-center justify-center">
                <Cpu className="w-4 h-4 text-[#bef264]" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Gemma 4 AI Inference Runtime</h3>
              <p className="text-xs text-gray-400">Gemini API integration & model status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#232736] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300">
          {/* Status Indicator Card */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              isLive
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/25 border-amber-500/30 text-amber-200'
            }`}
          >
            {isLive ? (
              <Server className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-semibold text-white flex items-center gap-2">
                <span>Current Status:</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                    isLive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isLive ? 'Live' : 'Simulated'}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {isLive
                  ? `Connected to the real Gemma 4 model (${status?.modelName || 'gemma-4-31b-it'}) using the Gemini API. Server-side GEMINI_API_KEY is active and inference requests run live.`
                  : 'Operating in simulated fallback mode. When GEMINI_API_KEY is missing or if an API call encounters temporary upstream errors, YapOut automatically falls back to deterministic simulated mode so the planner never fails.'}
              </p>
            </div>
          </div>

          {/* Architecture Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Gemma 4 Integration Architecture
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#0c0d12] border border-[#232736] rounded-xl space-y-1">
                <span className="text-gray-400 font-mono">Target Model:</span>
                <div className="font-bold text-white font-mono text-sm">{status?.modelName || 'gemma-4-31b-it'}</div>
                <p className="text-gray-400 text-[11px]">Official Google Gemma 4 instruction-tuned model.</p>
              </div>
              <div className="p-3 bg-[#0c0d12] border border-[#232736] rounded-xl space-y-1">
                <span className="text-gray-400 font-mono">Secret & Security:</span>
                <div className="font-bold text-emerald-400 font-mono text-sm">Server-Only (GEMINI_API_KEY)</div>
                <p className="text-gray-400 text-[11px]">Never exposed to browser bundles or client code.</p>
              </div>
            </div>
          </div>

          {/* Resilience & Fallback */}
          <div className="bg-[#0b0c10] border border-[#232736] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Sparkles className="w-4 h-4 text-[#bef264]" /> Automatic Fallback Resilience
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              If the <code className="text-purple-300">GEMINI_API_KEY</code> secret is omitted or an upstream call to <code className="text-purple-300">gemma-4-31b-it</code> fails, YapOut seamlessly provides the structured simulated hangout planner. When live calls succeed, the runtime badge switches to <span className="text-emerald-400 font-bold">Live</span>.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t-2 border-[#232736] bg-[#0f1118] flex items-center justify-between text-xs text-gray-400">
          <span>Engineered with GoogleGenAI SDK</span>
          <button
            onClick={onClose}
            className="btn-genz-lime rounded-xl px-5 py-2 text-xs"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
