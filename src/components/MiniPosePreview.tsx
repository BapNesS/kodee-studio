import React from 'react';
import type { GlobalPosePreset } from '../data/presets';
import type { ExpressionId, KodeeState } from '../types/kodee';
import { KodeeFaceExpression, KodeeSvg } from './KodeeSvg';

interface MiniPosePreviewProps {
  preset: GlobalPosePreset;
  bodyStyle: Pick<KodeeState['body'], 'colorMode' | 'colors' | 'gradientAngle'>;
}

export const MiniPosePreview: React.FC<MiniPosePreviewProps> = React.memo(({ preset, bodyStyle }) => {
  const previewState: KodeeState = {
    version: '1.0',
    background: { color: 'transparent' },
    body: {
      x: preset.body.x,
      y: preset.body.y,
      rotation: preset.body.rotation,
      colorMode: bodyStyle.colorMode,
      colors: bodyStyle.colors,
      gradientAngle: bodyStyle.gradientAngle,
    },
    face: preset.face,
    limbs: preset.limbs,
    feet: {
      enabled: true,
      left: preset.feet.left,
      right: preset.feet.right,
    },
    bubble: {
      enabled: false,
      position: 'top-right',
      text: '',
      fontSize: 'M',
    },
    accessories: [],
  };

  return (
    <div className="w-12 h-12 shrink-0 flex items-center justify-center">
      <KodeeSvg state={previewState} interactive={false} showHandles={false} />
    </div>
  );
});

MiniPosePreview.displayName = 'MiniPosePreview';

export const MiniFacePreview: React.FC<{ expression: ExpressionId }> = React.memo(({ expression }) => {
  return (
    <svg viewBox="-58 -26 116 72" className="w-14 h-9 shrink-0">
      <rect x={-56} y={-24} width={112} height={68} rx={11} fill="#09090D" stroke="#2D3040" strokeWidth={2} />
      <KodeeFaceExpression expression={expression} eyeOffset={{ x: 0, y: 0 }} />
    </svg>
  );
});

MiniFacePreview.displayName = 'MiniFacePreview';
