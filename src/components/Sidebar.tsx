import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  FileCode2,
  FileJson,
  FlipHorizontal2,
  Layers,
  MessageSquare,
  Minus,
  Palette,
  Plus,
  Smile,
  Sparkles,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import {
  ACCESSORY_CATALOG,
  ACCESSORY_CATEGORIES,
  AccessoryGraphic,
  getAccessoryMeta,
  type AccessoryCategory,
} from '../data/accessories';
import {
  ARM_ANCHOR_PRESETS,
  ARM_PRESETS,
  BACKGROUND_SWATCHES,
  buildLimbFromPreset,
  COLOR_PALETTES,
  EXPRESSION_METAS,
  GLOBAL_POSE_PRESETS,
  LEG_ANCHOR_PRESETS,
  LEG_PRESETS,
} from '../data/presets';
import {
  validateKodeeState,
  type AccessoryInstance,
  type AccessoryType,
  type BubbleFontSize,
  type BubblePosition,
  type ExportSize,
  type KodeeState,
  type LimbId,
} from '../types/kodee';
import {
  computeNewSecondBend,
  DEFAULT_BODY_Y,
  getLimbAnchors,
  LOCAL_ANCHORS,
  translateRig,
} from '../utils/geometry';
import type { CopyImageOutcome } from '../utils/exportPng';
import { MiniFacePreview, MiniPosePreview } from './MiniPosePreview';

export type SidebarTabId = 'poses' | 'face' | 'accessories' | 'style' | 'bubble' | 'export';

interface SidebarProps {
  activeTab: SidebarTabId;
  onTabChange: (tab: SidebarTabId) => void;
  state: KodeeState;
  activePresetId: string | null;
  selectedAccessoryId: string | null;
  onSelectAccessory: (id: string | null) => void;
  onSelectGlobalPreset: (presetId: string) => void;
  onUpdateState: (updater: (prev: KodeeState) => KodeeState, recordHistory?: boolean) => void;
  exportSize: ExportSize;
  onExportSizeChange: (size: ExportSize) => void;
  exportTransparent: boolean;
  onExportTransparentChange: (transparent: boolean) => void;
  onDownloadPng: () => Promise<void>;
  onCopyPng: () => Promise<CopyImageOutcome['status']>;
  onDownloadSvg: () => void;
  onCopySvg: () => Promise<void>;
  onDownloadJson: () => void;
  onCopyJson: () => Promise<void>;
  onImportState: (next: KodeeState) => void;
}

const TABS: Array<{ id: SidebarTabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'poses', label: 'Poses', icon: User },
  { id: 'face', label: 'Face', icon: Smile },
  { id: 'accessories', label: 'Props', icon: Sparkles },
  { id: 'style', label: 'Colors', icon: Palette },
  { id: 'bubble', label: 'Bubble', icon: MessageSquare },
  { id: 'export', label: 'Export', icon: Download },
];

const LIMB_META: Array<{ id: LimbId; label: string }> = [
  { id: 'leftArm', label: 'Left Arm' },
  { id: 'rightArm', label: 'Right Arm' },
  { id: 'leftLeg', label: 'Left Leg' },
  { id: 'rightLeg', label: 'Right Leg' },
];

const GAZE_DIRECTIONS: Array<{ label: string; x: number; y: number }> = [
  { label: 'Top-Left', x: -6, y: -4 },
  { label: 'Up', x: 0, y: -4 },
  { label: 'Top-Right', x: 6, y: -4 },
  { label: 'Left', x: -6, y: 0 },
  { label: 'Center', x: 0, y: 0 },
  { label: 'Right', x: 6, y: 0 },
  { label: 'Bottom-Left', x: -6, y: 4 },
  { label: 'Down', x: 0, y: 4 },
  { label: 'Bottom-Right', x: 6, y: 4 },
];

const SAMPLE_QUOTES = [
  'Hello Kotlin!',
  'Null-safe by design.',
  'Ready to ship!',
  'Coffee break?',
];

const EXPORT_SIZES: Array<{ size: ExportSize; tag: string; usage: string }> = [
  { size: 256, tag: 'S', usage: 'Slack, Discord, avatars' },
  { size: 1024, tag: 'M', usage: 'Web, docs, social' },
  { size: 2048, tag: 'L', usage: 'HD slides, print' },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  state,
  activePresetId,
  selectedAccessoryId,
  onSelectAccessory,
  onSelectGlobalPreset,
  onUpdateState,
  exportSize,
  onExportSizeChange,
  exportTransparent,
  onExportTransparentChange,
  onDownloadPng,
  onCopyPng,
  onDownloadSvg,
  onCopySvg,
  onDownloadJson,
  onCopyJson,
  onImportState,
}) => {
  const [armTarget, setArmTarget] = useState<'left' | 'right' | 'both'>('both');
  const [legTarget, setLegTarget] = useState<'left' | 'right' | 'both'>('both');
  const [accCategory, setAccCategory] = useState<'all' | AccessoryCategory>('all');
  const [importError, setImportError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedPng, setCopiedPng] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const verticalOffset = state.body.y - DEFAULT_BODY_Y;

  const parseAndImportJson = (rawText: string) => {
    setImportError(null);
    try {
      const parsed = JSON.parse(rawText);
      const result = validateKodeeState(parsed);
      if (!result.ok) {
        setImportError(result.error);
        return;
      }
      onImportState(result.state);
      setShowPasteBox(false);
      setPasteText('');
    } catch {
      setImportError('Malformed JSON: unable to read file contents.');
    }
  };

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setImportError('Please select a .json file.');
      return;
    }
    const text = await file.text();
    parseAndImportJson(text);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    await handleFileSelected(file);
  };

  const handleHexInput = (value: string, apply: (validHex: string) => void) => {
    const normalized = value.startsWith('#') ? value : `#${value}`;
    if (HEX_RE.test(normalized)) {
      apply(normalized.toUpperCase());
    }
  };

  const handleToggleLimbSecondBend = (id: LimbId) => {
    onUpdateState((prev) => {
      const limb = prev.limbs[id];
      const anchors = getLimbAnchors(prev.body, prev.limbs);
      if (limb.ctrl2) {
        const merged = {
          x: Math.round((limb.ctrl.x + limb.ctrl2.x) / 2),
          y: Math.round((limb.ctrl.y + limb.ctrl2.y) / 2),
        };
        const { ctrl2: _removed, ...rest } = limb;
        return {
          ...prev,
          limbs: {
            ...prev.limbs,
            [id]: { ...rest, ctrl: merged },
          },
        };
      }
      const { ctrl, ctrl2 } = computeNewSecondBend(anchors[id], limb);
      return {
        ...prev,
        limbs: {
          ...prev.limbs,
          [id]: { ...limb, ctrl, ctrl2 },
        },
      };
    });
  };

  const handleAddAccessory = (type: AccessoryType) => {
    const meta = getAccessoryMeta(type);
    const createdIds: string[] = [];
    onUpdateState((prev) => {
      const spawned = meta.spawn(prev).map((item, idx) => {
        const id = `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${idx}`;
        createdIds.push(id);
        return { ...item, id };
      });
      return {
        ...prev,
        accessories: [...prev.accessories, ...spawned],
      };
    });
    if (createdIds.length > 0) {
      onSelectAccessory(createdIds[createdIds.length - 1]);
    }
  };

  const handleUpdateAccessory = (
    id: string,
    patch: Partial<AccessoryInstance>,
    recordHistory = true,
  ) => {
    onUpdateState(
      (prev) => ({
        ...prev,
        accessories: prev.accessories.map((acc) =>
          acc.id === id ? { ...acc, ...patch } : acc,
        ),
      }),
      recordHistory,
    );
  };

  const handleRemoveAccessory = (id: string) => {
    onUpdateState((prev) => ({
      ...prev,
      accessories: prev.accessories.filter((acc) => acc.id !== id),
    }));
    if (selectedAccessoryId === id) {
      onSelectAccessory(null);
    }
  };

  const handleDuplicateAccessory = (acc: AccessoryInstance) => {
    const newId = `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    onUpdateState((prev) => ({
      ...prev,
      accessories: [
        ...prev.accessories,
        {
          ...acc,
          id: newId,
          x: Math.min(475, acc.x + 20),
          y: Math.min(475, acc.y + 14),
        },
      ],
    }));
    onSelectAccessory(newId);
  };

  const filteredCatalog =
    accCategory === 'all'
      ? ACCESSORY_CATALOG
      : ACCESSORY_CATALOG.filter((item) => item.category === accCategory);

  const activeAccessory =
    state.accessories.find((a) => a.id === selectedAccessoryId) ??
    state.accessories[state.accessories.length - 1] ??
    null;

  return (
    <aside
      aria-label="Kodee configuration panel"
      className="w-full lg:w-[412px] xl:w-[448px] shrink-0 bg-[#14151A] border-t lg:border-t-0 lg:border-l border-[#232530] flex flex-col lg:min-h-0"
    >
      {/* 6-Tab Bar */}
      <nav
        aria-label="Editor sections"
        className="grid grid-cols-6 border-b border-[#232530] px-1.5 pt-2 gap-0.5 shrink-0 sticky top-12 sm:top-14 lg:static z-20 bg-[#14151A]"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-1 min-h-[48px] py-2 px-1 rounded-t-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF] ${
                isActive
                  ? 'text-white bg-[#1B1D26]'
                  : 'text-[#8F93A6] hover:text-[#D5D8E2] hover:bg-[#181A22]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#9B7BFF]' : ''}`} aria-hidden="true" />
              <span className="truncate max-w-full">{tab.label}</span>
              {isActive && (
                <span
                  className="absolute bottom-0 inset-x-1.5 h-[2px] bg-[#7F52FF] rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Scrollable Tab Content */}
      <div className="flex-1 lg:overflow-y-auto studio-scroll p-4 sm:p-5 space-y-6">
        {/* TAB 1: POSES */}
        {activeTab === 'poses' && (
          <>
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Full poses</h2>
                <span className="text-xs text-[#7D8193] tabular-nums">
                  {GLOBAL_POSE_PRESETS.length} presets
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
                {GLOBAL_POSE_PRESETS.map((preset) => {
                  const selected = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onSelectGlobalPreset(preset.id)}
                      className={`group flex flex-col items-center gap-1 py-2 px-1.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF] ${
                        selected
                          ? 'bg-[#7F52FF]/15 border-[#7F52FF] text-white'
                          : 'bg-[#191B23] border-[#252734] text-[#B9BDD0] hover:border-[#3A3E52] hover:text-white'
                      }`}
                    >
                      <MiniPosePreview preset={preset} bodyStyle={state.body} />
                      <span className="text-[11px] font-medium truncate max-w-full">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-[#232530]" />

            {/* Feet toggle & Left/Right orientation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-white">Feet</h2>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.feet.enabled}
                  aria-label="Show feet"
                  onClick={() =>
                    onUpdateState((prev) => ({
                      ...prev,
                      feet: { ...prev.feet, enabled: !prev.feet.enabled },
                    }))
                  }
                  className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF] ${
                    state.feet.enabled ? 'bg-[#7F52FF]' : 'bg-[#2B2E3C]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform duration-150 ${
                      state.feet.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {state.feet.enabled && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1.5">
                    <span className="text-xs text-[#B4B8C9] block">Left foot</span>
                    <div className="grid grid-cols-2 p-0.5 rounded-lg bg-[#1A1C24] border border-[#262834]">
                      {(
                        [
                          { id: 'left', label: '← L' },
                          { id: 'right', label: 'R →' },
                        ] as const
                      ).map((dir) => (
                        <button
                          key={dir.id}
                          type="button"
                          onClick={() =>
                            onUpdateState((prev) => ({
                              ...prev,
                              feet: { ...prev.feet, left: dir.id },
                            }))
                          }
                          className={`py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            state.feet.left === dir.id
                              ? 'bg-[#2C2F3E] text-white'
                              : 'text-[#8F93A6] hover:text-white'
                          }`}
                        >
                          {dir.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs text-[#B4B8C9] block">Right foot</span>
                    <div className="grid grid-cols-2 p-0.5 rounded-lg bg-[#1A1C24] border border-[#262834]">
                      {(
                        [
                          { id: 'left', label: '← L' },
                          { id: 'right', label: 'R →' },
                        ] as const
                      ).map((dir) => (
                        <button
                          key={dir.id}
                          type="button"
                          onClick={() =>
                            onUpdateState((prev) => ({
                              ...prev,
                              feet: { ...prev.feet, right: dir.id },
                            }))
                          }
                          className={`py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            state.feet.right === dir.id
                              ? 'bg-[#2C2F3E] text-white'
                              : 'text-[#8F93A6] hover:text-white'
                          }`}
                        >
                          {dir.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-[#232530]" />

            {/* Articulations: 2nd bend point per limb */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold text-white">Bend points (arms &amp; legs)</h2>
                <span className="text-[11px] text-[#7D8193]">1 or 2 bends</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LIMB_META.map(({ id, label }) => {
                  const hasSecond = Boolean(state.limbs[id].ctrl2);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleToggleLimbSecondBend(id)}
                      className={`flex items-center justify-between px-3 min-h-[40px] rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                        hasSecond
                          ? 'bg-amber-500/15 border-amber-400/60 text-amber-100'
                          : 'bg-[#191B23] border-[#252734] text-[#C8CBD9] hover:border-[#3E4257] hover:text-white'
                      }`}
                    >
                      <span>{label}</span>
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        {hasSecond ? (
                          <>
                            <Minus className="w-3 h-3" aria-hidden="true" /> 2 bends
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" aria-hidden="true" /> 1 bend
                          </>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-[#232530]" />

            {/* Limb-to-body attachment joints */}
            <div className="space-y-3.5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold text-white">Body joints</h2>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateState((prev) => ({
                      ...prev,
                      limbs: {
                        leftArm: { ...prev.limbs.leftArm, anchor: { ...LOCAL_ANCHORS.leftArm } },
                        rightArm: { ...prev.limbs.rightArm, anchor: { ...LOCAL_ANCHORS.rightArm } },
                        leftLeg: { ...prev.limbs.leftLeg, anchor: { ...LOCAL_ANCHORS.leftLeg } },
                        rightLeg: { ...prev.limbs.rightLeg, anchor: { ...LOCAL_ANCHORS.rightLeg } },
                      },
                    }))
                  }
                  className="text-xs text-[#9B7BFF] hover:text-white cursor-pointer"
                >
                  Default
                </button>
              </div>
              <p className="text-xs text-[#8F93A6] leading-relaxed">
                Drag the teal anchor circles freely on the body, or pick a quick preset:
              </p>

              <div className="space-y-2">
                <span className="text-xs text-[#B4B8C9] block">Arm attachment</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {ARM_ANCHOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        onUpdateState((prev) => ({
                          ...prev,
                          limbs: {
                            ...prev.limbs,
                            leftArm: { ...prev.limbs.leftArm, anchor: { ...preset.left } },
                            rightArm: { ...prev.limbs.rightArm, anchor: { ...preset.right } },
                          },
                        }))
                      }
                      className="px-2.5 min-h-[38px] rounded-lg text-xs font-medium bg-[#191B23] border border-[#252734] text-[#D0D3E2] hover:border-[#2DD4BF] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-[#B4B8C9] block">Leg attachment</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {LEG_ANCHOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        onUpdateState((prev) => ({
                          ...prev,
                          limbs: {
                            ...prev.limbs,
                            leftLeg: { ...prev.limbs.leftLeg, anchor: { ...preset.left } },
                            rightLeg: { ...prev.limbs.rightLeg, anchor: { ...preset.right } },
                          },
                        }))
                      }
                      className="px-2 min-h-[38px] rounded-lg text-xs font-medium bg-[#191B23] border border-[#252734] text-[#D0D3E2] hover:border-[#2DD4BF] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-[#232530]" />

            {/* Body / Head Sliders */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white">Body &amp; Head</h2>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="body-rotation" className="text-[#B4B8C9]">
                    Tilt
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-white">
                      {state.body.rotation > 0 ? `+${state.body.rotation}°` : `${state.body.rotation}°`}
                    </span>
                    {state.body.rotation !== 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateState((prev) => ({
                            ...prev,
                            body: { ...prev.body, rotation: 0 },
                          }))
                        }
                        className="text-[11px] text-[#9B7BFF] hover:text-white cursor-pointer"
                      >
                        0°
                      </button>
                    )}
                  </div>
                </div>
                <input
                  id="body-rotation"
                  type="range"
                  min={-35}
                  max={35}
                  step={1}
                  value={state.body.rotation}
                  onChange={(e) => {
                    const rotation = Number(e.target.value);
                    onUpdateState((prev) => ({ ...prev, body: { ...prev.body, rotation } }), false);
                  }}
                  className="w-full studio-slider"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="body-offset-y" className="text-[#B4B8C9]">
                    Vertical offset
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-white">
                      {verticalOffset > 0 ? `+${verticalOffset} px` : `${verticalOffset} px`}
                    </span>
                    {verticalOffset !== 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateState((prev) => translateRig(prev, prev.body.x, DEFAULT_BODY_Y))
                        }
                        className="text-[11px] text-[#9B7BFF] hover:text-white cursor-pointer"
                      >
                        Center
                      </button>
                    )}
                  </div>
                </div>
                <input
                  id="body-offset-y"
                  type="range"
                  min={-80}
                  max={70}
                  step={1}
                  value={verticalOffset}
                  onChange={(e) => {
                    const nextY = DEFAULT_BODY_Y + Number(e.target.value);
                    onUpdateState((prev) => translateRig(prev, prev.body.x, nextY), false);
                  }}
                  className="w-full studio-slider"
                />
              </div>
            </div>

            <hr className="border-[#232530]" />

            {/* Modular Arms */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-white">Arms</h2>
                <div className="inline-flex p-0.5 rounded-lg bg-[#1A1C24] border border-[#262834]">
                  {(
                    [
                      { id: 'left', label: 'Left' },
                      { id: 'both', label: 'Both' },
                      { id: 'right', label: 'Right' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setArmTarget(opt.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        armTarget === opt.id
                          ? 'bg-[#2C2F3E] text-white'
                          : 'text-[#8F93A6] hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ARM_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      onUpdateState((prev) => ({
                        ...prev,
                        limbs: {
                          ...prev.limbs,
                          ...(armTarget === 'left' || armTarget === 'both'
                            ? {
                                leftArm: buildLimbFromPreset(
                                  preset,
                                  'left',
                                  prev.body,
                                  prev.limbs.leftArm.anchor,
                                  prev.limbs.leftArm.inFront,
                                ),
                              }
                            : {}),
                          ...(armTarget === 'right' || armTarget === 'both'
                            ? {
                                rightArm: buildLimbFromPreset(
                                  preset,
                                  'right',
                                  prev.body,
                                  prev.limbs.rightArm.anchor,
                                  prev.limbs.rightArm.inFront,
                                ),
                              }
                            : {}),
                        },
                      }))
                    }
                    className="px-2.5 min-h-[38px] rounded-lg text-xs font-medium bg-[#191B23] border border-[#252734] text-[#D0D3E2] hover:border-[#7F52FF] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Arm foreground layer toggle (pass in front of head/face) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-[#B4B8C9]">In front of head</span>
                  <span className="text-[11px] text-[#7D8193]">Overlap face</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'leftArm', label: 'Left Arm' },
                      { id: 'rightArm', label: 'Right Arm' },
                    ] as const
                  ).map(({ id, label }) => {
                    const isFront = Boolean(state.limbs[id].inFront);
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={isFront}
                        onClick={() =>
                          onUpdateState((prev) => ({
                            ...prev,
                            limbs: {
                              ...prev.limbs,
                              [id]: {
                                ...prev.limbs[id],
                                inFront: !prev.limbs[id].inFront,
                              },
                            },
                          }))
                        }
                        className={`flex items-center justify-between px-3 min-h-[40px] rounded-xl border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          isFront
                            ? 'bg-[#7F52FF]/20 border-[#7F52FF] text-white'
                            : 'bg-[#191B23] border-[#252734] text-[#C8CBD9] hover:border-[#3E4257] hover:text-white'
                        }`}
                      >
                        <span>{label}</span>
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <Layers className="w-3 h-3" aria-hidden="true" />
                          {isFront ? 'Front' : 'Behind'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <hr className="border-[#232530]" />

            {/* Modular Legs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-white">Legs</h2>
                <div className="inline-flex p-0.5 rounded-lg bg-[#1A1C24] border border-[#262834]">
                  {(
                    [
                      { id: 'left', label: 'Left' },
                      { id: 'both', label: 'Both' },
                      { id: 'right', label: 'Right' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLegTarget(opt.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        legTarget === opt.id
                          ? 'bg-[#2C2F3E] text-white'
                          : 'text-[#8F93A6] hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {LEG_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      onUpdateState((prev) => ({
                        ...prev,
                        limbs: {
                          ...prev.limbs,
                          ...(legTarget === 'left' || legTarget === 'both'
                            ? {
                                leftLeg: buildLimbFromPreset(
                                  preset,
                                  'left',
                                  prev.body,
                                  prev.limbs.leftLeg.anchor,
                                ),
                              }
                            : {}),
                          ...(legTarget === 'right' || legTarget === 'both'
                            ? {
                                rightLeg: buildLimbFromPreset(
                                  preset,
                                  'right',
                                  prev.body,
                                  prev.limbs.rightLeg.anchor,
                                ),
                              }
                            : {}),
                        },
                      }))
                    }
                    className="px-2.5 min-h-[38px] rounded-lg text-xs font-medium bg-[#191B23] border border-[#252734] text-[#D0D3E2] hover:border-[#7F52FF] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: FACE */}
        {activeTab === 'face' && (
          <>
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Facial expressions</h2>
                <span className="text-xs text-[#7D8193] tabular-nums">
                  {EXPRESSION_METAS.length} presets
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
                {EXPRESSION_METAS.map((expr) => {
                  const selected = state.face.expression === expr.id;
                  return (
                    <button
                      key={expr.id}
                      type="button"
                      onClick={() =>
                        onUpdateState((prev) => ({
                          ...prev,
                          face: { ...prev.face, expression: expr.id },
                        }))
                      }
                      className={`flex flex-col items-center justify-center gap-1.5 py-2 px-1.5 min-h-[68px] rounded-xl border transition-all cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF] ${
                        selected
                          ? 'bg-[#7F52FF]/15 border-[#7F52FF] text-white'
                          : 'bg-[#191B23] border-[#252734] text-[#C8CBD9] hover:border-[#3A3E52] hover:text-white'
                      }`}
                    >
                      <MiniFacePreview expression={expr.id} />
                      <span className="text-[11px] font-medium truncate max-w-full">
                        {expr.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-[#232530]" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Gaze direction</h2>
                {(state.face.eyeOffset.x !== 0 || state.face.eyeOffset.y !== 0) && (
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateState((prev) => ({
                        ...prev,
                        face: { ...prev.face, eyeOffset: { x: 0, y: 0 } },
                      }))
                    }
                    className="text-xs text-[#9B7BFF] hover:text-white cursor-pointer"
                  >
                    Recenter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5 max-w-[210px] mx-auto">
                {GAZE_DIRECTIONS.map((dir) => {
                  const active =
                    state.face.eyeOffset.x === dir.x && state.face.eyeOffset.y === dir.y;
                  return (
                    <button
                      key={dir.label}
                      type="button"
                      title={dir.label}
                      aria-label={`Look ${dir.label}`}
                      onClick={() =>
                        onUpdateState((prev) => ({
                          ...prev,
                          face: { ...prev.face, eyeOffset: { x: dir.x, y: dir.y } },
                        }))
                      }
                      className={`h-11 rounded-lg border text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#7F52FF] border-[#9B7BFF] text-white'
                          : 'bg-[#191B23] border-[#252734] text-[#9EA2B4] hover:border-[#3E4257] hover:text-white'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full bg-current"
                        style={{
                          transform: `translate(${Math.sign(dir.x) * 4}px, ${Math.sign(dir.y) * 3}px)`,
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label htmlFor="eye-x" className="text-[#B4B8C9]">
                      Horizontal offset
                    </label>
                    <span className="font-mono tabular-nums text-white">
                      {state.face.eyeOffset.x > 0
                        ? `+${state.face.eyeOffset.x}`
                        : state.face.eyeOffset.x}
                    </span>
                  </div>
                  <input
                    id="eye-x"
                    type="range"
                    min={-10}
                    max={10}
                    step={1}
                    value={state.face.eyeOffset.x}
                    onChange={(e) => {
                      const x = Number(e.target.value);
                      onUpdateState(
                        (prev) => ({
                          ...prev,
                          face: { ...prev.face, eyeOffset: { ...prev.face.eyeOffset, x } },
                        }),
                        false,
                      );
                    }}
                    className="w-full studio-slider"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label htmlFor="eye-y" className="text-[#B4B8C9]">
                      Vertical offset
                    </label>
                    <span className="font-mono tabular-nums text-white">
                      {state.face.eyeOffset.y > 0
                        ? `+${state.face.eyeOffset.y}`
                        : state.face.eyeOffset.y}
                    </span>
                  </div>
                  <input
                    id="eye-y"
                    type="range"
                    min={-6}
                    max={6}
                    step={1}
                    value={state.face.eyeOffset.y}
                    onChange={(e) => {
                      const y = Number(e.target.value);
                      onUpdateState(
                        (prev) => ({
                          ...prev,
                          face: { ...prev.face, eyeOffset: { ...prev.face.eyeOffset, y } },
                        }),
                        false,
                      );
                    }}
                    className="w-full studio-slider"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 3: ACCESSORIES LIBRARY (32 items) */}
        {activeTab === 'accessories' && (
          <>
            {/* Active placed accessories */}
            {state.accessories.length > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">
                      On stage ({state.accessories.length})
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateState((prev) => ({ ...prev, accessories: [] }));
                        onSelectAccessory(null);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>

                  {/* Placed accessory selector strip */}
                  <div className="flex flex-wrap gap-1.5">
                    {state.accessories.map((acc) => {
                      const meta = getAccessoryMeta(acc.type);
                      const isSel = activeAccessory?.id === acc.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => onSelectAccessory(acc.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-[#7F52FF]/20 border-[#7F52FF] text-white'
                              : 'bg-[#191B23] border-[#262834] text-[#C8CBD9] hover:border-[#3E4257]'
                          }`}
                        >
                          <svg viewBox="-55 -55 110 110" className="w-4 h-4 shrink-0">
                            <AccessoryGraphic type={acc.type} color={acc.color} />
                          </svg>
                          <span>{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Accessory Controls */}
                  {activeAccessory && (
                    <div className="pt-2 space-y-3.5 border-t border-[#232530]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white">
                          {getAccessoryMeta(activeAccessory.type).label}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Flip horizontally"
                            aria-label="Flip horizontally"
                            onClick={() =>
                              handleUpdateAccessory(activeAccessory.id, {
                                flipX: !activeAccessory.flipX,
                              })
                            }
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border text-xs cursor-pointer transition-colors ${
                              activeAccessory.flipX
                                ? 'bg-[#7F52FF]/20 border-[#7F52FF] text-white'
                                : 'bg-[#191B23] border-[#262834] text-[#C8CBD9] hover:text-white'
                            }`}
                          >
                            <FlipHorizontal2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            title={
                              activeAccessory.layer === 'front'
                                ? 'Place behind Kodee'
                                : 'Place in front of Kodee'
                            }
                            onClick={() =>
                              handleUpdateAccessory(activeAccessory.id, {
                                layer: activeAccessory.layer === 'front' ? 'back' : 'front',
                              })
                            }
                            className="inline-flex items-center gap-1 px-2 h-8 rounded-lg border bg-[#191B23] border-[#262834] text-[11px] text-[#C8CBD9] hover:text-white cursor-pointer whitespace-nowrap"
                          >
                            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                            {activeAccessory.layer === 'front' ? 'Front' : 'Back'}
                          </button>

                          <button
                            type="button"
                            title="Duplicate"
                            aria-label="Duplicate accessory"
                            onClick={() => handleDuplicateAccessory(activeAccessory)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border bg-[#191B23] border-[#262834] text-[#C8CBD9] hover:text-white cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            aria-label="Delete accessory"
                            onClick={() => handleRemoveAccessory(activeAccessory.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border bg-[#191B23] border-[#262834] text-red-400 hover:bg-red-500/15 hover:border-red-500/40 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <label htmlFor="acc-scale" className="text-[#B4B8C9]">
                              Size
                            </label>
                            <span className="font-mono tabular-nums text-white">
                              {Math.round(activeAccessory.scale * 100)}%
                            </span>
                          </div>
                          <input
                            id="acc-scale"
                            type="range"
                            min={0.45}
                            max={1.9}
                            step={0.05}
                            value={activeAccessory.scale}
                            onChange={(e) =>
                              handleUpdateAccessory(
                                activeAccessory.id,
                                { scale: Number(e.target.value) },
                                false,
                              )
                            }
                            className="w-full studio-slider"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <label htmlFor="acc-rot" className="text-[#B4B8C9]">
                              Rotation
                            </label>
                            <span className="font-mono tabular-nums text-white">
                              {activeAccessory.rotation}°
                            </span>
                          </div>
                          <input
                            id="acc-rot"
                            type="range"
                            min={-180}
                            max={180}
                            step={2}
                            value={activeAccessory.rotation}
                            onChange={(e) =>
                              handleUpdateAccessory(
                                activeAccessory.id,
                                { rotation: Number(e.target.value) },
                                false,
                              )
                            }
                            className="w-full studio-slider"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <label htmlFor="acc-color" className="text-xs text-[#B4B8C9]">
                          Accessory tint
                        </label>
                        <div className="flex items-center gap-2 p-1 rounded-lg bg-[#191B23] border border-[#262834]">
                          <input
                            id="acc-color"
                            type="color"
                            value={activeAccessory.color}
                            onChange={(e) =>
                              handleUpdateAccessory(
                                activeAccessory.id,
                                { color: e.target.value.toUpperCase() },
                                false,
                              )
                            }
                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-[11px] font-mono text-white pr-1.5">
                            {activeAccessory.color}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <hr className="border-[#232530]" />
              </>
            )}

            {/* Catalog Header & Category Filter */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold text-white">Accessory library</h2>
                <span className="text-xs text-[#7D8193] tabular-nums">
                  {ACCESSORY_CATALOG.length} items
                </span>
              </div>

              <div className="grid grid-cols-5 p-1 rounded-xl bg-[#1A1C24] border border-[#262834] gap-0.5">
                {ACCESSORY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setAccCategory(cat.id)}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap truncate ${
                      accCategory === cat.id
                        ? 'bg-[#2C2F3E] text-white'
                        : 'text-[#8F93A6] hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
                {filteredCatalog.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleAddAccessory(item.type)}
                    className="group flex flex-col items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-xl bg-[#191B23] border border-[#252734] text-[#C8CBD9] hover:border-[#7F52FF] hover:text-white active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF]"
                  >
                    <svg viewBox="-65 -55 130 110" className="w-11 h-9 shrink-0 overflow-visible">
                      <AccessoryGraphic type={item.type} color={item.defaultColor} />
                    </svg>
                    <span className="text-[11px] font-medium truncate max-w-full">{item.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#7D8193]">
                Click an accessory to add it, then drag it directly on the canvas.
              </p>
            </div>
          </>
        )}

        {/* TAB 4: COLORS & BACKGROUND */}
        {activeTab === 'style' && (
          <>
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-white">Kodee palettes</h2>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PALETTES.map((pal) => {
                  const isActive =
                    state.body.colorMode === pal.colorMode &&
                    state.body.colors[0].toLowerCase() === pal.colors[0].toLowerCase() &&
                    (pal.colorMode === 'solid' ||
                      state.body.colors[1].toLowerCase() === pal.colors[1].toLowerCase());
                  const swatchBg =
                    pal.colorMode === 'solid'
                      ? pal.colors[0]
                      : `linear-gradient(${pal.gradientAngle}deg, ${pal.colors[0]}, ${pal.colors[1]})`;

                  return (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() =>
                        onUpdateState((prev) => ({
                          ...prev,
                          body: {
                            ...prev.body,
                            colorMode: pal.colorMode,
                            colors: [...pal.colors] as [string, string],
                            gradientAngle: pal.gradientAngle,
                          },
                        }))
                      }
                      className={`flex items-center gap-2.5 p-2.5 min-h-[44px] rounded-xl border transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#7F52FF]/15 border-[#7F52FF] text-white'
                          : 'bg-[#191B23] border-[#252734] text-[#C8CBD9] hover:border-[#3A3E52] hover:text-white'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-md shrink-0 ring-1 ring-white/15"
                        style={{ background: swatchBg }}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-medium truncate">{pal.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#1A1C24] border border-[#262834]">
                {(
                  [
                    { id: 'solid', label: 'Solid color' },
                    { id: 'gradient', label: 'Linear gradient' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() =>
                      onUpdateState((prev) => ({
                        ...prev,
                        body: { ...prev.body, colorMode: mode.id },
                      }))
                    }
                    className={`py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      state.body.colorMode === mode.id
                        ? 'bg-[#2C2F3E] text-white'
                        : 'text-[#8F93A6] hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="kodee-color-1" className="text-xs text-[#B4B8C9] block">
                    {state.body.colorMode === 'solid' ? 'Color' : 'Color 1'}
                  </label>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-[#191B23] border border-[#262834]">
                    <input
                      id="kodee-color-1"
                      type="color"
                      value={state.body.colors[0]}
                      onChange={(e) => {
                        const hex = e.target.value.toUpperCase();
                        onUpdateState(
                          (prev) => ({
                            ...prev,
                            body: { ...prev.body, colors: [hex, prev.body.colors[1]] },
                          }),
                          false,
                        );
                      }}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      aria-label="Color 1 hex code"
                      defaultValue={state.body.colors[0]}
                      key={`c1-${state.body.colors[0]}`}
                      onBlur={(e) =>
                        handleHexInput(e.target.value, (hex) =>
                          onUpdateState((prev) => ({
                            ...prev,
                            body: { ...prev.body, colors: [hex, prev.body.colors[1]] },
                          })),
                        )
                      }
                      className="w-full bg-transparent text-xs font-mono text-white uppercase focus:outline-none"
                    />
                  </div>
                </div>

                {state.body.colorMode === 'gradient' && (
                  <div className="space-y-1.5">
                    <label htmlFor="kodee-color-2" className="text-xs text-[#B4B8C9] block">
                      Color 2
                    </label>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-[#191B23] border border-[#262834]">
                      <input
                        id="kodee-color-2"
                        type="color"
                        value={state.body.colors[1]}
                        onChange={(e) => {
                          const hex = e.target.value.toUpperCase();
                          onUpdateState(
                            (prev) => ({
                              ...prev,
                              body: { ...prev.body, colors: [prev.body.colors[0], hex] },
                            }),
                            false,
                          );
                        }}
                        className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        aria-label="Color 2 hex code"
                        defaultValue={state.body.colors[1]}
                        key={`c2-${state.body.colors[1]}`}
                        onBlur={(e) =>
                          handleHexInput(e.target.value, (hex) =>
                            onUpdateState((prev) => ({
                              ...prev,
                              body: { ...prev.body, colors: [prev.body.colors[0], hex] },
                            })),
                          )
                        }
                        className="w-full bg-transparent text-xs font-mono text-white uppercase focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {state.body.colorMode === 'gradient' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="grad-angle" className="text-[#B4B8C9]">
                      Gradient angle
                    </label>
                    <span className="font-mono tabular-nums text-white">
                      {state.body.gradientAngle}°
                    </span>
                  </div>
                  <input
                    id="grad-angle"
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={state.body.gradientAngle}
                    onChange={(e) => {
                      const gradientAngle = Number(e.target.value);
                      onUpdateState(
                        (prev) => ({ ...prev, body: { ...prev.body, gradientAngle } }),
                        false,
                      );
                    }}
                    className="w-full studio-slider"
                  />
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[0, 45, 90, 135, 180].map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() =>
                          onUpdateState((prev) => ({
                            ...prev,
                            body: { ...prev.body, gradientAngle: deg },
                          }))
                        }
                        className={`flex-1 py-1.5 rounded-md text-[11px] font-mono tabular-nums transition-colors cursor-pointer ${
                          state.body.gradientAngle === deg
                            ? 'bg-[#7F52FF]/25 text-white ring-1 ring-inset ring-[#7F52FF]/60'
                            : 'bg-[#191B23] text-[#8F93A6] hover:text-white'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <hr className="border-[#232530]" />

            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-white">Canvas background</h2>
              <div className="grid grid-cols-2 gap-2">
                {BACKGROUND_SWATCHES.map((sw) => {
                  const selected =
                    state.background.color.toLowerCase() === sw.color.toLowerCase();
                  const isTrans = sw.color === 'transparent';
                  return (
                    <button
                      key={sw.id}
                      type="button"
                      onClick={() =>
                        onUpdateState((prev) => ({
                          ...prev,
                          background: { color: sw.color },
                        }))
                      }
                      className={`flex items-center gap-2.5 p-2.5 min-h-[44px] rounded-xl border transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#7F52FF]/15 border-[#7F52FF] text-white'
                          : 'bg-[#191B23] border-[#252734] text-[#C8CBD9] hover:border-[#3A3E52] hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md shrink-0 ring-1 ring-white/15 ${
                          isTrans ? 'transparency-checkerboard' : ''
                        }`}
                        style={isTrans ? undefined : { backgroundColor: sw.color }}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-medium">{sw.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-1">
                <label htmlFor="bg-custom-color" className="text-xs text-[#B4B8C9] block">
                  Custom color
                </label>
                <div className="flex items-center gap-2.5 p-1.5 rounded-lg bg-[#191B23] border border-[#262834]">
                  <input
                    id="bg-custom-color"
                    type="color"
                    value={state.background.color === 'transparent' ? '#0F0F12' : state.background.color}
                    onChange={(e) => {
                      const color = e.target.value.toUpperCase();
                      onUpdateState((prev) => ({ ...prev, background: { color } }), false);
                    }}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    aria-label="Background hex code"
                    defaultValue={state.background.color}
                    key={`bg-${state.background.color}`}
                    onBlur={(e) => {
                      const val = e.target.value.trim().toLowerCase();
                      if (val === 'transparent') {
                        onUpdateState((prev) => ({ ...prev, background: { color: 'transparent' } }));
                      } else {
                        handleHexInput(e.target.value, (hex) =>
                          onUpdateState((prev) => ({ ...prev, background: { color: hex } })),
                        );
                      }
                    }}
                    className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 5: SPEECH BUBBLE */}
        {activeTab === 'bubble' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Speech bubble</h2>
                <p className="text-xs text-[#7D8193] mt-0.5">
                  Native vector rendering with automatic contrast.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={state.bubble.enabled}
                onClick={() =>
                  onUpdateState((prev) => ({
                    ...prev,
                    bubble: { ...prev.bubble, enabled: !prev.bubble.enabled },
                  }))
                }
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF] ${
                  state.bubble.enabled ? 'bg-[#7F52FF]' : 'bg-[#2B2E3C]'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform duration-150 ${
                    state.bubble.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className={state.bubble.enabled ? 'space-y-5' : 'space-y-5 opacity-45 pointer-events-none'}>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="bubble-text" className="text-[#B4B8C9]">
                    Bubble text
                  </label>
                  <span className="font-mono tabular-nums text-[#7D8193]">
                    {state.bubble.text.length}/140
                  </span>
                </div>
                <textarea
                  id="bubble-text"
                  rows={3}
                  maxLength={140}
                  value={state.bubble.text}
                  onChange={(e) => {
                    const text = e.target.value;
                    onUpdateState((prev) => ({ ...prev, bubble: { ...prev.bubble, text } }), false);
                  }}
                  placeholder="Write Kodee's message..."
                  className="w-full rounded-xl bg-[#191B23] border border-[#2A2D3B] px-3.5 py-2.5 text-sm text-white placeholder-[#666A7C] focus:outline-none focus:border-[#7F52FF] resize-none"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SAMPLE_QUOTES.map((quote) => (
                    <button
                      key={quote}
                      type="button"
                      onClick={() =>
                        onUpdateState((prev) => ({
                          ...prev,
                          bubble: { ...prev.bubble, text: quote },
                        }))
                      }
                      className="px-2.5 py-1.5 rounded-md text-[11px] bg-[#191B23] border border-[#262834] text-[#A8ACC0] hover:text-white hover:border-[#3E4257] transition-colors cursor-pointer"
                    >
                      {quote}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-[#B4B8C9] block">Position</span>
                <div className="grid grid-cols-2 p-1 rounded-xl bg-[#1A1C24] border border-[#262834]">
                  {(
                    [
                      { id: 'top-left', label: 'Top-Left' },
                      { id: 'top-right', label: 'Top-Right' },
                    ] as Array<{ id: BubblePosition; label: string }>
                  ).map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() =>
                        onUpdateState((prev) => ({
                          ...prev,
                          bubble: { ...prev.bubble, position: pos.id },
                        }))
                      }
                      className={`py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        state.bubble.position === pos.id
                          ? 'bg-[#2C2F3E] text-white'
                          : 'text-[#8F93A6] hover:text-white'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-[#B4B8C9] block">Font size</span>
                <div className="grid grid-cols-3 p-1 rounded-xl bg-[#1A1C24] border border-[#262834]">
                  {(['S', 'M', 'L'] as BubbleFontSize[]).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() =>
                        onUpdateState((prev) => ({
                          ...prev,
                          bubble: { ...prev.bubble, fontSize: sz },
                        }))
                      }
                      className={`py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        state.bubble.fontSize === sz
                          ? 'bg-[#2C2F3E] text-white'
                          : 'text-[#8F93A6] hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: EXPORT & JSON */}
        {activeTab === 'export' && (
          <>
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white">PNG Image Export</h2>

              <div className="space-y-2">
                <span className="text-xs text-[#B4B8C9] block">Resolution</span>
                <div className="space-y-2">
                  {EXPORT_SIZES.map((item) => {
                    const selected = exportSize === item.size;
                    return (
                      <button
                        key={item.size}
                        type="button"
                        onClick={() => onExportSizeChange(item.size)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                          selected
                            ? 'bg-[#7F52FF]/15 border-[#7F52FF] text-white'
                            : 'bg-[#191B23] border-[#252734] text-[#C8CBD9] hover:border-[#3A3E52] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-[#252836] flex items-center justify-center text-xs font-semibold text-white">
                            {item.tag}
                          </span>
                          <div>
                            <div className="text-xs font-semibold font-mono tabular-nums">
                              {item.size} × {item.size} px
                            </div>
                            <div className="text-[11px] text-[#8F93A6]">{item.usage}</div>
                          </div>
                        </div>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selected ? 'border-[#9B7BFF] bg-[#7F52FF]' : 'border-[#3C4054]'
                          }`}
                          aria-hidden="true"
                        >
                          {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-[#B4B8C9] block">Export background</span>
                <div className="grid grid-cols-2 p-1 rounded-xl bg-[#1A1C24] border border-[#262834]">
                  <button
                    type="button"
                    onClick={() => onExportTransparentChange(false)}
                    className={`py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      !exportTransparent
                        ? 'bg-[#2C2F3E] text-white'
                        : 'text-[#8F93A6] hover:text-white'
                    }`}
                  >
                    Current background
                  </button>
                  <button
                    type="button"
                    onClick={() => onExportTransparentChange(true)}
                    className={`py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      exportTransparent
                        ? 'bg-[#2C2F3E] text-white'
                        : 'text-[#8F93A6] hover:text-white'
                    }`}
                  >
                    Transparent (Alpha)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={onDownloadPng}
                  className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#7F52FF] hover:bg-[#906BFF] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  Download PNG ({exportSize} px)
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const outcome = await onCopyPng();
                      if (outcome === 'copied' || outcome === 'shared') {
                        setCopiedPng(true);
                        setTimeout(() => setCopiedPng(false), 1800);
                      }
                    } catch {
                      // Error surfaced via toast
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 min-h-[42px] py-2.5 px-4 rounded-xl text-xs font-medium text-[#E4E6F0] bg-[#1E202A] border border-[#2C2F3E] hover:bg-[#252836] transition-colors cursor-pointer"
                >
                  {copiedPng ? (
                    <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Copy className="w-4 h-4" aria-hidden="true" />
                  )}
                  {copiedPng ? 'Image copied to clipboard' : 'Copy to clipboard'}
                </button>
              </div>
            </div>

            <hr className="border-[#232530]" />

            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">SVG Vector Export</h2>
                <span className="text-xs text-[#7D8193]">Infinitely scalable</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onDownloadSvg}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[42px] py-2.5 px-3 rounded-xl text-xs font-medium text-[#E4E6F0] bg-[#191B23] border border-[#282B39] hover:border-[#7F52FF] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-[#9B7BFF]" aria-hidden="true" />
                  Export .svg
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await onCopySvg();
                      setCopiedSvg(true);
                      setTimeout(() => setCopiedSvg(false), 1800);
                    } catch {
                      // Error surfaced via toast
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[42px] py-2.5 px-3 rounded-xl text-xs font-medium text-[#E4E6F0] bg-[#191B23] border border-[#282B39] hover:border-[#3E4257] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedSvg ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {copiedSvg ? 'SVG copied' : 'Copy SVG'}
                </button>
              </div>
            </div>

            <hr className="border-[#232530]" />

            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">JSON Configuration</h2>
                <span className="text-xs text-[#7D8193]">Save &amp; share</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onDownloadJson}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[42px] py-2.5 px-3 rounded-xl text-xs font-medium text-[#E4E6F0] bg-[#191B23] border border-[#282B39] hover:border-[#3E4257] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  <FileJson className="w-3.5 h-3.5 text-[#9B7BFF]" aria-hidden="true" />
                  Export .json
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await onCopyJson();
                      setCopiedJson(true);
                      setTimeout(() => setCopiedJson(false), 1800);
                    } catch {
                      // Error surfaced via toast
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[42px] py-2.5 px-3 rounded-xl text-xs font-medium text-[#E4E6F0] bg-[#191B23] border border-[#282B39] hover:border-[#3E4257] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedJson ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {copiedJson ? 'JSON copied' : 'Copy JSON'}
                </button>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`rounded-xl border border-dashed p-4 text-center transition-colors cursor-pointer ${
                  isDragOver
                    ? 'border-[#7F52FF] bg-[#7F52FF]/10 text-white'
                    : 'border-[#333748] bg-[#171921] text-[#9EA2B4] hover:border-[#4E536B] hover:text-white'
                }`}
              >
                <Upload className="w-5 h-5 mx-auto mb-1.5 text-[#9B7BFF]" aria-hidden="true" />
                <p className="text-xs font-medium text-white">Import a .json file</p>
                <p className="text-[11px] text-[#7D8193] mt-0.5">
                  Drag &amp; drop here or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    void handleFileSelected(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasteBox((v) => !v);
                    setImportError(null);
                  }}
                  className="text-xs text-[#9B7BFF] hover:text-white cursor-pointer"
                >
                  {showPasteBox ? 'Hide paste area' : 'Or paste JSON directly'}
                </button>
              </div>

              {showPasteBox && (
                <div className="space-y-2">
                  <textarea
                    rows={5}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder='{ "version": "1.0", ... }'
                    className="w-full rounded-xl bg-[#111217] border border-[#2A2D3B] p-3 text-xs font-mono text-[#E4E6F0] placeholder-[#585C6E] focus:outline-none focus:border-[#7F52FF]"
                  />
                  <button
                    type="button"
                    onClick={() => parseAndImportJson(pasteText)}
                    className="w-full min-h-[40px] py-2 rounded-lg text-xs font-semibold text-white bg-[#2B2E3E] hover:bg-[#383C50] transition-colors cursor-pointer"
                  >
                    Load JSON
                  </button>
                </div>
              )}

              {importError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{importError}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
