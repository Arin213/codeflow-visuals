# Video #5 shorts — paste-ready scheduling package

Prepared Nov 12. Order matters: **upload V5 long-form as Scheduled
(Fri Nov 26, 19:00 NPT) FIRST** — grab its `youtu.be/...` URL from the
scheduled entry, then use it everywhere `{V5}` appears below.

Video files (all 1080×1920, crf 18, audio pre-mixed):

| File | Cut | Duration |
|---|---|---|
| `renders/shorts/scope-rooms-v2.mp4` | Cut 10 | ~56s |
| `renders/shorts/scope-closure-v2.mp4` | Cut 11 | ~1:21 |
| `renders/shorts/scope-full-v2.mp4` | Cut 9 (PILLAR) | 2:17 |

Captions verbatim from `publish/tiktok/captions.md` and
`publish/meta/captions.md`. Rule: TikTok = NO links in captions (bio
only); YouTube = full URL in description + pinned comment; Meta =
"link in bio" line.

---

## YouTube Shorts (Studio → upload → Scheduled)

### Cut 10 — scope rooms — Fri Nov 27, 17:45
- **File:** `renders/shorts/scope-rooms-v2.mp4`
- **Title:** `Where JavaScript variables actually live (scope, visualized) #shorts`
- **Description:**
  ```
  JavaScript decides where every variable lives — before your code even runs. Global, function, block… and var ignores the wall 👀

  Full deep dive: {V5}
  #javascript #scope #webdev #coding #programming #learntocode
  ```
- **After it publishes:** pin comment →
  ```
  Full video: {V5} — every scope rule, animated word-by-word.
  ```

### Cut 11 — closures — Sat Nov 28, 17:45
- **File:** `renders/shorts/scope-closure-v2.mp4`
- **Title:** `Why counter() still counts after outer() is done (closures) #shorts`
- **Description:**
  ```
  outer finishes and its variables should disappear. They don't. counter() prints 1, 2, 3 — that memory is the closure 🧠

  Full deep dive: {V5}
  #javascript #closures #react #coding #programming #learntocode
  ```
- **After it publishes:** pin comment →
  ```
  Full video: {V5} — includes the return inner vs return inner() trap.
  ```

### Cut 9 (PILLAR) — scope full film — Sun Nov 29, 17:45
- **File:** `renders/shorts/scope-full-v2.mp4`
- **Title:** `Scope & Closures — the full film, one take (2:17) #shorts`
- **Description:**
  ```
  The whole story in one vertical take: rooms, the outward search, and the closure that keeps count alive. The idea React is built on.

  Full 16:9 deep dive: {V5}
  #javascript #closures #scope #react #webdev #coding #programming #learntocode
  ```
- **After it publishes:** pin comment →
  ```
  Watched all the way through? Then answer the three questions at the end — that's the React homework. Full video: {V5}
  ```

---

## TikTok (upload → Schedule, 17:45 NPT)

### Cut 10 — Mon Nov 30, 17:45
- **File:** `renders/shorts/scope-rooms-v2.mp4`
- **Caption:**
  ```
  JavaScript decides where your variable lives BEFORE your code runs. And var ignores the wall 👀 #javascript #scope #webdev #coding #programming #learntocode
  ```
- **After it publishes:** pin comment → `Full video on YouTube — link in bio 🔗` (bio = portfolio, per the no-links rule)

### Cut 11 — Tue Dec 1, 17:45
- **File:** `renders/shorts/scope-closure-v2.mp4`
- **Caption:**
  ```
  outer is done... but counter() still counts: 1, 2, 3. That memory is the closure 🧠 #javascript #closures #react #coding #programming #learntocode
  ```
- **After it publishes:** pin comment → `The full closure deep dive — link in bio 🔗`

### Cut 9 (PILLAR) — Wed Dec 2, 17:45
- **File:** `renders/shorts/scope-full-v2.mp4`
- **Caption:**
  ```
  Where variables live, why the outside can't reach in, and why counter() keeps counting after outer is done. The idea React is built on. Watch it all the way through 🧠 #javascript #closures #scope #react #webdev #coding #programming #learntocode
  ```

---

## Meta — Instagram + Facebook (Business Suite → Reels → Schedule)

Same file on both pages, same time 17:45. Cover frame: the scope-orbit
still for cut 10 / the counter-scrap still for cut 11 / the depth gauge
for the pillar.

### Cut 10 — Mon Nov 30, 17:45 (IG + FB)
```
JavaScript decides where every variable lives — before your code even runs. Three rooms, three rules. And var ignores the wall 👀

Full video on YouTube - link in bio.
#javascript #scope #webdev #coding #programming #developer
```

### Cut 11 — Tue Dec 1, 17:45 (IG + FB)
```
outer finishes and its variables should disappear. They don't. counter() prints 1, 2, 3 — that memory is the closure, and it's the idea React is built on 🧠

Full deep dive on YouTube - link in bio.
#javascript #closures #react #webdev #coding #programming #developer
```

### Cut 9 (PILLAR) — FB Sat Dec 5, 17:45 · IG Mon Dec 7, 17:45 (manual)
```
Where variables live, why the outside can't reach in, and why counter() keeps counting after outer is done. The idea React is built on 🧠

Full deep dive on YouTube - link in bio.
#javascript #closures #scope #react #webdev #coding #programming #learntocode
```

---

## Scheduling checklist (do once V5 is uploaded & scheduled)

- [ ] V5 long-form scheduled → copy URL into every `{V5}` above
- [ ] YT: schedule cut 10 (Nov 27), cut 11 (Nov 28), pillar (Nov 29)
- [ ] TikTok: schedule cut 10 (Nov 30), cut 11 (Dec 1), pillar (Dec 2)
- [ ] Meta: schedule cut 10 + cut 11 (Nov 30 + Dec 1, both pages), FB pillar (Dec 5); IG pillar stays manual for Dec 7
- [ ] Swap `href="#"` in `docs/index.html` card 5 → real V5 URL → commit/push
- [ ] Note V5 URL in memory §10c-style for the pin rituals
