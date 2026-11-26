import type { ExportSize, KodeeState } from '../types/kodee';

export type CopyImageOutcome =
  | { status: 'copied' }
  | { status: 'shared' }
  | { status: 'cancelled' }
  | { status: 'modal'; blob: Blob; filename: string };

export function isAndroidDevice(): boolean {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
}

export function formatTimestamp(date = new Date()): string {
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

export function triggerBlobDownload(blob: Blob, filename: string): void {
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
 * Copies plain text to the clipboard with an Android/WebView-safe fallback
 * when navigator.clipboard.writeText is unavailable or blocked.
 */
async function copyTextWithFallback(text: string): Promise<void> {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to selection-based copy
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.inputMode = 'none'; // Prevents Android soft keyboard from flashing open
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  textarea.style.fontSize = '16px';
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

async function loadSvgImage(src: string): Promise<HTMLImageElement> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'sync';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load SVG vector rendering.'));
    image.src = src;
  });

  // Ensure vector rasterization finishes completely before drawImage (prevents blank frames on Android Chrome)
  if (typeof img.decode === 'function') {
    try {
      await img.decode();
    } catch {
      // Some engines resolve onload already decoded and reject decode() for SVG data URIs
    }
  }

  return img;
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
  const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

  let img: HTMLImageElement;
  let objectUrl: string | null = null;

  try {
    try {
      img = await loadSvgImage(dataUri);
    } catch {
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      objectUrl = URL.createObjectURL(svgBlob);
      img = await loadSvgImage(objectUrl);
    }

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

    return pngBlob.type === 'image/png' ? pngBlob : new Blob([pngBlob], { type: 'image/png' });
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
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

export function canSharePngFiles(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') {
    return false;
  }
  if (typeof File === 'undefined') return false;
  try {
    const probe = new File([new Uint8Array([137, 80, 78, 71])], 'probe.png', {
      type: 'image/png',
    });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

export async function tryDirectClipboardPng(blobOrPromise: Blob | Promise<Blob>): Promise<boolean> {
  const supportsPngClipboard =
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard?.write === 'function' &&
    typeof ClipboardItem !== 'undefined' &&
    (typeof (ClipboardItem as unknown as { supports?: (type: string) => boolean }).supports !==
      'function' ||
      (ClipboardItem as unknown as { supports: (type: string) => boolean }).supports('image/png'));

  if (!supportsPngClipboard) {
    return false;
  }

  // Call navigator.clipboard.write synchronously inside the active user gesture
  try {
    const item = new ClipboardItem({ 'image/png': blobOrPromise });
    await navigator.clipboard.write([item]);
    return true;
  } catch {
    // If a Promise<Blob> failed (common on older mobile Chromium), retry once with the resolved Blob
    if (blobOrPromise instanceof Promise) {
      try {
        const resolved = await blobOrPromise;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': resolved })]);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export async function tryNativeSharePng(
  blob: Blob,
  filename: string,
): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.share !== 'function' ||
    typeof File === 'undefined'
  ) {
    return 'unsupported';
  }

  const file = new File([blob], filename, { type: 'image/png' });
  if (typeof navigator.canShare === 'function' && !navigator.canShare({ files: [file] })) {
    return 'unsupported';
  }

  try {
    // Keep payload strictly to { files } so Android target apps (WhatsApp, Slack, Gboard Copy) never reject mixed intents
    await navigator.share({ files: [file] });
    return 'shared';
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return 'cancelled';
    }
    return 'unsupported';
  }
}

/**
 * Copies the rendered PNG with dedicated Android & desktop strategies:
 * - On Android: web ClipboardItem('image/png') is widely dropped or unpasteable across Gboard,
 *   Samsung Keyboard, WhatsApp, and Slack. When a pre-rendered Blob is ready, we synchronously
 *   open Android's native Share/Copy sheet (which includes Android's native Copy button that writes
 *   a genuine content:// image URI to the system clipboard). If native share isn't available
 *   (Firefox Android, WebView, iframe), we return a rendered image modal for native long-press Copy.
 * - On Desktop: writes synchronously to navigator.clipboard with the pre-rendered Blob (or Promise<Blob>),
 *   falling back to the Copy Image modal only if clipboard access is blocked (e.g. iframe policy).
 */
export async function copyKodeePngToClipboard(
  svgElement: SVGSVGElement,
  size: ExportSize,
  transparentBackground: boolean,
  cachedBlob?: Blob | null,
): Promise<CopyImageOutcome> {
  const filename = `kodee-studio-${formatTimestamp()}.png`;

  if (isAndroidDevice()) {
    // If we already pre-rendered the PNG blob in memory, invoke native Android Share/Copy synchronously inside the tap
    if (cachedBlob) {
      const shareResult = await tryNativeSharePng(cachedBlob, filename);
      if (shareResult === 'shared') return { status: 'shared' };
      if (shareResult === 'cancelled') return { status: 'cancelled' };
      return { status: 'modal', blob: cachedBlob, filename };
    }

    // If user tapped before background pre-render finished, render now and attempt share or show native long-press modal
    const blob = await renderSvgToPngBlob(svgElement, size, transparentBackground);
    const shareResult = await tryNativeSharePng(blob, filename);
    if (shareResult === 'shared') return { status: 'shared' };
    if (shareResult === 'cancelled') return { status: 'cancelled' };
    return { status: 'modal', blob, filename };
  }

  // Desktop / iOS Safari path: preserve transient user activation synchronously
  const blobOrPromise = cachedBlob ?? renderSvgToPngBlob(svgElement, size, transparentBackground);
  const copied = await tryDirectClipboardPng(blobOrPromise);
  if (copied) {
    return { status: 'copied' };
  }

  const resolvedBlob = await blobOrPromise;
  return { status: 'modal', blob: resolvedBlob, filename };
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
