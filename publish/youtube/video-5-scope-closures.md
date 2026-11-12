# Video #5 — Scope & Closures (2:17, 4100 frames)

The foundation for React: where variables live, how JavaScript searches
outward, and why a function can outlive its owner. Told in three acts
on the "Deep Current" stage — ink-teal canvas, drifting glows, big
opacity-spotlighted code, one-clause kinetic captions, and a depth
gauge tracking nesting level 0–4.

Runtime: 135.7s narration. Every chapter below is generated from the
measured sentence timeline (`timing2.json`, silence-snapped), not
eyeballed.

## Title (primary)

```
JavaScript Scope & Closures: Why counter() Still Counts (Visualized)
```

## Title (A/B alternative)

```
Closures, Explained So It Finally Clicks (and Why React Needs It)
```

## Description

```
Every variable you create lives somewhere — and JavaScript decides
where before your code ever runs. That decision is scope, and it is
the foundation React is built on.

① Global scope — declare a variable in the open, the whole program
can read it. greet needs name, doesn't find it in its own room, and
searches outward. Both logs print Arin.

② Function & block scope — a const inside a function belongs to that
function alone. Inside, message prints Hello. Outside: ReferenceError.
Blocks are the same idea, smaller: anything in curly braces lives and
dies there — unless it's var, the one legacy trap that ignores the
wall entirely.

③ The outward search — inner can read street, city, and country.
Current scope first, then the parent, then outward, until it's found
or JavaScript throws. The chain is decided by where the code is
WRITTEN — that's why they call it lexical scope.

④ Closures — outer creates count and inner, then returns inner. The
function itself, not a call: return inner hands over the function,
return inner() with parentheses would execute it right now. Then
outer finishes, and its local world should disappear. It doesn't.
counter still holds inner, and inner still holds count. Call it:
1. 2. 3. Private state that survives its owner — that memory is the
closure.

Before React, answer three questions: why can inner see count? why
can't the outside reach it? why does count keep rising after outer is
done? Answer all three, and you own closures.

Chapters:
0:00 Where variables live
0:11 Global scope: the open field
0:26 Function scope: private stays private
0:42 Block scope and the var trap
0:56 How JavaScript searches outward
1:16 Why it's called lexical scope
1:18 Closures: the function keeps what it found
1:44 counter(): 1, 2, 3
1:57 Recap: scope vs closure
2:13 Three questions before React

The code in the video:

// ① global scope — the open field
const name = "Arin";
function greet() {
  console.log(name); // searches outward, finds it
}
greet(); // Arin

// ② function scope — the walled cell
function outer() {
  const message = "Hello";
  console.log(message); // Hello
}
console.log(message); // ReferenceError: message is not defined

// ③ the var trap — var ignores the brace wall
{
  let a = 1; // lives and dies in the block
}
// var would leak out: it is function-scoped, not block-scoped

// ④ the closure — the function keeps what it found
function outer() {
  let count = 0;
  return function inner() {
    count += 1;
    return count;
  };
}
const counter = outer();
counter(); // 1
counter(); // 2
counter(); // 3

► Watch next: "async/await: The Hidden Hook That Pauses Your
  JavaScript" — how await actually pauses a function.

► Playlist: JavaScript Visualized — the whole series in order.

► CodeFlow Visuals — complex code, clear visuals.
   Need a technical explainer for your product or course?
   That is literally what we make: animated, narrated, word-synced.
```

## Tags

```
scope, closures, javascript closures, lexical scope, function scope, block scope, var vs let, closure counter, javascript scope explained, javascript tutorial, learn javascript, javascript animation, javascript visually, react fundamentals, javascript under the hood, technical explainer
```

## Thumbnail

`publish/youtube/thumbnails/thumb-video-5.png` (1280×720, composition
`ThumbScope`). Designed to read at 320px: **scope → closure** across
the frame — the orbit-chain doodle (street/city/country rings) on the
left, the `{ count }` scrap note with "still there!" sticker on the
right, tagline "the idea react is built on."

## Audio

Voice + BGM ship as ONE pre-mixed WAV (`public/scopeclosures2-mix.wav`):
voice −18.2 dBFS, bed ~15 dB underneath, +3 dB pre-amplified with a
soft-knee limiter (cancels Remotion's fixed 0.707 `<Audio>`
attenuation). No volume props needed in the render.

## Pinned comment

```
Quick quiz from the video: what happens if we write return inner()
WITH parentheses instead of return inner? First correct answer gets
bragging rights. (Hint: one of them runs the function right now.)
```

## Scheduling notes

- Proposed slot: **Nov 26, 19:00 NPT** (weekly cadence — after V4's
  Nov 19 slot). V5 shorts (cuts 10/11 + scope pillar) must come
  AFTER the long-form, same rule as V4.
- Upload thumbnail: `publish/youtube/thumbnails/thumb-video-5.png`.
- Add to playlist "JavaScript Visualized" immediately on publish
  (playlist is already public since V3's Nov 12 flip).
- After publish: end screens — V4 → V5, V5 → V3 + playlist; wire
  landing card #5 (currently `href="#"` placeholder in
  `docs/index.html`); then commit/push.
