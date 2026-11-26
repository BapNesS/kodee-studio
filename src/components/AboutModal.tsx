import React, { useEffect } from 'react';
import {
  BookOpen,
  Code2,
  Coffee,
  Cpu,
  ExternalLink,
  Heart,
  Terminal,
  Users,
  X,
} from 'lucide-react';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

interface ResourceLink {
  title: string;
  description: string;
  url: string;
}

interface ResourceCategory {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  links: ResourceLink[];
}

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    title: 'Official Resources & Documentation',
    icon: BookOpen,
    links: [
      {
        title: 'Kotlin Official Website',
        description:
          'The official home for news, downloads, and overview of multiplatform capabilities.',
        url: 'https://kotlinlang.org/',
      },
      {
        title: 'Official Kotlin Documentation',
        description:
          'Comprehensive documentation, standard library reference, and language specifications.',
        url: 'https://kotlinlang.org/docs/home.html',
      },
      {
        title: 'Kotlin Standard Library API Reference',
        description:
          'Complete reference for all standard types, collections, and utilities.',
        url: 'https://kotlinlang.org/api/core/kotlin-stdlib/',
      },
      {
        title: 'Kotlin Multiplatform (KMP)',
        description:
          'Official guides for sharing code between Android, iOS, desktop, and backend.',
        url: 'https://kotlinlang.org/docs/multiplatform.html',
      },
    ],
  },
  {
    title: 'Interactive Learning & Practice',
    icon: Terminal,
    links: [
      {
        title: 'Kotlin Playground',
        description:
          'An online sandbox to write, compile, and run Kotlin directly in your browser.',
        url: 'https://play.kotlinlang.org/',
      },
    ],
  },
  {
    title: 'Advanced Topics & Asynchronous Programming',
    icon: Cpu,
    links: [
      {
        title: 'Kotlin Coroutines Guide',
        description:
          'The definitive guide to non-blocking, asynchronous programming in Kotlin.',
        url: 'https://kotlinlang.org/docs/coroutines-guide.html',
      },
      {
        title: 'kotlinx.coroutines GitHub Repository',
        description:
          'Library documentation, reactive streams integration (Flow), and issue tracker.',
        url: 'https://github.com/Kotlin/kotlinx.coroutines',
      },
      {
        title: 'kotlinx.serialization',
        description:
          'Official multiplatform serialization library for JSON, Protobuf, CBOR, and more.',
        url: 'https://github.com/Kotlin/kotlinx.serialization',
      },
    ],
  },
  {
    title: 'Community, News & Community Links',
    icon: Users,
    links: [
      {
        title: 'Official Kotlin GitHub Repository',
        description:
          'Source code of the Kotlin compiler, standard library, and language evolution proposals (KEEP).',
        url: 'https://github.com/JetBrains/kotlin',
      },
      {
        title: 'Kotlin Community Slack',
        description:
          'Active Slack workspace with channels dedicated to Android, multiplatform, coroutines, and web.',
        url: 'https://surveys.jetbrains.com/s3/kotlin-slack-sign-up',
      },
    ],
  },
];

export const AboutModal: React.FC<AboutModalProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[88dvh] flex flex-col rounded-2xl bg-[#14151A] border border-[#262834] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-[#232530] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <svg
              viewBox="-72 -72 144 132"
              className="w-8 h-8 shrink-0"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="about-kodee-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7F52FF" />
                  <stop offset="100%" stopColor="#E44857" />
                </linearGradient>
              </defs>
              <path
                d="M -66 41 Q -66 54 -53 54 L 53 54 Q 66 54 66 41 L 66 -54 Q 66 -68 53 -61 L 7 -36 Q 0 -32 -7 -36 L -53 -61 Q -66 -68 -66 -54 Z"
                fill="url(#about-kodee-grad)"
              />
              <rect x={-55} y={-24} width={110} height={67} rx={11} fill="#09090D" />
              <circle cx={-22} cy={7} r={13} fill="none" stroke="#FFFFFF" strokeWidth={6} />
              <circle cx={22} cy={7} r={13} fill="none" stroke="#FFFFFF" strokeWidth={6} />
            </svg>
            <div className="min-w-0">
              <h2
                id="about-modal-title"
                className="text-base sm:text-lg font-bold tracking-tight text-white truncate"
              >
                About Kodee Studio
              </h2>
              <p className="text-xs text-[#8F93A6] truncate">
                Client-side procedural vector studio for posing the Kotlin mascot
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close About dialog"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#9EA2B4] hover:text-white hover:bg-[#1E202A] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto studio-scroll px-5 sm:px-6 py-5 space-y-6">
          {/* Project Repository & Support Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://github.com/bapness/kodee-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between gap-3 p-4 rounded-xl bg-[#191B23] border border-[#262834] hover:border-[#7F52FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#A78BFA]">
                  <Code2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Open Source Project</span>
                </div>
                <ExternalLink
                  className="w-3.5 h-3.5 text-[#7D8193] group-hover:text-white transition-colors shrink-0"
                  aria-hidden="true"
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-[#C4B5FD] transition-colors">
                  bapness/kodee-studio
                </div>
                <p className="text-xs text-[#8F93A6] mt-1 leading-relaxed">
                  Explore the source code, star the repo, report issues, or contribute new presets on GitHub.
                </p>
              </div>
            </a>

            <a
              href="https://buymeacoffee.com/bapness"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between gap-3 p-4 rounded-xl bg-amber-500/[0.08] border border-amber-400/25 hover:border-amber-400/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <Coffee className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Buy Me a Coffee</span>
                </div>
                <ExternalLink
                  className="w-3.5 h-3.5 text-amber-300/70 group-hover:text-amber-200 transition-colors shrink-0"
                  aria-hidden="true"
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors">
                  Support Kodee Studio
                </div>
                <p className="text-xs text-[#B9BDD0] mt-1 leading-relaxed">
                  Having fun posing Kodee for your slides, docs, or talks? Fuel future updates with a coffee — thank you!
                </p>
              </div>
            </a>
          </div>

          <hr className="border-[#232530]" />

          {/* Kotlin Resource Sections */}
          <div className="space-y-5">
            {RESOURCE_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <section key={category.title} className="space-y-2.5">
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9EA2B4]">
                    <Icon className="w-3.5 h-3.5 text-[#9B7BFF] shrink-0" aria-hidden="true" />
                    <span>{category.title}</span>
                  </h3>

                  <div className="space-y-2">
                    {category.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start justify-between gap-3 p-3.5 rounded-xl bg-[#191B23] border border-[#252734] hover:border-[#3E4257] hover:bg-[#1D202A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F52FF]"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white group-hover:text-[#C4B5FD] transition-colors">
                            {link.title}
                          </div>
                          <p className="text-xs text-[#8F93A6] mt-0.5 leading-relaxed">
                            {link.description}
                          </p>
                        </div>
                        <ExternalLink
                          className="w-3.5 h-3.5 text-[#6D7185] group-hover:text-white transition-colors shrink-0 mt-1"
                          aria-hidden="true"
                        />
                      </a>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#232530] bg-[#111217] flex items-center justify-between gap-3 text-xs text-[#7D8193] shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-[#E44857] fill-[#E44857]" aria-hidden="true" />
            <span>for the Kotlin community</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#232634] hover:bg-[#2E3245] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
