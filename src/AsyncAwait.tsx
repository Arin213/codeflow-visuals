import type { Caption } from "./Subtitles";
import {
    AbsoluteFill,
    Audio,
    interpolate,
    staticFile,
    useCurrentFrame,
} from "remotion";
import { Subtitles } from "./Subtitles";

/* ------------------------------------------------------------------
 * 🎬 VIDEO #3 — async/await, the deep dive (the Suspension Hook)
 *
 * All timings measured from public/asyncawait-narration.wav
 * (177.9s = 5346 frames @30fps) with faster-whisper word timestamps:
 * every PHASE_STARTS entry is the midpoint of the real silence gap
 * before the sentence, and every BEATS entry references the exact
 * spoken word. Do not tune these by eye — re-measure if the narration
 * is regenerated.
 *
 * Design: classic sketchnote / notebook style — cream paper, dot grid,
 * ink strokes and a restricted marker palette (color-theory semantics:
 * blue = code & structure, amber = await/pending, green = fulfilled &
 * results, slate = sleeping/secondary). A numbered red thread runs
 * through the whole video showing WHICH STEP is WHICH: ①call →
 * ②hangs → ③waits → ④released → ⑤loop grabs → ⑥resumes.
 * ------------------------------------------------------------------ */

export const ADURATION = 5346;

const SENTENCES = [
    "Inside every async function there is a hidden piece of machinery — a hook — that can stop your code mid line, and hang it in the air.",
    "In this video, we watch it live, on this real code.",
    "Our script declares an async function, called showData.",
    "It is normal JavaScript with one special power: it can pause itself in the middle of a line, without freezing the engine.",
    "When we call showData, the whole showData function steps onto the call stack, just like any function call.",
    "Execution starts at the top.",
    "The first line is plain code — console log A — so the letter A prints right away.",
    "Nothing async has happened yet.",
    "Then showData reaches the await keyword, waiting on the call to getData.",
    "And this is the magic moment: everything after the await line is wrapped up into a promise, held by the runtime.",
    "The hook moves in, grabs showData, and hangs it in the air — paused exactly at the await line.",
    "From now on, the rest of showData exists, but it is not running — it is in limbo.",
    "And because showData is out of the way, the call stack is empty again, so global code keeps going.",
    "The very next line, console log C, runs — C prints before B.",
    "Meanwhile, the promise that showData is waiting on starts out pending — the getData promise is in the pending state.",
    "Down below, the real work happens — getData does its fetching, or its file reading, or whatever getData was written to do.",
    "And the hook keeps showData hanging until that work is done.",
    "When getData finishes, the promise flips from pending to fulfilled — and now the promise carries the data as its result value.",
    "Fulfilled is the unlock signal — the hook lets go, and the rest of showData is released as a microtask.",
    "A microtask is a tiny job with front of the line privileges.",
    "Microtasks always jump the queue. The chip lands in the microtask queue — ahead of every waiting callback.",
    "Timers and callbacks have to wait their turn — microtasks never do.",
    "Now the event loop does its one and only job: any time the call stack is empty, it takes the next microtask.",
    "The stack is empty, so the loop grabs the chip, and pushes the rest of showData straight back onto the call stack.",
    "The hook lowers the card back into place.",
    "And showData resumes exactly where it was hooked — right after the await line, with data finally filled in.",
    "The next line runs — console log B prints B — and showData returns the data to whoever called it.",
    "That is async and await.",
    "showData reads top to bottom, like normal code.",
    "But underneath, it ran as a chain — hook, hang, release, and resume — the ceremony JavaScript performs every time you write await.",
];

/** Real sentence-gap midpoints from the narration waveform. */
const PHASE_STARTS = [
    0, 257, 368, 480, 711, 910, 977, 1140, 1202, 1358, 1578, 1794, 1971,
    2175, 2334, 2555, 2820, 2937, 3189, 3406, 3532, 3759, 3897, 4126, 4343,
    4420, 4644, 4861, 4919, 5021,
];

const ASYNC_CAPTIONS: Caption[] = SENTENCES.map((text, i) => ({
    start: PHASE_STARTS[i],
    end: i < SENTENCES.length - 1 ? PHASE_STARTS[i + 1] : ADURATION,
    text,
}));

/** Word-anchored visual beats (frames). */
const BEATS = {
    s1HookWord: 138, // "a hook"
    s1Hang: 206, // "hang it in the air"

    s3Enter: 839, // "steps onto the call stack" — push
    s3RunA: 1111, // "A prints right away" — console prints A

    s4Await: 1263, // "the await keyword"
    s4Promise: 1529, // "wrapped up into a promise" — locket appears

    s5HookIn: 1598, // "The hook moves in"
    s5Hooked: 1644, // "grabs showData" — LATCH + swing
    s5Frozen: 1737, // "paused exactly at the await line"

    s6DropBack: 2227, // "console log C" — prints C

    s7Pending: 2461, // "starts out pending"

    s8Work: 2686, // "fetching" — progress bar

    s9Fulfilled: 3055, // "to fulfilled" — state flip
    s9Value: 3170, // "carries the data as its result value"

    s10Unlock: 3229, // "unlock signal"
    s10Chip: 3387, // "released as a microtask" — chip released

    s11Jump: 3584, // "jump the queue"
    s11Before: 3704, // "ahead of every waiting callback"

    s12Grabs: 4196, // "the loop grabs"
    s12Push: 4239, // "pushes the rest" — re-push

    s13Lowers: 4366, // "The hook lowers the card"
    s13Resume: 4455, // "showData resumes" — resume marker + prints B
    s13Return: 4793, // "showData returns the data"

    s14Title: 4871, // "That is async and await" — title glow
    s14Chain: 5087, // "ran as a chain"
};

/* ------------------------------------------------------------------
 * Source code shown in the left panel — chosen so the console truth
 * (A, then C, then B) it self-demonstrates while the narrator talks.
 * ------------------------------------------------------------------ */
const codeLines = [
    "async function showData() {",
    '  console.log("A");',
    "  const data = await getData();",
    '  console.log("B");',
    "}",
    "showData();",
    'console.log("C");',
];

// Highlight follows the narration sentence (phases 0..29).
const LINE_BY_PHASE: number[][] = [
    [], // p0 hook teaser
    [], // p1 watch it live
    [0], // p2 declares showData
    [0], // p3 special power
    [5], // p4 call showData()
    [0], // p5 starts at the top
    [1], // p6 console log A
    [], // p7 nothing async yet
    [2], // p8 hits await
    [2], // p9 wrapped into a promise
    [2], // p10 hook grabs (frozen)
    [2], // p11 in limbo
    [6], // p12 stack empty — global continues
    [6], // p13 console log C
    [2], // p14 pending
    [2], // p15 work happens
    [2], // p16 until done
    [2], // p17 fulfilled
    [2], // p18 unlock — released
    [2], // p19 microtask privileges
    [2], // p20 jump the queue
    [2], // p21 timers wait their turn
    [], // p22 event loop's one job
    [2], // p23 grabs + re-push
    [2], // p24 hook lowers card
    [2], // p25 resumes after await
    [3], // p26 console log B + return
    [], // p27 that is async await
    [], // p28 reads top to bottom
    [], // p29 chain recap
];

/* --------------------------- helpers ------------------------------ */

const clamp0 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const phaseAt = (frame: number): number => {
    for (let i = PHASE_STARTS.length - 1; i >= 0; i--) {
        if (frame >= PHASE_STARTS[i]) return i;
    }
    return 0;
};

/** Fade in at `at`, hold until `at2`; fadeTail=0 means hold visible. */
const appear = (frame: number, at: number, at2: number, fadeTail = 6) =>
    fadeTail === 0
        ? interpolate(frame, [at, at + 8], [0, 1], clamp0)
        : interpolate(
              frame,
              [at, at + 8, at2, at2 + fadeTail],
              [0, 1, 1, 0],
              clamp0
          );

/** Max over overlapping pulse intervals — keeps baselines intact. */
const pulse = (
    frame: number,
    base: number,
    intervals: readonly (readonly number[])[]
) =>
    Math.max(
        base,
        ...intervals.map(([a, b, c, d]) =>
            interpolate(frame, [a, b, c, d], [base, 1, 1, base], clamp0)
        )
    );

/* --------------------- sketchnote styles -------------------------- */
/*
 * Palette (color theory, one job per color):
 *   paper  #FAF7EF — warm cream canvas
 *   ink    #2F2A26 — warm near-black, all strokes & text
 *   blue   #2B6CB0 — code, call stack, structure
 *   amber  #D97706 — await / pending / high-priority (the warm accent,
 *                    used exactly where the story says "wait")
 *   green  #2F855A — fulfilled / results / resumed
 *   slate  #8A8378 — sleeping, dimmed, secondary
 */
const INK = "#2F2A26";
const BLUE = "#2B6CB0";
const AMBER = "#D97706";
const GREEN = "#2F855A";
const SLATE = "#8A8378";
const PAPER = "#F3E7CB"; // milk-tea sheet tint

const HAND = '"Segoe Print", "Comic Sans MS", cursive';
const MONO = "Consolas, monospace";

/* Wobbly hand-drawn compartments (uneven radii = pen wobble). */
const sheet: React.CSSProperties = {
    background: "#FFFFFF",
    border: `2.5px solid ${INK}`,
    borderRadius: "26px 12px 22px 14px / 14px 22px 12px 26px",
    padding: 26,
};

const tile: React.CSSProperties = {
    background: "#FFFFFF",
    border: `2px solid ${INK}`,
    borderRadius: "18px 9px 16px 10px / 10px 16px 9px 18px",
    padding: 14,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
};

const tape: React.CSSProperties = {
    position: "absolute",
    top: -14,
    left: "50%",
    width: 110,
    height: 30,
    background: "rgba(246, 196, 84, 0.45)",
    border: "1px solid rgba(217,119,6,0.25)",
    transform: "translateX(-50%) rotate(-2deg)",
};

const tileLabel: React.CSSProperties = {
    fontFamily: HAND,
    fontSize: 20,
    fontWeight: 700,
    color: INK,
    marginBottom: 10,
};

const codeLine: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 10,
    fontFamily: MONO,
    fontSize: 26,
    fontWeight: 700,
    whiteSpace: "pre",
    color: "#4A443D",
};

const chipStyle: React.CSSProperties = {
    background: "#FFFFFF",
    fontFamily: MONO,
    fontSize: 18,
    color: INK,
    padding: "8px 12px",
    borderRadius: "14px 7px 12px 8px / 8px 12px 7px 14px",
    fontWeight: 700,
    border: `2px solid ${INK}`,
};

/* ------------------------------------------------------------------ */
/* The numbered red thread: which step is which.                       */
/* Anchors are tuned to the fixed 1920x1080 layout.                    */
/* ------------------------------------------------------------------ */

const threadLegs: {
    d: string;
    at: number; // frame the pen starts inking
    up: number; // inking duration
    num: number;
    label: string;
    bx: number; // badge x
    by: number; // badge y
}[] = [
    {
        d: "M 255 487 C 500 510, 740 630, 1000 740",
        at: BEATS.s3Enter,
        up: 45,
        num: 1,
        label: "call",
        bx: 450,
        by: 528,
    },
    {
        d: "M 1035 726 C 1080 560, 1170 340, 1330 308",
        at: BEATS.s5Hooked,
        up: 45,
        num: 2,
        label: "hangs",
        bx: 1060,
        by: 500,
    },
    {
        d: "M 1330 360 C 1240 470, 1080 550, 998 596",
        at: BEATS.s5Hooked + 24,
        up: 45,
        num: 3,
        label: "waits",
        bx: 1200,
        by: 470,
    },
    {
        d: "M 1366 362 C 1372 480, 1362 640, 1352 754",
        at: BEATS.s10Unlock,
        up: 45,
        num: 4,
        label: "released",
        bx: 1435,
        by: 540,
    },
    {
        d: "M 1256 774 C 1200 784, 1130 772, 1082 762",
        at: BEATS.s12Grabs,
        up: 40,
        num: 5,
        label: "loop grabs",
        bx: 1150,
        by: 678,
    },
    {
        d: "M 980 796 C 740 900, 460 952, 180 966",
        at: BEATS.s13Resume,
        up: 50,
        num: 6,
        label: "resumes",
        bx: 560,
        by: 810,
    },
];

export const AsyncAwait: React.FC = () => {
    const frame = useCurrentFrame();
    const phase = phaseAt(frame);
    const activeLines = LINE_BY_PHASE[phase] ?? [];
    const B = BEATS;

    /* ---------------- console truth: A ... C ... B ---------------- */
    const printA = appear(frame, B.s3RunA, ADURATION, 0);
    const printC = appear(frame, B.s6DropBack, ADURATION, 0);
    const printB = appear(frame, B.s13Resume + 14, ADURATION, 0);

    /* ---------------- hook rig ---------------- */
    // Hook + cable descend from the ceiling, latch, leave, return low.
    const hookY =
        frame < B.s5HookIn
            ? -420
            : frame < B.s5HookIn + 24
              ? interpolate(
                    frame,
                    [B.s5HookIn, B.s5HookIn + 24],
                    [-420, 0],
                    clamp0
                )
              : frame < B.s10Unlock
                ? 0
                : frame < B.s10Unlock + 24
                  ? interpolate(
                        frame,
                        [B.s10Unlock, B.s10Unlock + 24],
                        [0, -420],
                        clamp0
                    )
                  : frame < B.s13Lowers
                    ? -420
                    : frame < B.s13Lowers + 28
                      ? interpolate(
                            frame,
                            [B.s13Lowers, B.s13Lowers + 28],
                            [-420, 150],
                            clamp0
                        )
                      : frame < B.s13Resume + 34
                        ? 150
                        : frame < B.s13Resume + 58
                          ? interpolate(
                                frame,
                                [B.s13Resume + 34, B.s13Resume + 58],
                                [150, -420],
                                clamp0
                            )
                          : -420;

    // Latch flash on "gets hooked".
    const latchFlash = interpolate(
        frame,
        [B.s5Hooked, B.s5Hooked + 5, B.s5Hooked + 26],
        [0, 1, 0],
        clamp0
    );

    // Pendulum swing of the hanging card.
    const hung = frame >= B.s5Hooked && frame < B.s10Unlock + 26;
    const latchT = frame - B.s5Hooked;
    const windMask = interpolate(
        frame,
        [B.s5Hooked + 18, B.s5Hooked + 40],
        [0, 1],
        clamp0
    );
    const cardAngle = hung
        ? 15 * Math.exp(-latchT / 70) * Math.sin(latchT / 6.5) +
          2.4 * Math.sin(frame / 34) * windMask
        : 0;

    // Hanging card: in on latch, free-falls out when released.
    const cardIn = interpolate(
        frame,
        [B.s5Hooked, B.s5Hooked + 10],
        [0, 1],
        clamp0
    );
    const cardOut = frame < B.s10Unlock + 14
        ? 1
        : frame < B.s10Unlock + 40
          ? interpolate(
                frame,
                [B.s10Unlock + 14, B.s10Unlock + 40],
                [1, 0],
                clamp0
            )
          : 0;
    const cardDrop =
        frame < B.s10Unlock + 14
            ? 0
            : frame < B.s10Unlock + 40
              ? interpolate(
                    frame,
                    [B.s10Unlock + 14, B.s10Unlock + 40],
                    [0, 220],
                    clamp0
                )
              : 220;

    // Lowering return: the hook descends carrying the card again.
    const lowering = frame >= B.s13Lowers && frame < B.s13Resume + 12;
    const lowerOp = Math.min(
        interpolate(frame, [B.s13Lowers + 6, B.s13Lowers + 16], [0, 1], clamp0),
        interpolate(frame, [B.s13Resume, B.s13Resume + 10], [1, 0], clamp0)
    );
    const cardOpacity =
        frame < B.s13Lowers
            ? cardIn * cardOut
            : Math.max(cardIn * cardOut, lowering ? lowerOp : 0);
    const frozenOp = interpolate(
        frame,
        [B.s5Frozen, B.s5Frozen + 8],
        [0, 1],
        clamp0
    );

    // Pencil-shade wedge follows the hook's presence.
    const cone = pulse(
        frame,
        0.22,
        [
            [B.s5Hooked, B.s5Hooked + 8, B.s10Unlock, B.s10Unlock + 14],
            [B.s13Lowers, B.s13Lowers + 10, B.s13Resume + 20, B.s13Resume + 36],
            [B.s1HookWord, B.s1HookWord + 10, B.s1Hang - 10, B.s1Hang],
        ]
    );

    /* ---------------- promise locket ---------------- */
    const locketIn = interpolate(
        frame,
        [B.s4Promise, B.s4Promise + 14],
        [0, 1],
        clamp0
    );
    const locketScale = interpolate(
        frame,
        [B.s4Promise, B.s4Promise + 14],
        [0.8, 1],
        clamp0
    );
    const fulfillFlash = interpolate(
        frame,
        [
            B.s9Fulfilled,
            B.s9Fulfilled + 6,
            B.s9Fulfilled + 44,
        ],
        [0, 1, 0.3],
        clamp0
    );
    const valueChip = interpolate(
        frame,
        [B.s9Value, B.s9Value + 10],
        [0, 1],
        clamp0
    );
    const workBar = interpolate(
        frame,
        [B.s8Work, B.s9Fulfilled],
        [6, 100],
        clamp0
    );
    const workVisible = appear(frame, B.s8Work, ADURATION, 0);

    /* ---------------- queues row ---------------- */
    const chipIn = interpolate(
        frame,
        [B.s10Chip, B.s10Chip + 10],
        [0, 1],
        clamp0
    );
    const chipScale = interpolate(
        frame,
        [B.s11Jump, B.s11Jump + 8, B.s11Jump + 44],
        [1, 1.14, 1],
        clamp0
    );
    const ghostsDim = interpolate(
        frame,
        [B.s11Before, B.s11Before + 12, B.s13Resume, B.s13Resume + 20],
        [0.55, 0.14, 0.14, 0.55],
        clamp0
    );

    // Hook descent deposit + resume markers.
    const resumeChip = interpolate(
        frame,
        [B.s13Lowers + 30, B.s13Lowers + 40],
        [0, 1],
        clamp0
    );
    const returnValue = interpolate(
        frame,
        [B.s13Return, B.s13Return + 10],
        [0, 1],
        clamp0
    );

    // Event loop grabs the microtask: travelling pen dot along the row.
    const grabT = interpolate(
        frame,
        [B.s12Grabs, B.s12Push],
        [0, 1],
        clamp0
    );
    const grabDot = frame >= B.s12Grabs && frame < B.s12Push;

    // Mini stack card: first push/pop, later the re-push.
    const stackFirst = appear(frame, B.s3Enter, B.s4Await + 40);
    const stackRestack = appear(frame, B.s12Push, ADURATION, 0);

    // Pulses: event-loop icon, underline emphasis.
    const loopIcon = pulse(frame, 0.42, [
        [B.s12Grabs, B.s12Grabs + 10, B.s12Push + 18, B.s12Push + 28],
        [B.s13Resume, B.s13Resume + 8, B.s14Chain, B.s14Chain + 14],
    ]);
    const titleGlow = pulse(frame, 0, [
        [B.s1HookWord, B.s1HookWord + 12, B.s1Hang - 10, B.s1Hang],
        [B.s14Title, B.s14Title + 14, B.s14Chain, B.s14Chain + 20],
    ]);

    /* ---------------- thread inking ---------------- */
    const legT = (at: number, up: number) =>
        interpolate(frame, [at, at + up], [0, 1], clamp0);

    return (
        <AbsoluteFill
            style={{
                background:
                    `radial-gradient(rgba(47,42,38,0.055) 1.2px, transparent 1.4px) 0 0 / 26px 26px,` +
                    `radial-gradient(620px 420px at 10% 6%, rgba(150,104,56,0.10), transparent 70%),` +
                    `radial-gradient(800px 620px at 94% 96%, rgba(150,104,56,0.13), transparent 72%),` +
                    `radial-gradient(520px 360px at 88% 10%, rgba(150,104,56,0.07), transparent 70%),` +
                    `radial-gradient(700px 500px at 4% 90%, rgba(150,104,56,0.09), transparent 70%),` +
                    `linear-gradient(165deg, #F4E7C8 0%, #F1E2BD 45%, #EAD5A6 100%)`,
                padding: 60,
                fontFamily: HAND,
                overflow: "hidden",
            }}
        >
            <Audio src={staticFile("asyncawait-narration.wav")} />

            {/* title with a marker underline */}
            <div style={{ position: "relative", marginBottom: 24, height: 52 }}>
                <div
                    style={{
                        fontSize: 40,
                        fontWeight: 700,
                        color: INK,
                        transform: "rotate(-0.5deg)",
                    }}
                >
                    async/await — The Hook Inside
                </div>
                <div
                    style={{
                        position: "absolute",
                        left: 4,
                        bottom: 2,
                        width: Math.min(660, 660 * Math.max(titleGlow, 0.34)),
                        height: 10,
                        borderRadius: 6,
                        background: "rgba(246, 196, 84, 0.55)",
                        transform: "skewX(-14deg) rotate(-0.4deg)",
                    }}
                />
            </div>

            <div style={{ display: "flex", gap: 30, height: 894 }}>
                {/* LEFT: code + console truth */}
                <div
                    style={{
                        ...sheet,
                        width: 760,
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        transform: "rotate(-0.25deg)",
                    }}
                >
                    <div style={tape} />
                    <div style={{ ...tileLabel, color: BLUE }}>
                        source code ⌘
                    </div>
                    {codeLines.map((line, index) => {
                        const isActive = activeLines.includes(index);
                        const style = {
                            ...codeLine,
                            background: isActive
                                ? "rgba(246, 196, 84, 0.38)"
                                : "transparent",
                            color: isActive ? INK : "#4A443D",
                            borderBottom: isActive
                                ? `3px solid ${AMBER}`
                                : "3px solid transparent",
                            transform: isActive ? "rotate(-0.3deg)" : "none",
                        };
                        let content: React.ReactNode = line;
                        if (index === 2) {
                            content = (
                                <>
                                    {"  const data = "}
                                    <span
                                        style={{
                                            color: AMBER,
                                            fontWeight: 700,
                                            textDecoration:
                                                "underline wavy 2px",
                                            textUnderlineOffset: 5,
                                            textDecorationColor:
                                                "rgba(217,119,6,0.6)",
                                        }}
                                    >
                                        await
                                    </span>
                                    {" getData();"}
                                </>
                            );
                        }
                        if (index === 3 && frame >= B.s13Resume) {
                            content = (
                                <>
                                    {"  console.log("}
                                    <span
                                        style={{
                                            color: GREEN,
                                            fontWeight: 700,
                                        }}
                                    >
                                        &quot;B&quot;
                                    </span>
                                    {");"}
                                    <span
                                        style={{
                                            marginLeft: 12,
                                            fontFamily: HAND,
                                            color: GREEN,
                                            fontSize: 15,
                                            fontWeight: 700,
                                        }}
                                    >
                                        ↰ resumed here!
                                    </span>
                                </>
                            );
                        }
                        return (
                            <div key={index} style={style}>
                                <span style={{ color: "#B9B2A6" }}>
                                    {index + 1}{" "}
                                </span>
                                {content}
                            </div>
                        );
                    })}

                    <div style={{ flex: 1 }} />

                    <div
                        style={{
                            ...tile,
                            padding: "14px 16px",
                            transform: "rotate(0.2deg)",
                        }}
                    >
                        <div style={{ ...tileLabel, color: GREEN, fontSize: 20 }}>
                            console ✓
                        </div>
                        <div
                            style={{
                                fontFamily: MONO,
                                fontSize: 25,
                                fontWeight: 700,
                                lineHeight: 1.5,
                            }}
                        >
                            <div style={{ opacity: printA, color: BLUE }}>
                                &gt; A
                            </div>
                            <div style={{ opacity: printC, color: BLUE }}>
                                &gt; C
                            </div>
                            <div style={{ opacity: printB, color: GREEN }}>
                                &gt; B
                                <span
                                    style={{
                                        opacity:
                                            printB && returnValue ? 1 : 0,
                                        fontFamily: HAND,
                                        fontSize: 15,
                                        marginLeft: 10,
                                    }}
                                >
                                    ← after C!
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: the sketch stage */}
                <div
                    style={{
                        ...sheet,
                        flex: 1,
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        transform: "rotate(0.25deg)",
                    }}
                >
                    <div style={{ ...tape, transform: "translateX(-50%) rotate(1.5deg)" }} />

                    {/* RIG AREA (height 380) */}
                    <div style={{ height: 380, position: "relative" }}>
                        <svg
                            viewBox="0 0 958 380"
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                overflow: "visible",
                                pointerEvents: "none",
                            }}
                        >
                            {/* pencil-shade wedge instead of a spotlight */}
                            <polygon
                                points="479,0 300,380 658,380"
                                fill="rgba(47,42,38,0.07)"
                                opacity={cone * 0.6}
                            />

                            {/* cable + hook, drawn like ink pen strokes */}
                            <g transform={`translate(0 ${hookY})`}>
                                <path
                                    d="M 480 -540 C 476 -300, 482 -160, 479 74"
                                    fill="none"
                                    stroke={INK}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                />
                                {/* hook body: stem + J curve */}
                                <path
                                    d="M 479 74 L 479 118 A 24 24 0 1 1 452 118 L 452 100"
                                    fill="none"
                                    stroke={INK}
                                    strokeWidth="7"
                                    strokeLinecap="round"
                                />
                                {/* latch flash */}
                                {latchFlash > 0 && (
                                    <circle
                                        cx="465"
                                        cy="126"
                                        r={10 + latchFlash * 8}
                                        fill="none"
                                        stroke={AMBER}
                                        strokeWidth={3 * latchFlash}
                                        opacity={latchFlash}
                                    />
                                )}
                            </g>
                        </svg>

                        {/* hanging async function card — amber sticky note */}
                        <div
                            style={{
                                position: "absolute",
                                left: 479 - 150,
                                top: 118,
                                width: 300,
                                opacity: cardOpacity,
                                transform: `rotate(${cardAngle}deg) translateY(${lowering ? hookY : cardDrop}px)`,
                                transformOrigin: "50% -10px",
                            }}
                        >
                            {/* handle ring that the hook grabs */}
                            <div
                                style={{
                                    position: "absolute",
                                    left: 130,
                                    top: -14,
                                    width: 22,
                                    height: 22,
                                    borderRadius: "50%",
                                    border: `3px solid ${INK}`,
                                    background: PAPER,
                                }}
                            />
                            <div
                                style={{
                                    background: "#FDF3D0",
                                    border: `2.5px solid ${INK}`,
                                    borderRadius:
                                        "16px 8px 14px 9px / 9px 14px 8px 16px",
                                    padding: "14px 18px",
                                    boxShadow: "3px 4px 0 rgba(47,42,38,0.16)",
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: MONO,
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: INK,
                                    }}
                                >
                                    showData()
                                </div>
                                <div
                                    style={{
                                        marginTop: 6,
                                        fontFamily: HAND,
                                        fontSize: 15,
                                        color: "#6B6357",
                                    }}
                                >
                                    ⏸ paused at{" "}
                                    <span
                                        style={{
                                            color: AMBER,
                                            fontWeight: 700,
                                        }}
                                    >
                                        await
                                    </span>{" "}
                                    getData()
                                </div>
                                {frozenOp > 0 && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            right: 10,
                                            top: 10,
                                            opacity: frozenOp,
                                            fontFamily: HAND,
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: SLATE,
                                            letterSpacing: 1,
                                            border: `2px dashed ${SLATE}`,
                                            borderRadius: 8,
                                            padding: "2px 8px",
                                            transform: "rotate(2.5deg)",
                                            background: "rgba(255,255,255,0.6)",
                                        }}
                                    >
                                        ❄ FROZEN
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* released card label during free-fall */}
                        {frame >= B.s10Unlock && frame < B.s10Chip + 8 && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: 479 - 70,
                                    top: 130 + cardDrop * 0.6,
                                    fontFamily: HAND,
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color: GREEN,
                                    opacity: cardOut,
                                }}
                            >
                                ⚡ released!
                            </div>
                        )}
                    </div>

                    {/* PROMISE LOCKET ROW (height 120) */}
                    <div style={{ height: 120, display: "flex", gap: 16 }}>
                        <div
                            style={{
                                width: 150,
                                height: 120,
                                position: "relative",
                                opacity: locketIn,
                                transform: `scale(${locketScale})`,
                            }}
                        >
                            <svg
                                viewBox="0 0 150 120"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                }}
                            >
                                <circle
                                    cx="75"
                                    cy="60"
                                    r="44"
                                    fill="#FFFFFF"
                                    stroke={
                                        frame < B.s9Fulfilled ? AMBER : GREEN
                                    }
                                    strokeWidth="2.5"
                                    strokeDasharray="11 7"
                                    transform={`rotate(${frame < B.s9Fulfilled ? frame * 1.6 : 0} 75 60)`}
                                />
                                <text
                                    x="75"
                                    y="57"
                                    textAnchor="middle"
                                    fontFamily={HAND}
                                    fontSize="17"
                                    fontWeight="700"
                                    fill={
                                        frame < B.s9Fulfilled ? AMBER : GREEN
                                    }
                                >
                                    {frame < B.s9Fulfilled
                                        ? "pending"
                                        : "fulfilled"}
                                </text>
                                {frame >= B.s9Value && (
                                    <text
                                        x="75"
                                        y="78"
                                        textAnchor="middle"
                                        fontSize="13"
                                        fontFamily={MONO}
                                        fill={GREEN}
                                        opacity={valueChip}
                                    >
                                        data ✓
                                    </text>
                                )}
                                {fulfillFlash > 0 && (
                                    <circle
                                        cx="75"
                                        cy="60"
                                        r={44 + fulfillFlash * 26}
                                        fill="none"
                                        stroke={GREEN}
                                        strokeWidth={2.5 * (1 - fulfillFlash * 0.7)}
                                        opacity={fulfillFlash}
                                    />
                                )}
                            </svg>
                        </div>

                        {/* work progress — pen-filled bar */}
                        <div
                            style={{
                                ...tile,
                                flex: 1,
                                opacity: workVisible,
                                justifyContent: "center",
                            }}
                        >
                            <div style={{ ...tileLabel, color: BLUE, fontSize: 18 }}>
                                the work (down below)
                            </div>
                            <div
                                style={{
                                    height: 16,
                                    border: `2px solid ${INK}`,
                                    borderRadius:
                                        "10px 6px 12px 8px / 8px 12px 6px 10px",
                                    background: "#FFFFFF",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${workBar}%`,
                                        borderRadius:
                                            "8px 4px 10px 6px / 6px 10px 4px 8px",
                                        background: BLUE,
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    marginTop: 8,
                                    fontSize: 15,
                                    color: SLATE,
                                }}
                            >
                                fetch · file read · whatever you wrote
                            </div>
                        </div>
                    </div>

                    {/* RUNTIME ROW (height 150) */}
                    <div
                        style={{
                            height: 150,
                            position: "relative",
                            display: "flex",
                            gap: 12,
                        }}
                    >
                        {/* mini stack */}
                        <div style={{ ...tile, flex: 1.05 }}>
                            <div
                                style={{
                                    ...tileLabel,
                                    color: BLUE,
                                    fontSize: 23,
                                }}
                            >
                                call stack
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "flex-end",
                                    gap: 6,
                                    alignItems: "center",
                                }}
                            >
                                <div
                                    style={{
                                        ...chipStyle,
                                        opacity: stackFirst > 0 ? stackFirst : 0,
                                        background: "#E3EFF9",
                                        borderColor: BLUE,
                                        color: "#1E4E79",
                                        display:
                                            stackFirst > 0 && stackRestack === 0
                                                ? "block"
                                                : "none",
                                    }}
                                >
                                    showData()
                                </div>
                                <div
                                    style={{
                                        ...chipStyle,
                                        opacity: stackRestack,
                                        background:
                                            stackRestack > 0 &&
                                            frame >= B.s13Resume
                                                ? "#DFF3E8"
                                                : "#E3EFF9",
                                        borderColor:
                                            frame >= B.s13Resume
                                                ? GREEN
                                                : BLUE,
                                        color:
                                            frame >= B.s13Resume
                                                ? GREEN
                                                : "#1E4E79",
                                        display:
                                            stackRestack > 0 ? "block" : "none",
                                    }}
                                >
                                    showData()
                                    {resumeChip > 0 && (
                                        <span
                                            style={{
                                                marginLeft: 8,
                                                opacity: resumeChip,
                                                fontFamily: HAND,
                                                color: GREEN,
                                                fontSize: 15,
                                            }}
                                        >
                                            ▶ resume
                                        </span>
                                    )}
                                </div>
                                <div
                                    style={{
                                        ...chipStyle,
                                        opacity: 0.35,
                                        borderStyle: "dashed",
                                        color: SLATE,
                                        borderRadius: 10,
                                    }}
                                >
                                    global scope
                                </div>
                            </div>
                            {returnValue > 0 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        right: 8,
                                        top: 4,
                                        opacity: returnValue,
                                        fontFamily: HAND,
                                        fontSize: 15,
                                        color: GREEN,
                                        fontWeight: 700,
                                    }}
                                >
                                    → returns data
                                </div>
                            )}
                        </div>

                        {/* microtask queue */}
                        <div style={{ ...tile, flex: 1 }}>
                            <div
                                style={{
                                    ...tileLabel,
                                    color: AMBER,
                                    fontSize: 23,
                                }}
                            >
                                microtask queue
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <div
                                    style={{
                                        ...chipStyle,
                                        opacity: chipIn,
                                        transform: `scale(${chipScale})`,
                                        background: "#FDF3D0",
                                        borderColor: AMBER,
                                        color: "#8C4A03",
                                        fontFamily: MONO,
                                    }}
                                >
                                    ⚡ rest of showData()
                                </div>
                            </div>
                        </div>

                        {/* normal callback queue */}
                        <div style={{ ...tile, flex: 1 }}>
                            <div
                                style={{
                                    ...tileLabel,
                                    color: SLATE,
                                    fontSize: 23,
                                }}
                            >
                                callback queue
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    gap: 8,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity: ghostsDim,
                                }}
                            >
                                <div
                                    style={{
                                        ...chipStyle,
                                        fontSize: 16,
                                        borderStyle: "dashed",
                                        color: SLATE,
                                        borderRadius: 10,
                                    }}
                                >
                                    cb 1
                                </div>
                                <div
                                    style={{
                                        ...chipStyle,
                                        fontSize: 16,
                                        borderStyle: "dashed",
                                        color: SLATE,
                                        borderRadius: 10,
                                    }}
                                >
                                    cb 2
                                </div>
                            </div>
                            <div
                                style={{
                                    fontSize: 14,
                                    color: SLATE,
                                    textAlign: "center",
                                    paddingBottom: 4,
                                }}
                            >
                                sleeps — waits its turn 💤
                            </div>
                        </div>

                        {/* mini event loop */}
                        <div
                            style={{
                                position: "absolute",
                                right: -14,
                                top: -14,
                                width: 66,
                                height: 66,
                                borderRadius: "50%",
                                background: "#FFFFFF",
                                border: `2.5px solid rgba(43,108,176,${loopIcon})`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <svg width="34" height="34" viewBox="0 0 40 40">
                                <g transform={`rotate(${frame * 2.4} 20 20)`}>
                                    <path
                                        d="M 20 6 A 14 14 0 1 1 6 20"
                                        fill="none"
                                        stroke={INK}
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M 6 20 L 1 15 M 6 20 L 11 16"
                                        fill="none"
                                        stroke={INK}
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                    />
                                </g>
                            </svg>
                        </div>

                        {/* travelling pen dot: microtask → stack */}
                        {grabDot && (
                            <svg
                                viewBox="0 0 958 150"
                                preserveAspectRatio="none"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    pointerEvents: "none",
                                    overflow: "visible",
                                }}
                            >
                                <line
                                    x1="640"
                                    y1="72"
                                    x2="160"
                                    y2="72"
                                    stroke={INK}
                                    strokeOpacity="0.35"
                                    strokeWidth="2"
                                    strokeDasharray="7 6"
                                />
                                <circle
                                    cx={640 - grabT * 480}
                                    cy="72"
                                    r="6.5"
                                    fill={PAPER}
                                    stroke={INK}
                                    strokeWidth="2.5"
                                />
                            </svg>
                        )}
                    </div>
                </div>
            </div>

            {/* THE NUMBERED THREAD — which step is which */}
            <svg
                viewBox="0 0 1920 1080"
                preserveAspectRatio="none"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                }}
            >
                <defs>
                    <marker
                        id="sketchArrow"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6.5"
                        markerHeight="6.5"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={INK} />
                    </marker>
                </defs>

                {threadLegs.map((leg) => {
                    const t = legT(leg.at, leg.up);
                    if (t <= 0) return null;
                    const badgeIn = appear(frame, leg.at + 4, ADURATION, 0);
                    return (
                        <g key={leg.num} opacity={badgeIn}>
                            <path
                                d={leg.d}
                                fill="none"
                                stroke="rgba(178, 60, 47, 0.75)"
                                strokeWidth="2.5"
                                strokeDasharray="9 7"
                                strokeLinecap="round"
                                pathLength={1}
                                strokeDashoffset={1 - t}
                                markerEnd={
                                    t > 0.97 ? "url(#sketchArrow)" : undefined
                                }
                            />
                            {/* numbered station badge */}
                            <g transform={`translate(${leg.bx} ${leg.by})`}>
                                <circle
                                    r="15"
                                    fill="#FFFFFF"
                                    stroke={INK}
                                    strokeWidth="2.5"
                                />
                                <text
                                    textAnchor="middle"
                                    dy="5.5"
                                    fontFamily={HAND}
                                    fontSize="16"
                                    fontWeight="700"
                                    fill={INK}
                                >
                                    {leg.num}
                                </text>
                                <text
                                    x="23"
                                    y="5"
                                    fontFamily={HAND}
                                    fontSize="14"
                                    fontStyle="italic"
                                    fill={SLATE}
                                >
                                    {leg.label}
                                </text>
                            </g>
                        </g>
                    );
                })}
            </svg>

            <Subtitles captions={ASYNC_CAPTIONS} transparent />
        </AbsoluteFill>
    );
};
