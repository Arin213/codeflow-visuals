# Video #4 — The Evolution of Async JavaScript (1:39, 2964 frames)

The sequel to Video #3, but told as history: three eras solving the
same problem, each one a rearrangement of the last.

Runtime is deliberately short (98.6s narration). It is the most
shareable long-form in the series: a complete arc, no filler, and a
payoff line built for a screenshot.

## Title (primary)

```
Callbacks → Promises → async/await: Why Each One Replaced the Last
```

## Title (A/B alternative)

```
Callback Hell, Explained in 100 Seconds (and How await Fixed It)
```

## Description

```
Every async feature in JavaScript solved the same problem, badly, then
better. This is that story in three shapes.

① Callbacks — you hand a function to a function and hope it calls you
back. Each step needs the one before it, so each step nests inside the
last. One level is fine. Three levels is callback hell. And the shape
is the least of it: errors don't throw, they arrive as an argument on
every layer, every library invents its own rules, and you're not in
control — the library decides when, or whether, to call back.

② Promises — a value for a future result. It returns instantly in one
of three states: pending, fulfilled, rejected. .then unpacks the result.
Chains flatten the pyramid because each step returns the next promise.
Errors fall to one .catch; cleanup goes to .finally. But look closely:
still functions passed to functions. Nicer packaging, same baggage.

③ async/await — we needed to read top to bottom. async marks the
function; await pauses it — not the thread — until the promise
settles. Underneath it is still promises: same .then, same .catch. But
now the code reads like the story it tells. Try, catch, one line at a
time.

Callbacks gave us control. Promises gave us composition. async/await
gave us readability. Every step was just the last idea, rearranged.

Chapters:
0:00 Before async/await: the ugly way
0:04 A function given a function
0:08 That's a callback
0:13 Read the user → posts → comments
0:18 One level fine, three levels callback hell
0:25 Not just the shape: errors as arguments
0:30 Every library invents its own rules
0:34 Worse — you're not in control
0:41 Inversion of control
0:43 A value for a future result
0:47 Pending, fulfilled, rejected
0:52 .then unpacks the result
0:54 Chains flatten the pyramid
0:58 One .catch, one .finally
1:02 Still functions passed to functions
1:08 We needed to read top to bottom
1:10 So we got await
1:12 async marks it; await pauses it (not the thread)
1:18 Underneath: still promises
1:23 Reads like the story it tells
1:25 try / catch, one line at a time
1:28 Three eras, one problem
1:34 Every step was the last idea, rearranged

The code in the video:

// ① callbacks
getUser(id, function (err, user) {
  getPosts(user, function (err, posts) {
    getComments(posts, function (err, comments) {
      if (err) return done(err);
      done(null, comments);
    });
  });
});

// ② promises
getUser(id)
  .then(user => getPosts(user))
  .then(posts => getComments(posts))
  .catch(err => handle(err))
  .finally(cleanup);

// ③ async/await
async function load() {
  const user = await getUser(id);
  const posts = await getPosts(user);
  const comments = await getComments(posts);
  return comments;
}

► Watch the deep dive next: "async/await: The Hidden Hook That Pauses
  Your JavaScript" — what await actually does to the function.

► Playlist: JavaScript Visualized — the whole series in order.

► CodeFlow Visuals — complex code, clear visuals.
   Need a technical explainer for your product or course?
   That is literally what we make: animated, narrated, word-synced.
```

## Tags

```
callbacks, callback hell, promises javascript, async await, javascript promises, promise then catch finally, async await explained, javascript tutorial, learn javascript, javascript animation, javascript visually, inversion of control, event loop, javascript under the hood, technical explainer
```

## Thumbnail

`publish/youtube/thumbnails/thumb-video-4.png` (1280×720, composition
`ThumbEvolution`). Designed to read at 320px: **callback hell ✗ → await**,
the pyramid and the staircase carrying the story, plus a small
"same idea, rearranged" strip.

Frame alternatives if you want to A/B a video still instead:
`renders/stills/evo/thumb-hell.png` (the Callback Hell stamp, pain-first)
and `renders/stills/evo/thumb-recap.png` (three eras side by side).

## Pinned comment

```
Which era did you actually learn in? I started in callback hell and I
still flinch at four levels of nesting.
```
