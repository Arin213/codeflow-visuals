# Video #3 — async/await, The Hook Inside (2:58, 5346 frames)

The flagship. Longest watch time of the three; this is the video the
thumbnail and Shorts funnel should push hardest.

## Title (primary)

```
async/await: The Hidden Hook That Pauses Your JavaScript (Visualized)
```

## Title (A/B alternative)

```
Why "C" Prints Before "B" — The Suspension Hook Inside async/await
```

## Description

```
JavaScript never waits. So what stops your function mid-line?

Call an async function and it runs like normal code. Then it hits
`await` — and the runtime literally hooks the running function, hangs it
in the air, and lets the thread go. This video shows that machinery:
the call in, the hang, the frozen line, the promise flipping pending →
fulfilled, the release as a microtask, the queue jump, the event loop's
grab, and the resume — exactly where the function left off.

The console never lies: A prints, then C, then B.

Chapters:
0:00 The hidden hook inside every async function
0:12 Calling showData()
0:40 await getData() — the fork in the line
0:45 Everything after await is wrapped in a promise
0:53 The hook grabs showData() in the air
1:00 The rest of the function: written, scheduled… limbo
1:06 Stack empty → global code keeps going
1:13 The surprise: C prints before B
1:18 Pending → fulfilled
1:25 getData does the work down below
1:34 Fulfilled, carrying the value
1:46 Unlock signal → released as a microtask
1:58 Microtasks: front-of-the-line privileges
2:05 Callbacks wait their turn
2:10 The event loop's one and only job
2:18 Loop grabs the chip, pushes showData back
2:35 The hook lowers it — resumes after await
2:35 B prints, showData returns the data
2:42 Reads top to bottom, runs as a chain

The code in the video:

async function showData() {
  console.log("A");
  const data = await getData();
  console.log("B");
}
showData();
console.log("C");

► Playlist: JavaScript Visualized — the whole series in order.

► CodeFlow Visuals — complex code, clear visuals.
   Need a technical explainer for your product or course?
   That is literally what we make: animated, narrated, word-synced.
```

## Tags

```
async await, async await javascript, javascript async await, event loop, microtask queue, call stack, javascript promises, javascript tutorial, javascript animation, learn javascript, javascript visually, promise pending fulfilled, callback queue, javascript under the hood, technical explainer
```
