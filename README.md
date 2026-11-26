# Kodee Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-7F52FF.svg)](./LICENSE)
[![Live Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-E44857.svg)](https://bapness.github.io/kodee-studio/)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-FFDD00.svg?logo=buy-me-a-coffee&logoColor=000)](https://buymeacoffee.com/bapness)

A **100% client-side interactive vector studio** for posing the Kotlin mascot **Kodee**, customizing expressions, colors, props, and speech bubbles, and exporting crisp **HD PNG**, **SVG**, or reusable **JSON** scenes — right in your browser with zero backend dependencies.

---

## Features

- **100% Procedural Vector Rendering** — Every limb, face expression, accessory, and speech bubble is generated dynamically in clean inline SVG.
- **Full-Body Presets & Direct Canvas Manipulation**
  - **13 global poses** (*Walking, Happy, Greeting, Cute, Relaxing, Running, Jumping, Sitting, Sad, In love, Angry, Shocked, Dancing*) plus modular arm and leg presets.
  - **Drag & drop directly on the canvas** to reposition hands, feet, elbows, knees, body tilt, and body offset.
  - **1 or 2 bend points per limb** for smooth curves or expressive S-bends.
  - **Movable body joints** to attach arms or legs anywhere along Kodee's body.
  - **Arms in front of head** toggle per arm so Kodee's hands can overlap the face screen.
  - **Toggleable oriented feet** (left/right direction per foot).
- **28 Facial Expressions & Gaze Control** — From *Neutral*, *Greeting*, and *In love* to *Starry*, *Code*, *Loading*, *Sleepy*, and *Fire*, paired with a 9-way gaze pad and fine X/Y offsets.
- **32 Vector Accessories & Props** — Beanie, scarf, sunglasses, crown, headphones, mug, laptop, ice skates, skateboard, heart, sparkles, and more — draggable, scalable, rotatable, flippable, tintable, and layerable (`Front` / `Back`).
- **Colors & Backgrounds** — Official Kotlin palettes, custom solid or linear gradients with angle control, and solid or transparent canvas backgrounds.
- **Native Vector Speech Bubbles** — Multi-line auto-sizing speech bubbles with top-left/top-right positioning, font sizes, and automatic contrast borders.
- **Flexible Export & Import**
  - **PNG** export at `256 × 256`, `1024 × 1024`, or `2048 × 2048 px` (with optional alpha transparency), plus clipboard copy & native mobile share support.
  - **SVG** vector download and copy.
  - **JSON** save, copy, and drag-and-drop / paste import to share and remix poses.
- **Responsive UI** — Split-screen studio on desktop and touch-friendly stacked workspace on tablets and phones, with undo/redo (`Ctrl+Z` / `Ctrl+Shift+Z`) and a pose randomizer.

---

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22+

### Local Development

```bash
# Clone the repository
git clone https://github.com/bapness/kodee-studio.git
cd kodee-studio

# Install dependencies
npm install

# Start the development server (http://localhost:3000)
npm run dev
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server on port `3000` |
| `npm run build` | Builds the production static bundle into `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |

---

## Deployment (GitHub Pages)

This repository includes a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that automatically type-checks, builds the bundle with relative asset paths, and deploys to GitHub Pages on every push to `main` (or via manual trigger).

To enable it on a fork, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

---

## Support

Having fun posing Kodee for your slides, talks, docs, or stickers?
If you'd like to support the project and fuel future updates, you can [buy me a coffee](https://buymeacoffee.com/bapness)!

---

## Disclaimer

Kodee is the official mascot of the [Kotlin](https://kotlinlang.org/) programming language by JetBrains. Kodee Studio is an independent community-built creative tool and is not officially affiliated with or endorsed by JetBrains.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.
