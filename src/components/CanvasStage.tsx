import React, { useState } from 'react';
import { Check, Copy, Crosshair, Dices, Redo2, RotateCcw, Undo2 } from 'lucide-react';
import type { KodeeState } from '../types/kodee';
import { KodeeSvg } from './KodeeSvg';

interface CanvasStageProps {
  state: KodeeState;
  svgRef: React.RefObject<SVGSVGElement | null>;
  handlesPinned: boolean;
  selectedAccessoryId: string | null;
  onSelectAccessory: (id: string | null) => void;
  onToggleHandles: () => void;
  onChange: (next: KodeeState) => void;
  onDragStart: () => void;
  onRandomize: () => void;
  onReset: () => void;
  onCopyPng: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  state,
  svgRef,
  handlesPinned,
  selectedAccessoryId,
  onSelectAccessory,
  onToggleHandles,
  onChange,
  onDragStart,
  onRandomize,
  onReset,
  onCopyPng,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const showHandles = handlesPinned || isHovered;
  const isTransparentBg = state.background.color === 'transparent';

  const handleCopyClick = async () => {
    try {
      await onCopyPng();
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Handled via toast in parent
    }
  };

  return (
    <section
      aria-label="Kodee preview canvas"
      className="relative flex-none lg:flex-1 min-w-0 studio-viewport-grid flex flex-col items-center justify-center px-3 py-4 sm:p-6 lg:p-8 lg:overflow-hidden"
    >
      {/* Square Artboard Container */}
      <div className="w-full lg:flex-1 lg:min-h-0 flex items-center justify-center">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative aspect-square w-full max-w-[min(420px,calc(100vw-1.75rem))] sm:max-w-[460px] lg:max-w-[min(560px,calc(100vh-205px))] rounded-2xl overflow-hidden border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.6)] transition-shadow duration-200 ${
            isTransparentBg ? 'transparency-checkerboard' : ''
          }`}
        >
          <KodeeSvg
            state={state}
            svgRef={svgRef}
            interactive
            showHandles={showHandles}
            selectedAccessoryId={selectedAccessoryId}
            onSelectAccessory={onSelectAccessory}
            onDragStart={onDragStart}
            onChange={onChange}
            useCanonicalGradientId
          />
        </div>
      </div>

      {/* Floating Action Toolbar */}
      <div className="mt-3.5 sm:mt-4 w-full flex flex-col items-center gap-2 shrink-0">
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-1.5 rounded-xl bg-[#14151A]/95 border border-[#262834] shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-md max-w-full">
          <button
            type="button"
            onClick={onRandomize}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 min-h-[38px] sm:min-h-[36px] rounded-lg text-xs font-medium text-white bg-[#7F52FF] hover:bg-[#906BFF] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]"
          >
            <Dices className="w-3.5 h-3.5" aria-hidden="true" />
            Random
          </button>

          <div className="w-px h-5 bg-[#262834] mx-0.5 hidden sm:block" aria-hidden="true" />

          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#C7CAD6] hover:text-white hover:bg-[#1E2029] disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF]"
          >
            <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#C7CAD6] hover:text-white hover:bg-[#1E2029] disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF]"
          >
            <Redo2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 min-h-[38px] sm:min-h-[36px] rounded-lg text-xs font-medium text-[#C7CAD6] hover:text-white hover:bg-[#1E2029] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF]"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden xs:inline sm:inline">Reset</span>
          </button>

          <div className="w-px h-5 bg-[#262834] mx-0.5 hidden sm:block" aria-hidden="true" />

          <button
            type="button"
            onClick={onToggleHandles}
            aria-pressed={handlesPinned}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 min-h-[38px] sm:min-h-[36px] rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF] ${
              handlesPinned
                ? 'bg-[#7F52FF]/20 text-[#C4B5FD] ring-1 ring-inset ring-[#7F52FF]/50'
                : 'text-[#C7CAD6] hover:text-white hover:bg-[#1E2029]'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
            Handles
          </button>

          <button
            type="button"
            onClick={handleCopyClick}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 min-h-[38px] sm:min-h-[36px] rounded-lg text-xs font-medium text-[#C7CAD6] hover:text-white hover:bg-[#1E2029] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF]"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy PNG'}
          </button>
        </div>

        <p className="text-[11px] text-[#7D8193] text-center max-w-lg px-2 leading-relaxed">
          Drag <span className="text-[#2DD4BF]">body joints</span>,{' '}
          <span className="text-[#C4B5FD]">bend diamonds</span>, or limb tips. Double-click any limb to toggle a 2nd bend point.
        </p>
      </div>
    </section>
  );
};
