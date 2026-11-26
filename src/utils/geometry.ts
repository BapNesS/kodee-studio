import type {
  BubbleFontSize,
  FootDirection,
  KodeeState,
  LimbCurve,
  LimbId,
  Point,
} from '../types/kodee';

export const CANVAS_SIZE = 500;
export const DEFAULT_BODY_X = 250;
export const DEFAULT_BODY_Y = 268;

/**
 * Default local anchor coordinates relative to Kodee's body center (0, 0).
 * Slightly recessed inside the body silhouette so round-capped tubular limbs merge seamlessly.
 */
export const LOCAL_ANCHORS: Record<LimbId, Point> = {
  leftArm: { x: -58, y: 12 },
  rightArm: { x: 58, y: 12 },
  leftLeg: { x: -23, y: 46 },
  rightLeg: { x: 23, y: 46 },
};

export const LOCAL_ROTATION_HANDLE: Point = { x: 0, y: -108 };

export function localToWorld(
  local: Point,
  body: Pick<KodeeState['body'], 'x' | 'y' | 'rotation'>,
): Point {
  const rad = (body.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: body.x + local.x * cos - local.y * sin,
    y: body.y + local.x * sin + local.y * cos,
  };
}

export function worldToLocal(
  world: Point,
  body: Pick<KodeeState['body'], 'x' | 'y' | 'rotation'>,
): Point {
  const rad = (-body.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = world.x - body.x;
  const dy = world.y - body.y;
  return {
    x: dx * cos - dy * sin,
    y: dx * sin + dy * cos,
  };
}

export function clampLocalAnchor(pt: Point): Point {
  return {
    x: Math.round(Math.max(-62, Math.min(62, pt.x))),
    y: Math.round(Math.max(-44, Math.min(50, pt.y))),
  };
}

export function getLimbAnchors(
  body: Pick<KodeeState['body'], 'x' | 'y' | 'rotation'>,
  limbs?: KodeeState['limbs'],
): Record<LimbId, Point> {
  return {
    leftArm: localToWorld(limbs?.leftArm.anchor ?? LOCAL_ANCHORS.leftArm, body),
    rightArm: localToWorld(limbs?.rightArm.anchor ?? LOCAL_ANCHORS.rightArm, body),
    leftLeg: localToWorld(limbs?.leftLeg.anchor ?? LOCAL_ANCHORS.leftLeg, body),
    rightLeg: localToWorld(limbs?.rightLeg.anchor ?? LOCAL_ANCHORS.rightLeg, body),
  };
}

export function getRotationHandlePos(
  body: Pick<KodeeState['body'], 'x' | 'y' | 'rotation'>,
): Point {
  return localToWorld(LOCAL_ROTATION_HANDLE, body);
}

export function clampCoord(value: number, min = 18, max = 482): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

/**
 * Computes the rounded foot tip position at the end of a leg, staying horizontal when standing
 * and gently tilting upward on wide dynamic strides (running / jumping) like the Kodee artwork.
 */
export function getFootTipPoint(limb: LimbCurve, footDir: FootDirection): Point {
  const prev = limb.ctrl2 ?? limb.ctrl;
  const inDx = limb.end.x - prev.x;
  const inDy = limb.end.y - prev.y;
  const legTilt = Math.atan2(inDx, Math.max(18, inDy));
  const subtleLift = Math.max(-0.46, Math.min(0.46, -legTilt * 0.42));
  const baseAngle = footDir === 'right' ? 0 : Math.PI;
  const footLen = 19;
  return {
    x: limb.end.x + Math.cos(baseAngle + subtleLift) * footLen,
    y: limb.end.y + Math.sin(baseAngle + subtleLift) * footLen,
  };
}

/**
 * Builds the SVG path `d` for a limb.
 * - With 1 bend point (`ctrl`): standard quadratic Bézier `M a Q ctrl end`.
 * - With 2 bend points (`ctrl` + `ctrl2`): C1-smooth quadratic midpoint spline
 *   `M a Q ctrl mid Q ctrl2 end` so both joints stay intuitive and support crisp elbows, ankles, and S-waves.
 * - If `footDir` is provided (for legs with feet enabled), appends the seamless rounded foot segment.
 */
export function buildLimbPathD(
  anchor: Point,
  limb: LimbCurve,
  footDir?: FootDirection,
): string {
  const ax = anchor.x.toFixed(1);
  const ay = anchor.y.toFixed(1);
  let d: string;
  if (limb.ctrl2) {
    const mx = ((limb.ctrl.x + limb.ctrl2.x) / 2).toFixed(1);
    const my = ((limb.ctrl.y + limb.ctrl2.y) / 2).toFixed(1);
    d = `M ${ax} ${ay} Q ${limb.ctrl.x} ${limb.ctrl.y} ${mx} ${my} Q ${limb.ctrl2.x} ${limb.ctrl2.y} ${limb.end.x} ${limb.end.y}`;
  } else {
    d = `M ${ax} ${ay} Q ${limb.ctrl.x} ${limb.ctrl.y} ${limb.end.x} ${limb.end.y}`;
  }
  if (footDir) {
    const tip = getFootTipPoint(limb, footDir);
    d += ` L ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`;
  }
  return d;
}

/**
 * Computes a well-placed default secondary bend point when toggling a 2nd bend on a limb.
 */
export function computeNewSecondBend(anchor: Point, limb: LimbCurve): { ctrl: Point; ctrl2: Point } {
  const c1: Point = {
    x: clampCoord(anchor.x * 0.35 + limb.ctrl.x * 0.65),
    y: clampCoord(anchor.y * 0.35 + limb.ctrl.y * 0.65),
  };
  const c2: Point = {
    x: clampCoord(limb.ctrl.x * 0.45 + limb.end.x * 0.55),
    y: clampCoord(limb.ctrl.y * 0.45 + limb.end.y * 0.55),
  };
  return { ctrl: c1, ctrl2: c2 };
}

/**
 * Translates body and all four limbs (including optional ctrl2) together so changing
 * vertical/horizontal offset preserves the pose.
 */
export function translateRig(state: KodeeState, targetX: number, targetY: number): KodeeState {
  const clampedX = clampCoord(targetX, 140, 360);
  const clampedY = clampCoord(targetY, 165, 345);
  const dx = clampedX - state.body.x;
  const dy = clampedY - state.body.y;

  if (dx === 0 && dy === 0) return state;

  const shift = (pt: Point): Point => ({
    x: clampCoord(pt.x + dx),
    y: clampCoord(pt.y + dy),
  });

  const shiftLimb = (limb: LimbCurve): LimbCurve => ({
    ...(limb.anchor ? { anchor: limb.anchor } : {}),
    ctrl: shift(limb.ctrl),
    ...(limb.ctrl2 ? { ctrl2: shift(limb.ctrl2) } : {}),
    end: shift(limb.end),
    ...(limb.inFront ? { inFront: true } : {}),
  });

  return {
    ...state,
    body: {
      ...state.body,
      x: clampedX,
      y: clampedY,
    },
    limbs: {
      leftArm: shiftLimb(state.limbs.leftArm),
      rightArm: shiftLimb(state.limbs.rightArm),
      leftLeg: shiftLimb(state.limbs.leftLeg),
      rightLeg: shiftLimb(state.limbs.rightLeg),
    },
  };
}

/**
 * Computes W3C relative luminance (0 = black, 1 = white) for auto-contrast speech bubble borders.
 */
export function getColorLuminance(color: string): number {
  if (!color || color === 'transparent') return 0;
  const hex = color.replace('#', '').trim();
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;
  if (full.length !== 6) return 0;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

/**
 * Computes linear gradient start/end points in SVG userSpaceOnUse space for Kodee's bounding box.
 */
export function getGradientCoords(
  angleDeg: number,
  body: Pick<KodeeState['body'], 'x' | 'y'>,
): { x1: number; y1: number; x2: number; y2: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const radius = 140;
  const cx = body.x;
  const cy = body.y + 30;
  return {
    x1: cx - Math.cos(rad) * radius,
    y1: cy - Math.sin(rad) * radius,
    x2: cx + Math.cos(rad) * radius,
    y2: cy + Math.sin(rad) * radius,
  };
}

export interface SpeechBubbleLayout {
  lines: string[];
  fontSizePx: number;
  lineHeight: number;
  boxX: number;
  boxY: number;
  boxW: number;
  boxH: number;
  textX: number;
  textStartY: number;
  pathD: string;
}

const FONT_METRICS: Record<
  BubbleFontSize,
  { size: number; lineHeight: number; padX: number; padY: number; maxWidth: number; charFactor: number }
> = {
  S: { size: 15, lineHeight: 20, padX: 16, padY: 11, maxWidth: 210, charFactor: 0.57 },
  M: { size: 18, lineHeight: 24, padX: 18, padY: 13, maxWidth: 228, charFactor: 0.58 },
  L: { size: 22, lineHeight: 29, padX: 20, padY: 15, maxWidth: 242, charFactor: 0.59 },
};

function estimateLineWidth(line: string, fontSize: number, charFactor: number): number {
  let width = 0;
  for (const ch of line) {
    if ('ilIj1.,!|\':;'.includes(ch)) {
      width += fontSize * 0.32;
    } else if ('mwMW@%#'.includes(ch)) {
      width += fontSize * 0.84;
    } else if (ch === ' ') {
      width += fontSize * 0.3;
    } else if (ch >= 'A' && ch <= 'Z') {
      width += fontSize * 0.68;
    } else {
      width += fontSize * charFactor;
    }
  }
  return width;
}

function wrapTextToLines(
  rawText: string,
  fontSize: number,
  maxContentWidth: number,
  charFactor: number,
): string[] {
  const cleaned = rawText.replace(/\r\n/g, '\n');
  if (!cleaned.trim()) return ['...'];

  const paragraphs = cleaned.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    const words = para.split(/\s+/);
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (estimateLineWidth(candidate, fontSize, charFactor) <= maxContentWidth) {
        current = candidate;
      } else {
        if (current) {
          lines.push(current);
          current = '';
        }
        if (estimateLineWidth(word, fontSize, charFactor) > maxContentWidth) {
          let chunk = '';
          for (const ch of word) {
            if (estimateLineWidth(chunk + ch, fontSize, charFactor) > maxContentWidth && chunk) {
              lines.push(chunk);
              chunk = ch;
            } else {
              chunk += ch;
            }
          }
          current = chunk;
        } else {
          current = word;
        }
      }
    }
    if (current) lines.push(current);
  }

  return lines.slice(0, 5);
}

/**
 * Generates a unified rounded-rect + tail SVG path (no internal stroke seam)
 * and native SVG <text>/<tspan> placement metrics.
 */
export function computeSpeechBubbleLayout(
  bubble: KodeeState['bubble'],
  body: Pick<KodeeState['body'], 'x' | 'y'>,
): SpeechBubbleLayout {
  const m = FONT_METRICS[bubble.fontSize];
  const maxContentW = m.maxWidth - m.padX * 2;
  const lines = wrapTextToLines(bubble.text, m.size, maxContentW, m.charFactor);

  const longestLineW = Math.max(
    46,
    ...lines.map((line) => estimateLineWidth(line, m.size, m.charFactor)),
  );
  const boxW = Math.min(m.maxWidth, Math.ceil(longestLineW + m.padX * 2));
  const boxH = Math.ceil(lines.length * m.lineHeight + m.padY * 2);

  const isRight = bubble.position === 'top-right';
  const margin = 20;

  const desiredX = isRight
    ? Math.min(CANVAS_SIZE - margin - boxW, Math.max(230, body.x + 12))
    : Math.max(margin, Math.min(270 - boxW, body.x - boxW - 12));

  const boxX = Math.max(margin, Math.min(CANVAS_SIZE - margin - boxW, Math.round(desiredX)));
  const maxBoxY = Math.max(22, Math.min(138, body.y - 98 - boxH));
  const boxY = Math.max(22, Math.round(Math.min(maxBoxY, 128 - boxH * 0.45)));

  const r = Math.min(18, boxH / 2 - 2, boxW / 2 - 2);

  const left = boxX;
  const right = boxX + boxW;
  const top = boxY;
  const bottom = boxY + boxH;

  let pathD: string;
  if (isRight) {
    const tailStart = Math.min(right - r - 24, left + r + 26);
    const tailEnd = Math.max(left + r + 4, tailStart - 20);
    const tipX = Math.max(left + 2, tailEnd - 12);
    const tipY = bottom + 19;

    pathD = [
      `M ${left + r} ${top}`,
      `H ${right - r}`,
      `Q ${right} ${top} ${right} ${top + r}`,
      `V ${bottom - r}`,
      `Q ${right} ${bottom} ${right - r} ${bottom}`,
      `H ${tailStart}`,
      `Q ${tailStart - 6} ${bottom + 10} ${tipX} ${tipY}`,
      `Q ${tailEnd + 4} ${bottom + 7} ${tailEnd} ${bottom}`,
      `H ${left + r}`,
      `Q ${left} ${bottom} ${left} ${bottom - r}`,
      `V ${top + r}`,
      `Q ${left} ${top} ${left + r} ${top}`,
      'Z',
    ].join(' ');
  } else {
    const tailStart = Math.max(left + r + 24, right - r - 26);
    const tailEnd = Math.min(right - r - 4, tailStart + 20);
    const tipX = Math.min(right - 2, tailEnd + 12);
    const tipY = bottom + 19;

    pathD = [
      `M ${left + r} ${top}`,
      `H ${right - r}`,
      `Q ${right} ${top} ${right} ${top + r}`,
      `V ${bottom - r}`,
      `Q ${right} ${bottom} ${right - r} ${bottom}`,
      `H ${tailEnd}`,
      `Q ${tailEnd - 4} ${bottom + 7} ${tipX} ${tipY}`,
      `Q ${tailStart + 6} ${bottom + 10} ${tailStart} ${bottom}`,
      `H ${left + r}`,
      `Q ${left} ${bottom} ${left} ${bottom - r}`,
      `V ${top + r}`,
      `Q ${left} ${top} ${left + r} ${top}`,
      'Z',
    ].join(' ');
  }

  return {
    lines,
    fontSizePx: m.size,
    lineHeight: m.lineHeight,
    boxX,
    boxY,
    boxW,
    boxH,
    textX: boxX + boxW / 2,
    textStartY: boxY + m.padY + m.size * 0.82,
    pathD,
  };
}
