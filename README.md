# yanmiAde

Marketing website for yanmiAde: websites, internal tools, analytics and SEO.
Hand-built static HTML, CSS and JS. No build step.

## Run locally

Open the folder in VS Code and start **Live Server** (default `http://127.0.0.1:5500`), or serve it with any static server.

## Pages

- `index.html` home
- `services.html` services
- `about.html` about
- `contact.html` contact form
- `privacy.html`, `terms.html` legal

## Structure

- `assets/styles.css` all styles
- `assets/site.js` menu, reveal, animations, form
- `assets/fonts/` self-hosted fonts

## Before launch

- Add a Web3Forms access key in `contact.html` (`YOUR_WEB3FORMS_ACCESS_KEY`).
- Fill the placeholders in `privacy.html` and `terms.html`.
- Add the Cloudflare analytics token (commented snippet at the bottom of each page).
- When the real domain is live, replace `https://yanmife.ca` with it in every page's canonical/OG/Twitter tags, `sitemap.xml` and `robots.txt`.
