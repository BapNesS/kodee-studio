export interface Point {
  x: number;
  y: number;
}

export interface LimbCurve {
  /** Optional custom attachment point in local body coordinates (relative to body center) */
  anchor?: Point;
  /** Primary bend control point (elbow / knee) in 500x500 canvas coordinates */
  ctrl: Point;
  /** Optional secondary bend control point for S-curves / wrist / ankle bends */
  ctrl2?: Point;
  /** Extremity point (hand / foot) in 500x500 canvas coordinates */
  end: Point;
  /** When true on arms, renders the arm in front of Kodee's body and face */
  inFront?: boolean;
}

export type LimbId = 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';

export type FootDirection = 'left' | 'right';

export interface FeetState {
  enabled: boolean;
  left: FootDirection;
  right: FootDirection;
}

export type ExpressionId =
  | 'neutral'
  | 'greeting'
  | 'happy'
  | 'sad'
  | 'in-love'
  | 'angry'
  | 'shocked'
  | 'determined'
  | 'laughing'
  | 'starry'
  | 'sleepy'
  | 'dizzy'
  | 'dead'
  | 'cool'
  | 'skeptical'
  | 'smug'
  | 'shy'
  | 'crying'
  | 'wink-left'
  | 'cat'
  | 'tongue'
  | 'surprised'
  | 'nervous'
  | 'code'
  | 'money'
  | 'fire-eyes'
  | 'hypnotized'
  | 'loading';

export type ColorMode = 'solid' | 'gradient';

export type BubblePosition = 'top-left' | 'top-right';

export type BubbleFontSize = 'S' | 'M' | 'L';

export type ExportSize = 256 | 1024 | 2048;

export type AccessoryType =
  // Head (8)
  | 'beanie'
  | 'cap'
  | 'crown'
  | 'party-hat'
  | 'headphones'
  | 'sunglasses'
  | 'glasses'
  | 'halo'
  // Wearables & Feet (6)
  | 'scarf'
  | 'bowtie'
  | 'cape'
  | 'wings'
  | 'ice-skate'
  | 'skateboard'
  // Props & Drinks (10)
  | 'mug'
  | 'straw-cup'
  | 'gift'
  | 'marker'
  | 'laptop'
  | 'smartphone'
  | 'book'
  | 'umbrella'
  | 'camera'
  | 'trophy'
  // Emotions & Effects (8)
  | 'heart'
  | 'mini-hearts'
  | 'sparkles'
  | 'lightning'
  | 'music-notes'
  | 'lightbulb'
  | 'zzz'
  | 'fire';

export type AccessoryLayer = 'front' | 'back';

export interface AccessoryInstance {
  id: string;
  type: AccessoryType;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  layer: AccessoryLayer;
  color: string;
}

export interface KodeeState {
  version: '1.0';
  background: {
    color: string;
  };
  body: {
    x: number;
    y: number;
    rotation: number;
    colorMode: ColorMode;
    colors: [string, string];
    gradientAngle: number;
  };
  face: {
    expression: ExpressionId;
    eyeOffset: Point;
  };
  limbs: {
    leftArm: LimbCurve;
    rightArm: LimbCurve;
    leftLeg: LimbCurve;
    rightLeg: LimbCurve;
  };
  feet: FeetState;
  bubble: {
    enabled: boolean;
    position: BubblePosition;
    text: string;
    fontSize: BubbleFontSize;
  };
  accessories: AccessoryInstance[];
}

export const VALID_EXPRESSIONS: ExpressionId[] = [
  'neutral',
  'greeting',
  'happy',
  'sad',
  'in-love',
  'angry',
  'shocked',
  'determined',
  'laughing',
  'starry',
  'sleepy',
  'dizzy',
  'dead',
  'cool',
  'skeptical',
  'smug',
  'shy',
  'crying',
  'wink-left',
  'cat',
  'tongue',
  'surprised',
  'nervous',
  'code',
  'money',
  'fire-eyes',
  'hypnotized',
  'loading',
];

export const VALID_ACCESSORY_TYPES: AccessoryType[] = [
  'beanie',
  'cap',
  'crown',
  'party-hat',
  'headphones',
  'sunglasses',
  'glasses',
  'halo',
  'scarf',
  'bowtie',
  'cape',
  'wings',
  'ice-skate',
  'skateboard',
  'mug',
  'straw-cup',
  'gift',
  'marker',
  'laptop',
  'smartphone',
  'book',
  'umbrella',
  'camera',
  'trophy',
  'heart',
  'mini-hearts',
  'sparkles',
  'lightning',
  'music-notes',
  'lightbulb',
  'zzz',
  'fire',
];

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidPoint(value: unknown): value is Point {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  return isFiniteNumber(p.x) && isFiniteNumber(p.y);
}

function isValidLimb(value: unknown): value is LimbCurve {
  if (!value || typeof value !== 'object') return false;
  const l = value as Record<string, unknown>;
  if (!isValidPoint(l.ctrl) || !isValidPoint(l.end)) return false;
  if (l.ctrl2 !== undefined && !isValidPoint(l.ctrl2)) return false;
  if (l.anchor !== undefined && !isValidPoint(l.anchor)) return false;
  if (l.inFront !== undefined && typeof l.inFront !== 'boolean') return false;
  return true;
}

function isValidColor(value: unknown, allowTransparent = false): value is string {
  if (typeof value !== 'string') return false;
  if (allowTransparent && value === 'transparent') return true;
  return HEX_COLOR_RE.test(value.trim());
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function validateKodeeState(
  raw: unknown,
): { ok: true; state: KodeeState } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'The JSON file must contain a valid object.' };
  }

  const obj = raw as Record<string, unknown>;

  if (!obj.background || typeof obj.background !== 'object') {
    return { ok: false, error: 'Missing or invalid "background" field.' };
  }
  const bg = obj.background as Record<string, unknown>;
  if (!isValidColor(bg.color, true)) {
    return {
      ok: false,
      error: 'Invalid background color (expected #RRGGBB or "transparent").',
    };
  }

  if (!obj.body || typeof obj.body !== 'object') {
    return { ok: false, error: 'Missing or invalid "body" field.' };
  }
  const body = obj.body as Record<string, unknown>;
  if (!isFiniteNumber(body.x) || !isFiniteNumber(body.y) || !isFiniteNumber(body.rotation)) {
    return { ok: false, error: 'Invalid body coordinates or rotation.' };
  }
  if (body.colorMode !== 'solid' && body.colorMode !== 'gradient') {
    return { ok: false, error: 'Color mode must be "solid" or "gradient".' };
  }
  if (
    !Array.isArray(body.colors) ||
    body.colors.length < 1 ||
    !isValidColor(body.colors[0]) ||
    (body.colors.length > 1 && !isValidColor(body.colors[1]))
  ) {
    return {
      ok: false,
      error: '"body.colors" must contain valid hex color values.',
    };
  }
  const gradientAngle = isFiniteNumber(body.gradientAngle) ? body.gradientAngle : 135;

  if (!obj.face || typeof obj.face !== 'object') {
    return { ok: false, error: 'Missing or invalid "face" field.' };
  }
  const face = obj.face as Record<string, unknown>;
  if (
    typeof face.expression !== 'string' ||
    !VALID_EXPRESSIONS.includes(face.expression as ExpressionId)
  ) {
    return { ok: false, error: `Unrecognized facial expression: "${String(face.expression)}".` };
  }
  const eyeOffset: Point = isValidPoint(face.eyeOffset)
    ? {
        x: clamp(face.eyeOffset.x, -12, 12),
        y: clamp(face.eyeOffset.y, -8, 8),
      }
    : { x: 0, y: 0 };

  if (!obj.limbs || typeof obj.limbs !== 'object') {
    return { ok: false, error: 'Missing or invalid "limbs" field.' };
  }
  const limbs = obj.limbs as Record<string, unknown>;
  for (const key of ['leftArm', 'rightArm', 'leftLeg', 'rightLeg'] as const) {
    if (!isValidLimb(limbs[key])) {
      return { ok: false, error: `Missing or invalid coordinates for limb "${key}".` };
    }
  }

  const feetRaw = (obj.feet && typeof obj.feet === 'object'
    ? (obj.feet as Record<string, unknown>)
    : {}) as Record<string, unknown>;

  const feet: FeetState = {
    enabled: typeof feetRaw.enabled === 'boolean' ? feetRaw.enabled : true,
    left: feetRaw.left === 'right' ? 'right' : 'left',
    right: feetRaw.right === 'left' ? 'left' : 'right',
  };

  const bubbleRaw = (obj.bubble && typeof obj.bubble === 'object'
    ? (obj.bubble as Record<string, unknown>)
    : {}) as Record<string, unknown>;

  const bubblePosition: BubblePosition =
    bubbleRaw.position === 'top-left' || bubbleRaw.position === 'top-right'
      ? bubbleRaw.position
      : 'top-right';
  const bubbleFontSize: BubbleFontSize =
    bubbleRaw.fontSize === 'S' || bubbleRaw.fontSize === 'M' || bubbleRaw.fontSize === 'L'
      ? bubbleRaw.fontSize
      : 'M';

  const clampPt = (p: Point): Point => ({
    x: Math.round(clamp(p.x, 10, 490)),
    y: Math.round(clamp(p.y, 10, 490)),
  });

  const clampAnchorPt = (p: Point): Point => ({
    x: Math.round(clamp(p.x, -62, 62)),
    y: Math.round(clamp(p.y, -44, 50)),
  });

  const clampLimb = (l: LimbCurve): LimbCurve => {
    const out: LimbCurve = {
      ctrl: clampPt(l.ctrl),
      end: clampPt(l.end),
    };
    if (l.ctrl2) out.ctrl2 = clampPt(l.ctrl2);
    if (l.anchor) out.anchor = clampAnchorPt(l.anchor);
    if (l.inFront) out.inFront = true;
    return out;
  };

  const accessories: AccessoryInstance[] = [];
  if (Array.isArray(obj.accessories)) {
    for (let i = 0; i < obj.accessories.length; i++) {
      const item = obj.accessories[i];
      if (!item || typeof item !== 'object') continue;
      const a = item as Record<string, unknown>;
      if (
        typeof a.type !== 'string' ||
        !VALID_ACCESSORY_TYPES.includes(a.type as AccessoryType)
      ) {
        continue;
      }
      accessories.push({
        id: typeof a.id === 'string' && a.id.trim() ? a.id : `acc-${Date.now()}-${i}`,
        type: a.type as AccessoryType,
        x: Math.round(clamp(isFiniteNumber(a.x) ? a.x : 250, 10, 490)),
        y: Math.round(clamp(isFiniteNumber(a.y) ? a.y : 250, 10, 490)),
        scale: Number(clamp(isFiniteNumber(a.scale) ? a.scale : 1, 0.35, 2.2).toFixed(2)),
        rotation: Math.round(clamp(isFiniteNumber(a.rotation) ? a.rotation : 0, -180, 180)),
        flipX: Boolean(a.flipX),
        layer: a.layer === 'back' ? 'back' : 'front',
        color: isValidColor(a.color) ? a.color.trim() : '#D4D7E2',
      });
    }
  }

  return {
    ok: true,
    state: {
      version: '1.0',
      background: {
        color: bg.color.trim(),
      },
      body: {
        x: Math.round(clamp(body.x, 120, 380)),
        y: Math.round(clamp(body.y, 140, 360)),
        rotation: Math.round(clamp(body.rotation, -45, 45)),
        colorMode: body.colorMode,
        colors: [body.colors[0].trim(), (body.colors[1] ?? body.colors[0]).trim()],
        gradientAngle: Math.round(((gradientAngle % 360) + 360) % 360),
      },
      face: {
        expression: face.expression as ExpressionId,
        eyeOffset,
      },
      limbs: {
        leftArm: clampLimb(limbs.leftArm as LimbCurve),
        rightArm: clampLimb(limbs.rightArm as LimbCurve),
        leftLeg: clampLimb(limbs.leftLeg as LimbCurve),
        rightLeg: clampLimb(limbs.rightLeg as LimbCurve),
      },
      feet,
      bubble: {
        enabled: Boolean(bubbleRaw.enabled),
        position: bubblePosition,
        text: typeof bubbleRaw.text === 'string' ? bubbleRaw.text.slice(0, 180) : '',
        fontSize: bubbleFontSize,
      },
      accessories,
    },
  };
}
