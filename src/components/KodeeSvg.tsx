import React, { useCallback, useId, useRef, useState } from 'react';
import { AccessoryGraphic } from '../data/accessories';
import type { AccessoryInstance, ExpressionId, KodeeState, LimbId, Point } from '../types/kodee';
import {
  buildLimbPathD,
  clampCoord,
  clampLocalAnchor,
  computeNewSecondBend,
  computeSpeechBubbleLayout,
  getColorLuminance,
  getGradientCoords,
  getLimbAnchors,
  getRotationHandlePos,
  translateRig,
  worldToLocal,
} from '../utils/geometry';

export interface KodeeSvgProps {
  state: KodeeState;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  interactive?: boolean;
  showHandles?: boolean;
  selectedAccessoryId?: string | null;
  onSelectAccessory?: (id: string | null) => void;
  onDragStart?: () => void;
  onChange?: (next: KodeeState) => void;
  className?: string;
  useCanonicalGradientId?: boolean;
}

type DragTarget =
  | { type: 'limb'; limb: LimbId; part: 'ctrl' | 'ctrl2' | 'end' }
  | { type: 'anchor'; limb: LimbId }
  | { type: 'rotation' }
  | { type: 'body'; offsetX: number; offsetY: number }
  | { type: 'accessory'; id: string; offsetX: number; offsetY: number };

const KODEE_BODY_PATH = [
  'M -66 41',
  'Q -66 54 -53 54',
  'L 53 54',
  'Q 66 54 66 41',
  'L 66 -54',
  'Q 66 -68 53 -61',
  'L 7 -36',
  'Q 0 -32 -7 -36',
  'L -53 -61',
  'Q -66 -68 -66 -54',
  'Z',
].join(' ');

const PIXEL_HEART_GRID = [
  '011000110',
  '100101001',
  '100010001',
  '100000001',
  '010000010',
  '001000100',
  '000101000',
  '000010000',
];

function PixelHeart({ cx, cy, pixelSize = 3.5 }: { cx: number; cy: number; pixelSize?: number }) {
  const cols = PIXEL_HEART_GRID[0].length;
  const rows = PIXEL_HEART_GRID.length;
  const startX = cx - (cols * pixelSize) / 2;
  const startY = cy - (rows * pixelSize) / 2;
  const rects: React.ReactNode[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (PIXEL_HEART_GRID[r][c] === '1') {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={startX + c * pixelSize}
            y={startY + r * pixelSize}
            width={pixelSize + 0.15}
            height={pixelSize + 0.15}
            rx={0.5}
            fill="#FFFFFF"
          />,
        );
      }
    }
  }
  return <g>{rects}</g>;
}

export function KodeeFaceExpression({
  expression,
  eyeOffset,
}: {
  expression: ExpressionId;
  eyeOffset: Point;
}) {
  const ox = eyeOffset.x;
  const oy = eyeOffset.y;

  return (
    <g transform={`translate(${ox}, ${oy})`}>
      {expression === 'neutral' && (
        <>
          <circle cx={-23} cy={6} r={13.5} fill="none" stroke="#FFFFFF" strokeWidth={6} />
          <circle cx={23} cy={6} r={13.5} fill="none" stroke="#FFFFFF" strokeWidth={6} />
          <path
            d="M -5 25 Q 0 29 5 25"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'greeting' && (
        <>
          <circle cx={-23} cy={6} r={13.5} fill="none" stroke="#FFFFFF" strokeWidth={6} />
          <path
            d="M 10 9 C 12 -6 34 -6 36 9 C 30 3 16 3 10 9 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M -5 25 Q 0 29 5 25"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'happy' && (
        <>
          <path
            d="M -36 12 A 13.5 13.5 0 0 1 -10 12"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5.8}
            strokeLinecap="round"
          />
          <path
            d="M 10 12 A 13.5 13.5 0 0 1 36 12"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5.8}
            strokeLinecap="round"
          />
          <path
            d="M -6 24 Q 0 30 6 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'sad' && (
        <>
          <path
            d="M -35 2 A 12 12 0 0 0 -11 2"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5.5}
            strokeLinecap="round"
          />
          <path
            d="M 11 2 A 12 12 0 0 0 35 2"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5.5}
            strokeLinecap="round"
          />
          <path
            d="M -4 26 Q 0 23.5 4 26"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <path
            d="M -39 14 C -42 19.5 -40 23.5 -37.2 23.5 C -34.4 23.5 -32.4 19.5 -35.4 14 L -37.2 10.5 Z"
            fill="#8D7EFF"
          />
        </>
      )}

      {expression === 'in-love' && (
        <>
          <PixelHeart cx={-23} cy={7} pixelSize={3.5} />
          <PixelHeart cx={23} cy={7} pixelSize={3.5} />
          <path
            d="M -5 27 Q 0 31 5 27"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'angry' && (
        <>
          <circle cx={-23} cy={8} r={12.5} fill="none" stroke="#FFFFFF" strokeWidth={5.8} />
          <ellipse cx={22} cy={10} rx={13} ry={7.5} fill="none" stroke="#FFFFFF" strokeWidth={5.5} />
          <path d="M -36 -6 L -6 4 L -6 -12 L -36 -12 Z" fill="#09090D" />
          <path d="M 36 -5 L 7 4 L 7 -12 L 36 -12 Z" fill="#09090D" />
          <line
            x1={-5}
            y1={27}
            x2={5}
            y2={27}
            stroke="#FFFFFF"
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'shocked' && (
        <>
          <circle cx={-21} cy={5} r={16.5} fill="none" stroke="#FFFFFF" strokeWidth={4.6} />
          <circle cx={21} cy={5} r={16.5} fill="none" stroke="#FFFFFF" strokeWidth={4.6} />
          <ellipse
            cx={0}
            cy={27}
            rx={3.5}
            ry={5.6}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.8}
          />
        </>
      )}

      {expression === 'determined' && (
        <>
          <rect
            x={-39}
            y={-1}
            width={34}
            height={15}
            rx={2.5}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={4.2}
          />
          <rect
            x={5}
            y={-1}
            width={34}
            height={15}
            rx={2.5}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={4.2}
          />
          <line
            x1={-32}
            y1={6.5}
            x2={-12}
            y2={6.5}
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <line
            x1={12}
            y1={6.5}
            x2={32}
            y2={6.5}
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <line
            x1={-5}
            y1={26}
            x2={5}
            y2={26}
            stroke="#FFFFFF"
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'laughing' && (
        <>
          <path
            d="M -35 -2 L -13 7 L -35 16"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 35 -2 L 13 7 L 35 16"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M -11 22 H 11 A 11 10 0 0 1 -11 22 Z"
            fill="#FFFFFF"
          />
        </>
      )}

      {expression === 'starry' && (
        <>
          <path
            d="M -23 -10 Q -21 4 -8 6 Q -21 8 -23 22 Q -25 8 -38 6 Q -25 4 -23 -10 Z"
            fill="#FFFFFF"
          />
          <path
            d="M 23 -10 Q 25 4 38 6 Q 25 8 23 22 Q 21 8 8 6 Q 21 4 23 -10 Z"
            fill="#FFFFFF"
          />
          <path
            d="M -6 25 Q 0 32 6 25"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'sleepy' && (
        <>
          <line
            x1={-36}
            y1={8}
            x2={-10}
            y2={8}
            stroke="#FFFFFF"
            strokeWidth={5.5}
            strokeLinecap="round"
          />
          <line
            x1={10}
            y1={8}
            x2={36}
            y2={8}
            stroke="#FFFFFF"
            strokeWidth={5.5}
            strokeLinecap="round"
          />
          <circle
            cx={0}
            cy={26}
            r={3.8}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.6}
          />
        </>
      )}

      {expression === 'dizzy' && (
        <>
          <path
            d="M -23 6 C -23 1 -16 1 -16 6 C -16 13 -28 14 -29 6 C -30 -3 -14 -6 -10 5 C -8 14 -16 20 -26 18"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3.6}
            strokeLinecap="round"
          />
          <path
            d="M 23 6 C 23 1 30 1 30 6 C 30 13 18 14 17 6 C 16 -3 32 -6 36 5 C 38 14 30 20 20 18"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3.6}
            strokeLinecap="round"
          />
          <path
            d="M -9 27 Q -4.5 23 0 27 T 9 27"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'dead' && (
        <>
          <path
            d="M -33 -4 L -13 16 M -13 -4 L -33 16"
            stroke="#FFFFFF"
            strokeWidth={5.2}
            strokeLinecap="round"
          />
          <path
            d="M 13 -4 L 33 16 M 33 -4 L 13 16"
            stroke="#FFFFFF"
            strokeWidth={5.2}
            strokeLinecap="round"
          />
          <line
            x1={-8}
            y1={27}
            x2={8}
            y2={27}
            stroke="#FFFFFF"
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'cool' && (
        <>
          <path
            d="M -38 2 H -8 A 14 14 0 0 1 -38 2 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={4.8}
            strokeLinejoin="round"
          />
          <path
            d="M 8 2 H 38 A 14 14 0 0 1 8 2 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={4.8}
            strokeLinejoin="round"
          />
          <path
            d="M -6 26 Q 2 30 10 23"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'skeptical' && (
        <>
          <circle cx={-23} cy={8} r={13} fill="none" stroke="#FFFFFF" strokeWidth={5.6} />
          <line
            x1={-34}
            y1={-11}
            x2={-12}
            y2={-14}
            stroke="#FFFFFF"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <ellipse cx={23} cy={9} rx={13} ry={5.5} fill="none" stroke="#FFFFFF" strokeWidth={5} />
          <path
            d="M -7 27 L 7 24"
            stroke="#FFFFFF"
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'smug' && (
        <>
          <path
            d="M -36 4 L -10 8 A 12 11 0 0 1 -36 4 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={4.8}
            strokeLinejoin="round"
          />
          <path
            d="M 10 8 L 36 4 A 12 11 0 0 1 10 8 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={4.8}
            strokeLinejoin="round"
          />
          <path
            d="M -7 25 Q 3 32 12 22"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'shy' && (
        <>
          <circle cx={-23} cy={5} r={12.5} fill="none" stroke="#FFFFFF" strokeWidth={5.5} />
          <circle cx={23} cy={5} r={12.5} fill="none" stroke="#FFFFFF" strokeWidth={5.5} />
          <g stroke="#F472B6" strokeWidth={2.4} strokeLinecap="round" opacity={0.9}>
            <line x1={-44} y1={22} x2={-40} y2={16} />
            <line x1={-38} y1={22} x2={-34} y2={16} />
            <line x1={34} y1={22} x2={38} y2={16} />
            <line x1={40} y1={22} x2={44} y2={16} />
          </g>
          <path
            d="M -7 25 Q -3.5 29 0 25 Q 3.5 29 7 25"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'crying' && (
        <>
          <rect x={-30} y={13} width={14} height={29} rx={4} fill="#60A5FA" opacity={0.85} />
          <rect x={16} y={13} width={14} height={29} rx={4} fill="#60A5FA" opacity={0.85} />
          <path
            d="M -35 -1 L -14 7 L -35 14"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 35 -1 L 14 7 L 35 14"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M -7 28 Q 0 21 7 28"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'wink-left' && (
        <>
          <path
            d="M -36 9 C -34 -6 -12 -6 -10 9 C -16 3 -30 3 -36 9 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={23} cy={6} r={13.5} fill="none" stroke="#FFFFFF" strokeWidth={6} />
          <path
            d="M -5 25 Q 0 29 5 25"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'cat' && (
        <>
          <circle cx={-23} cy={4} r={12.5} fill="none" stroke="#FFFFFF" strokeWidth={5.6} />
          <circle cx={23} cy={4} r={12.5} fill="none" stroke="#FFFFFF" strokeWidth={5.6} />
          <path
            d="M -11 23 Q -5.5 31 0 24 Q 5.5 31 11 23"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {expression === 'tongue' && (
        <>
          <circle cx={-23} cy={5} r={13} fill="none" stroke="#FFFFFF" strokeWidth={5.8} />
          <path
            d="M 10 8 C 12 -6 34 -6 36 8 C 30 2 16 2 10 8 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M -9 22 Q 0 28 9 22"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.8}
            strokeLinecap="round"
          />
          <path
            d="M -5 25 V 32 A 5 5 0 0 0 5 32 V 25 Z"
            fill="#F472B6"
          />
        </>
      )}

      {expression === 'surprised' && (
        <>
          <path
            d="M -33 -12 Q -23 -18 -13 -12"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3.2}
            strokeLinecap="round"
          />
          <path
            d="M 13 -12 Q 23 -18 33 -12"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3.2}
            strokeLinecap="round"
          />
          <circle cx={-23} cy={6} r={12} fill="none" stroke="#FFFFFF" strokeWidth={5.4} />
          <circle cx={23} cy={6} r={12} fill="none" stroke="#FFFFFF" strokeWidth={5.4} />
          <circle cx={0} cy={27} r={6} fill="none" stroke="#FFFFFF" strokeWidth={3} />
        </>
      )}

      {expression === 'nervous' && (
        <>
          <circle cx={-23} cy={7} r={13.5} fill="none" stroke="#FFFFFF" strokeWidth={5.2} />
          <circle cx={23} cy={7} r={9.5} fill="none" stroke="#FFFFFF" strokeWidth={5} />
          <path
            d="M 41 -14 C 37 -7 38 -3 41 -3 C 44 -3 45 -7 41 -14 Z"
            fill="#60A5FA"
          />
          <path
            d="M -11 27 Q -7 23 -3 27 T 5 27 T 12 27"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'code' && (
        <>
          <path
            d="M -16 -5 L -34 6 L -16 17"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1={-4}
            y1={17}
            x2={4}
            y2={-5}
            stroke="#A78BFA"
            strokeWidth={4.5}
            strokeLinecap="round"
          />
          <path
            d="M 16 -5 L 34 6 L 16 17"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={5.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M -5 27 Q 0 31 5 27"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'money' && (
        <>
          <g fill="none" stroke="#4ADE80" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M -15 -3 C -15 -8 -31 -8 -31 -1 C -31 6 -15 6 -15 13 C -15 19 -31 19 -31 14" />
            <line x1={-23} y1={-11} x2={-23} y2={22} />
            <path d="M 31 -3 C 31 -8 15 -8 15 -1 C 15 6 31 6 31 13 C 31 19 15 19 15 14" />
            <line x1={23} y1={-11} x2={23} y2={22} />
          </g>
          <path
            d="M -7 27 Q 0 33 7 27"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'fire-eyes' && (
        <>
          <g transform="translate(-23, 6)">
            <path
              d="M 0 -17 C 9 -7 14 0 12 9 C 11 16 6 19 0 19 C -7 19 -12 14 -12 7 C -12 -1 -6 -6 -5 -11 C -2 -7 -1 -11 0 -17 Z"
              fill="#FB923C"
            />
            <path
              d="M 0 -2 C 4 3 6 7 5 11 C 4 15 2 16 0 16 C -3 16 -5 13 -5 9 C -5 5 -2 3 0 -2 Z"
              fill="#FEF08A"
            />
          </g>
          <g transform="translate(23, 6)">
            <path
              d="M 0 -17 C 9 -7 14 0 12 9 C 11 16 6 19 0 19 C -7 19 -12 14 -12 7 C -12 -1 -6 -6 -5 -11 C -2 -7 -1 -11 0 -17 Z"
              fill="#FB923C"
            />
            <path
              d="M 0 -2 C 4 3 6 7 5 11 C 4 15 2 16 0 16 C -3 16 -5 13 -5 9 C -5 5 -2 3 0 -2 Z"
              fill="#FEF08A"
            />
          </g>
          <path
            d="M -8 27 Q 0 33 8 27"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </>
      )}

      {expression === 'hypnotized' && (
        <>
          <circle cx={-23} cy={6} r={14.5} fill="none" stroke="#FFFFFF" strokeWidth={3.2} />
          <circle cx={-23} cy={6} r={8} fill="none" stroke="#FFFFFF" strokeWidth={3} />
          <circle cx={-23} cy={6} r={2.4} fill="#FFFFFF" />
          <circle cx={23} cy={6} r={14.5} fill="none" stroke="#FFFFFF" strokeWidth={3.2} />
          <circle cx={23} cy={6} r={8} fill="none" stroke="#FFFFFF" strokeWidth={3} />
          <circle cx={23} cy={6} r={2.4} fill="#FFFFFF" />
          <circle cx={0} cy={27} r={3.5} fill="none" stroke="#FFFFFF" strokeWidth={2.6} />
        </>
      )}

      {expression === 'loading' && (
        <>
          <circle cx={-24} cy={10} r={6.5} fill="#FFFFFF" />
          <circle cx={0} cy={10} r={6.5} fill="#FFFFFF" opacity={0.65} />
          <circle cx={24} cy={10} r={6.5} fill="#FFFFFF" opacity={0.35} />
        </>
      )}
    </g>
  );
}

const LIMB_KEYS: LimbId[] = ['leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

export const KodeeSvg: React.FC<KodeeSvgProps> = ({
  state,
  svgRef: externalSvgRef,
  interactive = false,
  showHandles = false,
  selectedAccessoryId = null,
  onSelectAccessory,
  onDragStart,
  onChange,
  className = 'w-full h-full select-none',
  useCanonicalGradientId = false,
}) => {
  const reactId = useId().replace(/:/g, '');
  const gradientId = useCanonicalGradientId ? 'kodee-gradient' : `kodee-gradient-${reactId}`;
  const screenClipId = useCanonicalGradientId ? 'kodee-screen-clip' : `kodee-screen-clip-${reactId}`;

  const internalRef = useRef<SVGSVGElement | null>(null);
  const svgRef = externalSvgRef ?? internalRef;

  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);

  const anchors = getLimbAnchors(state.body, state.limbs);
  const rotHandle = getRotationHandlePos(state.body);
  const gradCoords = getGradientCoords(state.body.gradientAngle, state.body);
  const kodeePaint = state.body.colorMode === 'gradient' ? `url(#${gradientId})` : state.body.colors[0];

  const isLightBg =
    state.background.color !== 'transparent' && getColorLuminance(state.background.color) > 0.62;
  const bubbleLayout = state.bubble.enabled
    ? computeSpeechBubbleLayout(state.bubble, state.body)
    : null;

  const backAccessories = state.accessories.filter((a) => a.layer === 'back');
  const frontAccessories = state.accessories.filter((a) => a.layer === 'front');

  const clientToSvgPoint = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const transformed = pt.matrixTransform(ctm.inverse());
      return { x: transformed.x, y: transformed.y };
    },
    [svgRef],
  );

  const beginDrag = useCallback(
    (e: React.PointerEvent<SVGElement>, target: DragTarget) => {
      if (!interactive || !onChange) return;
      e.stopPropagation();
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      onDragStart?.();
      setDragTarget(target);
    },
    [interactive, onChange, onDragStart],
  );

  const handleToggleSecondBend = useCallback(
    (id: LimbId) => {
      if (!interactive || !onChange) return;
      onDragStart?.();
      const limb = state.limbs[id];
      if (limb.ctrl2) {
        const mergedCtrl: Point = {
          x: Math.round((limb.ctrl.x + limb.ctrl2.x) / 2),
          y: Math.round((limb.ctrl.y + limb.ctrl2.y) / 2),
        };
        const { ctrl2: _removed, ...rest } = limb;
        onChange({
          ...state,
          limbs: {
            ...state.limbs,
            [id]: { ...rest, ctrl: mergedCtrl },
          },
        });
      } else {
        const { ctrl, ctrl2 } = computeNewSecondBend(anchors[id], limb);
        onChange({
          ...state,
          limbs: {
            ...state.limbs,
            [id]: { ...limb, ctrl, ctrl2 },
          },
        });
      }
    },
    [anchors, interactive, onChange, onDragStart, state],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragTarget || !interactive || !onChange) return;
      const pt = clientToSvgPoint(e.clientX, e.clientY);
      if (!pt) return;

      if (dragTarget.type === 'limb') {
        const nextPt: Point = {
          x: clampCoord(pt.x),
          y: clampCoord(pt.y),
        };
        onChange({
          ...state,
          limbs: {
            ...state.limbs,
            [dragTarget.limb]: {
              ...state.limbs[dragTarget.limb],
              [dragTarget.part]: nextPt,
            },
          },
        });
      } else if (dragTarget.type === 'anchor') {
        const local = clampLocalAnchor(worldToLocal(pt, state.body));
        onChange({
          ...state,
          limbs: {
            ...state.limbs,
            [dragTarget.limb]: {
              ...state.limbs[dragTarget.limb],
              anchor: local,
            },
          },
        });
      } else if (dragTarget.type === 'rotation') {
        const dx = pt.x - state.body.x;
        const dy = pt.y - state.body.y;
        const angleRad = Math.atan2(dy, dx) + Math.PI / 2;
        let deg = Math.round((angleRad * 180) / Math.PI);
        if (deg > 180) deg -= 360;
        if (deg < -180) deg += 360;
        deg = Math.max(-35, Math.min(35, deg));
        onChange({
          ...state,
          body: {
            ...state.body,
            rotation: deg,
          },
        });
      } else if (dragTarget.type === 'body') {
        onChange(translateRig(state, pt.x - dragTarget.offsetX, pt.y - dragTarget.offsetY));
      } else if (dragTarget.type === 'accessory') {
        const nextX = clampCoord(pt.x - dragTarget.offsetX);
        const nextY = clampCoord(pt.y - dragTarget.offsetY);
        onChange({
          ...state,
          accessories: state.accessories.map((acc) =>
            acc.id === dragTarget.id ? { ...acc, x: nextX, y: nextY } : acc,
          ),
        });
      }
    },
    [dragTarget, interactive, onChange, clientToSvgPoint, state],
  );

  const endDrag = useCallback(() => {
    setDragTarget(null);
  }, []);

  const handleBodyPointerDown = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      if (!interactive || !showHandles || !onChange) return;
      onSelectAccessory?.(null);
      const pt = clientToSvgPoint(e.clientX, e.clientY);
      if (!pt) return;
      beginDrag(e, {
        type: 'body',
        offsetX: pt.x - state.body.x,
        offsetY: pt.y - state.body.y,
      });
    },
    [interactive, showHandles, onChange, onSelectAccessory, clientToSvgPoint, beginDrag, state.body.x, state.body.y],
  );

  const handleAccessoryPointerDown = useCallback(
    (e: React.PointerEvent<SVGGElement>, acc: AccessoryInstance) => {
      if (!interactive || !onChange) return;
      onSelectAccessory?.(acc.id);
      const pt = clientToSvgPoint(e.clientX, e.clientY);
      if (!pt) return;
      beginDrag(e, {
        type: 'accessory',
        id: acc.id,
        offsetX: pt.x - acc.x,
        offsetY: pt.y - acc.y,
      });
    },
    [interactive, onChange, onSelectAccessory, clientToSvgPoint, beginDrag],
  );

  const backLimbs: LimbId[] = [];
  const mainLimbs: LimbId[] = [];
  for (const id of LIMB_KEYS) {
    if (id === 'leftLeg' && state.limbs.leftLeg.end.x > state.limbs.rightLeg.end.x) {
      backLimbs.push(id);
    } else {
      mainLimbs.push(id);
    }
  }

  const getFootDirForLimb = (id: LimbId) => {
    if (!state.feet.enabled) return undefined;
    if (id === 'leftLeg') return state.feet.left;
    if (id === 'rightLeg') return state.feet.right;
    return undefined;
  };

  const renderLimbPath = (id: LimbId) => {
    const anchor = anchors[id];
    const limb = state.limbs[id];
    const d = buildLimbPathD(anchor, limb, getFootDirForLimb(id));
    return (
      <path
        key={id}
        d={d}
        fill="none"
        stroke={kodeePaint}
        strokeWidth={17}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  const renderAccessory = (acc: AccessoryInstance) => {
    const sx = acc.flipX ? -acc.scale : acc.scale;
    const isDraggingThis = dragTarget?.type === 'accessory' && dragTarget.id === acc.id;
    return (
      <g
        key={acc.id}
        transform={`translate(${acc.x}, ${acc.y}) rotate(${acc.rotation}) scale(${sx}, ${acc.scale})`}
        onPointerDown={interactive ? (e) => handleAccessoryPointerDown(e, acc) : undefined}
        style={
          interactive
            ? { cursor: isDraggingThis ? 'grabbing' : 'grab' }
            : undefined
        }
      >
        <AccessoryGraphic type={acc.type} color={acc.color} />
      </g>
    );
  };

  const selectedAccessory = selectedAccessoryId
    ? state.accessories.find((a) => a.id === selectedAccessoryId) ?? null
    : null;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onPointerDown={() => {
        if (interactive) onSelectAccessory?.(null);
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{ touchAction: interactive ? 'none' : 'auto' }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={gradCoords.x1}
          y1={gradCoords.y1}
          x2={gradCoords.x2}
          y2={gradCoords.y2}
        >
          <stop offset="0%" stopColor={state.body.colors[0]} />
          <stop offset="100%" stopColor={state.body.colors[1]} />
        </linearGradient>
        <clipPath id={screenClipId}>
          <rect x={-54} y={-22} width={108} height={64} rx={9} />
        </clipPath>
      </defs>

      {/* Layer 1: Background */}
      {state.background.color !== 'transparent' && (
        <g id="layer-background">
          <rect x={0} y={0} width={500} height={500} fill={state.background.color} />
        </g>
      )}

      {/* Layer 1.5: Back Accessories (cape, wings, etc.) */}
      <g id="layer-accessories-back">{backAccessories.map(renderAccessory)}</g>

      {/* Layer 2: Back limbs */}
      <g id="layer-limbs-back">{backLimbs.map(renderLimbPath)}</g>

      {/* Layer 3: Main tubular Bézier limbs */}
      <g id="layer-limbs">{mainLimbs.map(renderLimbPath)}</g>

      {/* Layer 4: Kodee Body */}
      <g
        id="layer-body"
        transform={`translate(${state.body.x}, ${state.body.y}) rotate(${state.body.rotation})`}
        onPointerDown={handleBodyPointerDown}
        style={
          interactive && showHandles
            ? { cursor: dragTarget?.type === 'body' ? 'grabbing' : 'grab' }
            : undefined
        }
      >
        <path d={KODEE_BODY_PATH} fill={kodeePaint} />
      </g>

      {/* Layer 5: Face screen & expressions */}
      <g
        id="layer-face"
        transform={`translate(${state.body.x}, ${state.body.y}) rotate(${state.body.rotation})`}
        pointerEvents="none"
      >
        <rect x={-56} y={-24} width={112} height={68} rx={11} fill="#09090D" />
        <g clipPath={`url(#${screenClipId})`}>
          <KodeeFaceExpression
            expression={state.face.expression}
            eyeOffset={state.face.eyeOffset}
          />
        </g>
      </g>

      {/* Layer 5.5: Front Accessories */}
      <g id="layer-accessories-front">{frontAccessories.map(renderAccessory)}</g>

      {/* Layer 6: Pure native SVG speech bubble */}
      {bubbleLayout && (
        <g id="layer-bubble" pointerEvents="none">
          <path
            d={bubbleLayout.pathD}
            fill="#FFFFFF"
            stroke={isLightBg ? '#18181B' : 'rgba(255,255,255,0.12)'}
            strokeWidth={isLightBg ? 2.5 : 1}
            strokeLinejoin="round"
          />
          <text
            x={bubbleLayout.textX}
            y={bubbleLayout.textStartY}
            textAnchor="middle"
            fill="#111118"
            fontSize={bubbleLayout.fontSizePx}
            fontWeight={600}
            fontFamily="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          >
            {bubbleLayout.lines.map((line, idx) => (
              <tspan
                key={idx}
                x={bubbleLayout.textX}
                dy={idx === 0 ? 0 : bubbleLayout.lineHeight}
              >
                {line || ' '}
              </tspan>
            ))}
          </text>
        </g>
      )}

      {/* Layer 7: Interactive editing handles & accessory selection halo (strictly stripped on PNG export) */}
      {interactive && (showHandles || selectedAccessory) && (
        <g id="layer-handles">
          {/* Selected accessory visual highlight ring */}
          {selectedAccessory && (
            <g
              transform={`translate(${selectedAccessory.x}, ${selectedAccessory.y})`}
              pointerEvents="none"
            >
              <circle
                r={Math.max(24, 34 * selectedAccessory.scale)}
                fill="none"
                stroke="#38BDF8"
                strokeWidth={1.75}
                strokeDasharray="5 4"
              />
            </g>
          )}

          {showHandles && (
            <>
              {/* Rotation stem & handle above Kodee's head */}
              <line
                x1={state.body.x}
                y1={state.body.y}
                x2={rotHandle.x}
                y2={rotHandle.y}
                stroke="rgba(167, 139, 250, 0.55)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                pointerEvents="none"
              />
              <g
                transform={`translate(${rotHandle.x}, ${rotHandle.y})`}
                onPointerDown={(e) => beginDrag(e, { type: 'rotation' })}
                style={{ cursor: 'ew-resize' }}
              >
                <circle r={17} fill="transparent" />
                <circle
                  r={8.5}
                  fill={dragTarget?.type === 'rotation' ? '#7F52FF' : '#14151A'}
                  stroke="#A78BFA"
                  strokeWidth={2.2}
                />
                <path
                  d="M -3.2 0 A 3.2 3.2 0 1 1 2.2 2.4"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                />
              </g>

              {dragTarget?.type === 'rotation' && (
                <g
                  transform={`translate(${rotHandle.x + 18}, ${rotHandle.y - 12})`}
                  pointerEvents="none"
                >
                  <rect x={0} y={-11} width={42} height={20} rx={5} fill="#14151A" stroke="#3A3D4D" />
                  <text
                    x={21}
                    y={3}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={11}
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {state.body.rotation > 0 ? `+${state.body.rotation}°` : `${state.body.rotation}°`}
                  </text>
                </g>
              )}

              {/* Limb handles: Body anchor (teal), Bend 1 (violet diamond), Bend 2 (amber diamond), Extremity (white circle) */}
              {LIMB_KEYS.map((id) => {
                const anchor = anchors[id];
                const limb = state.limbs[id];
                const isAnchorActive = dragTarget?.type === 'anchor' && dragTarget.limb === id;
                const isCtrlActive =
                  dragTarget?.type === 'limb' && dragTarget.limb === id && dragTarget.part === 'ctrl';
                const isCtrl2Active =
                  dragTarget?.type === 'limb' && dragTarget.limb === id && dragTarget.part === 'ctrl2';
                const isEndActive =
                  dragTarget?.type === 'limb' && dragTarget.limb === id && dragTarget.part === 'end';

                const guidePoints = limb.ctrl2
                  ? `${anchor.x},${anchor.y} ${limb.ctrl.x},${limb.ctrl.y} ${limb.ctrl2.x},${limb.ctrl2.y} ${limb.end.x},${limb.end.y}`
                  : `${anchor.x},${anchor.y} ${limb.ctrl.x},${limb.ctrl.y} ${limb.end.x},${limb.end.y}`;

                return (
                  <g key={id}>
                    {/* Wide invisible double-click hit target on limb curve to toggle 2nd bend */}
                    <path
                      d={buildLimbPathD(anchor, limb)}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={26}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleToggleSecondBend(id);
                      }}
                      style={{ cursor: 'pointer' }}
                    />

                    <polyline
                      points={guidePoints}
                      fill="none"
                      stroke="rgba(255,255,255,0.34)"
                      strokeWidth={1.3}
                      strokeDasharray="3.5 3.5"
                      pointerEvents="none"
                    />

                    {/* Draggable body joint anchor handle (teal ring) */}
                    <g
                      transform={`translate(${anchor.x}, ${anchor.y})`}
                      onPointerDown={(e) => beginDrag(e, { type: 'anchor', limb: id })}
                      style={{ cursor: 'move' }}
                    >
                      <circle r={14} fill="transparent" />
                      <circle
                        r={5.8}
                        fill={isAnchorActive ? '#2DD4BF' : '#14151A'}
                        stroke="#2DD4BF"
                        strokeWidth={2.2}
                      />
                    </g>

                    {/* Primary elbow / knee Bézier control handle (violet diamond) */}
                    <g
                      transform={`translate(${limb.ctrl.x}, ${limb.ctrl.y})`}
                      onPointerDown={(e) => beginDrag(e, { type: 'limb', limb: id, part: 'ctrl' })}
                      style={{ cursor: 'move' }}
                    >
                      <circle r={15} fill="transparent" />
                      <rect
                        x={-5.8}
                        y={-5.8}
                        width={11.6}
                        height={11.6}
                        rx={2}
                        transform="rotate(45)"
                        fill={isCtrlActive ? '#7F52FF' : '#14151A'}
                        stroke="#C4B5FD"
                        strokeWidth={2}
                      />
                    </g>

                    {/* Optional secondary bend handle (amber diamond) */}
                    {limb.ctrl2 && (
                      <g
                        transform={`translate(${limb.ctrl2.x}, ${limb.ctrl2.y})`}
                        onPointerDown={(e) =>
                          beginDrag(e, { type: 'limb', limb: id, part: 'ctrl2' })
                        }
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleToggleSecondBend(id);
                        }}
                        style={{ cursor: 'move' }}
                      >
                        <circle r={15} fill="transparent" />
                        <rect
                          x={-5.5}
                          y={-5.5}
                          width={11}
                          height={11}
                          rx={2}
                          transform="rotate(45)"
                          fill={isCtrl2Active ? '#F59E0B' : '#14151A'}
                          stroke="#FCD34D"
                          strokeWidth={2}
                        />
                      </g>
                    )}

                    {/* Hand / Foot extremity handle (white circle) */}
                    <g
                      transform={`translate(${limb.end.x}, ${limb.end.y})`}
                      onPointerDown={(e) => beginDrag(e, { type: 'limb', limb: id, part: 'end' })}
                      style={{ cursor: 'move' }}
                    >
                      <circle r={17} fill="transparent" />
                      <circle
                        r={7.8}
                        fill={isEndActive ? '#7F52FF' : '#FFFFFF'}
                        stroke="#7F52FF"
                        strokeWidth={2.5}
                      />
                    </g>
                  </g>
                );
              })}
            </>
          )}
        </g>
      )}
    </svg>
  );
};
