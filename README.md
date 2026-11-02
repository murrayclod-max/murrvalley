# murrvalley.com

Static site for MurrValley: a landing page plus a `/sites/` directory of every
site we've built. Hosted on GitHub Pages from the `main` branch root, same as
MVGCWL.

## Files

- `index.html` — landing page with a link to the directory
- `sites/index.html` — the directory (cards with icon, description, link)
- `sites/icons/` — favicons pulled from each live site, or a simple SVG tile
  where the site had none
- `styles.css` — shared styles, light and dark
- `CNAME` — custom domain for GitHub Pages

## Adding a site

Copy one of the `<a class="card">` blocks in `sites/index.html`, drop an icon
in `sites/icons/`, and push. GitHub Pages redeploys in about a minute.

## DNS (one-time, at Squarespace)

`murrvalley.com` is registered at Squarespace and currently points `www` at
Google Sites. To move it to this repo:

1. Squarespace → Domains → murrvalley.com → DNS settings.
2. Delete the existing `www` CNAME to `ghs.googlehosted.com` and any Google
   Sites forwarding on the apex.
3. Add four `A` records on `@` (apex):
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
4. Add a `CNAME` for `www` → `murrayclod-max.github.io`.
5. Wait for DNS (usually minutes, up to a day), then in GitHub → repo →
   Settings → Pages confirm the custom domain shows a green check and tick
   **Enforce HTTPS**.
