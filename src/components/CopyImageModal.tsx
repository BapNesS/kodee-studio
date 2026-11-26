import React, { useEffect, useState } from 'react';
import { Check, Copy, Download, Share2, X } from 'lucide-react';
import {
  canSharePngFiles,
  isAndroidDevice,
  triggerBlobDownload,
  tryDirectClipboardPng,
  tryNativeSharePng,
} from '../utils/exportPng';

interface CopyImageModalProps {
  blob: Blob | null;
  filename: string;
  transparentBackground: boolean;
  onClose: () => void;
  onNotify: (kind: 'success' | 'error', text: string) => void;
}

export const CopyImageModal: React.FC<CopyImageModalProps> = ({
  blob,
  filename,
  transparentBackground,
  onClose,
  onNotify,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copiedDirect, setCopiedDirect] = useState(false);

  useEffect(() => {
    if (!blob) {
      setImageUrl(null);
      return;
    }
    // Use a data URL so Android Chrome / Firefox / WebView native long-press "Copy image" works everywhere
    let cancelled = false;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (!cancelled && typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(blob);
    return () => {
      cancelled = true;
    };
  }, [blob]);

  useEffect(() => {
    if (!blob) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [blob, onClose]);

  if (!blob) return null;

  const android = isAndroidDevice();
  const supportsShare = canSharePngFiles();

  const handleShare = async () => {
    const result = await tryNativeSharePng(blob, filename);
    if (result === 'shared') {
      onNotify('success', 'PNG shared successfully.');
      onClose();
    } else if (result === 'unsupported') {
      onNotify('error', 'Native sharing is not available in this browser — long-press the image to copy.');
    }
  };

  const handleDirectClipboard = async () => {
    const ok = await tryDirectClipboardPng(blob);
    if (ok) {
      setCopiedDirect(true);
      onNotify('success', 'PNG copied to clipboard.');
      setTimeout(() => setCopiedDirect(false), 1800);
    } else {
      onNotify(
        'error',
        android
          ? 'Browser blocked direct clipboard write — long-press the image above and tap "Copy image".'
          : 'Browser blocked direct clipboard write — right-click the image above and select "Copy image".',
      );
    }
  };

  const handleDownload = () => {
    triggerBlobDownload(blob, filename);
    onNotify('success', `Image downloaded: ${filename}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="copy-image-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-[#14151A] border border-[#262834] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-[#232530]">
          <h2 id="copy-image-modal-title" className="text-sm font-semibold text-white">
            Copy or Share PNG
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close copy dialog"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#9EA2B4] hover:text-white hover:bg-[#1E202A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Native <img> element enables OS-level long-press "Copy image" on Android Chrome, Firefox, Samsung & WebViews */}
          <div
            className={`aspect-square w-full max-w-[260px] mx-auto rounded-xl overflow-hidden border border-white/10 flex items-center justify-center ${
              transparentBackground ? 'transparency-checkerboard' : 'bg-[#0B0C10]'
            }`}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Kodee Studio PNG"
                className="w-full h-full object-contain select-auto"
                style={{ WebkitTouchCallout: 'default' }}
              />
            ) : (
              <span className="text-xs text-[#7D8193]">Preparing PNG...</span>
            )}
          </div>

          <p className="text-xs text-[#B4B8C9] text-center leading-relaxed">
            {android
              ? 'Long-press the image above and tap "Copy image", or use Share below to copy or send directly to any app.'
              : 'Right-click the image above and select "Copy image", or download the PNG file.'}
          </p>

          <div className="flex flex-col gap-2">
            {supportsShare && (
              <button
                type="button"
                onClick={handleShare}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#7F52FF] hover:bg-[#906BFF] transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                Share / Copy via Android
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDirectClipboard}
                className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium text-[#E4E6F0] bg-[#1E202A] border border-[#2C2F3E] hover:bg-[#252836] transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedDirect ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                ) : (
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {copiedDirect ? 'Copied' : 'Copy PNG'}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium text-[#E4E6F0] bg-[#1E202A] border border-[#2C2F3E] hover:bg-[#252836] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
