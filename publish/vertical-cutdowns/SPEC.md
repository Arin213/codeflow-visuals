# Vertical cutdowns — spec (9:16, 1080×1920)

Built as new Remotion compositions (registered in `src/Root.tsx`),
reusing the **same measured BEATS/PHASE_STARTS** so cuts stay
word-synced. Stage = vertical sheet, same sketchnote style, code +
labels enlarged to fill the frame.

## Compositions to build

| # | Composition | Source | Frames | Scene focus |
|---|---|---|---|---|
| 1 | `ShortCPrintsBeforeB` | AsyncAwait | ~1515 (2490→4005) | A prints → hook hangs → C prints before B → fulfilled → chip |
| 2 | `ShortHookLatch` | AsyncAwait | ~1000 (1200→2200) | await fires → hook descends → latch + ❄FROZEN swing |
| 3 | `ShortQueueJump` | AsyncAwait | ~900 (3380→4280) | chip released · jumps queue · loop grabs · re-push |
| 4 | `ShortTimeoutRace` | EventLoop | ~1150 (170→1320) | Start → setTimeout → End → queue → Timeout last |
| 5 | `ShortFunctionExec` | CodePanel | ~700 (280→980) | call → params → multiply → return 300 |

## Layout logic (vertical stage)

- Code panel on top (numbers left), stage below — swap of the landscape
- Runtime tiles stack vertically: call stack / queues / console
- Subtitle = the `transparent` style, centered, ~44px
- Title stamp on frame 0–90: sketchnote card, e.g. "C prints before B?!"

## Render

```
npx remotion render src/index.ts ShortCPrintsBeforeB renders/shorts/cut-1-c-before-b.mp4
```
(9:16 → `renders/shorts/`, one file per platform posting day)
