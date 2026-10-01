# ScaleX — website

Static website for **ScaleX**, an open-source quantitative research firm.
Its research group is **ScaleX Research**, and its open-source programme is **Ctrl + C**.

The site is plain HTML and CSS with a small amount of vanilla JavaScript. It has no framework, no build step, no dependencies and no tracking.

## Structure

The site is **one long scrolling page**. Every navigation link scrolls to a section on `index.html`. The only other pages are individual research publications and the 404 page.

```text
/
├── index.html      The site. Sections, in order:
│                     #top (hero) · #philosophy · #process (how we research)
│                     #research · #strategies (strategy library) · #backtesting
│                     #risk · #data · #open-source (Ctrl + C) · #infrastructure
│                     #principles · #about (+ #contact) · #legal (#privacy, #terms)
├── research/
│   ├── cross-sectional-momentum-under-implementation-stress.html   Publication page
│   └── cross-sectional-momentum/   Its PDF and figures (copied from the research repo)
├── 404.html        Not-found page (served by GitHub Pages for any unknown URL)
├── favicon.ico  robots.txt  sitemap.xml  .nojekyll
├── css/styles.css  Design system and all styles (tokens at the top)
├── js/config.js    GitHub organisation URL and contact email, set in ONE place
├── js/main.js      Header, mobile menu, reveals, scroll-spy, strategy tabs,
│                   legal panels, hero figure
└── assets/         fonts/ (self-hosted Inter + OFL licence), icons/, images/og-image.png
```

## Run locally

```bash
python -m http.server 8000      # then open http://localhost:8000
```

Opening `index.html` directly in a browser also works.

## Deploy to GitHub Pages

1. Push the contents of this folder to the root of a repository's `main` branch.
2. Go to **Settings → Pages → Build and deployment**. Choose **Deploy from a branch**, then `main` and `/ (root)`.
3. **Custom domain (recommended):** add it under Settings → Pages. GitHub creates a `CNAME` file. Configure DNS as GitHub instructs, then enable **Enforce HTTPS**.
4. **Project site without a custom domain** (`<user>.github.io/<repo>/`): `404.html` uses root-absolute paths. In that file, replace `href="/` and `src="/` with `href="/<repo>/` and `src="/<repo>/`.

## Editing

- **Links:** `js/config.js` holds the GitHub organisation (`https://github.com/scalex-research`) and the contact email. Links marked `data-href="github"`, `data-href="repo"` (with `data-repo`, optional `data-repo-path`) or `data-href="email"` are rewritten from it.
- **Header and footer** are repeated in `index.html`, `404.html` and each publication page. If you change them, change them everywhere. Links on the other pages point to `../index.html#section`, or to `/#section` in `404.html`.
- **Adding a publication:**
  1. Create `research/<slug>.html`, using the momentum page as the template.
  2. Copy its figures and PDF into `research/<slug>/`.
  3. Add it to `sitemap.xml`.
  4. Update the "Latest publication" block in `#research` on `index.html`.
  5. Every number must come from the research repository's results. Check it with that repository's `scripts/check_website.py`.
- **Adding a strategy** to the library: copy one `<article class="strat">` block. Give it a unique `id` and a `data-title`; the tab is generated automatically.
- **Repositories:** the first card is real (`scalex-momentum-research`). The other three are placeholders. Replace or delete them, and don't hard-code star counts.

## Placeholders still to replace

Search for `[` to find them.

| Placeholder | Where |
|---|---|
| `[DOMAIN]` | `index.html` and publication `<head>` (canonical, Open Graph, JSON-LD), `robots.txt`, `sitemap.xml` |
| `[CONTACT EMAIL]` | `js/config.js` (`contactEmail`), shown in `#contact` |
| `[REPOSITORY NAME]`, `[DESCRIPTION]`, `[LANGUAGE]`, `[STATUS]` | Three placeholder repo cards in `#open-source` |
| `[TEAM MEMBER]`, `[ROLE]`, `[BIO]` | Team list in `#about` (or delete the list) |
| `[RETENTION PERIOD AND EMAIL PROVIDER]`, `[APPLICABLE LAW]`, `[LEGAL ENTITY NAME AND ADDRESS]`, `[DATE]` | Privacy panel in `#legal` |
| `[LIMITATION OF LIABILITY]`, `[JURISDICTION]`, `[DATE]` | Terms panel in `#legal` |

The disclaimer, privacy and terms text are drafts and should be reviewed by counsel.

## Content rules

- **Results:** never publish performance, AUM, Sharpe ratios, client or partner names, or live-trading results unless they are verified. Label every backtest as a **historical simulation**, distinct from **live trading performance**.
- **Charts:** illustrative charts (the hero simulation, walk-forward schematic and correlation matrix) carry an "Illustrative" label. Keep it.

## Privacy and security

- **No tracking:** no cookies, analytics, tag managers, pixels, fingerprinting, session recording or browser storage.
- **No third-party requests:** the font is self-hosted.
- **Content Security Policy:** a CSP `<meta>` on every page allows only same-origin resources and blocks all outgoing connections (`connect-src 'none'`).
- **GitHub Pages limits:** it can't set HTTP headers, so HSTS and `frame-ancestors` need a CDN in front if required.
- **Never put secrets in this repository:** no API keys, exchange keys, tokens or passwords. Anything that needs a secret (a trading API, a contact-form backend, authenticated GitHub API calls) needs a server-side component that holds the secret. A static site's JavaScript is public.

## Accessibility

- **Structure:** semantic landmarks, one `h1` per page, ordered headings and a skip link.
- **Keyboard and focus:** visible focus states. The mobile menu works by keyboard: Escape closes it, and the content behind it is made inert.
- **Strategy library:** follows the WAI-ARIA tabs pattern (arrow keys, Home/End). Without JavaScript, all 13 strategies show as stacked articles.
- **Data:** the data table is a real `<table>`. Correlation values are printed in every cell, not shown by colour alone.
- **Motion:** `prefers-reduced-motion` disables all transitions and animations, and the hero figure is drawn as a static image.
