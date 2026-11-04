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

## Built With

- React
- TypeScript
- Remotion
- CSS
- SVG animations

## Technical Notes

- Composition ID: `CodePanel` (1920×1080, 30fps, 1076 frames).
- Narration WAV is synchronized with subtitle timings in `src/Subtitles.tsx`.
- The connector thread uses named, layout-measured anchor constants in `src/CodePanel.tsx` (`vbY = (pixelY − 148) / 1.2457`).

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
