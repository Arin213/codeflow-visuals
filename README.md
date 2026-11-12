# CodeFlow Visuals

**Complex code. Clear visuals.**

A portfolio of animated technical explainers built with Remotion — turning programming concepts, software workflows, and technical ideas into clear, engaging visual explanations.

## Portfolio

### 1. JavaScript Function Execution

A short animated explainer (1080p, 30fps, ~36s) demonstrating how a JavaScript function receives arguments, assigns them to parameters, performs a calculation, and returns a result — with synchronized narration, code highlighting, execution stages, an animated execution thread, and subtitles.

The example code used in the video:

```javascript
function calculateTotal(price, quantity) {
  const total = price * quantity;
  return total;
}

const result = calculateTotal(100, 3);
```

**What the video demonstrates:**

- JavaScript function declaration and invocation
- Arguments and parameters
- Variable assignment
- Multiplication and return values
- Step-by-step execution visualization
- Synchronized voice narration and subtitles

### 2. JavaScript's Event Loop

A longer animated explainer (1080p, 30fps, ~54s) explaining how JavaScript's
single-threaded runtime handles asynchronous work without blocking — following
one `setTimeout` from stack, to the browser's Web APIs, into the callback
queue, and back onto the stack when the event loop's watch finally clears.

The example code used in the video:

```javascript
console.log("Start");
setTimeout(() => {
  console.log("Timeout");
}, 0);
console.log("End");
```

**What the video demonstrates:**

- The call stack: frames pushed and popped in statement order
- Web API hand-off: timers leave the main thread immediately
- The callback queue and FIFO ordering
- The event loop's continuous stack-empty check, shown as a live runtime hub
- Full print order: `Start`, `End`, `Timeout`
- Synchronized voice narration, subtitles, word-level visual beats,
  code-line-to-stack-frame threads, and a loop lifecycle (boot →
  check-ticks → shutdown)

### 3. async/await — The Hook Inside

The deepest explainer yet (1080p, 30fps, ~2:58) revealing the mechanism
behind async/await: JavaScript doesn't *wait* — it hooks the running
function, hangs it in the air, and resumes it later. The video visualizes
the suspension hook as a literal rig: the `showData()` function card is
plucked off the call stack at the `await` line, latched and frozen while
the `getData()` promise does its work below, then released as a microtask
chip that jumps ahead of the callback queue — grabbed by the event loop,
pushed back on the stack, and lowered exactly where it left off.

A numbered red step-thread (① call → ② hangs → ③ waits → ④ released →
⑤ loop grabs → ⑥ resumes) inks progressively through the story so the
viewer always knows which step is which.

The example code used in the video — and narrated by name:

```javascript
async function showData() {
  console.log("A");
  const data = await getData();
  console.log("B");
}
showData();
console.log("C");
```

**What the video demonstrates:**

- Calling an async function: `showData()` enters the call stack like any
  other function
- The `await` keyword: everything after it is wrapped into a promise and
  the function is suspended — shown as the hook latching onto the card
- The promise lifecycle: `pending` → `fulfilled` while `getData()`'s work
  happens down below
- Microtasks vs callbacks: the released code becomes a high-priority
  microtask chip that `jump the queue`s ahead of waiting callbacks
- The event loop: grabs the microtask chip only when the call stack is
  empty and pushes the rest of `showData()` back onto the stack
- Execution resumes exactly after the `await` line with the resolved
  value, so the console prints `A`, `C`, `B` — never `A`, `B`, `C`
- Synchronized voice narration, subtitles, word-level visual beats, a new
  classic sketchnote stage (milk-tea aged paper, dot grid, marker ink),
  and a numbered step thread

### 4. The Evolution of Async JavaScript

A sequel told as history (1080p, 30fps, ~1:39): callbacks → promises →
`async/await`, three eras solving one problem, each one a rearrangement
of the last.

**What the video demonstrates:**

- **Callbacks:** handing a function to a function, callback hell nesting,
  errors-as-arguments, library-by-library conventions, and inversion of
  control
- **Promises:** pending/fulfilled/rejected, `.then` chains that flatten
  the pyramid, one `.catch` and one `.finally` — but still callbacks
  underneath
- **async/await:** `async` marks, `await` pauses (not the thread), code
  reads top-to-bottom with `try/catch`, while promises still power it
- Recap: callbacks gave control, promises gave composition, `async/await`
  gave readability — every step was the last idea, rearranged

**Shorts from this video:** callback-hell hook (Cut 6) and the
rearranged-fix arc (Cut 7), plus the uncut vertical master.

### 5. Scope & Closures

The foundation for React (1080p, 30fps, ~2:17): where variables live, how
JavaScript searches outward, and why a function can outlive its owner.
Told in three acts on a "Deep Current" stage — an ink-teal canvas with
drifting glows, a big opacity-spotlighted code listing, a one-clause
kinetic caption, and a depth gauge tracking nesting level 0–4.

**What the video demonstrates:**

- **Global scope:** a variable declared in the open that the whole
  program can read
- **Function & block scope:** a walled cell — inside prints, outside
  gets `ReferenceError`; `{ }` braces are the same wall, smaller
- **The `var` trap:** function-scoped, ignores the brace wall
- **Lexical scope:** the outward search (inner → outer → global), comet
  hops ring by ring, and why the chain is decided by *where the code is
  written*
- **Closures:** `outer` returns `inner` — the function itself, not a
  call — and `count` survives: `counter()` prints 1, 2, 3
- Recap: a scope-visibility matrix (who can read `name`/`message`/
  `count`) plus the three questions to answer before React

**Shorts from this video:** the house act (rooms: global/function/
block + var trap) and the closures act (`return inner`, count survives),
plus the uncut vertical master.

## Vertical Shorts & Publish Kit

The five long-form videos are flanked by a complete publishing pipeline
(all upload copy lives in `publish/`):

### Channel art (`publish/youtube/`, `src/PublishArt.tsx`)

- `banner.png` (2560×1440) and one custom thumbnail per video
  (`thumb-video-{1,2,3,4,5}.png`), all rendered from Remotion compositions in
  the `Publish-Kit` folder so every asset matches the videos' visual
  language.

### Vertical cutdowns (`src/Shorts.tsx`, `renders/shorts/`)

1080×1920 (9:16) shorts — real compositions, not crops — that winnow
each long-form video down to one scene while keeping the exact
word-synced narration timeline:

| Cut | Story | Length |
|---|---|---|
| Short cut 1 | hook hangs showData → **C prints before B** → fulfilled | ~55s |
| Short cut 2 | `await` fires → hook grabs the card → *in limbo* | ~26s |
| Short cut 3 | fulfill → microtask chip **jumps the queue** → resumes → B | ~56s |
| Short cut 4 | event loop: Start → `setTimeout` → End → **Timeout last** | ~50s |
| Short cut 5 | function execution: call → 100 × 3 → 300 → return | ~36s |
| Short cut 6 | callback hell — one level fine, three levels nightmare | ~44s |
| Short cut 7 | evolution fix — callbacks → promises → async/await, rearranged | ~55s |
| Short cut 10 | scope rooms — global / function / block + the `var` trap | ~56s |
| Short cut 11 | closures — `return inner`, and count survives: 1, 2, 3 | ~1:21 |
| Full film (V3) | entire async/await video, uncut vertical master | 2:58 |
| Full film (V4) | entire evolution video, uncut vertical master | 1:39 |
| Full film (V5) | entire scope & closures video, uncut vertical master | 2:17 |

Every cut window is chosen from the measured narration waveform so it
opens inside a silence gap on a sentence that needs no prior context —
no mid-sentence cold opens.

### Upload copy (`publish/`)

- `README.md` — pre-flight ordering checklist
- `youtube/channel-setup.md` + per-video titles/descriptions/tags
- `tiktok/captions.md`, `meta/captions.md` — paste-ready captions,
  hashtags, and posting order (3-day stagger, pin cut 1)
- `vertical-cutdowns/SPEC.md` — the cutdown design spec



- React
- TypeScript
- Remotion
- CSS
- SVG animations

## Technical Notes

- Composition IDs: `CodePanel` (1920×1080, 30fps, 1076 frames),
  `EventLoop` (1628 frames), `AsyncAwait` (5346 frames),
  `AsyncEvolution` (2964 frames), and `ScopeClosuresV2` (4100 frames),
  all 1920×1080 @ 30fps; vertical versions live in the `Shorts` folder
  (`ShortCPrintsBeforeB`, `ShortHookLatch`, `ShortQueueJump`,
  `ShortTimeoutRace`, `ShortFunctionExec`, `ShortAsyncFull`,
  `ShortEvolutionHell`, `ShortEvolutionFix`, `ShortEvolutionFull`,
  `ShortScopeRoomsV2`, `ShortScopeClosureV2`, `ShortScopeFullV2` — all
  1080×1920), plus the `Publish-Kit` folder for banner/thumbnails.
- Every narration WAV/MP3 is word-measured so subtitle and visual timing
  match the audio exactly; timings live as word-anchored `BEATS` and
  `PHASE_STARTS` constants at the top of each composition
  (`src/Subtitles.tsx`, `src/EventLoop.tsx`, `src/AsyncAwait.tsx`,
  `src/evolution/parts.tsx`, and the generated `src/scope2/timing.ts`).
- Video #5's narration + BGM ship as one pre-mixed WAV
  (`public/scopeclosures2-mix.wav`): voice −18 dBFS with the bed ~15 dB
  underneath, +3 dB pre-amplified with a soft-knee limiter to cancel
  Remotion's fixed 0.707 `<Audio>` attenuation.
- `Subtitles` takes an optional `transparent` prop — Video #3/V4 render
  ink-on-paper captions, while Videos #1/#2 keep their subtitle boxes.
- The connector thread uses named, layout-measured anchor constants in `src/CodePanel.tsx` (`vbY = (pixelY − 148) / 1.2457`); the later videos
  reuse the same thread visual language plus word-anchored beat constants.

## Project Structure

- `src/` — Animation components and video composition
- `public/` — Narration audio
- `renders/` — Local rendered video output (not tracked by Git)

## Run Locally

Clone the repository and install dependencies:

```bash
npm install
```

Start the Remotion preview:

```bash
npm run dev
```

## About CodeFlow Visuals

CodeFlow Visuals creates clear, engaging visual explanations of programming concepts, software workflows, and technical ideas.

**Complex code. Clear visuals.**
