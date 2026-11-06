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

## Built With

- React
- TypeScript
- Remotion
- CSS
- SVG animations

## Technical Notes

- Composition IDs: `CodePanel` (1920×1080, 30fps, 1076 frames),
  `EventLoop` (1628 frames), and `AsyncAwait` (5346 frames), all
  1920×1080 @ 30fps.
- Every narration WAV is word-measured with faster-whisper (raw 16kHz
  float arrays) so subtitle and visual timing match the audio exactly;
  each video's timings live as word-anchored `BEATS` constants at the
  top of its composition (`src/Subtitles.tsx`, `src/EventLoop.tsx`,
  `src/AsyncAwait.tsx`).
- `Subtitles` takes an optional `transparent` prop — Video #3 renders
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
