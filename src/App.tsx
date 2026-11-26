import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, Info } from 'lucide-react';
import { AboutModal } from './components/AboutModal';
import { CanvasStage } from './components/CanvasStage';
import { Sidebar, type SidebarTabId } from './components/Sidebar';
import {
  generateRandomState,
  GLOBAL_POSE_PRESETS,
  INITIAL_KODEE_STATE,
} from './data/presets';
import type { ExportSize, KodeeState, LimbCurve } from './types/kodee';
import {
  copyKodeeJsonToClipboard,
  copyKodeePngToClipboard,
  copyKodeeSvgToClipboard,
  downloadKodeeJson,
  downloadKodeePng,
  downloadKodeeSvg,
} from './utils/exportPng';

interface ToastMessage {
  id: number;
  kind: 'success' | 'error';
  text: string;
}

const MAX_HISTORY = 40;

function cloneLimb(limb: LimbCurve): LimbCurve {
  return {
    ...(limb.anchor ? { anchor: { ...limb.anchor } } : {}),
    ctrl: { ...limb.ctrl },
    ...(limb.ctrl2 ? { ctrl2: { ...limb.ctrl2 } } : {}),
    end: { ...limb.end },
  };
}

function KodeeBrandMark() {
  return (
    <svg viewBox="-72 -72 144 132" className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id="brand-kodee-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7F52FF" />
          <stop offset="100%" stopColor="#E44857" />
        </linearGradient>
      </defs>
      <path
        d="M -66 41 Q -66 54 -53 54 L 53 54 Q 66 54 66 41 L 66 -54 Q 66 -68 53 -61 L 7 -36 Q 0 -32 -7 -36 L -53 -61 Q -66 -68 -66 -54 Z"
        fill="url(#brand-kodee-grad)"
      />
      <rect x={-55} y={-24} width={110} height={67} rx={11} fill="#09090D" />
      <circle cx={-22} cy={7} r={13} fill="none" stroke="#FFFFFF" strokeWidth={6} />
      <circle cx={22} cy={7} r={13} fill="none" stroke="#FFFFFF" strokeWidth={6} />
    </svg>
  );
}

export default function App() {
  const [state, setState] = useState<KodeeState>(INITIAL_KODEE_STATE);
  const [past, setPast] = useState<KodeeState[]>([]);
  const [future, setFuture] = useState<KodeeState[]>([]);
  const [activeTab, setActiveTab] = useState<SidebarTabId>('poses');
  const [activePresetId, setActivePresetId] = useState<string | null>('greeting');
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<string | null>(null);
  const [handlesPinned, setHandlesPinned] = useState(false);
  const [exportSize, setExportSize] = useState<ExportSize>(1024);
  const [exportTransparent, setExportTransparent] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((kind: 'success' | 'error', text: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ id: Date.now(), kind, text });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  const pushSnapshot = useCallback((snapshot: KodeeState) => {
    setPast((prev) => [...prev.slice(-(MAX_HISTORY - 1)), snapshot]);
    setFuture([]);
  }, []);

  const handleUpdateState = useCallback(
    (updater: (prev: KodeeState) => KodeeState, recordHistory = true) => {
      setState((prev) => {
        const next = updater(prev);
        if (next === prev) return prev;
        if (recordHistory) {
          pushSnapshot(prev);
        }
        return next;
      });
      setActivePresetId(null);
    },
    [pushSnapshot],
  );

  const handleCanvasDragStart = useCallback(() => {
    pushSnapshot(state);
    setActivePresetId(null);
  }, [pushSnapshot, state]);

  const handleCanvasChange = useCallback((next: KodeeState) => {
    setState(next);
  }, []);

  const handleSelectAccessory = useCallback((id: string | null) => {
    setSelectedAccessoryId(id);
    if (id) {
      setActiveTab('accessories');
    }
  }, []);

  const handleSelectGlobalPreset = useCallback(
    (presetId: string) => {
      const preset = GLOBAL_POSE_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;
      pushSnapshot(state);
      setState((prev) => ({
        ...prev,
        body: {
          ...prev.body,
          x: preset.body.x,
          y: preset.body.y,
          rotation: preset.body.rotation,
        },
        face: {
          expression: preset.face.expression,
          eyeOffset: { ...preset.face.eyeOffset },
        },
        limbs: {
          leftArm: cloneLimb(preset.limbs.leftArm),
          rightArm: cloneLimb(preset.limbs.rightArm),
          leftLeg: cloneLimb(preset.limbs.leftLeg),
          rightLeg: cloneLimb(preset.limbs.rightLeg),
        },
        feet: {
          enabled: prev.feet.enabled,
          left: preset.feet.left,
          right: preset.feet.right,
        },
      }));
      setActivePresetId(presetId);
    },
    [pushSnapshot, state],
  );

  const handleRandomize = useCallback(() => {
    pushSnapshot(state);
    setState((prev) => generateRandomState(prev));
    setActivePresetId(null);
  }, [pushSnapshot, state]);

  const handleReset = useCallback(() => {
    pushSnapshot(state);
    setState(INITIAL_KODEE_STATE);
    setActivePresetId('greeting');
    setSelectedAccessoryId(null);
    showToast('success', 'Pose and settings reset.');
  }, [pushSnapshot, showToast, state]);

  const handleUndo = useCallback(() => {
    setPast((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setFuture((f) => [state, ...f.slice(0, MAX_HISTORY - 1)]);
      setState(previous);
      setActivePresetId(null);
      return prev.slice(0, -1);
    });
  }, [state]);

  const handleRedo = useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      setPast((p) => [...p.slice(-(MAX_HISTORY - 1)), state]);
      setState(next);
      setActivePresetId(null);
      return prev.slice(1);
    });
  }, [state]);

  // Keyboard shortcuts: Undo / Redo + Delete selected accessory
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditingText =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isEditingText) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAccessoryId) {
        e.preventDefault();
        handleUpdateState((prev) => ({
          ...prev,
          accessories: prev.accessories.filter((a) => a.id !== selectedAccessoryId),
        }));
        setSelectedAccessoryId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleRedo, handleUndo, handleUpdateState, selectedAccessoryId]);

  const effectiveTransparent = exportTransparent || state.background.color === 'transparent';

  const handleDownloadPng = useCallback(async () => {
    if (!svgRef.current) return;
    try {
      const filename = await downloadKodeePng(svgRef.current, exportSize, effectiveTransparent);
      showToast('success', `Image downloaded: ${filename}`);
    } catch (err) {
      showToast(
        'error',
        err instanceof Error ? err.message : 'Failed to export PNG.',
      );
    }
  }, [effectiveTransparent, exportSize, showToast]);

  const handleCopyPng = useCallback(async () => {
    if (!svgRef.current) return;
    try {
      await copyKodeePngToClipboard(svgRef.current, exportSize, effectiveTransparent);
      showToast('success', `PNG ${exportSize} × ${exportSize} px copied to clipboard.`);
    } catch (err) {
      showToast(
        'error',
        err instanceof Error
          ? err.message
          : 'Could not copy image to clipboard.',
      );
      throw err;
    }
  }, [effectiveTransparent, exportSize, showToast]);

  const handleDownloadSvg = useCallback(() => {
    if (!svgRef.current) return;
    const filename = downloadKodeeSvg(svgRef.current, effectiveTransparent);
    showToast('success', `Vector file exported: ${filename}`);
  }, [effectiveTransparent, showToast]);

  const handleCopySvg = useCallback(async () => {
    if (!svgRef.current) return;
    try {
      await copyKodeeSvgToClipboard(svgRef.current, effectiveTransparent);
      showToast('success', 'SVG code copied to clipboard.');
    } catch {
      showToast('error', 'Could not copy SVG to clipboard.');
      throw new Error('Clipboard copy failed');
    }
  }, [effectiveTransparent, showToast]);

  const handleDownloadJson = useCallback(() => {
    const filename = downloadKodeeJson(state);
    showToast('success', `Configuration exported: ${filename}`);
  }, [showToast, state]);

  const handleCopyJson = useCallback(async () => {
    try {
      await copyKodeeJsonToClipboard(state);
      showToast('success', 'JSON copied to clipboard.');
    } catch {
      showToast('error', 'Could not copy JSON to clipboard.');
      throw new Error('Clipboard copy failed');
    }
  }, [showToast, state]);

  const handleImportState = useCallback(
    (imported: KodeeState) => {
      pushSnapshot(state);
      setState(imported);
      setActivePresetId(null);
      setSelectedAccessoryId(null);
      showToast('success', 'JSON configuration imported successfully.');
    },
    [pushSnapshot, showToast, state],
  );

  return (
    <div className="min-h-[100dvh] lg:h-screen flex flex-col bg-[#0B0C10] text-[#F4F4F6] lg:overflow-hidden">
      {/* Studio Top Bar */}
      <header className="sticky top-0 z-30 h-12 sm:h-14 shrink-0 px-3.5 sm:px-5 flex items-center justify-between gap-4 sm:gap-8 bg-[#111217]/95 backdrop-blur-md border-b border-[#232530]">
        <div className="flex items-center gap-2 sm:gap-2.5 whitespace-nowrap shrink-0">
          <KodeeBrandMark />
          <span className="text-sm sm:text-base font-bold tracking-tight text-white">
            Kodee Studio
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium text-[#C8CBD9] bg-[#1A1C24] border border-[#282B39] hover:text-white hover:border-[#3E4257] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF]"
          >
            <Info className="w-3.5 h-3.5 text-[#9B7BFF]" aria-hidden="true" />
            About
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-semibold text-white bg-[#7F52FF] hover:bg-[#906BFF] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Export PNG
          </button>
        </div>
      </header>

      {/* Main Responsive Workspace (stacked on mobile/tablet, split-screen on desktop) */}
      <main className="relative flex-1 lg:min-h-0 flex flex-col lg:flex-row lg:overflow-hidden">
        {/* Toast Feedback */}
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className={`fixed top-14 sm:top-[68px] left-1/2 -translate-x-1/2 lg:left-[calc((100%-430px)/2)] z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium shadow-xl backdrop-blur-md max-w-[calc(100vw-2rem)] ${
              toast.kind === 'success'
                ? 'bg-[#161922]/95 border-[#2E3346] text-white'
                : 'bg-[#2A1519]/95 border-red-500/40 text-red-100'
            }`}
          >
            {toast.kind === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
            )}
            <span className="truncate">{toast.text}</span>
          </div>
        )}

        <CanvasStage
          state={state}
          svgRef={svgRef}
          handlesPinned={handlesPinned}
          selectedAccessoryId={selectedAccessoryId}
          onSelectAccessory={handleSelectAccessory}
          onToggleHandles={() => setHandlesPinned((v) => !v)}
          onChange={handleCanvasChange}
          onDragStart={handleCanvasDragStart}
          onRandomize={handleRandomize}
          onReset={handleReset}
          onCopyPng={handleCopyPng}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          state={state}
          activePresetId={activePresetId}
          selectedAccessoryId={selectedAccessoryId}
          onSelectAccessory={setSelectedAccessoryId}
          onSelectGlobalPreset={handleSelectGlobalPreset}
          onUpdateState={handleUpdateState}
          exportSize={exportSize}
          onExportSizeChange={setExportSize}
          exportTransparent={exportTransparent}
          onExportTransparentChange={setExportTransparent}
          onDownloadPng={handleDownloadPng}
          onCopyPng={handleCopyPng}
          onDownloadSvg={handleDownloadSvg}
          onCopySvg={handleCopySvg}
          onDownloadJson={handleDownloadJson}
          onCopyJson={handleCopyJson}
          onImportState={handleImportState}
        />
      </main>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
