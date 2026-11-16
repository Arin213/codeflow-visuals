# Video #6 — Why useState Remembers (2:44, 4933 frames)

The first React film. The question every beginner silently asks: my
component is a function, it runs top to bottom every render — so why
doesn't `const [count] = useState(0)` reset to zero? Told on the
"Deep Current" stage with 3B1B-style execution-flow arrows pointing
from the code line to the visual it causes, and a hotter heartbeat
BGM (bed sits 12 dB under voice — the hook element this time).

Runtime: 163.58s narration, 59 sentences. Every chapter below is
generated from the measured sentence timeline
(`scripts/v6/timing.json`, silence-snapped), not eyeballed.

## Title (primary)

```
Why useState Remembers — When Your Function Forgets (React, Visualized)
```

## Title (A/B alternative)

```
useState Is Just a Closure With a Memory (React Hooks, Visualized)
```

## Description

```
Your component is just a function. React runs it again — top to
bottom — every single render. So why doesn't const [count] =
useState(0) reset the count to zero each time?

① The re-run — a Counter component, read like any function: from the
first line to the return. Every render, React calls it again. On
paper, count should start at zero every time. It doesn't.

② The box — useState keeps the value OUTSIDE your function, in
React's world. The variable you get back is a window into that box,
not the box itself.

③ When you click — three things happen: ① React records the new
value, ② re-runs your function, ③ paints the screen with what the
box now holds. count goes 3 → 4 — not because the variable changed,
but because React handed back a different box.

④ The slots contract — first call gets slot zero, second call gets
slot one, in the exact order the lines execute. That contract is why
the same box comes back after every re-render, and it's why the
Rules of Hooks exist: a hook inside an if would ask for a different
number of slots on some renders, and the order breaks.

⑤ The arrow — and here is the twist the series has been building to:
follow the arrow from your function to the box, and you're drawing
the exact outward search from the closures film. useState is just a
closure with a memory.

Bonus mystery at the end: why does setTimeout still see the OLD
count? The answer is the same arrow.

Chapters:
0:00 The counter that ran hundreds of times
0:05 The whole component
0:11 Every render runs it again
0:18 But it isn't zero
0:24 The box in React's world
0:50 When you click, three things happen
1:10 Which box does React hand back?
1:38 If the order breaks (the Rules of Hooks)
2:06 The whole picture: the arrow is a closure
2:20 The setTimeout mystery
2:34 Read the arrow, not the name
2:40 A closure with a memory

The code in the video:

// the component — runs top to bottom, every render
function Counter() {
  const [count, setCount] = useState(0);

  const inc = () => {
    setCount(count + 1);
  };

  return (
    ＜button onClick={inc}＞
      clicked {count} times
    ＜/button＞
  );
}

// two calls → two slots, handed back in order
function Profile() {
  const [name] = useState("Ada"); // slot 0
  const [age] = useState(27);     // slot 1
  return ＜ProfileCard name={name} age={age} /＞;
}

// this breaks the contract:
if (lucky) {
  const [extra] = useState(1); // sometimes slot 2, sometimes not
}

// the setTimeout mystery:
const [count, setCount] = useState(0);
setCount(3);
setTimeout(() => console.log(count), 0); // 3 — old! the snapshot
// your render's closure gave it, not the box's new value

► Watch next: "JavaScript Scope & Closures: Why counter() Still
  Counts" — the foundation this whole film stands on.

► Playlist: JavaScript Visualized — the whole series in order.

► CodeFlow Visuals — complex code, clear visuals.
   Need a technical explainer for your product or course?
   That is literally what we make: animated, narrated, word-synced.
```

## Tags

```
react, useState, react hooks, useState explained, react tutorial, hooks explained, rules of hooks, react re-render, closures in react, react for beginners, learn react, react animation, javascript visually, react fundamentals, react visually explained, technical explainer
```

## Thumbnail

`publish/youtube/thumbnails/thumb-video-6.png` (1280×720, composition
`ThumbUseState`). Series paper style, reads at 320px: **useState →
react's world** across the frame — Counter.tsx scrap with the red
"should be 0!" badge on the left, `{ count: 3 }` scrap with the green
"same box!" badge on the right, tagline "a closure with a memory."

## Audio

Voice + BGM ship as ONE pre-mixed WAV (`public/video6-mix.wav`):
voice −18.2 dBFS, bed **12 dB** underneath (V5 was 15.4 — this film's
bed is deliberately hotter, the hook element), +3 dB pre-amplified
with a soft-knee limiter (cancels Remotion's fixed 0.707 `<Audio>`
attenuation). Verified from the rendered MP4: −18.0 dBFS, peak 0.708.
The bed itself is new: Am–F–C–G at 92 BPM with a heartbeat sub-pulse
on every beat.

## Pinned comment

```
Quick quiz from the video: the button shows "clicked 3 times". You
click once more. Between your click and the repaint, what does React
actually DO with count? (The film answers it with one arrow.)
```

## Scheduling notes

- Proposed slot: **Dec 12–14, 17:45 NPT** — AFTER the V5 shorts wave
  clears (V5 long-form Nov 26; V5 shorts Nov 27–29; wave ends Dec 7).
  Engine publishes nothing else in between.
- Upload thumbnail: `publish/youtube/thumbnails/thumb-video-6.png`.
- Add to playlist "JavaScript Visualized" immediately on publish.
- After publish: end screens — V5 → V6, V6 → V5 + playlist; wire
  landing card #6 in `docs/index.html` (add a new card pointing at
  the V6 URL); then commit/push.
- Shorts: `out/video6-short-first.mp4` (20.7s, ends on the "closures"
  cliffhanger — pin links THIS video) and `out/video6-short-second.mp4`
  (143.8s — that is pillar-length; either publish as the pillar or cut
  a second act-short from the slots/rules section ≈ s25–s45, ~50s).
  FB reel: if the Nov 23 45–60s test beats ~285 views, cut a FB
  special from the slots act (~50s) the same way ShortScopeFBV2 was.
- Pin texts for V6-era shorts are decided at publish time (shorts must
  publish AFTER the long-form, same rule as every video).
