# CodeFlow Visuals — JavaScript Function Explainer

**Complex code. Clear visuals.**

A short animated technical explainer demonstrating how JavaScript functions work through synchronized narration, code highlighting, execution stages, and subtitles.

## Project Overview

This project visualizes how a JavaScript function receives arguments, assigns them to parameters, performs a calculation, and returns a result.

The example uses:

```javascript
function calculateTotal(price, quantity) {
  const total = price * quantity;
  return total;
}

const result = calculateTotal(100, 3);
```

## What the Video Demonstrates

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

## Run Locally

Clone the repository and install dependencies:

```bash
npm install
```

Start the Remotion preview:

```bash
npm run dev
```

Render the video:

```bash
npx remotion render src/index.ts CodePanel renders/javascript-function-explainer-final.mp4
```

## Project Structure

- `src/` — Animation components and video composition
- `public/` — Narration audio
- `renders/` — Local rendered video output (not tracked by Git)

## About CodeFlow Visuals

CodeFlow Visuals creates clear, engaging visual explanations of programming concepts, software workflows, and technical ideas.

**Complex code. Clear visuals.**