import type { Caption } from "./Subtitles";
import {
    AbsoluteFill,
    Audio,
    interpolate,
    staticFile,
    useCurrentFrame,
} from "remotion";
import {
    BEATS as AB,
    PHASE_STARTS as APHASES,
    SENTENCES as ASENT,
    LINE_BY_PHASE as ALINES,
    codeLines as asyncCodeLines,
} from "./AsyncAwait";
import {
    BEATS as EB,
    PHASE_STARTS as EPHASES,
    SENTENCES as ESENT,
    LINE_BY_PHASE as ELINES,
    codeLines as loopCodeLines,
} from "./EventLoop";
import { functionExecutionCaptions } from "./Subtitles";

/* ==================================================================
 * 🎬 VERTICAL SHORTS — 1080×1920 (9:16), one per platform posting day
 *
 * Built per publish/vertical-cutdowns/SPEC.md: same measured BEATS/
 * PHASE_STARTS as the long-form videos, so every visual lands exactly
 * on the narrator's words — we only change the CANVAS, not the sync.
 *
 * Cutdown windows (frames inside the long-form timeline, chosen to
 * land inside MEASURED silence gaps, opening on a sentence that
 * needs no prior context so every short starts with its own setup):
 *   ShortCPrintsBeforeB  1555→3189  hook hangs → limbo → stack empty → C before B → fulfilled
 *   ShortHookLatch       1202→1977  await fires → hook grabs → FROZEN / limbo
 *   ShortQueueJump       3189→4861  unlock → chip jumps queue → resume
 *   ShortTimeoutRace        0→1494  full event-loop story (Video #2)
 *   ShortFunctionExec        0→1072  call → params → multiply → return (full story)
 *   ShortAsyncFull           0→5346  COMPLETE async/await film — uncut
 *
 * Render:
 *   npx remotion render src/index.ts ShortCPrintsBeforeB renders/shorts/cut-1-c-before-b.mp4
 * ================================================================== */

const INK = "#2F2A26";
const BLUE = "#2B6CB0";
const AMBER = "#D97706";
const GREEN = "#2F855A";
const SLATE = "#8A8378";
const PAPER = "#F3E7CB";

const HAND = '"Segoe Print", "Comic Sans MS", cursive';
const MONO = "Consolas, monospace";

/* same aged paper as the long-form sketch videos */
const paperBackground =
    `radial-gradient(rgba(47,42,38,0.055) 1.2px, transparent 1.4px) 0 0 / 26px 26px,` +
    `radial-gradient(420px 300px at 10% 4%, rgba(150,104,56,0.10), transparent 70%),` +
    `radial-gradient(560px 440px at 92% 96%, rgba(150,104,56,0.13), transparent 72%),` +
    `radial-gradient(380px 260px at 86% 8%, rgba(150,104,56,0.07), transparent 70%),` +
    `linear-gradient(165deg, #F4E7C8 0%, #F1E2BD 45%, #EAD5A6 100%)`;

const clamp0 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

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

const phaseOf = (phases: number[], frame: number): number => {
    for (let i = phases.length - 1; i >= 0; i--) {
        if (frame >= phases[i]) return i;
    }
    return 0;
};

/* --------------------------- shared bits -------------------------- */

const sheet: React.CSSProperties = {
    background: "#FFFFFF",
    border: `2.5px solid ${INK}`,
    borderRadius: "26px 12px 22px 14px / 14px 22px 12px 26px",
    padding: 26,
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

/** Big spec title stamp — shown for the first ~3s of every short. */
const Stamp: React.FC<{ text: string }> = ({ text }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [2, 12, 78, 94], [0, 1, 1, 0], clamp0);
    const pop = interpolate(frame, [2, 16], [0.7, 1], clamp0);
    if (opacity <= 0) return null;
    return (
        <div
            style={{
                position: "absolute",
                top: 92,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                zIndex: 30,
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    opacity,
                    transform: `scale(${pop}) rotate(-1.6deg)`,
                    background: "#FDF3D0",
                    border: `3.5px solid ${INK}`,
                    borderRadius: "20px 10px 16px 12px / 12px 16px 10px 20px",
                    boxShadow: "4px 6px 0 rgba(47,42,38,0.18)",
                    padding: "14px 34px",
                    fontFamily: HAND,
                    fontWeight: 700,
                    fontSize: 64,
                    color: INK,
                    maxWidth: 900,
                    textAlign: "center",
                }}
            >
                {text}
            </div>
        </div>
    );
};

/** Vertical subtitle: ink style on paper shorts, dark style on dark shorts. */
const ShortSubs: React.FC<{
    captions: Caption[];
    globalFrame: number;
    mode: "ink" | "dark";
}> = ({ captions, globalFrame, mode }) => {
    const current = captions.find(
        (c) => globalFrame >= c.start && globalFrame < c.end
    );
    if (!current) return null;
    return (
        <div
            style={{
                position: "absolute",
                left: 44,
                right: 44,
                bottom: 36,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                pointerEvents: "none",
                zIndex: 40,
            }}
        >
            <div
                style={{
                    backgroundColor:
                        mode === "ink" ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.88)",
                    color: mode === "ink" ? "#3A2E1E" : "#FFFFFF",
                    fontFamily:
                        mode === "ink"
                            ? HAND
                            : "Arial, sans-serif",
                    fontSize: 44,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    padding: mode === "ink" ? "10px 20px" : "16px 30px",
                    borderRadius: 14,
                    textAlign: "center",
                    maxWidth: "96%",
                    textShadow:
                        mode === "ink"
                            ? "0 1px 0 rgba(243,231,203,0.95), 0 0 10px rgba(243,231,203,0.95)"
                            : "none",
                    boxShadow:
                        mode === "ink"
                            ? "none"
                            : "0 4px 18px rgba(0,0,0,0.3)",
                }}
            >
                {current.text}
            </div>
        </div>
    );
};

const captionFrom = (sentences: string[], phases: number[], duration: number): Caption[] =>
    sentences.map((text, i) => ({
        text,
        start: phases[i],
        end: i < sentences.length - 1 ? phases[i + 1] : duration,
    }));

const asyncCaptions = captionFrom(ASENT, APHASES, 5346);
const eventLoopCaptions = captionFrom(ESENT, EPHASES, 1628);

/* ==================================================================
 * ASYNC SHORTS — one vertical sketchnote stage, driven by the SAME
 * global AsyncAwait frame (f = local frame + cut start). The hook rig,
 * locket, queues and console all reuse the exact beat math.
 * ================================================================== */

export type ShortWindow = {
    start: number;
    end: number;
    stamp: string;
};

const AsyncShort: React.FC<{ window: ShortWindow }> = ({ window: w }) => {
    const local = useCurrentFrame();
    const f = local + w.start;
    const B = AB;
    const phase = phaseOf(APHASES, f);
    const activeLines = ALINES[phase] ?? [];

    /* ---------------- console truth ---------------- */
    const printA = appear(f, B.s3RunA, 5346, 0);
    const printC = appear(f, B.s6DropBack, 5346, 0);
    const printB = appear(f, B.s13Resume + 14, 5346, 0);

    /* ---------------- hook rig (identical math to AsyncAwait) --------- */
    const hookY =
        f < B.s5HookIn
            ? -420
            : f < B.s5HookIn + 24
              ? interpolate(f, [B.s5HookIn, B.s5HookIn + 24], [-420, 0], clamp0)
              : f < B.s10Unlock
                ? 0
                : f < B.s10Unlock + 24
                  ? interpolate(
                        f,
                        [B.s10Unlock, B.s10Unlock + 24],
                        [0, -420],
                        clamp0
                    )
                  : f < B.s13Lowers
                    ? -420
                    : f < B.s13Lowers + 28
                      ? interpolate(
                            f,
                            [B.s13Lowers, B.s13Lowers + 28],
                            [-420, 150],
                            clamp0
                        )
                      : f < B.s13Resume + 34
                        ? 150
                        : f < B.s13Resume + 58
                          ? interpolate(
                                f,
                                [B.s13Resume + 34, B.s13Resume + 58],
                                [150, -420],
                                clamp0
                            )
                          : -420;

    const latchFlash = interpolate(
        f,
        [B.s5Hooked, B.s5Hooked + 5, B.s5Hooked + 26],
        [0, 1, 0],
        clamp0
    );

    const hung = f >= B.s5Hooked && f < B.s10Unlock + 26;
    const latchT = f - B.s5Hooked;
    const windMask = interpolate(
        f,
        [B.s5Hooked + 18, B.s5Hooked + 40],
        [0, 1],
        clamp0
    );
    const cardAngle = hung
        ? 15 * Math.exp(-latchT / 70) * Math.sin(latchT / 6.5) +
          2.4 * Math.sin(f / 34) * windMask
        : 0;

    const cardIn = interpolate(f, [B.s5Hooked, B.s5Hooked + 10], [0, 1], clamp0);
    const cardOut =
        f < B.s10Unlock + 14
            ? 1
            : f < B.s10Unlock + 40
              ? interpolate(
                    f,
                    [B.s10Unlock + 14, B.s10Unlock + 40],
                    [1, 0],
                    clamp0
                )
              : 0;
    const cardDrop =
        f < B.s10Unlock + 14
            ? 0
            : f < B.s10Unlock + 40
              ? interpolate(
                    f,
                    [B.s10Unlock + 14, B.s10Unlock + 40],
                    [0, 240],
                    clamp0
                )
              : 240;

    const lowering = f >= B.s13Lowers && f < B.s13Resume + 12;
    const lowerOp = Math.min(
        interpolate(f, [B.s13Lowers + 6, B.s13Lowers + 16], [0, 1], clamp0),
        interpolate(f, [B.s13Resume, B.s13Resume + 10], [1, 0], clamp0)
    );
    const cardOpacity =
        f < B.s13Lowers
            ? cardIn * cardOut
            : Math.max(cardIn * cardOut, lowering ? lowerOp : 0);
    const frozenOp = interpolate(f, [B.s5Frozen, B.s5Frozen + 8], [0, 1], clamp0);

    const cone = pulse(f, 0.22, [
        [B.s5Hooked, B.s5Hooked + 8, B.s10Unlock, B.s10Unlock + 14],
        [B.s13Lowers, B.s13Lowers + 10, B.s13Resume + 20, B.s13Resume + 36],
    ]);

    /* ---------------- promise locket + work ---------------- */
    const locketIn = interpolate(f, [B.s4Promise, B.s4Promise + 14], [0, 1], clamp0);
    const locketScale = interpolate(f, [B.s4Promise, B.s4Promise + 14], [0.8, 1], clamp0);
    const fulfilled = f >= B.s9Fulfilled;
    const fulfillFlash = interpolate(
        f,
        [B.s9Fulfilled, B.s9Fulfilled + 6, B.s9Fulfilled + 44],
        [0, 1, 0.3],
        clamp0
    );
    const valueChip = interpolate(f, [B.s9Value, B.s9Value + 10], [0, 1], clamp0);
    const workBar = interpolate(f, [B.s8Work, B.s9Fulfilled], [6, 100], clamp0);
    const workVisible = appear(f, B.s8Work, 5346, 0);

    /* ---------------- queues ---------------- */
    const chipIn = interpolate(f, [B.s10Chip, B.s10Chip + 10], [0, 1], clamp0);
    const chipScale = interpolate(f, [B.s11Jump, B.s11Jump + 8, B.s11Jump + 44], [1, 1.14, 1], clamp0);
    const ghostsDim = interpolate(
        f,
        [B.s11Before, B.s11Before + 12, B.s13Resume, B.s13Resume + 20],
        [0.55, 0.14, 0.14, 0.55],
        clamp0
    );

    const stackFirst = appear(f, B.s3Enter, B.s4Await + 40);
    const stackRestack = appear(f, B.s12Push, 5346, 0);
    const resumeChip = interpolate(f, [B.s13Lowers + 30, B.s13Lowers + 40], [0, 1], clamp0);
    const returnValue = interpolate(f, [B.s13Return, B.s13Return + 10], [0, 1], clamp0);

    const grabT = interpolate(f, [B.s12Grabs, B.s12Push], [0, 1], clamp0);
    const grabDot = f >= B.s12Grabs && f < B.s12Push;

    const loopIcon = pulse(f, 0.5, [
        [B.s12Grabs, B.s12Grabs + 10, B.s12Push + 18, B.s12Push + 28],
        [B.s13Resume, B.s13Resume + 8, B.s13Resume + 30, B.s13Resume + 44],
    ]);

    return (
        <AbsoluteFill
            style={{
                background: paperBackground,
                padding: 44,
                fontFamily: HAND,
                overflow: "hidden",
            }}
        >
            <Audio src={staticFile("asyncawait-narration.wav")} startFrom={w.start} />
            <Stamp text={w.stamp} />
            <ShortSubs
                captions={asyncCaptions}
                globalFrame={f}
                mode="ink"
            />

            {/* header */}
            <div
                style={{
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                }}
            >
                <div
                    style={{
                        fontSize: 34,
                        fontWeight: 700,
                        color: INK,
                        transform: "rotate(-0.5deg)",
                    }}
                >
                    async/await — the hook inside
                </div>
            </div>

            {/* CODE SHEET (code top, console bottom) */}
            <div
                style={{
                    ...sheet,
                    marginTop: 14,
                    display: "flex",
                    flexDirection: "column",
                    transform: "rotate(-0.2deg)",
                }}
            >
                <div style={tape} />
                <div style={{ fontSize: 22, fontWeight: 700, color: BLUE, marginBottom: 8 }}>
                    source code ⌘
                </div>
                {asyncCodeLines.map((line, index) => {
                    const isActive = activeLines.includes(index);
                    const style: React.CSSProperties = {
                        padding: "7px 10px",
                        borderRadius: 10,
                        fontFamily: MONO,
                        fontSize: 33,
                        fontWeight: 700,
                        whiteSpace: "pre",
                        color: isActive ? INK : "#4A443D",
                        background: isActive
                            ? "rgba(246, 196, 84, 0.38)"
                            : "transparent",
                        borderBottom: isActive
                            ? `3px solid ${AMBER}`
                            : "3px solid transparent",
                    };
                    let content: React.ReactNode = line;
                    if (index === 2) {
                        content = (
                            <>
                                {"  const data = "}
                                <span
                                    style={{
                                        color: AMBER,
                                        textDecoration: "underline wavy 2px",
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
                    if (index === 3 && f >= B.s13Resume) {
                        content = (
                            <>
                                {"  console.log("}
                                <span style={{ color: GREEN }}>&quot;B&quot;</span>
                                {");"}
                                <span
                                    style={{
                                        marginLeft: 12,
                                        fontFamily: HAND,
                                        color: GREEN,
                                        fontSize: 18,
                                    }}
                                >
                                    ↰ resumed here!
                                </span>
                            </>
                        );
                    }
                    return (
                        <div key={index} style={style}>
                            <span style={{ color: "#B9B2A6", fontSize: 24 }}>
                                {index + 1}{" "}
                            </span>
                            {content}
                        </div>
                    );
                })}

                {/* console truth */}
                <div
                    style={{
                        ...tile,
                        marginTop: 10,
                        padding: "12px 16px",
                    }}
                >
                    <div style={{ fontSize: 20, fontWeight: 700, color: GREEN }}>
                        console ✓
                    </div>
                    <div
                        style={{
                            fontFamily: MONO,
                            fontSize: 28,
                            fontWeight: 700,
                            lineHeight: 1.45,
                        }}
                    >
                        <div style={{ opacity: printA, color: BLUE }}>&gt; A</div>
                        <div style={{ opacity: printC, color: BLUE }}>&gt; C</div>
                        <div style={{ opacity: printB, color: GREEN }}>
                            &gt; B
                            <span
                                style={{
                                    opacity: printB && returnValue ? 1 : 0,
                                    fontFamily: HAND,
                                    fontSize: 18,
                                    marginLeft: 12,
                                }}
                            >
                                ← after C!
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* STAGE SHEET */}
            <div
                style={{
                    ...sheet,
                    marginTop: 16,
                    flex: 1,
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    transform: "rotate(0.2deg)",
                }}
            >
                <div style={{ ...tape, transform: "translateX(-50%) rotate(1.5deg)" }} />

                {/* RIG AREA */}
                <div style={{ height: 430, position: "relative" }}>
                    <svg
                        viewBox="0 0 932 430"
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            pointerEvents: "none",
                        }}
                    >
                        <polygon
                            points="466,0 280,430 652,430"
                            fill="rgba(47,42,38,0.07)"
                            opacity={cone * 0.6}
                        />
                        <g transform={`translate(0 ${hookY})`}>
                            <path
                                d="M 466 -520 C 462 -300, 470 -160, 466 106"
                                fill="none"
                                stroke={INK}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M 466 106 L 466 162 A 26 26 0 1 1 436 162 L 436 142"
                                fill="none"
                                stroke={INK}
                                strokeWidth="7"
                                strokeLinecap="round"
                            />
                            {latchFlash > 0 && (
                                <circle
                                    cx="451"
                                    cy="172"
                                    r={10 + latchFlash * 10}
                                    fill="none"
                                    stroke={AMBER}
                                    strokeWidth={3 * latchFlash}
                                    opacity={latchFlash}
                                />
                            )}
                        </g>
                    </svg>

                    {/* hanging showData card */}
                    <div
                        style={{
                            position: "absolute",
                            left: 466 - 175,
                            top: 136,
                            width: 350,
                            opacity: cardOpacity,
                            transform: `rotate(${cardAngle}deg) translateY(${lowering ? hookY : cardDrop}px)`,
                            transformOrigin: "50% -10px",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                left: 153,
                                top: -16,
                                width: 26,
                                height: 26,
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
                                padding: "16px 20px",
                                boxShadow: "3px 4px 0 rgba(47,42,38,0.16)",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: MONO,
                                    fontSize: 30,
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
                                    fontSize: 19,
                                    color: "#6B6357",
                                }}
                            >
                                ⏸ paused at{" "}
                                <span
                                    style={{ color: AMBER, fontWeight: 700 }}
                                >
                                    await
                                </span>{" "}
                                getData()
                            </div>
                            {frozenOp > 0 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        right: 12,
                                        top: 12,
                                        opacity: frozenOp,
                                        fontFamily: HAND,
                                        fontSize: 17,
                                        fontWeight: 700,
                                        color: SLATE,
                                        letterSpacing: 1,
                                        border: `2px dashed ${SLATE}`,
                                        borderRadius: 10,
                                        padding: "3px 10px",
                                        transform: "rotate(2.5deg)",
                                        background: "rgba(255,255,255,0.6)",
                                    }}
                                >
                                    ❄ FROZEN
                                </div>
                            )}
                        </div>
                    </div>

                    {/* released label during free-fall */}
                    {f >= B.s10Unlock && f < B.s10Chip + 8 && (
                        <div
                            style={{
                                position: "absolute",
                                left: 466 - 80,
                                top: 150 + cardDrop * 0.6,
                                fontFamily: HAND,
                                fontSize: 22,
                                fontWeight: 700,
                                color: GREEN,
                                opacity: cardOut,
                            }}
                        >
                            ⚡ released!
                        </div>
                    )}
                </div>

                {/* LOCKET + WORK ROW */}
                <div style={{ height: 150, display: "flex", gap: 16, marginTop: 14 }}>
                    <div
                        style={{
                            width: 160,
                            height: 150,
                            position: "relative",
                            opacity: locketIn,
                            transform: `scale(${locketScale})`,
                        }}
                    >
                        <svg
                            viewBox="0 0 160 150"
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                            }}
                        >
                            <circle
                                cx="80"
                                cy="75"
                                r="54"
                                fill="#FFFFFF"
                                stroke={fulfilled ? GREEN : AMBER}
                                strokeWidth="2.5"
                                strokeDasharray="13 8"
                                transform={`rotate(${fulfilled ? 0 : f * 1.6} 80 75)`}
                            />
                            <text
                                x="80"
                                y="71"
                                textAnchor="middle"
                                fontFamily={HAND}
                                fontSize="21"
                                fontWeight="700"
                                fill={fulfilled ? GREEN : AMBER}
                            >
                                {fulfilled ? "fulfilled" : "pending"}
                            </text>
                            {f >= B.s9Value && (
                                <text
                                    x="80"
                                    y="95"
                                    textAnchor="middle"
                                    fontSize="16"
                                    fontFamily={MONO}
                                    fill={GREEN}
                                    opacity={valueChip}
                                >
                                    data ✓
                                </text>
                            )}
                            {fulfillFlash > 0 && (
                                <circle
                                    cx="80"
                                    cy="75"
                                    r={54 + fulfillFlash * 30}
                                    fill="none"
                                    stroke={GREEN}
                                    strokeWidth={2.5 * (1 - fulfillFlash * 0.7)}
                                    opacity={fulfillFlash}
                                />
                            )}
                        </svg>
                    </div>

                    <div
                        style={{
                            ...tile,
                            flex: 1,
                            opacity: workVisible,
                            justifyContent: "center",
                        }}
                    >
                        <div style={{ fontSize: 19, fontWeight: 700, color: BLUE }}>
                            the work (down below)
                        </div>
                        <div
                            style={{
                                height: 18,
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
                        <div style={{ marginTop: 6, fontSize: 16, color: SLATE }}>
                            fetch · file read · whatever you wrote
                        </div>
                    </div>
                </div>

                {/* QUEUE ROW */}
                <div
                    style={{
                        height: 250,
                        marginTop: 14,
                        position: "relative",
                        display: "flex",
                        gap: 12,
                    }}
                >
                    {/* call stack */}
                    <div style={{ ...tile, flex: 1.05 }}>
                        <div style={{ fontSize: 21, fontWeight: 700, color: BLUE }}>
                            call stack
                        </div>
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: MONO,
                                    fontSize: 20,
                                    padding: "8px 12px",
                                    borderRadius:
                                        "14px 7px 12px 8px / 8px 12px 7px 14px",
                                    fontWeight: 700,
                                    border: `2px solid ${INK}`,
                                    opacity: stackFirst,
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
                                    fontFamily: MONO,
                                    fontSize: 20,
                                    padding: "8px 12px",
                                    borderRadius:
                                        "14px 7px 12px 8px / 8px 12px 7px 14px",
                                    fontWeight: 700,
                                    border: `2px solid ${INK}`,
                                    opacity: stackRestack,
                                    background:
                                        f >= B.s13Resume ? "#DFF3E8" : "#E3EFF9",
                                    borderColor: f >= B.s13Resume ? GREEN : BLUE,
                                    color: f >= B.s13Resume ? GREEN : "#1E4E79",
                                    display: stackRestack > 0 ? "block" : "none",
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
                                            fontSize: 17,
                                        }}
                                    >
                                        ▶ resume
                                    </span>
                                )}
                            </div>
                            <div
                                style={{
                                    background: "#FFFFFF",
                                    fontFamily: MONO,
                                    fontSize: 20,
                                    padding: "8px 12px",
                                    fontWeight: 700,
                                    border: `2px solid ${INK}`,
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
                                    right: 10,
                                    top: 6,
                                    opacity: returnValue,
                                    fontFamily: HAND,
                                    fontSize: 18,
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
                                fontSize: 21,
                                fontWeight: 700,
                                color: AMBER,
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
                                    background: "#FDF3D0",
                                    fontFamily: MONO,
                                    fontSize: 19,
                                    padding: "8px 12px",
                                    borderRadius:
                                        "14px 7px 12px 8px / 8px 12px 7px 14px",
                                    fontWeight: 700,
                                    border: `2px solid ${INK}`,
                                    opacity: chipIn,
                                    transform: `scale(${chipScale})`,
                                    borderColor: AMBER,
                                    color: "#8C4A03",
                                }}
                            >
                                ⚡ rest of showData()
                            </div>
                        </div>
                    </div>

                    {/* callback queue */}
                    <div style={{ ...tile, flex: 1 }}>
                        <div style={{ fontSize: 21, fontWeight: 700, color: SLATE }}>
                            callback queue
                        </div>
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: ghostsDim,
                            }}
                        >
                            <div
                                style={{
                                    background: "#FFFFFF",
                                    fontFamily: MONO,
                                    fontSize: 16,
                                    padding: "6px 10px",
                                    fontWeight: 700,
                                    border: `2px dashed ${SLATE}`,
                                    color: SLATE,
                                    borderRadius: 10,
                                }}
                            >
                                cb 1
                            </div>
                            <div
                                style={{
                                    background: "#FFFFFF",
                                    fontFamily: MONO,
                                    fontSize: 16,
                                    padding: "6px 10px",
                                    fontWeight: 700,
                                    border: `2px dashed ${SLATE}`,
                                    color: SLATE,
                                    borderRadius: 10,
                                }}
                            >
                                cb 2
                            </div>
                        </div>
                        <div
                            style={{
                                fontSize: 15,
                                color: SLATE,
                                textAlign: "center",
                            }}
                        >
                            waits its turn 💤
                        </div>
                    </div>

                    {/* event loop badge */}
                    <div
                        style={{
                            position: "absolute",
                            right: -16,
                            top: -16,
                            width: 68,
                            height: 68,
                            borderRadius: "50%",
                            background: "#FFFFFF",
                            border: `2.5px solid rgba(43,108,176,${loopIcon})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg width="38" height="38" viewBox="0 0 40 40">
                            <g transform={`rotate(${f * 2.4} 20 20)`}>
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

                    {/* travelling pen dot: queue → stack */}
                    {grabDot && (
                        <svg
                            viewBox="0 0 930 250"
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
                                x1="620"
                                y1="125"
                                x2="180"
                                y2="125"
                                stroke={INK}
                                strokeOpacity="0.35"
                                strokeWidth="2"
                                strokeDasharray="7 6"
                            />
                            <circle
                                cx={620 - grabT * 440}
                                cy="125"
                                r="7"
                                fill={PAPER}
                                stroke={INK}
                                strokeWidth="2.5"
                            />
                        </svg>
                    )}
                </div>
            </div>

            {/* reserved subtitle band — keeps captions off the tiles */}
            <div style={{ height: 235, flexShrink: 0 }} />
        </AbsoluteFill>
    );
};

/* ---------------- the three async cut windows ---------------- */

export const ShortCPrintsBeforeB: React.FC = () => (
    <AsyncShort
        window={{
            start: 1555,
            end: 3189,
            stamp: "C prints before B?!",
        }}
    />
);

/** FILM version: the ENTIRE async/await video uncut — every sentence from
 *  the intro to "...the ceremony JavaScript performs every time you write
 *  await." Identical narration timeline to the 16:9 master. */
export const ShortAsyncFull: React.FC = () => (
    <AsyncShort
        window={{
            start: 0,
            end: 5346,
            stamp: "async/await — the hook inside",
        }}
    />
);

export const ShortHookLatch: React.FC = () => (
    <AsyncShort
        window={{
            start: 1202,
            end: 1977,
            stamp: "await HANGS your function",
        }}
    />
);

export const ShortQueueJump: React.FC = () => (
    <AsyncShort
        window={{
            start: 3189,
            end: 4861,
            stamp: "Microtasks NEVER wait",
        }}
    />
);

/* ==================================================================
 * EVENT LOOP SHORT — dark runtime style like Video #2, full story
 * 0→1494 (question → Start → setTimeout → End → queue → Timeout last)
 * ================================================================== */

const darkPanel: React.CSSProperties = {
    backgroundColor: "#1E293B",
    borderRadius: 18,
    padding: 24,
};

export const ShortTimeoutRace: React.FC = () => {
    const local = useCurrentFrame();
    const f = local;
    const phase = phaseOf(EPHASES, f);
    const activeLines = ELINES[phase];

    const printStart = appear(f, EB.s3Print, 1628, 0);
    const printEnd = appear(f, EB.s5Print, 1628, 0);
    const printTimeout = appear(f, EB.s8Print, 1628, 0);

    const cardStart = appear(f, EB.s3Push, EB.s3Pop);
    const cardSettimeout = appear(f, EB.s4Push, EB.s4Pop);
    const cardEnd = appear(f, EB.s5Push, EB.s5Pop);
    const cardCallback = appear(f, EB.s8Push, EB.s8Pop);

    const timerOpacity = appear(f, EB.s4Handoff, EB.timerLeaves, 10);
    const queueChipOpacity = appear(f, EB.queueIn, EB.s8Move, 6);

    const hubSpin = f * (phase >= 6 && phase <= 7 ? 3.2 : 2);
    const hubActive = Math.max(
        0.55,
        ...(
            [
                [EB.introLoopWords[0], EB.introLoopWords[0] + 12, EB.introLoopWords[1], EB.introLoopWords[1] + 10],
                [EB.s7CheckStart, EB.s7CheckStart + 12, EB.s7CheckEnd, EB.s7CheckEnd + 9],
                [EB.s8Move, EB.s8Move + 12, EB.s8Pop - 4, EB.s8Pop + 6],
            ] as const
        ).map(([a, b, c, d]) =>
            interpolate(f, [a, b, c, d], [0.55, 1, 1, 0.55], clamp0)
        )
    );

    // thread anchor rows (measured for this vertical layout)
    const ROWS = [211, 272, 333, 394, 455];
    const STACK_END = { x: 470, y: 1050 }; // arrow lands beside the stack cards
    const HUB = { x: 529, y: 811 }; // sits in the gutter between the two columns

    const tickRings: { r: number; o: number }[] = [];
    if (f >= EB.s7CheckStart && f < EB.s7CheckEnd) {
        for (const off of [0, 18]) {
            const t = (((f - EB.s7CheckStart + off) % 36) + 36) % 36 / 36;
            tickRings.push({ r: 74 + t * 120, o: 0.45 * (1 - t) });
        }
    }
    const bootRing =
        f >= EB.introLoopWords[0] - 2 && f < EB.introLoopWords[1]
            ? Math.min((f - EB.introLoopWords[0] + 2) / 34, 1)
            : null;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: "#101827",
                padding: 44,
                fontFamily: "Arial, sans-serif",
                overflow: "hidden",
            }}
        >
            <Audio src={staticFile("eventloop-narration.wav")} />
            <Stamp text="One thread. THREE prints." />
            <ShortSubs
                captions={eventLoopCaptions}
                globalFrame={Math.min(f, 1627)}
                mode="dark"
            />

            <div
                style={{
                    color: "#FFFFFF",
                    fontSize: 40,
                    fontWeight: "bold",
                    height: 58,
                }}
            >
                JavaScript&apos;s Event Loop
            </div>

            {/* code panel */}
            <div style={{ ...darkPanel, marginTop: 14 }}>
                <div style={{ color: "#93C5FD", fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>
                    SOURCE CODE
                </div>
                {loopCodeLines.map((line, index) => (
                    <div
                        key={index}
                        style={{
                            padding: "10px 10px",
                            borderRadius: 8,
                            fontFamily: "monospace",
                            fontSize: 34,
                            whiteSpace: "pre",
                            backgroundColor: activeLines.includes(index)
                                ? "#334155"
                                : "transparent",
                            color: activeLines.includes(index)
                                ? "#FDE68A"
                                : "#E2E8F0",
                        }}
                    >
                        <span style={{ color: "#64748B", fontSize: 24 }}>
                            {index + 1}{" "}
                        </span>
                        {line}
                    </div>
                ))}
            </div>

            {/* RUNTIME ROW: call stack (left) + web apis / callback queue (right) */}
            <div style={{ display: "flex", gap: 24, marginTop: 22, height: 560 }}>
                {/* CALL STACK */}
                <div
                    style={{
                        ...darkPanel,
                        position: "relative",
                        flexDirection: "column",
                        display: "flex",
                        width: 456,
                        flexShrink: 0,
                        border: "2px solid #93C5FD",
                    }}
                >
                    <div style={{ color: "#93C5FD", fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
                        CALL STACK
                    </div>
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        {cardStart > 0 && (
                            <div style={{ ...frameCardV, opacity: cardStart }}>
                                console.log(&quot;Start&quot;)
                            </div>
                        )}
                        {cardSettimeout > 0 && (
                            <div style={{ ...frameCardV, opacity: cardSettimeout }}>
                                setTimeout(cb, 0)
                            </div>
                        )}
                        {cardEnd > 0 && (
                            <div style={{ ...frameCardV, opacity: cardEnd }}>
                                console.log(&quot;End&quot;)
                            </div>
                        )}
                        {cardCallback > 0 && (
                            <div style={{ ...frameCardV, opacity: cardCallback }}>
                                console.log(&quot;Timeout&quot;)
                            </div>
                        )}
                    </div>
                </div>

                {/* right column */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 20,
                    }}
                >
                    <div
                        style={{
                            ...darkPanel,
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            border: "2px solid #60A5FA",
                        }}
                    >
                        <div
                            style={{
                                color: "#60A5FA",
                                fontSize: 22,
                                fontWeight: 700,
                                letterSpacing: 1,
                                alignSelf: "flex-end",
                                marginRight: 4,
                            }}
                        >
                            WEB APIS
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
                                    ...chipCardV,
                                    opacity: timerOpacity,
                                    borderColor: "#60A5FA",
                                    backgroundColor: "rgba(96,165,250,0.16)",
                                    color: "#F1F5F9",
                                }}
                            >
                                ⏱ setTimeout (0 ms)
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            ...darkPanel,
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            border: "2px solid #FDE68A",
                        }}
                    >
                        <div
                            style={{
                                color: "#FDE68A",
                                fontSize: 22,
                                fontWeight: 700,
                                letterSpacing: 1,
                                alignSelf: "flex-end",
                                marginRight: 4,
                            }}
                        >
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
                                    ...chipCardV,
                                    opacity: queueChipOpacity,
                                    borderColor: "#FDE68A",
                                    backgroundColor: "rgba(253,230,138,0.14)",
                                    color: "#FDE68A",
                                }}
                            >
                                () =&gt; Timeout
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONSOLE */}
            <div
                style={{
                    ...darkPanel,
                    marginTop: 22,
                    height: 250,
                    display: "flex",
                    flexDirection: "column",
                    border: "2px solid #6EE7B7",
                }}
            >
                <div style={{ color: "#6EE7B7", fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>
                    CONSOLE OUTPUT
                </div>
                <div
                    style={{
                        flex: 1,
                        fontFamily: "monospace",
                        fontSize: 32,
                        lineHeight: 1.55,
                        color: "#6EE7B7",
                    }}
                >
                    <div style={{ opacity: printStart }}>&gt; Start</div>
                    <div style={{ opacity: printEnd }}>&gt; End</div>
                    <div style={{ opacity: printTimeout }}>&gt; Timeout</div>
                </div>
            </div>

            {/* EVENT LOOP HUB */}
            <div
                style={{
                    position: "absolute",
                    left: HUB.x - 68,
                    top: HUB.y - 68,
                    width: 136,
                    height: 136,
                    borderRadius: "50%",
                    backgroundColor: "#101827",
                    border: `3px solid rgba(96,165,250,${hubActive})`,
                    boxShadow: `0 0 ${18 * hubActive}px 3px rgba(96,165,250,${0.5 * hubActive})`,
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                }}
            >
                <svg width="50" height="50" viewBox="0 0 40 40">
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
                <div style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF" }}>
                    EVENT LOOP
                </div>
            </div>

            {/* threads + loop rings overlay (full canvas coords) */}
            <svg
                viewBox="0 0 1080 1920"
                preserveAspectRatio="none"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    overflow: "visible",
                    pointerEvents: "none",
                    zIndex: 9,
                }}
            >
                {[
                    { line: 0, push: EB.s3Push, pop: EB.s3Pop },
                    { line: 1, push: EB.s4Push, pop: EB.s4Pop },
                    { line: 4, push: EB.s5Push, pop: EB.s5Pop },
                    { line: 2, push: EB.s8Push, pop: EB.s8Pop },
                ].map((t, i) => {
                    if (f < t.push || f >= t.pop) return null;
                    const opacity = appear(f, t.push, t.pop);
                    const light = Math.min((f - t.push) / 16, 1);
                    const ly = ROWS[t.line];
                    const u = 1 - light;
                    const kx = [800, 800, 700, STACK_END.x];
                    const ky = [ly, ly + 150, STACK_END.y - 40, STACK_END.y];
                    const x =
                        u * u * u * kx[0] +
                        3 * u * u * light * kx[1] +
                        3 * u * light * light * kx[2] +
                        light * light * light * kx[3];
                    const y =
                        u * u * u * ky[0] +
                        3 * u * u * light * ky[1] +
                        3 * u * light * light * ky[2] +
                        light * light * light * ky[3];
                    return (
                        <g key={i}>
                            <path
                                d={`M 800 ${ly} C 800 ${ly + 150}, 700 ${STACK_END.y - 40}, ${STACK_END.x} ${STACK_END.y}`}
                                fill="none"
                                stroke="#60A5FA"
                                strokeWidth="4"
                                strokeLinecap="round"
                                opacity={opacity}
                            />
                            <circle cx="800" cy={ly} r="5" fill="#60A5FA" opacity={opacity} />
                            {light > 0 && light < 1 && (
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="9"
                                    fill="#FFFFFF"
                                    stroke="#60A5FA"
                                    strokeWidth="3"
                                    opacity={0.95}
                                />
                            )}
                        </g>
                    );
                })}

                {bootRing !== null && (
                    <circle
                        cx={HUB.x}
                        cy={HUB.y}
                        r={74 + bootRing * 110}
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
            </svg>
        </AbsoluteFill>
    );
};

const frameCardV: React.CSSProperties = {
    backgroundColor: "#FDE68A",
    color: "#1E293B",
    fontWeight: 700,
    fontSize: 24,
    padding: "12px 16px",
    borderRadius: 8,
    boxShadow: "0 3px 0 rgba(15,23,42,0.35)",
};

const chipCardV: React.CSSProperties = {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: "12px 16px",
    fontWeight: 700,
    fontSize: 22,
    border: "2px solid",
};

/* ==================================================================
 * FUNCTION EXECUTION SHORT — Video #1 vertical recut, 320→972
 * (call → arguments → params → multiply → 300 → return)
 * ================================================================== */

const execCodeLines = [
    "function calculateTotal(price, quantity) {",
    "  const total = price * quantity;",
    "  return total;",
    "}",
    "",
    "const result = calculateTotal(100, 3);",
];

export const ShortFunctionExec: React.FC = () => {
    const local = useCurrentFrame();
    const f = local; // window starts at 0 — full story, global == local

    const stage =
        f < 333 ? 0 : f < 633 ? 1 : f < 834 ? 2 : 3;
    const activeLine = [0, 5, 1, 2][stage];

    const parameterOpacity = interpolate(f, [333, 348], [0, 1], clamp0);
    const totalOpacity = interpolate(f, [633, 648], [0, 1], clamp0);
    const returnOpacity = interpolate(f, [834, 849], [0, 1], clamp0);

    // vertical-thread keyframes (same narration frames as the 16:9 video)
    const ROWS = [203, 258, 312, 367, 421, 476]; // code rows (idx 0..5)
    const TARGETS = [673, 883, 1102, 1290]; // stage card / params / total / returned
    const ANCHOR_X = 930; // right side of the code rows
    const END_X = 955; // lands inside the right (text-free) zone of each card
    const ARROW_START = [ROWS[0], ROWS[0], ROWS[5], ROWS[5], ROWS[1], ROWS[1], ROWS[2]];
    const ARROW_END = [TARGETS[0], TARGETS[0], TARGETS[1], TARGETS[1], TARGETS[2], TARGETS[2], TARGETS[3]];
    const keyframesF = [0, 333, 357, 633, 657, 834, 858];

    const arrowStartY = interpolate(f, keyframesF, ARROW_START, clamp0);
    const arrowEndY = interpolate(f, keyframesF, ARROW_END, clamp0);

    const flowProgress =
        f < 333
            ? 0
            : f < 357
              ? interpolate(f, [333, 357], [0, 1], clamp0)
              : f < 633
                ? 1
                : f < 657
                  ? interpolate(f, [633, 657], [0, 1], clamp0)
                  : f < 834
                    ? 1
                    : f < 858
                      ? interpolate(f, [834, 858], [0, 1], clamp0)
                      : 1;

    const flowOpacity = Math.max(
        interpolate(f, [333, 336, 354, 357], [0, 1, 1, 0], clamp0),
        interpolate(f, [633, 636, 654, 657], [0, 1, 1, 0], clamp0),
        interpolate(f, [834, 837, 855, 858], [0, 1, 1, 0], clamp0)
    );

    const t = flowProgress;
    const u = 1 - t;
    const lightX =
        u * u * u * ANCHOR_X +
        3 * u * u * t * 940 +
        3 * u * t * t * END_X +
        t * t * t * END_X;
    const lightY =
        u * u * u * arrowStartY +
        3 * u * u * t * arrowStartY +
        3 * u * t * t * arrowEndY +
        t * t * t * arrowEndY;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: "#101827",
                padding: 44,
                fontFamily: "Arial, sans-serif",
                overflow: "hidden",
            }}
        >
            <Audio src={staticFile("narration.wav")} />
            <Stamp text="100 × 3 = ?" />
            <ShortSubs
                captions={functionExecutionCaptions}
                globalFrame={Math.min(f, 1075)}
                mode="dark"
            />

            <div
                style={{
                    color: "#FFFFFF",
                    fontSize: 36,
                    fontWeight: "bold",
                    height: 50,
                }}
            >
                How JavaScript Executes a Function
            </div>

            {/* code panel */}
            <div style={{ ...darkPanel, marginTop: 12 }}>
                <div style={{ color: "#93C5FD", fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
                    SOURCE CODE
                </div>
                {execCodeLines.map((line, index) => (
                    <div
                        key={index}
                        style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            fontFamily: "monospace",
                            fontSize: 32,
                            whiteSpace: "pre",
                            backgroundColor:
                                activeLine === index ? "#334155" : "transparent",
                            color:
                                activeLine === index ? "#FDE68A" : "#E2E8F0",
                        }}
                    >
                        <span style={{ color: "#64748B", fontSize: 20 }}>
                            {index + 1}{" "}
                        </span>
                        {line}
                    </div>
                ))}
            </div>

            {/* visualization panel */}
            <div style={{ ...darkPanel, marginTop: 16, flex: 1 }}>
                <div style={{ color: "#6EE7B7", fontSize: 22, fontWeight: "bold" }}>
                    EXECUTION VISUALIZATION
                </div>

                <div
                    style={{
                        backgroundColor: "#273449",
                        borderRadius: 12,
                        padding: 18,
                        marginTop: 16,
                    }}
                >
                    <div style={{ color: "#93C5FD", fontSize: 20 }}>
                        CURRENT STAGE
                    </div>
                    <div style={{ fontSize: 40, fontFamily: HAND, fontWeight: 700, color: "#FFFFFF", marginTop: 8 }}>
                        {[
                            "Function declaration",
                            "Function call",
                            "Calculation",
                            "Return value",
                        ][stage]}
                    </div>
                </div>

                <div
                    style={{
                        color: "#94A3B8",
                        fontSize: 21,
                        marginTop: 40,
                    }}
                >
                    Function parameters
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                    <div
                        style={{
                            flex: 1,
                            backgroundColor: "#273449",
                            borderRadius: 12,
                            padding: 22,
                        }}
                    >
                        <div style={{ color: "#94A3B8", fontSize: 20, marginBottom: 8 }}>
                            price
                        </div>
                        <div
                            style={{
                                color: "#60A5FA",
                                fontSize: 52,
                                fontWeight: "bold",
                                opacity: parameterOpacity,
                            }}
                        >
                            {stage >= 1 ? "100" : "—"}
                        </div>
                    </div>
                    <div
                        style={{
                            flex: 1,
                            backgroundColor: "#273449",
                            borderRadius: 12,
                            padding: 22,
                        }}
                    >
                        <div style={{ color: "#94A3B8", fontSize: 20, marginBottom: 8 }}>
                            quantity
                        </div>
                        <div
                            style={{
                                color: "#60A5FA",
                                fontSize: 52,
                                fontWeight: "bold",
                                opacity: parameterOpacity,
                            }}
                        >
                            {stage >= 1 ? "3" : "—"}
                        </div>
                    </div>
                </div>

                <div style={{ color: "#94A3B8", fontSize: 21, marginTop: 56, marginBottom: 8 }}>
                    Local variable: total
                </div>
                <div
                    style={{
                        backgroundColor: "#273449",
                        padding: 26,
                        borderRadius: 12,
                        textAlign: "center",
                        fontSize: 50,
                        color: "#FDE68A",
                    }}
                >
                    <span style={{ opacity: totalOpacity }}>
                        {stage >= 2 ? "300" : "—"}
                    </span>
                </div>

                <div
                    style={{
                        backgroundColor: "#164E43",
                        borderRadius: 12,
                        padding: 28,
                        marginTop: 60,
                        textAlign: "center",
                    }}
                >
                    <div style={{ color: "#A7F3D0", fontSize: 22 }}>
                        Returned value
                    </div>
                    <div
                        style={{
                            color: "#6EE7B7",
                            fontSize: 72,
                            fontWeight: "bold",
                        }}
                    >
                        <span style={{ opacity: returnOpacity }}>
                            {stage >= 3 ? "300" : "—"}
                        </span>
                    </div>
                </div>
            </div>

            {/* thread overlay (full canvas coords) */}
            <svg
                viewBox="0 0 1080 1920"
                preserveAspectRatio="none"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    overflow: "visible",
                    pointerEvents: "none",
                    zIndex: 10,
                }}
            >
                <defs>
                    <marker
                        id="shortArrow"
                        markerWidth="10"
                        markerHeight="10"
                        refX="8"
                        refY="5"
                        orient="auto"
                        markerUnits="userSpaceOnUse"
                    >
                        <path
                            d="M1,1 L8,5 L1,9"
                            fill="none"
                            stroke="#60A5FA"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </marker>
                </defs>
                <path
                    d={`M ${ANCHOR_X} ${arrowStartY} C 940 ${arrowStartY + 80}, ${END_X} ${arrowEndY - 100}, ${END_X} ${arrowEndY}`}
                    fill="none"
                    stroke="#60A5FA"
                    strokeWidth="4"
                    strokeLinecap="round"
                    markerEnd="url(#shortArrow)"
                    opacity="0.95"
                />
                <circle cx={ANCHOR_X} cy={arrowStartY} r="5" fill="#60A5FA" />
                <circle
                    cx={lightX}
                    cy={lightY}
                    r="9"
                    fill="#FFFFFF"
                    stroke="#60A5FA"
                    strokeWidth="3"
                    opacity={flowOpacity}
                />
            </svg>
        </AbsoluteFill>
    );
};
