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

## Built With

- React
- TypeScript
- Remotion
- CSS
- SVG animations

## Technical Notes

- Composition IDs: `CodePanel` (1920×1080, 30fps, 1076 frames) and
  `EventLoop` (1920×1080, 30fps, 1628 frames).
- Every narration WAV is measured (waveform + word-level transcription for
  the event loop) so subtitle and visual timing match the audio exactly;
  timings live in `src/Subtitles.tsx` and `src/EventLoop.tsx`.
- The connector thread uses named, layout-measured anchor constants in `src/CodePanel.tsx` (`vbY = (pixelY − 148) / 1.2457`); the event loop video
  reuses the same thread visual language plus word-anchored beat constants.

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
