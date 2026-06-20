# personal-starter

a Next.js starter wired with the workspace aesthetic — washi paper, sumi ink, vermillion seal. copy this folder to begin a new project.

## quick start

from the workspace root:

```bash
cp -R _template my-new-project
cd my-new-project
npm install
git init && git add . && git commit -m "init"
npm run dev
```

open http://localhost:3000.

## what's wired

- **next.js 14** (app router, RSC, TypeScript)
- **tailwind** with the standard shadcn token shape (so `npx shadcn add ...` works out of the box)
- **shippori mincho** loaded via `next/font/google` in [app/layout.tsx](app/layout.tsx)
- the full **design system** (palette, paper texture, six keyframes, six animation utility classes, staggered delays, link/social/focus styles, reduced-motion handling) in [app/globals.css](app/globals.css)
- a sample [app/page.tsx](app/page.tsx) demonstrating the language: hanko seal, brush divider, ink wash, plum blossom, link-brush, social icons
- one shadcn component to demo wiring: [components/ui/button.tsx](components/ui/button.tsx) + [lib/utils.ts](lib/utils.ts)
- shadcn config in [components.json](components.json): `new-york`, RSC, slate base, `@/*` aliases

## what to do first

1. rename in [package.json](package.json) (`name` field).
2. update metadata in [app/layout.tsx](app/layout.tsx).
3. replace the body of [app/page.tsx](app/page.tsx) with the actual project. delete motifs you don't need; keep the ones that fit.
4. read the workspace's `DESIGN.md` and `AGENTS.md` if you haven't recently.

## adding shadcn components

```bash
npx shadcn@latest add dialog input label
```

components land in `components/ui/`. they use the css-variables already declared in `globals.css`'s `:root`.

## adding deps you'll likely want

trimmed by default. add as needed:

```bash
# forms
npm i react-hook-form @hookform/resolvers zod
# email contact form
npm i @emailjs/browser
# animation library
npm i gsap
# 3d / shaders
npm i three ogl postprocessing
```

## design language

source of truth lives in the workspace root:

- `../tokens.css` — canonical CSS variables
- `../DESIGN.md` — palette, type, motion, motif recipes
- `../AGENTS.md` — short rules for AI agents

if you change the language in this project's [app/globals.css](app/globals.css), consider mirroring it back into `../tokens.css` so future projects inherit it.

## stack notes

- node `>= 24.x`
- single column, `max-w-2xl`, lowercase typography — see `../DESIGN.md` before laying anything out
