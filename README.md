# CTRL+C — website

Static website for CTRL+C, the open-source quantitative firm.
Plain HTML, CSS and a small amount of vanilla JavaScript. No framework, no build step, no dependencies, no tracking.

## File structure

```text
/
├── index.html            Home: hero, principles, research, open source, infrastructure, manifesto, about
├── research.html         Research areas + filterable publication index
├── opensource.html       Why open source, repositories, contributing
├── infrastructure.html   Research lifecycle + infrastructure requirements
├── about.html            Philosophy, firm details, ways to get involved
├── privacy.html          Privacy policy (draft; no tracking)
├── terms.html            Terms of use (template; needs counsel)
├── 404.html              Not-found page (served automatically by GitHub Pages)
├── favicon.ico
├── robots.txt
├── sitemap.xml
├── .nojekyll             Tells GitHub Pages to serve files as-is
├── css/styles.css        Entire design system + all styles (tokens at the top)
├── js/config.js          ← GitHub URL and contact email, edited in ONE place
├── js/main.js            Navigation, mobile menu, reveals, filters, hero figure
└── assets/
    ├── fonts/            Inter (self-hosted) + its OFL licence
    ├── icons/            favicon.svg, apple-touch-icon.png
    └── images/           og-image.png (social preview, 1200×630)
```

## Run locally

Any static file server works. From this folder:

```bash
python -m http.server 8000      # then open http://localhost:8000
# or
npx serve .
```

You can also open `index.html` directly in a browser. Everything works except the 404 page.

## Deploy to GitHub Pages

1. Create a GitHub repository and push the contents of this folder to the root of the `main` branch.
2. On GitHub, go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then `main` and `/ (root)`.
3. **Custom domain (recommended):** enter it under Settings → Pages → Custom domain. GitHub creates a `CNAME` file. Configure DNS as GitHub instructs, then enable **Enforce HTTPS**.
4. **No custom domain, project site** (`username.github.io/REPO/`): in `404.html`, change `<base href="/">` to `<base href="/REPO/">`. All other pages use relative links and work unchanged.

## Editing

- **GitHub link and email:** edit `js/config.js`. Every link marked `data-href="github"`, `data-href="repo"` or `data-href="email"` is updated from there. Each of those links also has a fallback `href` in the HTML for visitors without JavaScript. Replace `https://github.com/` and `mailto:contact@example.com` across all `.html` files with a project-wide find-and-replace.
- **Header and footer** are repeated in every HTML file, because the site has no build step. If you change them, change them in all eight pages, using find-and-replace.
- **Colours, type and spacing** are CSS custom properties at the top of `css/styles.css`.
- **Adding a publication:** copy one `<article class="pub">` block in `research.html`. Its `data-category` must match a filter button's `data-filter`.
- **Adding a repository:** copy one `<li class="repo">` block. Set `data-repo` to the exact repository name.

## Placeholders to replace before launch

Search the project for `[` and `example.com` to find them all.

| Where | What |
|---|---|
| All `.html` heads, `robots.txt`, `sitemap.xml` | `https://example.com` → your domain (canonical, Open Graph, JSON-LD) |
| `js/config.js` (+ fallback hrefs) | GitHub organisation URL, contact email |
| `index.html` research cards | Publication dates, tags |
| `research.html` | Publication entries: date, title, abstract, paper link, repository |
| `index.html`, `opensource.html` repo cards | Name, description, language, stars, last updated |
| `index.html` terminal block | Real clone/install/reproduce commands |
| Footer (all pages) | Legal entity name; disclaimer reviewed by counsel |
| `about.html` | Legal entity, founding year, location, regulatory status, team, careers, name rationale |
| `opensource.html` | Default licence, link to CONTRIBUTING.md |
| `infrastructure.html` | Links to real components as they become public |
| `privacy.html` | Last-updated date, email provider and retention, applicable law, entity and address |
| `terms.html` | Liability clause, website-content licence, governing law, last-updated date |
| Hero meta line | "Inspectable research · Reproducible methods · Public code" should be true at launch |

**Repository statistics:** don't hard-code star counts. They go stale and become inaccurate claims. Remove the stars item, or update it deliberately. Live counts would need a request to the GitHub API, which this site intentionally doesn't make.

## Privacy and security

- No cookies, analytics, tag managers, pixels, fingerprinting, session recording or browser storage.
- No third-party requests. The font is self-hosted. The only external URLs are ordinary links to GitHub and GitHub's privacy statement.
- A Content-Security-Policy `<meta>` tag on every page allows only same-origin scripts, styles, fonts and images, and blocks all outgoing connections (`connect-src 'none'`). Anything added later from another origin will be blocked until the policy is updated on purpose.
- GitHub Pages can't set custom HTTP headers, so `frame-ancestors` (anti-clickjacking) and HSTS can't be configured there. If you need them, put a CDN such as Cloudflare in front of the site.
- **Never put secrets in this repository.** Everything here is public. A feature that needs a secret (a contact-form backend, the authenticated GitHub API, a database) needs a server. It cannot be implemented safely in frontend code.

## Accessibility notes

Semantic landmarks and one `h1` per page. Skip link. Visible focus states. A keyboard-operable mobile menu: Escape closes it, and the content behind it is made inert. Filter buttons use `aria-pressed`, and a live region announces results. The animated figure has a text description. 44px touch targets. `prefers-reduced-motion` turns off every animation; the hero figure is drawn as a static, complete image instead. Without JavaScript, all content stays visible.
