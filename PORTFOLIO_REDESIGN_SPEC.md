# Portfolio Redesign Specification

## Executive Summary  
We will refactor the portfolio into a **block-style, image-driven academic/editorial design**. The new UI uses card-based components and clear typographic hierarchy to distinguish content. DeepMind’s News page and Co‑Scientist article demonstrate many good patterns: each news item is a “card” with an image, title, and metadata. We will borrow these ideas (large header images, section headings, content cards) while enforcing a consistent grid and color system. Key changes include grouping achievements by year, adding distinct badges, and improving the blog layout with featured and grid listings. The design remains **minimal** (flat colors, simple hover transitions) but uses images and clear type to create visual interest. All changes respect the existing repository (plain HTML/CSS/JS, no new frameworks) and keep the local Node‑based CMS contract intact. Accessibility (semantic markup, ARIA, keyboard nav) and performance (lazy-loading, optimization) are priorities. The following sections detail goals, component specs, and a rollout plan.

## Design Goals and Constraints  
- **Existing Structure:** Maintain current static-site architecture (no new frontend framework). We’ll update the HTML/CSS/JS files (and any templates) in-place. The Node CMS output (e.g. `blogs-data.js`, `thoughts-data.js`) must still feed the UI without breaking. Avoid altering data formats or build scripts.  
- **Visual Simplicity:** Aim for an **academic-professional look**. Use neutral dark colors with limited accents. No heavy animations or AI-generated flourishes. Transitions are short and subtle (e.g. `0.15s` fade or scale on hover).  
- **Block UI:** Present content in discrete “cards” or panels. Each block has a mild border, slight rounding, and internal padding for clarity. Use images prominently (one per block) to differentiate entries at a glance. Each card’s image ratio should be consistent (we suggest square or 4:3; DeepMind mostly uses 1:1 images).  
- **Dark Mode Friendly:** Use a dark background (`#121212` or similar) with lighter card background (`#1e1e1e`) and high-contrast text (`#e0e0e0`). Accent colors can highlight tags or badges (choose an accent hue, e.g. teal or amber, to use sparingly). Ensure text meets AA contrast (>4.5:1).  
- **Typography:** Pair a clean sans-serif (for headings/body) with JetBrains Mono for labels or metadata. For example, headings in `font-size: 2rem` (H1), `1.5rem` (H2), `1.25rem` (H3), with weights 600–700. Body text ~`1rem` regular. Metadata/tags in JetBrains Mono at ~`0.875rem`. Use a vertical rhythm (line-height ~1.5, spacing in multiples of 0.5–1 rem).  
- **Accessibility:** Semantic HTML (`<article>`, `<section>`, etc). Alt text on images. Color contrast verified. Keyboard focus outlines visible. ARIA labels on interactive elements (menus, toggles). All UI changes tested for screen readers and keyboard nav.  
- **Performance:** Optimize and lazy-load images; use `img srcset` or modern formats (WebP) if possible. Predeclare image `width`/`height` or use `aspect-ratio` to avoid layout shifts. Minimize asset sizes and use CSS variables for theming.  
- **SEO & Social:** Each page gets a unique `<title>` and `<meta name="description">` from its content. Blog posts get `<meta property="og:title">`, `og:description`, and `og:image` (header image) for rich previews. Use clean URLs and a consistent `<meta charset>` and `<meta viewport>`. 

## Visual Style and Theming  
- **Color Palette:**  
  - Background: `#121212` (primary page background)  
  - Cards/Surfaces: `#1e1e1e` (cards, panels)  
  - Text: `#e0e0e0` (body), `#ffffff` (titles), `#888888` (secondary/meta)  
  - Accent: e.g. `#80cbc4` (teal) or `#ffcc80` (warm amber) for highlights/badges. Use accent only for calls-to-action or badges.  
  - Borders: `1px solid #333` (subtle) or 2px on hover (lighter shade).  
- **Typography:**  
  - Body/Headings: system or web sans-serif (e.g. Inter, Roboto, or Noto Sans).  
  - Monospace: JetBrains Mono (already used) for captions, code, metadata.  
  - Sizes (example):  
    - H1: `2rem, font-weight: 700`  
    - H2: `1.75rem, weight 600`  
    - H3: `1.25rem, weight 600`  
    - Body: `1rem, weight 400`  
    - Small/meta: `0.875rem, weight 400` (with letter-spacing 0.5px for uppercase tags).  
- **Spacing System:** Base unit = `1rem` (≈16px). Use multiples (0.5, 1, 1.5, 2). Example: Card padding `1rem`, gap between cards `1rem`, section padding `2rem`. Use consistent CSS variables (e.g. `--space-1: 0.5rem; --space-2: 1rem; --space-3: 1.5rem;`).  

## Component System

### Card Components  
We define several card types to handle different content, all sharing common base styles (border, radius, padding, background). Each card uses an image and a text region. Below we detail each:

#### Feature Card (Blog Highlight)  
Used for featured or large content (e.g. pinned blog post or main project). It spans two columns in grid on wide screens.  
- **Layout:** Large header image (aspect-ratio ~16:9) above title and meta.  
- **Styling:** Thicker border (`2px`) on hover. Subtle box-shadow on hover (e.g. `0 4px 8px rgba(0,0,0,0.3)`).  
- **Typography:** Title in H3 or H2 size; meta (category/date) in small uppercase above or below title.  
- **Example:**  

```html
<div class="card feature-card">
  <img src="path/to/image.jpg" alt="Feature Image">
  <div class="card-body">
    <span class="category">Research</span>
    <h3 class="title">Our New IoT Nurse Station System</h3>
    <p class="excerpt">Building the centralized dashboard for patient monitoring.</p>
    <span class="date">Sep 2026</span>
  </div>
</div>
```

```css
.feature-card {
  border: 1px solid #333;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.feature-card:hover {
  border-color: var(--accent-color);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}
.feature-card img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}
.feature-card .card-body {
  padding: 1rem;
  background: #1e1e1e;
}
.feature-card .category {
  display: block;
  font: 0.75rem JetBrains Mono;
  color: #80cbc4; /* accent for category */
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}
.feature-card .title {
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
}
.feature-card .excerpt {
  font-size: 1rem;
  margin: 0 0 0.5rem;
}
.feature-card .date {
  font: 0.75rem JetBrains Mono;
  color: #888;
}
```

#### Content Card (Standard Card)  
Used for regular items (blogs, projects). Similar to feature card but uniform size (one column).  
- **Layout:** Square or 4:3 image at top, then content.  
- **Styling:** 1px border by default, subtle hover (border highlight).  
- **Typography:** Title (H3), small category tag atop title (left-aligned), date below content or at bottom.  
- **Example:**  

```html
<div class="card content-card">
  <img src="path/to/project.jpg" alt="Project Image">
  <div class="card-body">
    <span class="category">Project</span>
    <h3 class="title">Smart IV Retrofit Controller</h3>
    <p class="excerpt">Closed-loop device for automated IV drip control.</p>
    <span class="date">Jan 2026 – Present</span>
  </div>
</div>
```

```css
.content-card {
  border: 1px solid #333;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: border-color 0.15s;
}
.content-card:hover {
  border-color: #80cbc4;
}
.content-card img {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
}
.content-card .card-body {
  padding: 1rem;
  background: #1e1e1e;
}
.content-card .category {
  font: 0.75rem JetBrains Mono;
  color: #ffcc80;
  text-transform: uppercase;
}
.content-card .title {
  margin: 0.25rem 0;
}
.content-card .excerpt {
  margin: 0.5rem 0;
  color: #ccc;
}
.content-card .date {
  font: 0.75rem JetBrains Mono;
  color: #888;
}
```

#### Compact Card  
For small items (e.g. pinboard snippets, mini posts). Typically no image or a very small thumbnail.  
- **Layout:** Either a reduced image or icon. Short title and meta only.  
- **Use Case:** Could apply to short thoughts or “tags” listing.  
- **Example:**  

```html
<div class="card compact-card">
  <h4 class="title">Indexing note:</h4>
  <p class="excerpt">Ensure offline LLM tools reduce redundant cloud calls.</p>
  <span class="date">June 27, 2026</span>
</div>
```

```css
.compact-card {
  border: 1px dashed #444;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #1e1e1e;
}
.compact-card .title {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
.compact-card .excerpt {
  margin: 0.5rem 0;
}
.compact-card .date {
  font: 0.75rem JetBrains Mono;
  color: #888;
}
```

#### Publication Card  
For research publications or papers. Should emphasize title and source/journal.  
- **Layout:** Smaller thumbnail (if any), title, venue/year, optional authors.  
- **Styling:** Titles italicized or bold, meta in subtle text.  
- **Example:**  

```html
<div class="card publication-card">
  <img src="cover-art.png" alt="Paper figure">
  <div class="card-body">
    <h4 class="title">ViT-RoT: Vision Transformer Framework for Plant Disease</h4>
    <span class="meta">MDPI AgriEngineering, Jun 2025</span>
    <p class="authors">Co-authors: A. Researcher et al.</p>
    <a href="#" class="link">Read Paper</a>
  </div>
</div>
```

```css
.publication-card {
  border: 1px solid #333;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #111;
}
.publication-card img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}
.publication-card .card-body {
  padding: 1rem;
}
.publication-card .title {
  margin: 0 0 0.5rem;
  font-weight: 600;
}
.publication-card .meta {
  font: 0.75rem JetBrains Mono;
  color: #ccc;
}
.publication-card .authors {
  font: 0.875rem sans-serif;
  margin: 0.5rem 0;
  color: #bbb;
}
.publication-card .link {
  display: inline-block;
  margin-top: 0.5rem;
  color: #80cbc4;
  text-decoration: none;
}
```

#### Achievement Card  
For awards or milestones. Includes a badge label (Winner/Finalist) and grouping by year.  
- **Layout:** Can be horizontal (image or icon on left, text on right) or vertical card.  
- **Styling:** Use a colored badge (e.g. amber for Winner, gray for Finalist). Group cards under year headings.  
- **Example:**  

```html
<div class="card achievement-card">
  <span class="badge winner">Winner</span>
  <h4 class="title">Best Innovative Product (Central Province)</h4>
  <p class="details">SLASSCOM Nat’l Ingenuity Awards, 2026</p>
</div>
```

```css
.achievement-card {
  border: 1px solid #333;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #1e1e1e;
  position: relative;
}
.badge {
  position: absolute;
  top: 1rem; right: 1rem;
  padding: 0.25rem 0.5rem;
  font: 0.75rem JetBrains Mono;
  border-radius: 0.25rem;
  text-transform: uppercase;
  color: #000;
}
.badge.winner { background: #ffcc80; }
.badge.finalist { background: #ccc; }
.achievement-card .title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}
.achievement-card .details {
  font-size: 0.9rem;
  color: #bbb;
}
```

#### Thought Card  
For the “Thoughts” sticky-notes. These can remain colorful but should adopt the same typography.  
- **Layout:** Square/rectangle with slight rotation (as in current design) optional.  
- **Styling:** Use pastel background colors (pink, blue, etc) as currently. Keep sticky “note” look.  
- **Example:**  

```html
<div class="card thought-card" style="background:#ffccf9">
  <p>Can offline LLM tools pre-process documents locally to avoid upload limits?</p>
  <span class="date">Jun 27, 2026</span>
</div>
```

```css
.thought-card {
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  padding: 1rem;
  font-size: 0.95rem;
  font-family: sans-serif;
  transform: rotate(-1deg);
}
.thought-card .date {
  display: block;
  margin-top: 0.5rem;
  font: 0.75rem JetBrains Mono;
  text-align: right;
  color: #555;
}
```

#### Media Card (Photography)  
For portfolio images or Instagram embeds. Render as full-width grid of thumbnails.  
- **Layout:** Square or responsive. Clicking opens a lightbox or links to original.  
- **Styling:** No border, just images with small caption or credits.  
- **Example:** (using Instagram embed is handled by script; here's a static alternative)  

```html
<div class="card media-card">
  <img src="photo.jpg" alt="Portrait of subject">
  <div class="caption">Photo: Iris Catchers (Kandy, 2026)</div>
</div>
```

```css
.media-card img {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 0.5rem;
}
.media-card .caption {
  font: 0.75rem italic sans-serif;
  color: #aaa;
  margin-top: 0.5rem;
  text-align: center;
}
```

### Layout and Grid  
Define a responsive grid for card containers. For example, the blog and projects listing use:

```css
.container {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

- **Breakpoints:**  
  - **Mobile (<640px):** 1 column.  
  - **Tablet (640–1023px):** 2 columns.  
  - **Desktop (>=1024px):** 3 columns.  

Example wireframe (ASCII) for a blog listing page on desktop:

```
┌───────────────────┬───────────────────┬───────────────────┐
│     Card 1        │     Card 2        │     Card 3        │
│ (with image)      │ (with image)      │ (with image)      │
└───────────────────┴───────────────────┴───────────────────┘
┌───────────────────┬───────────────────┬───────────────────┐
│     Card 4        │     Card 5        │     Card 6        │
└───────────────────┴───────────────────┴───────────────────┘
```

On mobile, these collapse to one per row:

```
┌───────────┐
│  Card 1   │
└───────────┘
┌───────────┐
│  Card 2   │
└───────────┘
...
```

For the **Featured + Grid** variant, we might highlight one card (e.g. make `.featured { grid-column: span 2; }`) at the top, then follow with the grid above. 

### Blog Listing (News Page)  
- Add a header: large page title (“Blog” or “News”) and a subtitle. Include a filter/tab bar if desired (e.g. “All / Projects / Research”). Use simple `<button>` or `<a>` tabs; the current repo uses a simple “All Blogs” pill.  
- Each post is a **Content Card** as above. Display only high-level info (title, short excerpt or subtitle, date/category). Minimize listing of tags – those can live inside the article or a details view. DeepMind hides detailed tags on listing, and we should too. For example, show “Sep 2026 · Research” on each card rather than listing all tech tags.  
- Images: use relevant screenshots or photos per post. Ensure a default image if none. Use square images for consistency (like DeepMind).  
- Pagination or “Load more”: The DeepMind blog uses numbered pagination. We can reuse that or implement a “Load more” button for simplicity.  

### Blog Article Template  
- Top metadata: show `CATEGORY` (uppercase) and `DATE` inline or stacked, then the `<h1>` title. Example:  
  ```
  [Science] · May 19, 2026  
  # Co-Scientist: A multi-agent AI partner to accelerate research
  by Co-Scientist team
  ```  
  (See DeepMind’s article where “May 19, 2026 Science” appears above the title.)  
- **Hero Image:** Immediately under the title, place a full-width image (16:9 or larger) with an optional caption. DeepMind’s Co-Scientist starts with a large illustrative image. We’ll do similar using project or concept imagery.  
- **Introduction (“Deck”):** One or two lead sentences in italic or bold to summarize the article (as DeepMind does with “Introducing a collaborative AI partner…”). This sets context before the body text.  
- **Body Content:** Use headings (H2) for sections. DeepMind’s post uses “## How Co-Scientist works…” etc. Interleave text with graphics or media. For example, embed diagrams or code blocks as needed.  
- **Images/Figures:** Images in the article can span narrower or full width. Use `max-width: 100%` and center them. Figures can break out to ~80% of container to emphasize them (compared to the narrower text column). Always include captions and alt text.  
- **Callouts/Boxes:** For technical details or notes, use shaded boxes (`<aside>` or styled `<div>`). E.g., DeepMind’s text is occasionally broken up by subheadings and bullet lists. We could add custom callouts like:  
  ```html
  <div class="callout"><strong>Design decision:</strong> We used ESP32 for...</div>
  ```  
  with CSS giving it a tinted background.  
- **Author/Credits:** Place authorship or acknowledgments at bottom or top (“By [Name]”). DeepMind put “Co-Scientist team” under the title. We should similarly credit names/roles.

## Image Usage  
- **Aspect Ratios:** Use consistent image aspect ratios per context (cards ~1:1, heroes ~16:9). This ensures a tidy grid.  
- **Lazy Loading:** Add `loading="lazy"` to `<img>` tags. Use `srcset` for multiple resolutions if available.  
- **Optimization:** Compress images (WebP/AVIF) and serve scaled versions. Preload the hero image `<link rel="preload" as="image">` for the currently viewed article to reduce LCP.  
- **Responsive sizes:** For hero images, consider `100vw` width scaling. For cards, images fit their card width.  
- **Captions:** Use `<figcaption>` or a `<div class="caption">`. DeepMind places captions under images (see Co-Scientist caption at). We do likewise for clarity.  

## Achievements Page  
- **Grouping:** Head each year (e.g. `2026`) as a subheading, then list achievements for that year. This adds clarity (and the user requested year grouping).  
- **Badges:** Prepend badges “Winner/Finalist”. Style: uppercase monospace on colored background (see achievement card CSS above). E.g. goldish for Winner, gray for Finalist.  
- **Layout:** Cards similar to content-cards but simpler. Each card can include an optional thumbnail or icon of the event (if images are available). Otherwise, just text.  
- **Metadata:** Show project name or context (like “Smart IV 3YP”) and event name. E.g. “Awarded for Smart IV (3rd Year Project) at SLASSCOM 2026.”  
- **Table Example:** (DeepMind does not have an achievements section, so we propose this as new functionality.)  

## Projects Page  
- **Filters:** Keep the category tabs (“All | Software | IoT/Embedded | Publications”) as shown in the screenshots. Implement with simple JS (toggle `.active` class) or anchor links with hashes. The styles: selected tab with underline or background.  
- **Grid:** Similar card layout to blogs. Each project card (use **Content Card** style) shows an image, title, tech tags (under title), and timeframe.  
- **Tags:** In DeepMind’s projects like “Smart IV Retrofit Controller”, tags (ESP32, MQTT, etc.) appear under the title. We can show up to 3 tags per card as labels in smaller font (JetBrains Mono).  
- **Card Example:** Same as content-card but perhaps with tag line.  

## Thoughts & Photography  
- **Thoughts:** Keep the sticky note design, as it adds personality. We’ll ensure fonts and colors fit the scheme. They are short, so no big redesign needed.  
- **Photography:** For the photography gallery, use a lightbox or carousel for images. We can either continue embedding Instagram posts or self-host images and display in a two-column grid (CSS grid or flex). Ensure images have captions (e.g. `title`, location credits).  

## Spacing, Breakpoints, and Wireframes  
- **Spacing:** All sections separated by ~2rem margin. Use consistent padding inside cards (`1rem`). Line heights ~1.5.  
- **Grid Breakpoints:** As above (1/2/3 columns). Use `@media` queries or CSS Grid’s `auto-fit`.  
- **Wireframe (Blog Page):**  
```  
┌─────────────────────────────────────────┐
│              All Blogs (header)         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┬─────────────────────────────────────────┐
│ Feature Card (2x wide)                 │ Content Card 2                           │
│ (large image)                          │                                         │
└─────────────────────────────────────────┴─────────────────────────────────────────┘
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│ Content Card 3          │ Content Card 4          │ Content Card 5          │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```  

- **Wireframe (Article Page):**  
```  
┌─────────────────────────────────────────┐
│ [ CATEGORY ] · May 19, 2026            │
│ # Co-Scientist: A multi-agent AI...     │
│ by Co-Scientist team                    │
├─────────────────────────────────────────┤
│             [ Hero Image ]             │
├─────────────────────────────────────────┤
│ *Introducing a collaborative AI partner*│
│                                        │
│ Every great scientific breakthrough...  │
│ ──────────────────────────────────────── │
│ ## How Co-Scientist works              │
│ [Image: Idea cycle diagram]            │
│ Generate ideas... (bullet list)       │
│                                        │
│ (more sections, images, text, callouts)│
└─────────────────────────────────────────┘
```  

## Accessibility and Meta  
- **ARIA/Labels:** Ensure interactive elements (filters, cards as links) have `aria-label`s if their function isn’t clear from text. For example, the theme toggle can have `aria-label="Toggle dark mode"`.  
- **Semantic HTML:** Use `<nav>`, `<main>`, `<aside>`, `<article>`, `<header>`, `<footer>` appropriately. Each card could be an `<article>`.  
- **Keyboard:** Focus outlines (e.g. `:focus { outline: 2px solid var(--accent-color); }`). Avoid removing native focus.  
- **Images:** All `<img>` need meaningful `alt`. If decorative, use `alt=""` and `role="presentation"`.  
- **Language:** `<html lang="en">`.  
- **Meta tags:** Include `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. In each page’s `<head>`, set `<title>` and `<meta name="description">`. For blog posts, use Open Graph tags: e.g. `<meta property="og:title" content="Post Title">`, `<meta property="og:image" content="URL_of_header_image">`.

## Image Diagrams (Examples)  
  *Figure: Example hero image in an article (from DeepMind’s Co-Scientist post). Hero images should span the content width to create impact.*  

  *Figure: Sample card-style listing (DeepMind blog’s “SynthID Bio” card). Each content card is a bordered block with an image and metadata.*  

 *Figure: Diagrams should adapt to theme. DeepMind shows the same figure on light (left) and dark (right) backgrounds. We’ll provide alternate-color versions or use semi-transparent graphics so they work in both modes.*  

## Comparison of Patterns  

| Aspect / Component        | DeepMind (Example)                                            | Proposed Portfolio Style                                           |
|---------------------------|---------------------------------------------------------------|--------------------------------------------------------------------|
| **Layout (Blog Listing)** | Uniform vertical list of cards (each with image + text). All look similar, no featured highlight. | Use similar image-led cards. Optionally make the newest post “featured” (larger span) or use grid columns for variety. |
| **Card Images**           | Square (1:1) or stacked images under each post. Consistent image style per card. | Continue using square or 4:3 images for cards. Maintain consistency in cropping. If full-width featured images (16:9) are used, keep ratio uniform across site. |
| **Title & Meta**          | Title as H3, with “Month YYYY Category” on separate line below. Category often uppercase. | Title larger (H2/H3). Place category and date either above title or below with smaller font. Use color or uppercase to differentiate category. |
| **Typography**            | Uses Google fonts (sans-serif for text) and JetBrains Mono for small labels (DeepMind’s site style). | Keep JetBrains Mono only for code/labels (tags, dates). Use a legible sans-serif (e.g. Noto Sans) for headings/body. Increase hierarchy (bigger headings, varied weights). |
| **Spacing**               | Generous vertical space between sections and cards. Cards have internal padding. | Similar or slightly tighter spacing to pack info. Use consistent `gap: 1rem` in grids, card padding 1rem. Maintain whitespace for readability. |
| **Colors**                | Dark background with colored highlights (blue/purple accents in images). Text mostly white/gray. | Use palette with accent color (teal or amber). For example, category text or links in accent. Card backgrounds slightly lighter than page bg. |
| **Hover Effects**         | Minimal: DeepMind’s cards lighten border or shadow on hover (very subtle). | Use subtle transforms: e.g. `border-color` shift and a mild shadow on hover (0.15s ease) to indicate interactivity. No crazy animations. |
| **Article Hero**          | Large 16:9 header image below title, with intro text. | Same pattern: full-width image (16:9), short intro paragraph. Ensure responsive width and alt text. |
| **Content Structure**     | Uses clear H2/H3 sections and bullet lists for readability. | Follow suit: break articles into sections, bullet/lists, and blockquotes/callouts. Use consistent heading sizes and spacing for each level. |
| **Achievements**          | (No direct equivalent on DeepMind.) DeepMind news are chronological posts. | Group by year headings; present each award as a card or list item with a badge. E.g., “2026” heading, then cards listing awards for that year (with “Winner” badge). |
| **Filtering/Tabs**        | DeepMind News has no category filter on page 1 (but has pagination). | Add filter tabs (e.g. All/Software/IoT) above project listings. Selected tab underlined. Tabs are simple `<button>`s styled with uppercase text. |

## Implementation Plan (Codex in VS Code)  
1. **Branch & Setup:** Create a new Git branch (e.g. `ui-redesign`). Ensure a clean working state. Document current data contracts (blog JSON, etc).  
2. **Global Styles:** Begin by updating `style.css` (or equivalent) to add CSS variables (colors, spacing units). Define base card styles (`.card { ... }`) that all types inherit. Commit changes.  
3. **Blog Listing:** Use Codex to transform the existing blog loop (in `index.html`) into a grid of `<div class="content-card">` as defined above. Insert necessary containers (`<div class="container blog-list">`). Ensure each card uses the new HTML structure (image, category span, h3, excerpt, date). Apply the CSS classes. Test in browser.  
4. **Featured Post (optional):** If using a featured card, detect the latest post and add `.feature-card` class (spanning 2 columns). Codepen or visualize with Codex-assisted edits.  
5. **Blog Post Template:** Edit the blog post page template. Move metadata to top, add hero image section. Wrap images in `<figure>` if captioned. Insert `<div class="excerpt">` after title for the intro sentence. Apply heading classes. Test with a Co-Scientist-like post (hard-code one if needed for view).  
6. **Projects Page:** Refactor project items similarly. Add tab filter logic (could be simple JS toggling classes, which Codex can suggest). Apply content-card style to projects. Include tech tags line.  
7. **Achievements Page:** Replace the static list with year-grouped sections. For each achievement entry, output a `<div class="achievement-card">` with title and badge. Use a loop over data if possible. Verify grouping by year. Style and test layout (two columns on wider screens).  
8. **Thoughts & Photography:** Minimal changes: ensure the colored note cards remain legible with new text colors. For photography, either keep the Instagram widget or build a grid of images. If coding, create `.media-card` wrappers and lazy-load images. Test focus and interaction.  
9. **Responsive Checks:** For each page, test at breakpoints (using DevTools). Adjust grid columns and font sizes if needed. Ensure no overflow/horizontal scroll.  
10. **Accessibility Checks:** Run Lighthouse or axe. Fix any contrast issues or missing alt text. Ensure keyboard tab order (e.g. filter tabs, cards) is logical.  
11. **SEO & Meta:** Verify `<title>` and meta tags are correct. Check that the new structure did not break any link (e.g. old `href`s). If using any single-page routing, ensure links reflect the new layout.  
12. **Review & Visual QA:** Use Codex’s (or manually) screenshot comparisons for each page before/after. Address any layout issues. Consider mobile-first design (touch sizes, clickable card padding).  
13. **Finalize:** Merge when tests pass. Optionally add a deployment check (if there's CI) and analytics snippet (e.g. Google Analytics). Ensure build (if any) still works (though this is static, likely no build).  

Throughout, use Codex’s code completion for tedious parts (e.g. writing repetitive CSS rules or HTML loops) but review its suggestions carefully. Commit incrementally (per page or component) and use descriptive messages (“Update blog card layout”, “Add achievements grouping”, etc.).  

## Migration Checklist  
- **Blog Listing (`index.html`):** Replace existing list-of-posts markup with a loop generating new `.content-card` structure. Remove old CSS rules or redundant elements (e.g. old tag list if present).  
- **Blog Post Template:** Update the HTML around title and content to match new design (date, category above title, `<figure>` for hero image, etc). Ensure existing content (written posts) still populate correctly.  
- **Projects (`projects.html`):** Wrap project items in `.content-card`, add container grid. Insert filter tab HTML/JS. Remove any inline styles so CSS can control layout.  
- **Achievements (`achievements.html`):** Reformat each `<li>` or block into a `.achievement-card`. Add year headings manually or via grouping. Remove old monolithic text if any.  
- **Thoughts (`thoughts.html`):** Likely no HTML change needed unless unifying fonts/colors (ensure `.thought-card` CSS is updated).  
- **Photos (`photography.html`):** If switching from Instagram embed to custom grid, rewrite gallery markup. Otherwise, style the embedded widget container.  
- **CSS:** Consolidate scattered rules into the new structure. Replace any `ul` bullet styles (if used) with our card CSS. Ensure no conflicting selectors.  
- **JS:** If project filters or pagination need JS, integrate or update. If none existed, add simple event handlers.  
- **Assets:** Verify image paths for newly specified images. If adding new images for featured posts, ensure they are in `assets/` or correct folder.  
- **Data Files:** Confirm that `blogs-data.js`, `thoughts-data.js` still load into the new templates. Update any data keys if templates expect changes (e.g. if we renamed `tags` to `category`).  
- **Theme Toggle:** Ensure the dark/light toggle still works with new colors. Adjust toggle icon coloring if needed.  

## Prioritized Implementation Plan  
1. **Blog Pages:** Redesign the blog listing and single-post pages first, as these are the most visible. Ensure card components and article template are solid.  
2. **Projects:** Next, implement the projects grid and filters using the same card styles.  
3. **Achievements:** Then, build the achievements section with year-grouping and badges.  
4. **Other Pages:** Tweak remaining pages (e.g. About, Thoughts, Photos) for consistency.  
5. **Final Polish:** Conduct responsive/a11y testing and fix any issues. Add missing meta tags or analytics at the end.  

By following this spec step-by-step (with Codex assisting in coding each component/page), we can achieve a cohesive redesign that balances minimalism with a more engaging, academic look, all while keeping the underlying system intact.  

**Sources:** Patterns from the DeepMind News page and Co‑Scientist article were used to guide layout, card design, and article structure.