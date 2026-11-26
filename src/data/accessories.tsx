import React from 'react';
import type {
  AccessoryInstance,
  AccessoryLayer,
  AccessoryType,
  KodeeState,
} from '../types/kodee';
import { clampCoord } from '../utils/geometry';

export type AccessoryCategory = 'head' | 'wear' | 'props' | 'effects';

export interface AccessoryCatalogItem {
  type: AccessoryType;
  label: string;
  category: AccessoryCategory;
  defaultLayer: AccessoryLayer;
  defaultColor: string;
  defaultScale: number;
  spawn: (state: KodeeState) => Array<Omit<AccessoryInstance, 'id'>>;
}

export const ACCESSORY_CATEGORIES: Array<{ id: 'all' | AccessoryCategory; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'head', label: 'Head' },
  { id: 'wear', label: 'Wear' },
  { id: 'props', label: 'Props' },
  { id: 'effects', label: 'Effects' },
];

export const ACCESSORY_CATALOG: AccessoryCatalogItem[] = [
  // ===== HEAD (8) =====
  {
    type: 'beanie',
    label: 'Beanie',
    category: 'head',
    defaultLayer: 'front',
    defaultColor: '#D4D7E2',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'beanie',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y - 68),
        scale: 1,
        rotation: s.body.rotation,
        flipX: false,
        layer: 'front',
        color: '#D4D7E2',
      },
    ],
  },
  {
    type: 'cap',
    label: 'Cap',
    category: 'head',
    defaultLayer: 'front',
    defaultColor: '#3B82F6',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'cap',
        x: clampCoord(s.body.x + 4),
        y: clampCoord(s.body.y - 66),
        scale: 1,
        rotation: s.body.rotation,
        flipX: false,
        layer: 'front',
        color: '#3B82F6',
      },
    ],
  },
  {
    type: 'crown',
    label: 'Crown',
    category: 'head',
    defaultLayer: 'front',
    defaultColor: '#F5B942',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'crown',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y - 76),
        scale: 1,
        rotation: s.body.rotation,
        flipX: false,
        layer: 'front',
        color: '#F5B942',
      },
    ],
  },
  {
    type: 'party-hat',
    label: 'Party hat',
    category: 'head',
    defaultLayer: 'front',
    defaultColor: '#F472B6',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'party-hat',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y - 78),
        scale: 1,
        rotation: s.body.rotation,
        flipX: false,
        layer: 'front',
        color: '#F472B6',
      },
    ],
  },
  {
    type: 'headphones',
    label: 'Headphones',
    category: 'head',
    defaultLayer: 'front',
    defaultColor: '#E2E4EC',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'headphones',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y - 12),
        scale: 1,
        rotation: s.body.rotation,
        flipX: false,
        layer: 'front',
        color: '#E2E4EC',
      },
    ],
  },
  {
    type: 'sunglasses',
    label: 'Sunglasses',
    category: 'head',
    defaultLayer: 'front',
    defaultColor: '#22D3EE',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'sunglasses',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y + 6),
        scale: 1,
        rotation: s.body.rotation,
        flipX: false,
        layer: 'front',
        color: '#22D3EE',
      },
    ],
  },
  {
    type: 'glasses',
    label: 'Glasses',
    category: 'head',
    defaultLayer: 'front',
    defaultColor: '#F5B942',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'glasses',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y + 6),
        scale: 1,
        rotation: s.body.rotation,
        flipX: false,
        layer: 'front',
        color: '#F5B942',
      },
    ],
  },
  {
    type: 'halo',
    label: 'Halo',
    category: 'head',
    defaultLayer: 'front',
    defaultColor: '#FDE047',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'halo',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y - 94),
        scale: 1,
        rotation: s.body.rotation,
        flipX: false,
        layer: 'front',
        color: '#FDE047',
      },
    ],
  },

  // ===== WEARABLES & FEET (6) =====
  {
    type: 'scarf',
    label: 'Scarf',
    category: 'wear',
    defaultLayer: 'front',
    defaultColor: '#D4D7E2',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'scarf',
        x: clampCoord(s.body.x + 12),
        y: clampCoord(s.body.y + 52),
        scale: 1,
        rotation: s.body.rotation,
        flipX: false,
        layer: 'front',
        color: '#D4D7E2',
      },
    ],
  },
  {
    type: 'bowtie',
    label: 'Bowtie',
    category: 'wear',
    defaultLayer: 'front',
    defaultColor: '#F43F5E',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'bowtie',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y + 56),
        scale: 1,
        rotation: s.body.rotation,
        flipX: false,
        layer: 'front',
        color: '#F43F5E',
      },
    ],
  },
  {
    type: 'cape',
    label: 'Hero cape',
    category: 'wear',
    defaultLayer: 'back',
    defaultColor: '#EF4444',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'cape',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y + 72),
        scale: 1,
        rotation: s.body.rotation,
        flipX: false,
        layer: 'back',
        color: '#EF4444',
      },
    ],
  },
  {
    type: 'wings',
    label: 'Wings',
    category: 'wear',
    defaultLayer: 'back',
    defaultColor: '#E2E8F0',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'wings',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y + 4),
        scale: 1,
        rotation: s.body.rotation,
        flipX: false,
        layer: 'back',
        color: '#E2E8F0',
      },
    ],
  },
  {
    type: 'ice-skate',
    label: 'Ice skates',
    category: 'wear',
    defaultLayer: 'front',
    defaultColor: '#E2E4EC',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'ice-skate',
        x: clampCoord(s.limbs.leftLeg.end.x - 4),
        y: clampCoord(s.limbs.leftLeg.end.y + 10),
        scale: 0.95,
        rotation: 0,
        flipX: true,
        layer: 'front',
        color: '#E2E4EC',
      },
      {
        type: 'ice-skate',
        x: clampCoord(s.limbs.rightLeg.end.x + 4),
        y: clampCoord(s.limbs.rightLeg.end.y + 10),
        scale: 0.95,
        rotation: 0,
        flipX: false,
        layer: 'front',
        color: '#E2E4EC',
      },
    ],
  },
  {
    type: 'skateboard',
    label: 'Skateboard',
    category: 'wear',
    defaultLayer: 'front',
    defaultColor: '#F97316',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'skateboard',
        x: clampCoord((s.limbs.leftLeg.end.x + s.limbs.rightLeg.end.x) / 2),
        y: clampCoord(Math.max(s.limbs.leftLeg.end.y, s.limbs.rightLeg.end.y) + 14),
        scale: 1,
        rotation: 0,
        flipX: false,
        layer: 'front',
        color: '#F97316',
      },
    ],
  },

  // ===== PROPS & DRINKS (10) =====
  {
    type: 'mug',
    label: 'Coffee mug',
    category: 'props',
    defaultLayer: 'front',
    defaultColor: '#E2E4EC',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'mug',
        x: clampCoord(s.limbs.rightArm.end.x + 6),
        y: clampCoord(s.limbs.rightArm.end.y - 4),
        scale: 1,
        rotation: 0,
        flipX: false,
        layer: 'front',
        color: '#E2E4EC',
      },
    ],
  },
  {
    type: 'straw-cup',
    label: 'Straw cup',
    category: 'props',
    defaultLayer: 'front',
    defaultColor: '#CBD5E1',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'straw-cup',
        x: clampCoord(s.limbs.leftArm.end.x),
        y: clampCoord(s.limbs.leftArm.end.y - 6),
        scale: 1,
        rotation: 0,
        flipX: false,
        layer: 'front',
        color: '#CBD5E1',
      },
    ],
  },
  {
    type: 'gift',
    label: 'Gift box',
    category: 'props',
    defaultLayer: 'front',
    defaultColor: '#D4D7E2',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'gift',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y + 62),
        scale: 1,
        rotation: 0,
        flipX: false,
        layer: 'front',
        color: '#D4D7E2',
      },
    ],
  },
  {
    type: 'marker',
    label: 'Marker',
    category: 'props',
    defaultLayer: 'front',
    defaultColor: '#D4D7E2',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'marker',
        x: clampCoord(s.limbs.rightArm.end.x + 4),
        y: clampCoord(s.limbs.rightArm.end.y - 8),
        scale: 1,
        rotation: -18,
        flipX: false,
        layer: 'front',
        color: '#D4D7E2',
      },
    ],
  },
  {
    type: 'laptop',
    label: 'Laptop',
    category: 'props',
    defaultLayer: 'front',
    defaultColor: '#CBD5E1',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'laptop',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y + 72),
        scale: 1,
        rotation: 0,
        flipX: false,
        layer: 'front',
        color: '#CBD5E1',
      },
    ],
  },
  {
    type: 'smartphone',
    label: 'Smartphone',
    category: 'props',
    defaultLayer: 'front',
    defaultColor: '#CBD5E1',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'smartphone',
        x: clampCoord(s.limbs.rightArm.end.x + 4),
        y: clampCoord(s.limbs.rightArm.end.y - 8),
        scale: 1,
        rotation: 12,
        flipX: false,
        layer: 'front',
        color: '#CBD5E1',
      },
    ],
  },
  {
    type: 'book',
    label: 'Book',
    category: 'props',
    defaultLayer: 'front',
    defaultColor: '#60A5FA',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'book',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y + 68),
        scale: 1,
        rotation: 0,
        flipX: false,
        layer: 'front',
        color: '#60A5FA',
      },
    ],
  },
  {
    type: 'umbrella',
    label: 'Umbrella',
    category: 'props',
    defaultLayer: 'front',
    defaultColor: '#38BDF8',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'umbrella',
        x: clampCoord(s.limbs.rightArm.end.x - 10),
        y: clampCoord(s.limbs.rightArm.end.y - 38),
        scale: 1.05,
        rotation: 12,
        flipX: false,
        layer: 'front',
        color: '#38BDF8',
      },
    ],
  },
  {
    type: 'camera',
    label: 'Camera',
    category: 'props',
    defaultLayer: 'front',
    defaultColor: '#D4D7E2',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'camera',
        x: clampCoord(s.limbs.leftArm.end.x - 4),
        y: clampCoord(s.limbs.leftArm.end.y),
        scale: 1,
        rotation: -6,
        flipX: false,
        layer: 'front',
        color: '#D4D7E2',
      },
    ],
  },
  {
    type: 'trophy',
    label: 'Trophy',
    category: 'props',
    defaultLayer: 'front',
    defaultColor: '#FBBF24',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'trophy',
        x: clampCoord(s.limbs.rightArm.end.x + 4),
        y: clampCoord(s.limbs.rightArm.end.y - 16),
        scale: 1,
        rotation: 0,
        flipX: false,
        layer: 'front',
        color: '#FBBF24',
      },
    ],
  },

  // ===== EMOTIONS & EFFECTS (8) =====
  {
    type: 'heart',
    label: 'Heart',
    category: 'effects',
    defaultLayer: 'front',
    defaultColor: '#F43F5E',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'heart',
        x: clampCoord(s.limbs.rightArm.end.x),
        y: clampCoord(s.limbs.rightArm.end.y),
        scale: 1,
        rotation: 8,
        flipX: false,
        layer: 'front',
        color: '#F43F5E',
      },
    ],
  },
  {
    type: 'mini-hearts',
    label: 'Mini hearts',
    category: 'effects',
    defaultLayer: 'front',
    defaultColor: '#EC4899',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'mini-hearts',
        x: clampCoord(s.body.x - 95),
        y: clampCoord(s.body.y - 78),
        scale: 1,
        rotation: -8,
        flipX: false,
        layer: 'front',
        color: '#EC4899',
      },
    ],
  },
  {
    type: 'sparkles',
    label: 'Sparkles',
    category: 'effects',
    defaultLayer: 'front',
    defaultColor: '#FDE047',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'sparkles',
        x: clampCoord(s.body.x + 96),
        y: clampCoord(s.body.y - 76),
        scale: 1,
        rotation: 0,
        flipX: false,
        layer: 'front',
        color: '#FDE047',
      },
    ],
  },
  {
    type: 'lightning',
    label: 'Lightning',
    category: 'effects',
    defaultLayer: 'front',
    defaultColor: '#FACC15',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'lightning',
        x: clampCoord(s.body.x + 94),
        y: clampCoord(s.body.y - 68),
        scale: 1,
        rotation: 10,
        flipX: false,
        layer: 'front',
        color: '#FACC15',
      },
    ],
  },
  {
    type: 'music-notes',
    label: 'Music notes',
    category: 'effects',
    defaultLayer: 'front',
    defaultColor: '#A78BFA',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'music-notes',
        x: clampCoord(s.body.x - 92),
        y: clampCoord(s.body.y - 82),
        scale: 1,
        rotation: -6,
        flipX: false,
        layer: 'front',
        color: '#A78BFA',
      },
    ],
  },
  {
    type: 'lightbulb',
    label: 'Idea!',
    category: 'effects',
    defaultLayer: 'front',
    defaultColor: '#FDE047',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'lightbulb',
        x: clampCoord(s.body.x),
        y: clampCoord(s.body.y - 112),
        scale: 1,
        rotation: 0,
        flipX: false,
        layer: 'front',
        color: '#FDE047',
      },
    ],
  },
  {
    type: 'zzz',
    label: 'Zzz',
    category: 'effects',
    defaultLayer: 'front',
    defaultColor: '#93C5FD',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'zzz',
        x: clampCoord(s.body.x + 88),
        y: clampCoord(s.body.y - 84),
        scale: 1,
        rotation: 0,
        flipX: false,
        layer: 'front',
        color: '#93C5FD',
      },
    ],
  },
  {
    type: 'fire',
    label: 'Flame',
    category: 'effects',
    defaultLayer: 'front',
    defaultColor: '#FB923C',
    defaultScale: 1,
    spawn: (s) => [
      {
        type: 'fire',
        x: clampCoord(s.limbs.rightArm.end.x + 4),
        y: clampCoord(s.limbs.rightArm.end.y - 16),
        scale: 1,
        rotation: 0,
        flipX: false,
        layer: 'front',
        color: '#FB923C',
      },
    ],
  },
];

export function getAccessoryMeta(type: AccessoryType): AccessoryCatalogItem {
  return ACCESSORY_CATALOG.find((item) => item.type === type) ?? ACCESSORY_CATALOG[0];
}

/**
 * Renders any of the 32 vector accessories centered around (0, 0).
 */
export const AccessoryGraphic: React.FC<{ type: AccessoryType; color: string }> = ({
  type,
  color,
}) => {
  switch (type) {
    case 'beanie':
      return (
        <g>
          <circle cx={0} cy={-26} r={9} fill={color} />
          <path d="M -32 10 C -32 -16 32 -16 32 10 Z" fill={color} />
          <rect x={-36} y={4} width={72} height={14} rx={6} fill={color} stroke="#14151A" strokeWidth={2} />
          <line x1={-18} y1={5} x2={-18} y2={17} stroke="#14151A" strokeWidth={2} opacity={0.25} />
          <line x1={0} y1={5} x2={0} y2={17} stroke="#14151A" strokeWidth={2} opacity={0.25} />
          <line x1={18} y1={5} x2={18} y2={17} stroke="#14151A" strokeWidth={2} opacity={0.25} />
        </g>
      );

    case 'cap':
      return (
        <g>
          <path d="M -34 8 C -34 -18 30 -18 32 8 Z" fill={color} />
          <circle cx={0} cy={-13} r={3.5} fill="#FFFFFF" opacity={0.7} />
          <path d="M -34 6 L 46 6 Q 52 10 44 14 L -34 12 Z" fill={color} stroke="#14151A" strokeWidth={1.8} />
        </g>
      );

    case 'crown':
      return (
        <g>
          <path
            d="M -32 14 L -36 -14 L -14 0 L 0 -22 L 14 0 L 36 -14 L 32 14 Z"
            fill={color}
            stroke="#14151A"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <circle cx={-36} cy={-15} r={4} fill="#FEF08A" />
          <circle cx={0} cy={-23} r={4.5} fill="#FEF08A" />
          <circle cx={36} cy={-15} r={4} fill="#FEF08A" />
          <circle cx={0} cy={4} r={3.5} fill="#EF4444" />
        </g>
      );

    case 'party-hat':
      return (
        <g>
          <path d="M -26 20 L 0 -30 L 26 20 Z" fill={color} stroke="#14151A" strokeWidth={2} strokeLinejoin="round" />
          <path d="M -16 2 L 16 2" stroke="#FEF08A" strokeWidth={4} strokeLinecap="round" />
          <path d="M -9 -10 L 9 -10" stroke="#38BDF8" strokeWidth={3.5} strokeLinecap="round" />
          <circle cx={0} cy={-32} r={7} fill="#FEF08A" />
        </g>
      );

    case 'headphones':
      return (
        <g>
          <path
            d="M -68 6 C -68 -66 68 -66 68 6"
            fill="none"
            stroke={color}
            strokeWidth={9}
            strokeLinecap="round"
          />
          <rect x={-77} y={-8} width={18} height={36} rx={8} fill={color} stroke="#14151A" strokeWidth={2} />
          <rect x={59} y={-8} width={18} height={36} rx={8} fill={color} stroke="#14151A" strokeWidth={2} />
          <rect x={-64} y={-2} width={6} height={24} rx={3} fill="#7F52FF" />
          <rect x={58} y={-2} width={6} height={24} rx={3} fill="#7F52FF" />
        </g>
      );

    case 'sunglasses':
      return (
        <g>
          <path d="M -46 -10 H -8 Q -4 -10 -4 -4 V 6 Q -4 14 -16 14 H -36 Q -46 14 -46 4 Z" fill="#111218" stroke={color} strokeWidth={3.5} />
          <path d="M 8 -10 H 46 V 4 Q 46 14 36 14 H 16 Q 4 14 4 6 V -4 Q 4 -10 8 -10 Z" fill="#111218" stroke={color} strokeWidth={3.5} />
          <line x1={-6} y1={-4} x2={6} y2={-4} stroke={color} strokeWidth={4} />
          <line x1={-37} y1={-4} x2={-27} y2={6} stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
          <line x1={17} y1={-4} x2={27} y2={6} stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
        </g>
      );

    case 'glasses':
      return (
        <g>
          <circle cx={-23} cy={0} r={16} fill="rgba(255,255,255,0.08)" stroke={color} strokeWidth={4} />
          <circle cx={23} cy={0} r={16} fill="rgba(255,255,255,0.08)" stroke={color} strokeWidth={4} />
          <path d="M -7 -2 Q 0 -7 7 -2" fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
          <line x1={-48} y1={-3} x2={-39} y2={-1} stroke={color} strokeWidth={3.5} strokeLinecap="round" />
          <line x1={39} y1={-1} x2={48} y2={-3} stroke={color} strokeWidth={3.5} strokeLinecap="round" />
        </g>
      );

    case 'halo':
      return (
        <g>
          <ellipse cx={0} cy={0} rx={36} ry={10} fill="none" stroke={color} strokeWidth={6} />
          <ellipse cx={0} cy={0} rx={36} ry={10} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.65} />
        </g>
      );

    case 'scarf':
      return (
        <g>
          <rect x={-66} y={-9} width={132} height={18} rx={7} fill={color} stroke="#14151A" strokeWidth={2} />
          <path d="M 30 6 L 56 6 L 64 32 L 36 32 Z" fill={color} stroke="#14151A" strokeWidth={2} strokeLinejoin="round" />
          <line x1={42} y1={32} x2={44} y2={40} stroke={color} strokeWidth={3.2} strokeLinecap="round" />
          <line x1={50} y1={32} x2={52} y2={40} stroke={color} strokeWidth={3.2} strokeLinecap="round" />
          <line x1={58} y1={32} x2={60} y2={40} stroke={color} strokeWidth={3.2} strokeLinecap="round" />
          <line x1={-40} y1={-7} x2={-40} y2={7} stroke="#7F52FF" strokeWidth={3} opacity={0.55} />
          <line x1={12} y1={-7} x2={12} y2={7} stroke="#7F52FF" strokeWidth={3} opacity={0.55} />
        </g>
      );

    case 'bowtie':
      return (
        <g>
          <path d="M 0 0 L -26 -14 L -26 14 Z" fill={color} stroke="#14151A" strokeWidth={2} strokeLinejoin="round" />
          <path d="M 0 0 L 26 -14 L 26 14 Z" fill={color} stroke="#14151A" strokeWidth={2} strokeLinejoin="round" />
          <circle cx={0} cy={0} r={7} fill={color} stroke="#14151A" strokeWidth={2} />
        </g>
      );

    case 'cape':
      return (
        <g>
          <path
            d="M -52 -46 L 52 -46 L 82 54 Q 0 38 -82 54 Z"
            fill={color}
            stroke="#14151A"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path d="M -32 -44 L -48 44" stroke="#000000" strokeWidth={2} opacity={0.18} />
          <path d="M 32 -44 L 48 44" stroke="#000000" strokeWidth={2} opacity={0.18} />
        </g>
      );

    case 'wings':
      return (
        <g>
          <path
            d="M -52 0 C -92 -38 -116 -18 -102 8 C -114 14 -102 32 -84 26 C -84 38 -64 38 -52 16 Z"
            fill={color}
            stroke="#14151A"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path
            d="M 52 0 C 92 -38 116 -18 102 8 C 114 14 102 32 84 26 C 84 38 64 38 52 16 Z"
            fill={color}
            stroke="#14151A"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </g>
      );

    case 'ice-skate':
      return (
        <g>
          <path
            d="M -14 -20 L 4 -20 L 6 -2 L 24 2 Q 30 4 28 12 L -16 12 Z"
            fill={color}
            stroke="#14151A"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <line x1={-10} y1={12} x2={-10} y2={20} stroke="#94A3B8" strokeWidth={3} />
          <line x1={18} y1={12} x2={18} y2={20} stroke="#94A3B8" strokeWidth={3} />
          <path d="M -20 20 L 28 20 Q 35 20 37 14" fill="none" stroke="#E2E8F0" strokeWidth={3.5} strokeLinecap="round" />
        </g>
      );

    case 'skateboard':
      return (
        <g>
          <path
            d="M -62 -6 Q -54 4 -42 4 H 42 Q 54 4 62 -6"
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
          />
          <circle cx={-32} cy={13} r={6.5} fill="#E2E8F0" stroke="#14151A" strokeWidth={2} />
          <circle cx={32} cy={13} r={6.5} fill="#E2E8F0" stroke="#14151A" strokeWidth={2} />
        </g>
      );

    case 'mug':
      return (
        <g>
          <path d="M 16 -8 C 30 -8 30 14 16 14" fill="none" stroke={color} strokeWidth={5.5} strokeLinecap="round" />
          <rect x={-18} y={-14} width={34} height={34} rx={5} fill={color} stroke="#14151A" strokeWidth={2} />
          <path d="M -6 -22 Q -10 -28 -6 -34" fill="none" stroke="#CBD5E1" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M 4 -20 Q 8 -26 4 -32" fill="none" stroke="#CBD5E1" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );

    case 'straw-cup':
      return (
        <g>
          <path d="M 0 -10 L 8 -34 L 22 -30" fill="none" stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M -16 -10 L 16 -10 L 12 22 L -12 22 Z" fill={color} stroke="#14151A" strokeWidth={2} strokeLinejoin="round" />
          <rect x={-19} y={-14} width={38} height={6} rx={3} fill="#FFFFFF" stroke="#14151A" strokeWidth={1.8} />
        </g>
      );

    case 'gift':
      return (
        <g>
          <rect x={-22} y={-14} width={44} height={36} rx={4} fill={color} stroke="#14151A" strokeWidth={2} />
          <rect x={-25} y={-18} width={50} height={10} rx={3} fill={color} stroke="#14151A" strokeWidth={2} />
          <rect x={-4} y={-18} width={8} height={40} fill="#EC4899" />
          <rect x={-22} y={0} width={44} height={7} fill="#EC4899" />
          <path d="M 0 -18 C -14 -32 -22 -18 0 -18 C 22 -18 14 -32 0 -18 Z" fill="none" stroke="#EC4899" strokeWidth={4} strokeLinejoin="round" />
        </g>
      );

    case 'marker':
      return (
        <g>
          <rect x={-8} y={-16} width={16} height={44} rx={3} fill={color} stroke="#14151A" strokeWidth={2} />
          <path d="M -6 -16 L -3 -28 L 3 -28 L 6 -16 Z" fill="#1E202B" stroke="#14151A" strokeWidth={1.5} />
          <path d="M -2.5 -28 L 0 -34 L 2.5 -28 Z" fill="#7F52FF" />
          <rect x={-8} y={4} width={16} height={10} fill="#7F52FF" />
        </g>
      );

    case 'laptop':
      return (
        <g>
          <rect x={-30} y={-22} width={60} height={38} rx={5} fill={color} stroke="#14151A" strokeWidth={2} />
          <rect x={-24} y={-16} width={48} height={26} rx={2} fill="#14151A" />
          <path d="M -38 16 H 38 L 34 23 H -34 Z" fill={color} stroke="#14151A" strokeWidth={2} strokeLinejoin="round" />
          <circle cx={0} cy={-3} r={3.5} fill="#7F52FF" />
        </g>
      );

    case 'smartphone':
      return (
        <g>
          <rect x={-14} y={-24} width={28} height={48} rx={6} fill={color} stroke="#14151A" strokeWidth={2} />
          <rect x={-10} y={-18} width={20} height={34} rx={2} fill="#14151A" />
          <circle cx={0} cy={20} r={2} fill="#14151A" />
        </g>
      );

    case 'book':
      return (
        <g>
          <path d="M 0 -14 Q -18 -20 -34 -12 V 20 Q -18 12 0 18 Z" fill={color} stroke="#14151A" strokeWidth={2} strokeLinejoin="round" />
          <path d="M 0 -14 Q 18 -20 34 -12 V 20 Q 18 12 0 18 Z" fill={color} stroke="#14151A" strokeWidth={2} strokeLinejoin="round" />
          <path d="M -26 -6 Q -14 -10 -6 -6" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
          <path d="M -26 2 Q -14 -2 -6 2" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
          <path d="M 6 -6 Q 14 -10 26 -6" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
          <path d="M 6 2 Q 14 -2 26 2" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
        </g>
      );

    case 'umbrella':
      return (
        <g>
          <path d="M 0 -22 V 26 Q 0 34 -8 34 Q -14 34 -14 28" fill="none" stroke="#E2E8F0" strokeWidth={4} strokeLinecap="round" />
          <path
            d="M -42 -4 C -40 -34 40 -34 42 -4 Q 28 -12 14 -4 Q 0 -12 -14 -4 Q -28 -12 -42 -4 Z"
            fill={color}
            stroke="#14151A"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </g>
      );

    case 'camera':
      return (
        <g>
          <path d="M -12 -16 L -7 -23 H 7 L 12 -16 Z" fill={color} stroke="#14151A" strokeWidth={2} />
          <rect x={-26} y={-16} width={52} height={34} rx={6} fill={color} stroke="#14151A" strokeWidth={2} />
          <circle cx={0} cy={1} r={11} fill="#14151A" stroke="#FFFFFF" strokeWidth={2.5} />
          <circle cx={0} cy={1} r={4.5} fill="#38BDF8" />
          <circle cx={17} cy={-8} r={2.8} fill="#EF4444" />
        </g>
      );

    case 'trophy':
      return (
        <g>
          <path d="M -18 -20 C -30 -20 -30 -2 -14 0" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
          <path d="M 18 -20 C 30 -20 30 -2 14 0" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
          <path d="M -18 -24 H 18 V -4 C 18 10 8 14 0 14 C -8 14 -18 10 -18 -4 Z" fill={color} stroke="#14151A" strokeWidth={2} />
          <rect x={-4} y={14} width={8} height={10} fill={color} />
          <rect x={-14} y={22} width={28} height={7} rx={2} fill={color} stroke="#14151A" strokeWidth={2} />
        </g>
      );

    case 'heart':
      return (
        <path
          d="M 0 24 C -26 6 -32 -14 -16 -22 C -6 -27 0 -17 0 -12 C 0 -17 6 -27 16 -22 C 32 -14 26 6 0 24 Z"
          fill={color}
          stroke="#14151A"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      );

    case 'mini-hearts':
      return (
        <g fill={color}>
          <path d="M -12 4 C -24 -4 -26 -14 -19 -18 C -14 -20 -12 -15 -12 -13 C -12 -15 -10 -20 -5 -18 C 2 -14 0 -4 -12 4 Z" />
          <path
            transform="translate(14, 14) scale(0.75) rotate(14)"
            d="M 0 12 C -12 4 -14 -6 -7 -10 C -2 -12 0 -7 0 -5 C 0 -7 2 -12 7 -10 C 14 -6 12 4 0 12 Z"
          />
          <path
            transform="translate(14, -14) scale(0.55) rotate(-14)"
            d="M 0 12 C -12 4 -14 -6 -7 -10 C -2 -12 0 -7 0 -5 C 0 -7 2 -12 7 -10 C 14 -6 12 4 0 12 Z"
          />
        </g>
      );

    case 'sparkles':
      return (
        <g fill={color}>
          <path d="M -8 -26 Q -6 -6 14 -4 Q -6 -2 -8 18 Q -10 -2 -30 -4 Q -10 -6 -8 -26 Z" />
          <path d="M 18 4 Q 19 14 29 15 Q 19 16 18 26 Q 17 16 7 15 Q 17 14 18 4 Z" />
          <circle cx={16} cy={-18} r={3.5} />
        </g>
      );

    case 'lightning':
      return (
        <path
          d="M 6 -28 L -18 2 H -2 L -10 28 L 20 -4 H 4 Z"
          fill={color}
          stroke="#14151A"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      );

    case 'music-notes':
      return (
        <g>
          <path d="M -12 14 V -16 L 16 -24 V 6" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx={-17} cy={14} rx={8} ry={6} transform="rotate(-18 -17 14)" fill={color} />
          <ellipse cx={11} cy={6} rx={8} ry={6} transform="rotate(-18 11 6)" fill={color} />
        </g>
      );

    case 'lightbulb':
      return (
        <g>
          <path d="M 0 -30 V -36 M -22 -20 L -27 -25 M 22 -20 L 27 -25 M -28 -2 H -34 M 28 -2 H 34" stroke={color} strokeWidth={3.2} strokeLinecap="round" />
          <path
            d="M -16 -6 C -16 -24 16 -24 16 -6 C 16 4 9 8 8 15 H -8 C -9 8 -16 4 -16 -6 Z"
            fill={color}
            stroke="#14151A"
            strokeWidth={2}
          />
          <rect x={-7} y={16} width={14} height={5} rx={2} fill="#CBD5E1" />
          <rect x={-5} y={22} width={10} height={4} rx={2} fill="#94A3B8" />
        </g>
      );

    case 'zzz':
      return (
        <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
          <path d="M -24 16 H -10 L -24 28 H -10" strokeWidth={3.5} />
          <path d="M -8 -4 H 10 L -8 12 H 10" strokeWidth={4.2} />
          <path d="M 8 -26 H 28 L 8 -8 H 28" strokeWidth={4.8} />
        </g>
      );

    case 'fire':
      return (
        <g>
          <path
            d="M 0 -28 C 14 -12 22 -2 20 12 C 18 24 10 28 0 28 C -12 28 -20 20 -20 10 C -20 -4 -10 -10 -8 -18 C -4 -12 -2 -18 0 -28 Z"
            fill={color}
            stroke="#14151A"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path
            d="M 0 -4 C 7 4 9 10 8 16 C 7 22 3 24 0 24 C -5 24 -8 20 -8 14 C -8 8 -3 4 0 -4 Z"
            fill="#FEF08A"
          />
        </g>
      );
  }
};
