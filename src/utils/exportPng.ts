import type { ExportSize, KodeeState } from '../types/kodee';

export type CopyImageResult = 'copied' | 'shared' | 'downloaded' | 'cancelled';

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

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Copies plain text to the clipboard with a mobile/Android-safe execCommand fallback
 * when navigator.clipboard.writeText is unavailable or blocked (e.g. WebViews, older Android browsers).
 */
async function copyTextWithFallback(text: string): Promise<void> {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to legacy textarea selection copy
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.contentEditable = 'true';
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  textarea.style.fontSize = '16px'; // Prevents mobile auto-zoom on focus
  document.body.appendChild(textarea);

  const activeEl = document.activeElement as HTMLElement | null;
  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    if (!ok) {
      throw new Error('Clipboard copy was rejected by this browser.');
    }
  } finally {
    document.body.removeChild(textarea);
    activeEl?.focus?.({ preventScroll: true });
  }
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
  const filename = `kodee-studio-${formatTimestamp()}.png`;
  triggerBlobDownload(blob, filename);
  return filename;
}

/**
 * Copies the rendered PNG to the clipboard with full Android / mobile compatibility:
 * 1. Invokes navigator.clipboard.write synchronously with a Promise<Blob> inside ClipboardItem
 *    to preserve transient user activation on Android Chrome & Safari.
 * 2. Retries with a resolved Blob for older Chromium engines that reject Promise items.
 * 3. Falls back to the native Android Web Share sheet (navigator.share with PNG file)
 *    when direct binary image clipboard writes are unsupported or blocked.
 * 4. As a last resort, downloads the PNG file directly so the user always gets the image.
 */
export async function copyKodeePngToClipboard(
  svgElement: SVGSVGElement,
  size: ExportSize,
  transparentBackground: boolean,
): Promise<CopyImageResult> {
  // Start rendering immediately while still inside the synchronous user gesture
  const pngPromise = renderSvgToPngBlob(svgElement, size, transparentBackground);

  const canAttemptClipboardWrite =
    typeof navigator.clipboard?.write === 'function' &&
    typeof ClipboardItem !== 'undefined' &&
    (typeof (ClipboardItem as unknown as { supports?: (type: string) => boolean }).supports !==
      'function' ||
      (ClipboardItem as unknown as { supports: (type: string) => boolean }).supports('image/png'));

  if (canAttemptClipboardWrite) {
    // 1. Synchronous Promise<Blob> write — keeps transient user activation alive on Android Chrome / iOS Safari
    try {
      const asyncItem = new ClipboardItem({ 'image/png': pngPromise });
      await navigator.clipboard.write([asyncItem]);
      return 'copied';
    } catch (firstErr) {
      // 2. Fallback for older mobile Chromium versions that only accept a resolved Blob in ClipboardItem
      const isTypeError = firstErr instanceof TypeError;
      if (isTypeError) {
        try {
          const blob = await pngPromise;
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          return 'copied';
        } catch {
          // Continue to Android Web Share / download fallback
        }
      }
    }
  }

  const blob = await pngPromise;
  const filename = `kodee-studio-${formatTimestamp()}.png`;

  // 3. Native Android / mobile Share Sheet fallback (allows copying/sending PNG directly)
  if (typeof navigator.share === 'function' && typeof File !== 'undefined') {
    const file = new File([blob], filename, { type: 'image/png' });
    const canShareFile =
      typeof navigator.canShare === 'function' ? navigator.canShare({ files: [file] }) : false;

    if (canShareFile) {
      try {
        await navigator.share({
          files: [file],
          title: 'Kodee Studio',
        });
        return 'shared';
      } catch (shareErr) {
        if (shareErr instanceof DOMException && shareErr.name === 'AbortError') {
          return 'cancelled';
        }
        // If share failed for another reason, fall back to direct download
      }
    }
  }

  // 4. Guaranteed fallback: download the PNG file directly
  triggerBlobDownload(blob, filename);
  return 'downloaded';
}

export function downloadKodeeSvg(
  svgElement: SVGSVGElement,
  transparentBackground: boolean,
): string {
  const filename = `kodee-studio-${formatTimestamp()}.svg`;
  const svgMarkup = `<?xml version="1.0" encoding="UTF-8"?>\n${serializeCleanSvg(
    svgElement,
    transparentBackground,
    500,
  )}`;
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  triggerBlobDownload(blob, filename);
  return filename;
}

export async function copyKodeeSvgToClipboard(
  svgElement: SVGSVGElement,
  transparentBackground: boolean,
): Promise<void> {
  const svgMarkup = serializeCleanSvg(svgElement, transparentBackground, 500);
  await copyTextWithFallback(svgMarkup);
}

export function downloadKodeeJson(state: KodeeState): string {
  const filename = `kodee-studio-${formatTimestamp()}.json`;
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  triggerBlobDownload(blob, filename);
  return filename;
}

export async function copyKodeeJsonToClipboard(state: KodeeState): Promise<void> {
  const json = JSON.stringify(state, null, 2);
  await copyTextWithFallback(json);
}
