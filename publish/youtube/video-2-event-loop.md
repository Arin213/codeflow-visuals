# Video #2 — JavaScript's Event Loop (54s, 1628 frames)

## Title (primary)

```
The JavaScript Event Loop Finally Makes Sense (Visualized)
```

## Title (A/B alternative)

```
setTimeout(fn, 0) — Why Is It Never 0? The Event Loop Explained
```

## Description

```
One thread. Three prints. Why does "Timeout" come LAST?

Follow one setTimeout from the call stack, to the browser's Web APIs,
into the callback queue, and back onto the stack — while the event loop
watches for a clear stack the whole time. Word-synced narration, a live
loop hub with tick rings, and code-line-to-stack threads.

Chapters:
0:00 One thread, async tasks — how?
0:05 It all comes down to the event loop
0:08 Start prints immediately
0:16 setTimeout → Web APIs
0:24 End prints second
0:31 The callback enters the queue
0:36 The event loop's constant check
0:42 Stack clears → Timeout prints
0:50 Recap

The code in the video:

console.log("Start");
setTimeout(() => {
  console.log("Timeout");
}, 0);
console.log("End");

► Next: async/await — the hidden hook that pauses your functions,
  and how microtasks jump this very queue.

► CodeFlow Visuals — complex code, clear visuals.
```

## Tags

```
event loop, javascript event loop, settimeout, javascript async, callback queue, web apis, javascript animation, javascript tutorial, javascript for beginners, call stack, javascript visually, non blocking javascript, microtasks
```
