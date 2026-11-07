# Publish Kit — CodeFlow Visuals

Everything for getting the three videos onto every platform, organized
so nothing has to be re-derived.

## Layout

```
publish/
  README.md                 ← this file (layout + upload checklist)
  youtube/
    channel-setup.md        ← channel name, handle, description, keywords
    video-1-function-execution.md   ← title / description / tags (paste-ready)
    video-2-event-loop.md
    video-3-async-await.md
    banner.png              ← channel art (center-safe 1546×423)
    thumbnails/             ← 1280×720 thumbnail per video
  tiktok/
    captions.md             ← caption + hashtags per vertical cutdown
  meta/
    captions.md             ← Instagram Reels / Facebook captions
  vertical-cutdowns/
    SPEC.md                 ← which scenes become which vertical clips
```

## Upload order

- **Day 1:** Video #1 (function execution) — entry point
- **Day 2:** Video #2 (event loop) — binge-forward partner
- **Day 3:** Video #3 (async/await) — flagship deep dive

On day 3 also create the playlist **"JavaScript Visualized"** containing
all three in the same order, and publish the first vertical cutdown on
TikTok / Reels / Shorts (the "C prints before B" clip — strongest hook).

## Checklist per upload (any platform)

1. Video file from `renders/video-N-*/` (the newest *_final/*-final or
   latest version listed in the folder)
2. Title + description + tags from `youtube/video-N-*.md`
3. Thumbnail from `youtube/thumbnails/`
4. Playlist added
5. Cross-post the same day's cutdown: TikTok + Reels + Shorts using
   `tiktok/captions.md` / `meta/captions.md`
