# Portfolio UI Refactor — Agent Instructions

## Source of truth

Read `PORTFOLIO_REDESIGN_SPEC.md` before making UI/UX changes.

The specification defines the intended visual system, layout,
typography, card system, responsive behavior and page-level designs.

Do not reinterpret the project as a generic developer portfolio.

## Primary objective

Refactor the existing portfolio into an image-led,
editorial/research-oriented portfolio inspired by the principles
documented in `PORTFOLIO_REDESIGN_SPEC.md`.

The desired balance is:

- minimal but visibly designed
- academic/research oriented
- engineering focused
- image driven
- block/card based
- readable and restrained

Avoid an AI-startup aesthetic.

## Architecture constraints

Do not introduce a new frontend framework.

Do not migrate the site to React, Next.js, Astro, Vue, Svelte,
Tailwind, Bootstrap, or another framework unless explicitly requested.

Prefer the existing HTML/CSS/JavaScript architecture.

Do not add dependencies unless they solve a concrete problem that
cannot reasonably be solved with the existing stack.

## Content constraints

Do not rewrite portfolio content unless explicitly requested.

Preserve:

- blog content
- thoughts content
- project content
- achievements
- photography
- publications
- external links
- resume links

Minor markup changes required for presentation are allowed.

## CMS constraints

The existing local Node-based content workflow must continue working.

Do not change existing Blog or Thought data formats unless explicitly
approved.

Do not break scripts used to create or update Blog/Thought content.

Existing content must render without requiring manual migration.

## URL constraints

Preserve existing public URLs.

Existing blog URLs must continue working.

Do not rename routes or content identifiers unless explicitly requested.

## Theme constraints

Preserve both dark and light themes.

New components must work correctly in both themes.

Use shared design tokens/CSS custom properties rather than duplicating
theme values throughout individual components.

## Design constraints

Follow `PORTFOLIO_REDESIGN_SPEC.md`.

Prefer authentic portfolio imagery:
hardware, prototypes, PCBs, screenshots, architecture diagrams,
publication figures, event photographs and photography.

Do not introduce AI-generated decorative artwork.

Avoid:

- excessive gradients
- glassmorphism
- glow effects
- parallax
- cursor effects
- unnecessary animation
- large decorative blobs
- excessive shadows

Motion should be subtle and functional.

## Accessibility

Preserve semantic HTML.

All interactive elements must be keyboard accessible.

Do not remove visible focus indicators.

Images require appropriate alt text.

Respect `prefers-reduced-motion`.

Maintain sufficient text/background contrast.

## Performance

Avoid unnecessary JavaScript.

Lazy-load non-critical images.

Prevent layout shift by declaring image dimensions or aspect ratios.

Prefer responsive optimized images where practical.

Do not add large UI libraries for small visual effects.

## Implementation workflow

Implement the redesign incrementally.

Do not redesign multiple major pages in one task unless explicitly asked.

Before modifying a page:

1. inspect the existing implementation
2. identify dependencies and shared styles
3. explain the intended changes
4. implement only the requested phase
5. run available checks/tests
6. report files changed and anything requiring visual review

Do not perform unrelated cleanup.

## Regression requirements

After relevant changes, verify:

- existing routes
- navigation
- dark theme
- light theme
- mobile layout
- Blog rendering
- Thoughts rendering
- Projects filtering
- existing CMS-generated content
- external links
- keyboard navigation
- image loading
- console errors

## Git

Work only on the current redesign branch.

Do not merge into `main`.

Do not rewrite Git history.

Do not make commits unless explicitly asked to commit.