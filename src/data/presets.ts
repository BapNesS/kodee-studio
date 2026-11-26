import type {
  ColorMode,
  ExpressionId,
  FootDirection,
  KodeeState,
  LimbCurve,
  Point,
} from '../types/kodee';
import { clampCoord, DEFAULT_BODY_X, DEFAULT_BODY_Y, LOCAL_ANCHORS } from '../utils/geometry';

export interface GlobalPosePreset {
  id: string;
  label: string;
  body: {
    x: number;
    y: number;
    rotation: number;
  };
  face: {
    expression: ExpressionId;
    eyeOffset: { x: number; y: number };
  };
  limbs: KodeeState['limbs'];
  feet: {
    left: FootDirection;
    right: FootDirection;
  };
}

export interface LimbPreset {
  id: string;
  label: string;
  /** Offsets relative to body center (body.x, body.y) */
  ctrlOffset: { x: number; y: number };
  endOffset: { x: number; y: number };
}

export interface AnchorPreset {
  id: string;
  label: string;
  left: Point;
  right: Point;
}

export interface ColorPalettePreset {
  id: string;
  label: string;
  colorMode: ColorMode;
  colors: [string, string];
  gradientAngle: number;
}

export interface ExpressionMeta {
  id: ExpressionId;
  label: string;
}

export const ARM_ANCHOR_PRESETS: AnchorPreset[] = [
  {
    id: 'sides',
    label: 'Sides',
    left: { ...LOCAL_ANCHORS.leftArm },
    right: { ...LOCAL_ANCHORS.rightArm },
  },
  {
    id: 'bottom',
    label: 'Bottom',
    left: { x: -46, y: 46 },
    right: { x: 46, y: 46 },
  },
  {
    id: 'low-corners',
    label: 'Lower corners',
    left: { x: -58, y: 38 },
    right: { x: 58, y: 38 },
  },
  {
    id: 'high',
    label: 'High',
    left: { x: -58, y: -14 },
    right: { x: 58, y: -14 },
  },
];

export const LEG_ANCHOR_PRESETS: AnchorPreset[] = [
  {
    id: 'standard',
    label: 'Standard',
    left: { ...LOCAL_ANCHORS.leftLeg },
    right: { ...LOCAL_ANCHORS.rightLeg },
  },
  {
    id: 'wide',
    label: 'Wide',
    left: { x: -40, y: 46 },
    right: { x: 40, y: 46 },
  },
  {
    id: 'narrow',
    label: 'Narrow',
    left: { x: -11, y: 46 },
    right: { x: 11, y: 46 },
  },
];

export const GLOBAL_POSE_PRESETS: GlobalPosePreset[] = [
  {
    id: 'walking',
    label: 'Walking',
    body: { x: 250, y: 266, rotation: 5 },
    face: { expression: 'neutral', eyeOffset: { x: 2, y: 0 } },
    limbs: {
      leftArm: { ctrl: { x: 152, y: 288 }, end: { x: 138, y: 244 } },
      rightArm: { ctrl: { x: 356, y: 282 }, end: { x: 334, y: 326 } },
      leftLeg: { ctrl: { x: 238, y: 366 }, end: { x: 288, y: 414 } },
      rightLeg: { ctrl: { x: 256, y: 366 }, end: { x: 212, y: 414 } },
    },
    feet: { left: 'left', right: 'left' },
  },
  {
    id: 'happy',
    label: 'Happy',
    body: { x: 250, y: 264, rotation: -3 },
    face: { expression: 'happy', eyeOffset: { x: 0, y: 0 } },
    limbs: {
      leftArm: { ctrl: { x: 152, y: 292 }, end: { x: 112, y: 274 } },
      rightArm: { ctrl: { x: 348, y: 292 }, end: { x: 388, y: 274 } },
      leftLeg: { ctrl: { x: 214, y: 366 }, end: { x: 186, y: 414 } },
      rightLeg: { ctrl: { x: 286, y: 366 }, end: { x: 324, y: 412 } },
    },
    feet: { left: 'left', right: 'right' },
  },
  {
    id: 'greeting',
    label: 'Greeting',
    body: { x: 250, y: 270, rotation: -5 },
    face: { expression: 'greeting', eyeOffset: { x: 1, y: -1 } },
    limbs: {
      leftArm: { ctrl: { x: 162, y: 304 }, end: { x: 158, y: 348 } },
      rightArm: { ctrl: { x: 356, y: 274 }, end: { x: 376, y: 198 } },
      leftLeg: { ctrl: { x: 230, y: 368 }, end: { x: 222, y: 416 } },
      rightLeg: { ctrl: { x: 272, y: 368 }, end: { x: 280, y: 416 } },
    },
    feet: { left: 'left', right: 'right' },
  },
  {
    id: 'cute',
    label: 'Cute',
    body: { x: 250, y: 268, rotation: -6 },
    face: { expression: 'neutral', eyeOffset: { x: -3, y: 0 } },
    limbs: {
      leftArm: { ctrl: { x: 154, y: 296 }, end: { x: 106, y: 298 } },
      rightArm: { ctrl: { x: 356, y: 290 }, end: { x: 326, y: 336 } },
      leftLeg: { ctrl: { x: 238, y: 376 }, end: { x: 194, y: 398 } },
      rightLeg: { ctrl: { x: 268, y: 368 }, end: { x: 272, y: 416 } },
    },
    feet: { left: 'left', right: 'left' },
  },
  {
    id: 'relaxing',
    label: 'Relaxing',
    body: { x: 250, y: 276, rotation: 11 },
    face: { expression: 'sleepy', eyeOffset: { x: 0, y: 0 } },
    limbs: {
      leftArm: { ctrl: { x: 146, y: 286 }, end: { x: 162, y: 340 } },
      rightArm: { ctrl: { x: 356, y: 286 }, end: { x: 324, y: 326 } },
      leftLeg: { ctrl: { x: 218, y: 370 }, end: { x: 248, y: 416 } },
      rightLeg: { ctrl: { x: 282, y: 362 }, end: { x: 268, y: 416 } },
    },
    feet: { left: 'left', right: 'right' },
  },
  {
    id: 'running',
    label: 'Running',
    body: { x: 250, y: 264, rotation: 16 },
    face: { expression: 'determined', eyeOffset: { x: 4, y: 0 } },
    limbs: {
      leftArm: { ctrl: { x: 154, y: 278 }, end: { x: 110, y: 306 } },
      rightArm: { ctrl: { x: 356, y: 278 }, end: { x: 386, y: 224 } },
      leftLeg: { ctrl: { x: 196, y: 368 }, end: { x: 152, y: 396 } },
      rightLeg: { ctrl: { x: 304, y: 356 }, end: { x: 364, y: 396 } },
    },
    feet: { left: 'left', right: 'right' },
  },
  {
    id: 'jumping',
    label: 'Jumping',
    body: { x: 250, y: 224, rotation: -4 },
    face: { expression: 'happy', eyeOffset: { x: 0, y: -2 } },
    limbs: {
      leftArm: { ctrl: { x: 154, y: 212 }, end: { x: 108, y: 174 } },
      rightArm: { ctrl: { x: 346, y: 212 }, end: { x: 392, y: 174 } },
      leftLeg: { ctrl: { x: 216, y: 324 }, end: { x: 180, y: 354 } },
      rightLeg: { ctrl: { x: 286, y: 324 }, end: { x: 326, y: 344 } },
    },
    feet: { left: 'left', right: 'right' },
  },
  {
    id: 'sitting',
    label: 'Sitting',
    body: { x: 250, y: 286, rotation: 2 },
    face: { expression: 'neutral', eyeOffset: { x: 0, y: 1 } },
    limbs: {
      leftArm: { ctrl: { x: 156, y: 324 }, end: { x: 104, y: 324 } },
      rightArm: { ctrl: { x: 344, y: 324 }, end: { x: 396, y: 324 } },
      leftLeg: { ctrl: { x: 220, y: 380 }, end: { x: 198, y: 414 } },
      rightLeg: { ctrl: { x: 268, y: 380 }, end: { x: 290, y: 414 } },
    },
    feet: { left: 'left', right: 'right' },
  },
  {
    id: 'sad',
    label: 'Sad',
    body: { x: 250, y: 280, rotation: -8 },
    face: { expression: 'sad', eyeOffset: { x: 0, y: 3 } },
    limbs: {
      leftArm: {
        anchor: { x: -46, y: 46 },
        ctrl: { x: 196, y: 368 },
        end: { x: 204, y: 408 },
      },
      rightArm: {
        anchor: { x: 46, y: 46 },
        ctrl: { x: 310, y: 364 },
        end: { x: 324, y: 400 },
      },
      leftLeg: {
        anchor: { x: -16, y: 46 },
        ctrl: { x: 234, y: 378 },
        end: { x: 230, y: 418 },
      },
      rightLeg: {
        anchor: { x: 16, y: 46 },
        ctrl: { x: 274, y: 378 },
        end: { x: 272, y: 418 },
      },
    },
    feet: { left: 'left', right: 'right' },
  },
  {
    id: 'in-love',
    label: 'In love',
    body: { x: 250, y: 268, rotation: -4 },
    face: { expression: 'in-love', eyeOffset: { x: 0, y: 0 } },
    limbs: {
      leftArm: {
        ctrl: { x: 148, y: 278 },
        ctrl2: { x: 158, y: 226 },
        end: { x: 132, y: 200 },
      },
      rightArm: { ctrl: { x: 362, y: 270 }, end: { x: 368, y: 212 } },
      leftLeg: { ctrl: { x: 266, y: 368 }, end: { x: 226, y: 416 } },
      rightLeg: { ctrl: { x: 234, y: 368 }, end: { x: 274, y: 416 } },
    },
    feet: { left: 'left', right: 'right' },
  },
  {
    id: 'angry',
    label: 'Angry',
    body: { x: 250, y: 272, rotation: 2 },
    face: { expression: 'angry', eyeOffset: { x: 0, y: 0 } },
    limbs: {
      leftArm: { ctrl: { x: 134, y: 286 }, end: { x: 184, y: 316 } },
      rightArm: { ctrl: { x: 366, y: 286 }, end: { x: 316, y: 316 } },
      leftLeg: { ctrl: { x: 212, y: 372 }, end: { x: 212, y: 416 } },
      rightLeg: { ctrl: { x: 288, y: 372 }, end: { x: 288, y: 416 } },
    },
    feet: { left: 'left', right: 'right' },
  },
  {
    id: 'shocked',
    label: 'Shocked',
    body: { x: 250, y: 264, rotation: 0 },
    face: { expression: 'shocked', eyeOffset: { x: 0, y: 0 } },
    limbs: {
      leftArm: { ctrl: { x: 142, y: 294 }, end: { x: 174, y: 256 } },
      rightArm: { ctrl: { x: 358, y: 294 }, end: { x: 326, y: 256 } },
      leftLeg: { ctrl: { x: 236, y: 364 }, end: { x: 214, y: 414 } },
      rightLeg: { ctrl: { x: 264, y: 364 }, end: { x: 286, y: 414 } },
    },
    feet: { left: 'left', right: 'right' },
  },
  {
    id: 'dancing',
    label: 'Dancing',
    body: { x: 250, y: 262, rotation: -6 },
    face: { expression: 'neutral', eyeOffset: { x: 3, y: -1 } },
    limbs: {
      leftArm: {
        ctrl: { x: 162, y: 316 },
        ctrl2: { x: 146, y: 248 },
        end: { x: 108, y: 240 },
      },
      rightArm: {
        ctrl: { x: 344, y: 240 },
        ctrl2: { x: 356, y: 302 },
        end: { x: 396, y: 274 },
      },
      leftLeg: { ctrl: { x: 216, y: 364 }, end: { x: 218, y: 416 } },
      rightLeg: {
        ctrl: { x: 318, y: 348 },
        ctrl2: { x: 254, y: 382 },
        end: { x: 268, y: 416 },
      },
    },
    feet: { left: 'left', right: 'right' },
  },
];

export const ARM_PRESETS: LimbPreset[] = [
  { id: 'down', label: 'Down', ctrlOffset: { x: 88, y: 36 }, endOffset: { x: 90, y: 84 } },
  { id: 'raised', label: 'Raised', ctrlOffset: { x: 98, y: -12 }, endOffset: { x: 126, y: -76 } },
  { id: 'wave', label: 'Wave', ctrlOffset: { x: 108, y: 6 }, endOffset: { x: 128, y: -68 } },
  { id: 'hips', label: 'Hips', ctrlOffset: { x: 116, y: 16 }, endOffset: { x: 66, y: 46 } },
  { id: 'open', label: 'Open', ctrlOffset: { x: 96, y: 24 }, endOffset: { x: 138, y: 8 } },
  { id: 'straight', label: 'Extended', ctrlOffset: { x: 104, y: 12 }, endOffset: { x: 148, y: 12 } },
];

export const LEG_PRESETS: LimbPreset[] = [
  { id: 'standing', label: 'Standing', ctrlOffset: { x: 24, y: 98 }, endOffset: { x: 30, y: 146 } },
  { id: 'walking', label: 'Walking', ctrlOffset: { x: 32, y: 98 }, endOffset: { x: 64, y: 144 } },
  { id: 'running', label: 'Running', ctrlOffset: { x: 54, y: 90 }, endOffset: { x: 112, y: 126 } },
  { id: 'jumping', label: 'Jumping', ctrlOffset: { x: 42, y: 94 }, endOffset: { x: 80, y: 112 } },
  { id: 'sitting', label: 'Sitting', ctrlOffset: { x: 26, y: 96 }, endOffset: { x: 52, y: 128 } },
  { id: 'crossed', label: 'Crossed', ctrlOffset: { x: -16, y: 98 }, endOffset: { x: 26, y: 146 } },
];

export function buildLimbFromPreset(
  preset: LimbPreset,
  side: 'left' | 'right',
  body: Pick<KodeeState['body'], 'x' | 'y'>,
  existingAnchor?: Point,
): LimbCurve {
  const dir = side === 'left' ? -1 : 1;
  return {
    ...(existingAnchor ? { anchor: existingAnchor } : {}),
    ctrl: {
      x: clampCoord(body.x + preset.ctrlOffset.x * dir),
      y: clampCoord(body.y + preset.ctrlOffset.y),
    },
    end: {
      x: clampCoord(body.x + preset.endOffset.x * dir),
      y: clampCoord(body.y + preset.endOffset.y),
    },
  };
}

export const EXPRESSION_METAS: ExpressionMeta[] = [
  { id: 'neutral', label: 'Curious' },
  { id: 'greeting', label: 'Right wink' },
  { id: 'wink-left', label: 'Left wink' },
  { id: 'happy', label: 'Happy' },
  { id: 'laughing', label: 'Laughing' },
  { id: 'starry', label: 'Starstruck' },
  { id: 'in-love', label: 'In love' },
  { id: 'shy', label: 'Shy' },
  { id: 'cat', label: 'UwU / Cat' },
  { id: 'tongue', label: 'Playful' },
  { id: 'cool', label: 'Cool' },
  { id: 'smug', label: 'Smug' },
  { id: 'skeptical', label: 'Skeptical' },
  { id: 'determined', label: 'Focused' },
  { id: 'code', label: 'Code mode' },
  { id: 'money', label: 'Jackpot' },
  { id: 'fire-eyes', label: 'On fire' },
  { id: 'surprised', label: 'Surprised' },
  { id: 'shocked', label: 'Shocked' },
  { id: 'nervous', label: 'Nervous' },
  { id: 'angry', label: 'Angry' },
  { id: 'sad', label: 'Sad' },
  { id: 'crying', label: 'Crying' },
  { id: 'sleepy', label: 'Sleepy' },
  { id: 'dizzy', label: 'Dizzy' },
  { id: 'hypnotized', label: 'Hypnotized' },
  { id: 'dead', label: 'K.O.' },
  { id: 'loading', label: 'Loading' },
];

export const COLOR_PALETTES: ColorPalettePreset[] = [
  {
    id: 'kotlin-violet',
    label: 'Kotlin Violet',
    colorMode: 'solid',
    colors: ['#7F52FF', '#7F52FF'],
    gradientAngle: 135,
  },
  {
    id: 'kotlin-gradient',
    label: 'Kotlin Gradient',
    colorMode: 'gradient',
    colors: ['#7F52FF', '#E44857'],
    gradientAngle: 135,
  },
  {
    id: 'in-love',
    label: 'In Love',
    colorMode: 'gradient',
    colors: ['#7F52FF', '#FF2E93'],
    gradientAngle: 165,
  },
  {
    id: 'angry',
    label: 'Angry',
    colorMode: 'gradient',
    colors: ['#FF2E5B', '#FF5F38'],
    gradientAngle: 135,
  },
];

export const BACKGROUND_SWATCHES: Array<{ id: string; label: string; color: string }> = [
  { id: 'black', label: 'Black', color: '#0F0F12' },
  { id: 'white', label: 'White', color: '#FFFFFF' },
  { id: 'gray', label: 'Gray', color: '#27272E' },
  { id: 'transparent', label: 'Transparent', color: 'transparent' },
];

export const INITIAL_KODEE_STATE: KodeeState = {
  version: '1.0',
  background: {
    color: '#0F0F12',
  },
  body: {
    x: DEFAULT_BODY_X,
    y: 270,
    rotation: -5,
    colorMode: 'gradient',
    colors: ['#7F52FF', '#E44857'],
    gradientAngle: 135,
  },
  face: {
    expression: 'greeting',
    eyeOffset: { x: 2, y: -1 },
  },
  limbs: {
    leftArm: { ctrl: { x: 162, y: 304 }, end: { x: 158, y: 348 } },
    rightArm: { ctrl: { x: 356, y: 274 }, end: { x: 376, y: 198 } },
    leftLeg: { ctrl: { x: 230, y: 368 }, end: { x: 222, y: 416 } },
    rightLeg: { ctrl: { x: 272, y: 368 }, end: { x: 280, y: 416 } },
  },
  feet: {
    enabled: true,
    left: 'left',
    right: 'right',
  },
  bubble: {
    enabled: true,
    position: 'top-right',
    text: 'Hello Kotlin!',
    fontSize: 'M',
  },
  accessories: [],
};

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function jitter(amount: number): number {
  return Math.round((Math.random() * 2 - 1) * amount);
}

const RANDOM_EXTRA_PALETTES: ColorPalettePreset[] = [
  ...COLOR_PALETTES,
  {
    id: 'sunset-kotlin',
    label: 'Sunset',
    colorMode: 'gradient',
    colors: ['#7F52FF', '#F88909'],
    gradientAngle: 120,
  },
  {
    id: 'indigo-cyan',
    label: 'Cyber',
    colorMode: 'gradient',
    colors: ['#6B57FF', '#00C2FF'],
    gradientAngle: 145,
  },
  {
    id: 'coral-rose',
    label: 'Coral',
    colorMode: 'solid',
    colors: ['#E44857', '#E44857'],
    gradientAngle: 135,
  },
];

const FOOT_COMBOS: Array<{ left: FootDirection; right: FootDirection }> = [
  { left: 'left', right: 'right' },
  { left: 'left', right: 'right' },
  { left: 'left', right: 'left' },
  { left: 'right', right: 'right' },
];

/**
 * Generates a surprising yet anatomically cohesive pose while preserving
 * the user's speech bubble, feet visibility, and placed accessories.
 */
export function generateRandomState(current: KodeeState): KodeeState {
  const palette = pickRandom(RANDOM_EXTRA_PALETTES);
  const expression = pickRandom(EXPRESSION_METAS).id;
  const rotation = Math.round((Math.random() * 2 - 1) * 20);
  const bodyY = Math.round(DEFAULT_BODY_Y + (Math.random() * 2 - 1) * 26);
  const bodyPos = { x: DEFAULT_BODY_X, y: bodyY };

  const leftArmPreset = pickRandom(ARM_PRESETS);
  const rightArmPreset = pickRandom(ARM_PRESETS);
  const leftLegPreset = pickRandom(LEG_PRESETS);
  const rightLegPreset = pickRandom(LEG_PRESETS);
  const footCombo = pickRandom(FOOT_COMBOS);

  const jitterLimb = (limb: LimbCurve, amount: number): LimbCurve => ({
    ctrl: {
      x: clampCoord(limb.ctrl.x + jitter(amount)),
      y: clampCoord(limb.ctrl.y + jitter(amount)),
    },
    end: {
      x: clampCoord(limb.end.x + jitter(amount)),
      y: clampCoord(limb.end.y + jitter(amount)),
    },
  });

  return {
    ...current,
    body: {
      x: bodyPos.x,
      y: bodyPos.y,
      rotation,
      colorMode: palette.colorMode,
      colors: [...palette.colors] as [string, string],
      gradientAngle: palette.gradientAngle,
    },
    face: {
      expression,
      eyeOffset: {
        x: Math.round((Math.random() * 2 - 1) * 5),
        y: Math.round((Math.random() * 2 - 1) * 3),
      },
    },
    limbs: {
      leftArm: jitterLimb(buildLimbFromPreset(leftArmPreset, 'left', bodyPos), 14),
      rightArm: jitterLimb(buildLimbFromPreset(rightArmPreset, 'right', bodyPos), 14),
      leftLeg: jitterLimb(buildLimbFromPreset(leftLegPreset, 'left', bodyPos), 10),
      rightLeg: jitterLimb(buildLimbFromPreset(rightLegPreset, 'right', bodyPos), 10),
    },
    feet: {
      enabled: current.feet.enabled,
      left: footCombo.left,
      right: footCombo.right,
    },
    bubble: { ...current.bubble },
    accessories: current.accessories,
  };
}
