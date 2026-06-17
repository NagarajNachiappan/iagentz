# iagentz.ai

Marketing site for **iagentz.ai** — AI agents that work as a team. A system of
specialized agents (Planner, Researcher, Builder, Critic, Orchestrator) that plan,
research, build, and review together instead of waiting for the next prompt.

## Stack

Zero dependencies, zero build step. Plain static HTML/CSS/JS — open `index.html`
in any browser or deploy the folder to any static host.

- `index.html` — markup
- `styles.css` — "premium glass" design system (glassmorphism, refined palette)
- `main.js` — live 3D agent swarm (canvas), animated message feed, scroll reveals,
  count-up metrics, form handling
- `assets/agents/` — agent imagery (avatars + cinematic hero scene)
- `refdocs/` — source reference images

## Develop

No tooling required. To preview locally:

```bash
# any static server, e.g.
python -m http.server 8000
# then open http://localhost:8000
```

## Design

Aesthetic: premium glass — frosted-glass surfaces, a disciplined violet + cyan
accent palette, soft glows, slow motion, and photoreal agent imagery. Responsive
down to mobile; respects `prefers-reduced-motion`.
