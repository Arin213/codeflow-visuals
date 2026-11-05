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
 * 🎬 VIDEO #2 — JavaScript's Event Loop
 *
 * All timings were measured from public/eventloop-narration.wav
 * (54.24s = 1628 frames @30fps) by word-level transcription
 * (faster-whisper base.en): every PHASE_STARTS entry is the midpoint
 * of the real silence gap before the sentence, and the BEATS below
 * reference exact spoken words. Do not tune these by eye — re-measure
 * if the narration is ever regenerated.
 * ------------------------------------------------------------------ */

export const DURATION = 1628;

const SENTENCES = [
    "Have you ever wondered how JavaScript handles asynchronous tasks with only a single thread?",
    "It all comes down to the Event Loop.",
    'First, console dot log("Start") enters the Call Stack, runs immediately, and prints Start.',
    "Next, setTimeout enters the stack. JavaScript hands the timer over to the browser's Web APIs and immediately pops it off.",
    'Then, console dot log("End") enters the stack, executes, and prints End.',
    "When the timer finishes, the callback moves into the Callback Queue.",
    "Here is where the magic happens: the Event Loop continuously checks if the Call Stack is empty.",
    "Once the stack clears, the Event Loop pushes the callback onto the stack, and Timeout finally prints.",
    "That's how JavaScript runs non-blocking code, using the Event Loop.",
];

/** Real sentence-gap midpoints from the narration waveform. */
const PHASE_STARTS = [0, 155, 225, 471, 729, 928, 1070, 1271, 1494];

const EVENTLOOP_CAPTIONS: Caption[] = SENTENCES.map((text, i) => ({
    start: PHASE_STARTS[i],
    end: i < SENTENCES.length - 1 ? PHASE_STARTS[i + 1] : DURATION,
    text,
}));

/** Word-anchored visual beats (frames).
 *  S3/S4/S5/S8 anchor on the narrator's actual words (push/print/pop). */
const BEATS = {
    introLoopWords: [165, 225], // "It all comes down to the event loop."

    s3Push: 333, // "enters the call stack"
    s3Print: 429, // "prints start"
    s3Pop: 448,

    s4Push: 515, // "enters the stack"
    s4Handoff: 575, // "JavaScript hands the timer"
    s4Pop: 692, // "pops it off"

    s5Push: 814, // "enters the stack"
    s5Print: 904, // "prints end"
    s5Pop: 918,

    timerLeaves: 992, // "the callback moves" — Web APIs empties
    queueIn: 992, // callback chip lands in the queue

    s7CheckStart: 1078, // "Here is where the magic happens"
    s7CheckEnd: 1262, // "...is empty."

    s8Move: 1350, // "pushes" — chip leaves the queue
    s8Push: 1400, // "onto the stack"
    s8Print: 1470, // "finally prints"
    s8Pop: 1494,
};

// ------------------------------------------------------------------
// Source code shown in the left panel.
// Highlight follows the narration phase (not word beats):
//   p2 -> line 0 | p3 -> lines 1..3 | p4 -> line 4 | p7 -> line 2
// ------------------------------------------------------------------
const codeLines = [
    'console.log("Start");',
    "setTimeout(() => {",
    '  console.log("Timeout");',
    "}, 0);",
    'console.log("End");',
];

const LINE_BY_PHASE: number[][] = [
    [],
    [],
    [0],
    [1, 2, 3],
    [4],
    [2], // callback chip in queue — nod at its body line
    [], // pure event-loop mechanics; nothing highlighted
    [2], // the callback body executes
    [],
];

/* ------------- code-line → stack-card thread anchors --------------
 * Measured from rendered stills (1920×1080 canvas): code-line row
 * centers, the call-stack card position (cards sit alone at the bottom
 * of the box while their thread is alive), and the card's left edge.
 * ------------------------------------------------------------------ */
const LINE_ANCHOR_X = 912;
const CARD_ANCHOR_X = 1092;
const CARD_ANCHOR_Y = 598;
const LINE_ROWS_Y = [258, 307, 357, 406, 455];

/** Threads: highlighted line gets tethered to its pushed stack card,
 *  anchored on the same spoken-word beats as the card itself. */
const THREADS: { line: number; push: number; pop: number }[] = [
    { line: 0, push: BEATS.s3Push, pop: BEATS.s3Pop },
    { line: 1, push: BEATS.s4Push, pop: BEATS.s4Pop },
    { line: 4, push: BEATS.s5Push, pop: BEATS.s5Pop },
    { line: 2, push: BEATS.s8Push, pop: BEATS.s8Pop },
];

const HUB = { x: 1417, y: 599 };

const threadPath = (ly: number) =>
    `M ${LINE_ANCHOR_X} ${ly} C 968 ${ly}, 1036 ${CARD_ANCHOR_Y}, ${
        CARD_ANCHOR_X
    } ${CARD_ANCHOR_Y}`;

/** Cubic-bezier point for the travelling light (same curve as threadPath). */
const bezierPoint = (t: number, ly: number) => {
    const u = 1 - t;
    const k = [LINE_ANCHOR_X, 968, 1036, CARD_ANCHOR_X];
    const yv = [ly, ly, CARD_ANCHOR_Y, CARD_ANCHOR_Y];
    return {
        x:
            u * u * u * k[0] +
            3 * u * u * t * k[1] +
            3 * u * t * t * k[2] +
            t * t * t * k[3],
        y:
            u * u * u * yv[0] +
            3 * u * u * t * yv[1] +
            3 * u * t * t * yv[2] +
            t * t * t * yv[3],
    };
};

/* --------------------------- helpers ------------------------------ */

const clamp0 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Which narration phase the current frame belongs to. */
const phaseAt = (frame: number): number => {
    for (let i = PHASE_STARTS.length - 1; i >= 0; i--) {
        if (frame >= PHASE_STARTS[i]) return i;
    }
    return 0;
};

/**
 * Fade-in from `at`, hold, then fade out at `at2` (+fadeTail frames);
 * with fadeTail=0 the thing simply stays visible.
 */
const appear = (frame: number, at: number, at2: number, fadeTail = 5) =>
    fadeTail === 0
        ? interpolate(frame, [at, at + 6], [0, 1], clamp0)
        : interpolate(
              frame,
              [at, at + 6, at2, at2 + fadeTail],
              [0, 1, 1, 0],
              clamp0
          );

/* --------------------------- styles ------------------------------- */

const panel: React.CSSProperties = {
    backgroundColor: "#1E293B",
    borderRadius: 18,
    padding: 30,
};

const box: React.CSSProperties = {
    backgroundColor: "#273449",
    borderRadius: 12,
    padding: 18,
    position: "relative",
    display: "flex",
    flexDirection: "column",
};

const boxLabel: React.CSSProperties = {
    fontSize: 19,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 10,
};

const codeLine: React.CSSProperties = {
    padding: "12px 10px",
    borderRadius: 8,
    fontFamily: "monospace",
    fontSize: 21,
    whiteSpace: "pre",
};

/* --------------------------- component ---------------------------- */

export const EventLoop: React.FC = () => {
    const frame = useCurrentFrame();
    const phase = phaseAt(frame);
    const activeLines = LINE_BY_PHASE[phase];

    // --- console output (persists once printed) ---
    const printStart = appear(frame, BEATS.s3Print, DURATION, 0);
    const printEnd = appear(frame, BEATS.s5Print, DURATION, 0);
    const printTimeout = appear(frame, BEATS.s8Print, DURATION, 0);

    // --- call stack cards: push on "enters", pop after the print ---
    const cardStart = appear(frame, BEATS.s3Push, BEATS.s3Pop);
    const cardSettimeout = appear(frame, BEATS.s4Push, BEATS.s4Pop);
    const cardEnd = appear(frame, BEATS.s5Push, BEATS.s5Pop);
    const cardCallback = appear(frame, BEATS.s8Push, BEATS.s8Pop);

    // --- web APIs timer chip: in on "hands the timer", out on "moves" ---
    const timerOpacity = appear(
        frame,
        BEATS.s4Handoff,
        BEATS.timerLeaves,
        10
    );

    // --- callback queue chip: in as the callback is dequeued ---
    const queueChipOpacity = appear(frame, BEATS.queueIn, BEATS.s8Move, 6);

    // --- event loop hub: dormant at boot, spins always, glows on beats ---
    const hubSpin = frame * (phase >= 6 && phase <= 7 ? 3.2 : 2);
    const hubBase = phase === 0 ? 0.3 : 0.55;
    const hubActive = Math.max(
        hubBase,
        ...([
            [BEATS.introLoopWords[0], BEATS.introLoopWords[0] + 12, BEATS.introLoopWords[1], BEATS.introLoopWords[1] + 10],
            [BEATS.s7CheckStart, BEATS.s7CheckStart + 12, BEATS.s7CheckEnd, BEATS.s7CheckEnd + 9],
            [BEATS.s8Move, BEATS.s8Move + 12, BEATS.s8Pop - 4, BEATS.s8Pop + 6],
            [1596, 1608, DURATION - 6, DURATION], // outro — the loop exits lit
        ] as const).map(([a, b, c, d]) =>
            interpolate(frame, [a, b, c, d], [hubBase, 1, 1, hubBase], clamp0)
        )
    );
    const hubColor = phase === 8 ? "110,231,183" : "96,165,250";

    // --- lifecycle detail ---
    // Tick rings: the loop's recurring "is the stack empty?" probes (phase 7).
    const tickRings: { r: number; o: number }[] = [];
    if (frame >= BEATS.s7CheckStart && frame < BEATS.s7CheckEnd) {
        for (const off of [0, 18]) {
            const t = (((frame - BEATS.s7CheckStart + off) % 36) + 36) % 36 / 36;
            tickRings.push({ r: 58 + t * 78, o: 0.45 * (1 - t) });
        }
    }
    // Boot ring: the loop waking up on "It all comes down to the Event Loop".
    const bootRing =
        frame >= BEATS.introLoopWords[0] - 2 && frame < BEATS.introLoopWords[1]
            ? Math.min((frame - BEATS.introLoopWords[0] + 2) / 34, 1)
            : null;
    // Shutdown ring: how the loop's watch finally ends (outro, green).
    const exitRing =
        frame >= 1596 ? Math.min((frame - 1596) / 34, 1) : null;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: "#101827",
                padding: 60,
                fontFamily: "Arial, sans-serif",
            }}
        >
            <Audio src={staticFile("eventloop-narration.wav")} />

            <div
                style={{
                    color: "#FFFFFF",
                    fontSize: 42,
                    fontWeight: "bold",
                    marginBottom: 40,
                }}
            >
                JavaScript&apos;s Event Loop
            </div>

            <div style={{ display: "flex", gap: 30, flex: 1 }}>
                {/* LEFT: SOURCE CODE */}
                <div style={{ ...panel, flex: 1 }}>
                    <div
                        style={{
                            color: "#93C5FD",
                            fontSize: 24,
                            fontWeight: "bold",
                            marginBottom: 30,
                        }}
                    >
                        SOURCE CODE
                    </div>

                    {codeLines.map((line, index) => (
                        <div
                            key={index}
                            style={{
                                ...codeLine,
                                backgroundColor: activeLines.includes(index)
                                    ? "#334155"
                                    : "transparent",
                                color: activeLines.includes(index)
                                    ? "#FDE68A"
                                    : "#E2E8F0",
                            }}
                        >
                            <span style={{ color: "#64748B" }}>
                                {index + 1}{" "}
                            </span>
                            {line}
                        </div>
                    ))}
                </div>

                {/* RIGHT: RUNTIME ENGINE */}
                <div
                    style={{
                        ...panel,
                        flex: 1,
                        position: "relative",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gridTemplateRows: "1.4fr 1fr",
                        gap: 20,
                    }}
                >
                    {/* CALL STACK */}
                    <div style={{ ...box, border: "2px solid #93C5FD" }}>
                        <div style={{ ...boxLabel, color: "#93C5FD" }}>
                            CALL STACK
                        </div>
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            {cardStart > 0 && (
                                <div style={{ ...frameCard, opacity: cardStart }}>
                                    console.log("Start")
                                </div>
                            )}
                            {cardSettimeout > 0 && (
                                <div
                                    style={{
                                        ...frameCard,
                                        opacity: cardSettimeout,
                                    }}
                                >
                                    setTimeout(cb, 0)
                                </div>
                            )}
                            {cardEnd > 0 && (
                                <div style={{ ...frameCard, opacity: cardEnd }}>
                                    console.log("End")
                                </div>
                            )}
                            {cardCallback > 0 && (
                                <div
                                    style={{
                                        ...frameCard,
                                        opacity: cardCallback,
                                    }}
                                >
                                    console.log("Timeout")
                                </div>
                            )}
                        </div>
                    </div>

                    {/* WEB APIs */}
                    <div style={{ ...box, border: "2px solid #60A5FA" }}>
                        <div style={{ ...boxLabel, color: "#60A5FA" }}>
                            WEB APIs
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
                                    ...chipCard,
                                    opacity: timerOpacity,
                                    borderColor: "#60A5FA",
                                    backgroundColor: "rgba(96,165,250,0.16)",
                                    color: "#F1F5F9",
                                    boxShadow:
                                        "0 0 14px rgba(96,165,250,0.30)",
                                }}
                            >
                                ⏱ setTimeout (0 ms)
                            </div>
                        </div>
                    </div>

                    {/* CALLBACK QUEUE */}
                    <div style={{ ...box, border: "2px solid #FDE68A" }}>
                        <div style={{ ...boxLabel, color: "#FDE68A" }}>
                            CALLBACK QUEUE
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
                                    ...chipCard,
                                    opacity: queueChipOpacity,
                                    borderColor: "#FDE68A",
                                    backgroundColor: "rgba(253,230,138,0.14)",
                                    color: "#FDE68A",
                                    boxShadow:
                                        "0 0 14px rgba(253,230,138,0.28)",
                                }}
                            >
                                () =&gt; Timeout
                            </div>
                        </div>
                    </div>

                    {/* CONSOLE OUTPUT */}
                    <div style={{ ...box, border: "2px solid #6EE7B7" }}>
                        <div style={{ ...boxLabel, color: "#6EE7B7" }}>
                            CONSOLE OUTPUT
                        </div>
                        <div
                            style={{
                                flex: 1,
                                fontFamily: "monospace",
                                fontSize: 22,
                                lineHeight: 1.6,
                                color: "#6EE7B7",
                            }}
                        >
                            <div style={{ opacity: printStart }}>
                                &gt; Start
                            </div>
                            <div style={{ opacity: printEnd }}>
                                &gt; End
                            </div>
                            <div style={{ opacity: printTimeout }}>
                                &gt; Timeout
                            </div>
                        </div>
                    </div>

                    {/* EVENT LOOP HUB (centered over the four boxes) */}
                    <div
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 112,
                            height: 112,
                            borderRadius: "50%",
                            backgroundColor: "#101827",
                            border: `3px solid rgba(${hubColor}, ${hubActive})`,
                            boxShadow: `0 0 ${18 * hubActive}px 3px rgba(${hubColor},${0.5 * hubActive})`,
                            zIndex: 10,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                        }}
                    >
                        <svg width="46" height="46" viewBox="0 0 40 40">
                            <g transform={`rotate(${hubSpin} 20 20)`}>
                                <path
                                    d="M 20 6 A 14 14 0 1 1 6 20"
                                    fill="none"
                                    stroke="#60A5FA"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M 6 20 L 1 15 M 6 20 L 11 16"
                                    stroke="#60A5FA"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                            </g>
                        </svg>
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#FFFFFF",
                            }}
                        >
                            EVENT LOOP
                        </div>
                    </div>
                </div>
            </div>

            {/* THREADS + LOOP PULSES overlay (Video #1 thread language) */}
            <svg
                viewBox="0 0 1920 1080"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    overflow: "visible",
                    pointerEvents: "none",
                }}
            >
                <defs>
                    <filter id="el2ThreadGlow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <marker
                        id="el2Arrowhead"
                        markerWidth="14"
                        markerHeight="14"
                        refX="10"
                        refY="7"
                        orient="auto"
                        markerUnits="userSpaceOnUse"
                    >
                        <path
                            d="M2,2 L11,7 L2,12"
                            fill="none"
                            stroke="#60A5FA"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </marker>
                </defs>

                {/* Per-push thread: code line → pushed stack card */}
                {THREADS.map((t, i) => {
                    if (frame < t.push || frame >= t.pop) return null;
                    const ly = LINE_ROWS_Y[t.line];
                    const opacity = appear(frame, t.push, t.pop);
                    const light = Math.min((frame - t.push) / 16, 1);
                    const pos = bezierPoint(light, ly);
                    return (
                        <g key={i}>
                            <path
                                d={threadPath(ly)}
                                fill="none"
                                stroke="#60A5FA"
                                strokeWidth="4"
                                strokeLinecap="round"
                                markerEnd="url(#el2Arrowhead)"
                                filter="url(#el2ThreadGlow)"
                                opacity={opacity}
                            />
                            <circle
                                cx={LINE_ANCHOR_X}
                                cy={ly}
                                r="4"
                                fill="#60A5FA"
                                opacity={opacity}
                            />
                            {light > 0 && light < 1 && (
                                <circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r="7"
                                    fill="#FFFFFF"
                                    stroke="#60A5FA"
                                    strokeWidth="3"
                                    filter="url(#el2ThreadGlow)"
                                    opacity={0.95}
                                />
                            )}
                        </g>
                    );
                })}

                {/* Hub pulse rings (boot / ticks / shutdown) */}
                {bootRing !== null && (
                    <circle
                        cx={HUB.x}
                        cy={HUB.y}
                        r={58 + bootRing * 72}
                        fill="none"
                        stroke="#60A5FA"
                        strokeWidth="2.5"
                        opacity={0.55 * (1 - bootRing)}
                    />
                )}
                {tickRings.map((r, i) => (
                    <circle
                        key={i}
                        cx={HUB.x}
                        cy={HUB.y}
                        r={r.r}
                        fill="none"
                        stroke="#60A5FA"
                        strokeWidth="2.5"
                        opacity={r.o}
                    />
                ))}
                {exitRing !== null && (
                    <circle
                        cx={HUB.x}
                        cy={HUB.y}
                        r={58 + exitRing * 85}
                        fill="none"
                        stroke="#6EE7B7"
                        strokeWidth="3"
                        opacity={0.6 * (1 - exitRing)}
                    />
                )}
            </svg>

            <Subtitles captions={EVENTLOOP_CAPTIONS} />
        </AbsoluteFill>
    );
};

/* ------------------------ shared small styles --------------------- */

const frameCard: React.CSSProperties = {
    backgroundColor: "#FDE68A",
    color: "#1E293B",
    fontWeight: 700,
    fontSize: 16,
    padding: "10px 12px",
    borderRadius: 8,
    boxShadow: "0 3px 0 rgba(15,23,42,0.35)",
};

const chipCard: React.CSSProperties = {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 700,
    fontSize: 17,
    border: "2px solid",
};
