import type { ExportSize, KodeeState } from '../types/kodee';

function formatTimestamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
  ].join('');
}

/**
 * Produces clean standalone SVG markup from the live Kodee <svg> node,
 * stripping interactive handles, editor inline cursor styles, and optional background.
 */
export function serializeCleanSvg(
  svgElement: SVGSVGElement,
  transparentBackground: boolean,
  dimension = 500,
): string {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(dimension));
  clone.setAttribute('height', String(dimension));
  clone.setAttribute('viewBox', '0 0 500 500');
  clone.removeAttribute('class');
  clone.removeAttribute('style');

  const handlesLayer = clone.querySelector('#layer-handles');
  if (handlesLayer) {
    handlesLayer.remove();
  }

  if (transparentBackground) {
    const bgLayer = clone.querySelector('#layer-background');
    if (bgLayer) {
      bgLayer.remove();
    }
  }

  // Strip interactive editor styles (e.g., cursor: grab) from exported vector nodes
  clone.querySelectorAll('[style]').forEach((node) => {
    node.removeAttribute('style');
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}

/**
 * Rasterizes the live Kodee <svg> node to a crisp PNG Blob without external requests
 * or tainted-canvas issues (strips interactive handles and optional background).
 */
export async function renderSvgToPngBlob(
  svgElement: SVGSVGElement,
  size: ExportSize,
  transparentBackground: boolean,
): Promise<Blob> {
  const svgString = serializeCleanSvg(svgElement, transparentBackground, size);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load SVG vector rendering.'));
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D Canvas context is unavailable.');
    }

    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);

    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), 'image/png'),
    );

    if (!pngBlob) {
      throw new Error('Failed to generate PNG file.');
    }

    return pngBlob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadKodeePng(
  svgElement: SVGSVGElement,
  size: ExportSize,
  transparentBackground: boolean,
): Promise<string> {
  const blob = await renderSvgToPngBlob(svgElement, size, transparentBackground);
  const filename = `kodee-pose-${formatTimestamp()}.png`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}

export async function copyKodeePngToClipboard(
  svgElement: SVGSVGElement,
  size: ExportSize,
  transparentBackground: boolean,
): Promise<void> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new Error('Copying images to the clipboard is not supported in this browser.');
  }
  const blob = await renderSvgToPngBlob(svgElement, size, transparentBackground);
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

export function downloadKodeeSvg(
  svgElement: SVGSVGElement,
  transparentBackground: boolean,
): string {
  const filename = `kodee-pose-${formatTimestamp()}.svg`;
  const svgMarkup = `<?xml version="1.0" encoding="UTF-8"?>\n${serializeCleanSvg(
    svgElement,
    transparentBackground,
    500,
  )}`;
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}

export async function copyKodeeSvgToClipboard(
  svgElement: SVGSVGElement,
  transparentBackground: boolean,
): Promise<void> {
  const svgMarkup = serializeCleanSvg(svgElement, transparentBackground, 500);
  await navigator.clipboard.writeText(svgMarkup);
}

export function downloadKodeeJson(state: KodeeState): string {
  const filename = `kodee-pose-${formatTimestamp()}.json`;
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}

export async function copyKodeeJsonToClipboard(state: KodeeState): Promise<void> {
  const json = JSON.stringify(state, null, 2);
  await navigator.clipboard.writeText(json);
}
