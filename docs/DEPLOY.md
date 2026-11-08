# DEPLOY — Publishing the Landing Page

The landing page lives in `docs/`. GitHub Pages can serve it straight
from the `main` branch with **no build step** — it's a single static
`index.html` plus the thumbnail images in `docs/assets/`.

## One-time setup (5 minutes)

1. Push `docs/` to `main` (needs the commit approval flow).
2. On GitHub, open the repo → **Settings → Pages**.
3. Under **Build and deployment**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main`, folder **`/docs`** ← important, not `/ (root)`
   - Save.
4. Wait ~1 minute for the first build. The page goes live at:

   `https://arin213.github.io/codeflow-visuals/`

   (GitHub shows the exact URL on the Pages settings screen once built.)

## Update flow (every change)

Anything committed to `docs/` on `main` is live within a minute.
No commands to run — pushing *is* deploying.

## Before going live — the TODO checklist

Search `docs/index.html` for these markers and replace the placeholders:

- [ ] `TODO(#upload)` — the three video cards: swap `href="#"` for the
      real YouTube watch URLs after upload.
- [ ] `TODO(#upload)` — footer YouTube channel link.
- [ ] `TODO(#contact)` — the real email / contact method.
- [ ] Optional: confirm the custom domain decision (keep the free
      `github.io` URL, or add a domain later in Settings → Pages →
      Custom domain).

## Notes

- **Asset size:** the three thumbnails are ~760 KB each (~2.3 MB total
  for the page). Fine to start; if load time matters later, re-encode
  them as compressed JPEGs and update the `src` paths.
- **OG image** (`assets/thumb-video-3.png`) uses a relative path, which
  resolves correctly from the github.io URL.
- **`client/` must never be linked from the page** — it stays private
  (and only ever in the repo, never on Pages; Pages serves `docs/` only).
- Anything else in the repo (renders, publish/, src/) is invisible to
  the site — Pages only serves the `/docs` folder.
