# iagentz.ai

Marketing site for **iagentz.ai** — custom-trained autonomous AI agents that live
in your stack. Memory, logic, and action layers, not chatbots. The site covers the
platform (Discover / Build / Govern / Optimize), Skill Shadowing, the Human
Operating System, and a healthcare-focused FAQ (EHR, HIPAA, clinical agents).

## Stack

- **React 19** + **Vite** — static single-page app, client-rendered.
- **Tailwind CSS v4** (`@tailwindcss/vite`) with an OKLCH dark cyan/magenta theme.
- Zero backend. `npm run build` emits a fully static `dist/` for any CDN.

```
index.html        # Vite entry (head meta, fonts, #root)
src/main.tsx       # React entry
src/App.tsx        # the landing page + all sections
src/styles.css     # Tailwind v4 theme + custom utilities/animations
src/assets/        # bundled imagery
.github/workflows/ # CI: build + deploy to AWS S3/CloudFront
```

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # -> dist/
npm run preview    # serve the production build
```

## Deploy

Pushes to `main` build and deploy to AWS S3 + CloudFront via GitHub Actions.
Full one-time AWS setup, GitHub secrets, and GoDaddy DNS instructions are in
[DEPLOY.md](./DEPLOY.md).
