import type { Caption } from "../Subtitles";
import {
    AbsoluteFill,
    Audio,
    interpolate,
    staticFile,
    useCurrentFrame,
} from "remotion";
import { Subtitles } from "../Subtitles";

/* ------------------------------------------------------------------
 * 🎬 VIDEO #4 — The Evolution of Async JavaScript
 *
 * Sequenced from public/asyncevolution-narration.mp3 (98.59s = 2964
 * frames @30fps, edge-tts en-US-AndrewNeural -8%). Sentence windows
 * come from edge-tts SentenceBoundary events, then each boundary is
 * snapped to the midpoint of the real silence gap in the waveform.
 * Never tune these by eye — re-measure if narration is regenerated.
 *
 * Story in three shapes:
 *   ① callbacks → a pyramid that grows downward (control leaves you)
 *   ② promises  → a flat chain of lockets (composition returns)
 *   ③ await     → a staircase you read top-to-bottom (readability)
 * ------------------------------------------------------------------ */

export const ADURATION = 2964; // 98.8s incl. a short tail

export const SENTENCES = [
    "Before async and await, JavaScript waited the ugly way.",
    "You gave a function a function — and hoped it would call you back.",
    "That's a callback.",
    "Read the user. Then their posts. Then the comments.",
    "Each step needs the one before it.",
    "So each step nests inside the last.",
    "One level — fine.",
    "Two levels — getting ugly.",
    "Three — welcome to callback hell.",
    "And it's not just the shape.",
    "Errors don't throw — they arrive as an argument, on every layer.",
    "Every library invents its own rules. You defend everywhere.",
    "Worse — you're not in control.",
    "You handed your function away. It decides when — or whether — to call back.",
    "That's inversion of control.",
    "JavaScript needed a value for a future result.",
    "A promise.",
    "It returns instantly. Pending — fulfilled — or rejected.",
    "Dot then unpacks the result.",
    "Chains flatten the pyramid. Each step returns the next promise.",
    "Errors fall to one dot catch. Cleanup to dot finally.",
    "But look closely — still functions passed to functions.",
    "Nicer packaging. Same baggage.",
    "We needed to read top to bottom.",
    "So we got await.",
    "async marks the function. await pauses it — not the thread — until the promise settles.",
    "Underneath, it's still promises. Same dot then. Same dot catch.",
    "But now the code reads like the story it tells.",
    "Try, catch, one line at a time.",
    "Callbacks gave us control. Promises gave us composition. async await gave us readability.",
    "Every step was just the last idea, rearranged.",
];

/** Sentence-gap midpoints from the narration waveform (frames @30fps). */
export const PHASE_STARTS = [
    0, 132, 241, 279, 394, 464, 549, 593, 653, 718, 769, 906, 1034, 1096,
    1252, 1307, 1402, 1434, 1566, 1628, 1758, 1881, 1990, 2067, 2127, 2164,
    2349, 2494, 2578, 2660, 2848,
];

export const ADURATION_END = 2956; // last spoken word (frame)

/** Clause / word-anchored visual beats (frames). */
export const BEATS = {
    // ① callbacks
    s1Slam: 0,
    s2Give: 134,
    s3Callback: 243,
    s4Read: 282,
    s4Posts: 318,
    s4Comments: 357,
    s5Needs: 397,
    s6Nests: 467,
    s7One: 552,
    s8Two: 596,
    s9Three: 655,
    s10Shape: 721,
    s11Errors: 772,
    s12Rules: 908,
    s12Defend: 988,
    s13Control: 1036,
    s14Handoff: 1098,
    s14Decides: 1153,
    s15Inversion: 1255,

    // ② promises
    s16Future: 1309,
    s17Promise: 1405,
    s18Instant: 1436,
    s18States: 1484,
    s19Then: 1568,
    s20Flatten: 1630,
    s20Returns: 1686,
    s21Catch: 1761,
    s21Finally: 1829,
    s22Look: 1883,
    s23Packaging: 1993,
    s23Baggage: 2032,
    s24Read: 2069,
    s25Await: 2129,

    // ③ await
    s26Async: 2166,
    s26Pause: 2222,
    s27Under: 2351,
    s27Then: 2423,
    s27Catch: 2457,
    s28Story: 2496,
    s29Try: 2581,
    s29Catch: 2630,
    s30Control: 2662,
    s30Composition: 2716,
    s30Readability: 2777,
    s31Final: 2850,
};

export const ACT1_END = 1307;
export const ACT2_END = 2129;

const ASYNC_CAPTIONS: Caption[] = [
    { start: 0, end: 134, text: "Before async and await, JavaScript waited the ugly way." },
    { start: 134, end: 243, text: "You gave a function a function — and hoped it would call you back." },
    { start: 243, end: 282, text: "That's a callback." },
    { start: 282, end: 318, text: "Read the user." },
    { start: 318, end: 357, text: "Then their posts." },
    { start: 357, end: 397, text: "Then the comments." },
    { start: 397, end: 467, text: "Each step needs the one before it." },
    { start: 467, end: 552, text: "So each step nests inside the last." },
    { start: 552, end: 596, text: "One level — fine." },
    { start: 596, end: 655, text: "Two levels — getting ugly." },
    { start: 655, end: 721, text: "Three — welcome to callback hell." },
    { start: 721, end: 772, text: "And it's not just the shape." },
    { start: 772, end: 908, text: "Errors don't throw — they arrive as an argument, on every layer." },
    { start: 908, end: 988, text: "Every library invents its own rules." },
    { start: 988, end: 1036, text: "You defend everywhere." },
    { start: 1036, end: 1098, text: "Worse — you're not in control." },
    { start: 1098, end: 1153, text: "You handed your function away." },
    { start: 1153, end: 1255, text: "It decides when — or whether — to call back." },
    { start: 1255, end: 1309, text: "That's inversion of control." },
    { start: 1309, end: 1405, text: "JavaScript needed a value for a future result." },
    { start: 1405, end: 1436, text: "A promise." },
    { start: 1436, end: 1484, text: "It returns instantly." },
    { start: 1484, end: 1568, text: "Pending — fulfilled — or rejected." },
    { start: 1568, end: 1630, text: "Dot then unpacks the result." },
    { start: 1630, end: 1686, text: "Chains flatten the pyramid." },
    { start: 1686, end: 1761, text: "Each step returns the next promise." },
    { start: 1761, end: 1829, text: "Errors fall to one dot catch." },
    { start: 1829, end: 1883, text: "Cleanup to dot finally." },
    { start: 1883, end: 1993, text: "But look closely — still functions passed to functions." },
    { start: 1993, end: 2032, text: "Nicer packaging." },
    { start: 2032, end: 2069, text: "Same baggage." },
    { start: 2069, end: 2129, text: "We needed to read top to bottom." },
    { start: 2129, end: 2166, text: "So we got await." },
    { start: 2166, end: 2222, text: "async marks the function." },
    { start: 2222, end: 2351, text: "await pauses it — not the thread — until the promise settles." },
    { start: 2351, end: 2423, text: "Underneath, it's still promises." },
    { start: 2423, end: 2457, text: "Same dot then." },
    { start: 2457, end: 2496, text: "Same dot catch." },
    { start: 2496, end: 2581, text: "But now the code reads like the story it tells." },
    { start: 2581, end: 2662, text: "Try, catch, one line at a time." },
    { start: 2662, end: 2716, text: "Callbacks gave us control." },
    { start: 2716, end: 2777, text: "Promises gave us composition." },
    { start: 2777, end: 2850, text: "async await gave us readability." },
    { start: 2850, end: 2964, text: "Every step was just the last idea, rearranged." },
];

/* --------------------------- palette ------------------------------ */
const INK = "#2F2A26";
const BLUE = "#2B6CB0";
const AMBER = "#D97706";
const GREEN = "#2F855A";
const RED = "#B23C2F";
const SLATE = "#8A8378";

const HAND = '"Segoe Print", "Comic Sans MS", cursive';
const MONO = "Consolas, monospace";

const clamp0 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const phaseAt = (frame: number): number => {
    for (let i = PHASE_STARTS.length - 1; i >= 0; i--) {
        if (frame >= PHASE_STARTS[i]) return i;
    }
    return 0;
};

const appear = (frame: number, at: number, at2: number, fadeTail = 6) =>
    fadeTail === 0
        ? interpolate(frame, [at, at + 8], [0, 1], clamp0)
        : interpolate(
              frame,
              [at, at + 8, at2, at2 + fadeTail],
              [0, 1, 1, 0],
              clamp0
          );

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
void pulse;

/* ------------------------- shared styles -------------------------- */
const sheet: React.CSSProperties = {
    background: "#FFFFFF",
    border: `2.5px solid ${INK}`,
    borderRadius: "26px 12px 22px 14px / 14px 22px 12px 26px",
    padding: 24,
    position: "relative",
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

const tileLabel: React.CSSProperties = {
    fontFamily: HAND,
    fontSize: 20,
    fontWeight: 700,
    color: INK,
    marginBottom: 10,
};

const cardBase: React.CSSProperties = {
    position: "absolute",
    background: "#FFFFFF",
    border: `2.5px solid ${INK}`,
    borderRadius: "16px 8px 14px 9px / 9px 14px 8px 16px",
    boxShadow: "3px 4px 0 rgba(47,42,38,0.14)",
};

const chipStyle: React.CSSProperties = {
    background: "#FFFFFF",
    fontFamily: MONO,
    fontSize: 17,
    color: INK,
    padding: "6px 10px",
    borderRadius: "12px 6px 10px 7px / 7px 10px 6px 12px",
    fontWeight: 700,
    border: `2px solid ${INK}`,
    display: "inline-block",
};

const paperBackground =
    `radial-gradient(rgba(47,42,38,0.055) 1.2px, transparent 1.4px) 0 0 / 26px 26px,` +
    `radial-gradient(620px 420px at 10% 6%, rgba(150,104,56,0.10), transparent 70%),` +
    `radial-gradient(800px 620px at 94% 96%, rgba(150,104,56,0.13), transparent 72%),` +
    `radial-gradient(520px 360px at 88% 10%, rgba(150,104,56,0.07), transparent 70%),` +
    `radial-gradient(700px 500px at 4% 90%, rgba(150,104,56,0.09), transparent 70%),` +
    `linear-gradient(165deg, #F4E7C8 0%, #F1E2BD 45%, #EAD5A6 100%)`;

/* ------------------------ little components ----------------------- */

const Stamp: React.FC<{
    text: string;
    color: string;
    opacity?: number;
    size?: number;
    rotate?: number;
    style?: React.CSSProperties;
}> = ({ text, color, opacity = 1, size = 26, rotate = -6, style }) => (
    <div
        style={{
            position: "absolute",
            fontFamily: HAND,
            fontWeight: 700,
            fontSize: size,
            letterSpacing: 1,
            color,
            border: `3px solid ${color}`,
            borderRadius: 10,
            padding: "4px 14px",
            transform: `rotate(${rotate}deg)`,
            opacity,
            background: "rgba(255,255,255,0.55)",
            whiteSpace: "nowrap",
            ...style,
        }}
    >
        {text}
    </div>
);

const Pill: React.FC<{
    children: React.ReactNode;
    color?: string;
    bg?: string;
    size?: number;
    dashed?: boolean;
    opacity?: number;
}> = ({ children, color = INK, bg = "#FFFFFF", size = 17, dashed, opacity = 1 }) => (
    <span
        style={{
            ...chipStyle,
            color,
            background: bg,
            fontSize: size,
            borderStyle: dashed ? "dashed" : "solid",
            borderColor: color,
            opacity,
        }}
    >
        {children}
    </span>
);

/** A tiny promise locket used in several acts. */
const Locket: React.FC<{
    size: number;
    state: "pending" | "fulfilled" | "rejected";
    frame: number;
    value?: string;
    opacity?: number;
    scale?: number;
}> = ({ size, state, frame, value, opacity = 1, scale = 1 }) => {
    const color = state === "pending" ? AMBER : state === "fulfilled" ? GREEN : RED;
    const r = size * 0.36;
    return (
        <div
            style={{
                width: size,
                height: size,
                position: "relative",
                opacity,
                transform: `scale(${scale})`,
            }}
        >
            <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "100%" }}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="#FFFFFF"
                    stroke={color}
                    strokeWidth="3"
                    strokeDasharray={state === "pending" ? "12 8" : undefined}
                    transform={
                        state === "pending"
                            ? `rotate(${frame * 1.5} ${size / 2} ${size / 2})`
                            : undefined
                    }
                />
                <text
                    x={size / 2}
                    y={size / 2 - 2}
                    textAnchor="middle"
                    fontFamily={HAND}
                    fontSize={size * 0.105}
                    fontWeight="700"
                    fill={color}
                >
                    {state}
                </text>
                {value && (
                    <text
                        x={size / 2}
                        y={size / 2 + size * 0.13}
                        textAnchor="middle"
                        fontFamily={MONO}
                        fontSize={size * 0.08}
                        fontWeight="700"
                        fill={GREEN}
                    >
                        {value}
                    </text>
                )}
            </svg>
        </div>
    );
};

/* --------------------------- mini shapes -------------------------- */

const MiniPyramid: React.FC<{ x: number; y: number; scale?: number; opacity?: number }> = ({
    x,
    y,
    scale = 1,
    opacity = 1,
}) => (
    <div style={{ position: "absolute", left: x, top: y, opacity, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        {["getUser", "getPosts", "getComments", "done"].map((label, i) => (
            <div
                key={label}
                style={{
                    marginLeft: i * 16,
                    marginTop: i === 0 ? 0 : 8,
                    width: 210 - i * 16,
                    height: 30,
                    border: `2.5px solid ${BLUE}`,
                    background: i === 3 ? "rgba(178,60,47,0.12)" : "#FFFFFF",
                    borderRadius: "8px 4px 7px 5px / 5px 7px 4px 8px",
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 700,
                    color: INK,
                    paddingLeft: 8,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {label}
            </div>
        ))}
    </div>
);

const MiniChain: React.FC<{ x: number; y: number; scale?: number; opacity?: number }> = ({
    x,
    y,
    scale = 1,
    opacity = 1,
}) => (
    <div style={{ position: "absolute", left: x, top: y, opacity, transform: `scale(${scale})`, transformOrigin: "0 0", display: "flex", gap: 8, alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                    style={{
                        width: 68,
                        height: 44,
                        border: `2.5px solid ${GREEN}`,
                        background: "#FFFFFF",
                        borderRadius: "10px 5px 9px 6px / 6px 9px 5px 10px",
                        fontFamily: MONO,
                        fontSize: 12,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: INK,
                    }}
                >
                    {["getUser", "posts", "comments"][i]}()
                </div>
                {i < 2 && (
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: AMBER }}>
                        .then
                    </span>
                )}
            </div>
        ))}
    </div>
);

const MiniStair: React.FC<{ x: number; y: number; scale?: number; opacity?: number }> = ({
    x,
    y,
    scale = 1,
    opacity = 1,
}) => (
    <div style={{ position: "absolute", left: x, top: y, opacity, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        {["await user", "await posts", "await comments", "return"].map((label, i) => (
            <div
                key={label}
                style={{
                    marginLeft: i * 20,
                    marginTop: i === 0 ? 0 : 6,
                    width: 190 - i * 14,
                    height: 26,
                    border: `2.5px solid ${AMBER}`,
                    background: "#FFFFFF",
                    borderRadius: "7px 4px 6px 5px / 5px 6px 4px 7px",
                    fontFamily: MONO,
                    fontSize: 10,
                    fontWeight: 700,
                    color: INK,
                    paddingLeft: 8,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {label}
            </div>
        ))}
    </div>
);

/* ==================================================================
 * ACT ① — CALLBACKS: the pyramid + the three real drawbacks
 * ================================================================== */

const PYRAMID = [
    { code: "getUser(id, (err, user) => {", at: BEATS.s4Read, depth: 1 },
    { code: "  getPosts(user, (err, posts) => {", at: BEATS.s4Posts, depth: 2 },
    { code: "    getComments(posts, (err, comments) => {", at: BEATS.s4Comments, depth: 3 },
    { code: "      done(null, comments);", at: BEATS.s5Needs, depth: 4 },
];

const Act1: React.FC<{ frame: number }> = ({ frame }) => {
    const B = BEATS;

    const shake =
        frame >= B.s9Three && frame < B.s9Three + 46
            ? Math.sin(frame * 1.9) * 3.2 * (1 - (frame - B.s9Three) / 46)
            : 0;

    const activeLevel =
        frame >= B.s9Three ? 2 : frame >= B.s8Two ? 1 : frame >= B.s7One ? 0 : -1;

    const dimPyramid = interpolate(
        frame,
        [B.s13Control, B.s13Control + 20],
        [1, 0.42],
        clamp0
    );

    const depthOp = appear(frame, B.s4Read, B.s11Errors, 20);
    const errorsOp = appear(frame, B.s11Errors, B.s13Control, 18);
    const controlOp = appear(frame, B.s13Control, ACT1_END, 0);

    // callback card travels from YOU to LIBRARY
    const handoff = interpolate(
        frame,
        [B.s14Handoff, B.s14Handoff + 38],
        [0, 1],
        clamp0
    );
    const strings = interpolate(
        frame,
        [B.s14Decides, B.s14Decides + 18],
        [0, 1],
        clamp0
    );
    const inversion = interpolate(
        frame,
        [B.s15Inversion, B.s15Inversion + 10],
        [0, 1],
        clamp0
    );

    // opening hook: a function handed to a function
    const introMove = interpolate(frame, [B.s2Give, B.s2Give + 54], [0, 1], clamp0);
    const introOp = interpolate(frame, [262, 282], [1, 0], clamp0);
    const callbackStamp = interpolate(
        frame,
        [B.s3Callback, B.s3Callback + 8],
        [0, 1],
        clamp0
    );

    return (
        <div style={{ position: "absolute", inset: 0, opacity: 1 }}>
            {/* ---------------- opening: function -> function ---------------- */}
            {introOp > 0 && (
                <div style={{ position: "absolute", inset: 0, opacity: introOp }}>
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: 26,
                            textAlign: "center",
                            fontFamily: HAND,
                            fontSize: 30,
                            fontWeight: 700,
                            color: INK,
                            transform: "rotate(-0.5deg)",
                        }}
                    >
                        you gave a function… a function.
                    </div>

                    <div style={{ ...cardBase, left: 44, top: 108, width: 316, height: 124, padding: "14px 16px" }}>
                        <div style={{ fontFamily: HAND, fontSize: 15, fontWeight: 700, color: BLUE }}>
                            your code
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 21, fontWeight: 700, color: INK, marginTop: 10 }}>
                            function youWrote() {"{"}
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 16, color: SLATE, marginTop: 6 }}>
                            {"  // …does some work"}
                        </div>
                    </div>

                    <div style={{ ...cardBase, left: 680, top: 108, width: 316, height: 124, padding: "14px 16px" }}>
                        <div style={{ fontFamily: HAND, fontSize: 15, fontWeight: 700, color: SLATE }}>
                            someone else's code
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 21, fontWeight: 700, color: INK, marginTop: 10 }}>
                            someLibrary( … )
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 16, color: SLATE, marginTop: 6 }}>
                            {"// calls you back?"}
                        </div>
                    </div>

                    {/* the hand-off arrow */}
                    <svg
                        viewBox="0 0 1040 740"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                    >
                        <line x1="364" y1="170" x2="668" y2="170" stroke={INK} strokeWidth="2.4" strokeDasharray="7 6" />
                        <path d="M 660 162 L 674 170 L 660 178" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
                        <path
                            d="M 900 300 C 930 440, 820 520, 640 522 C 380 522, 214 480, 196 306"
                            fill="none"
                            stroke={AMBER}
                            strokeWidth="2.4"
                            strokeDasharray="7 6"
                            opacity={0.85}
                        />
                        <path d="M 185 318 L 196 298 L 207 318" fill="none" stroke={AMBER} strokeWidth="2.4" strokeLinecap="round" />
                    </svg>

                    <div
                        style={{
                            position: "absolute",
                            left: 380,
                            top: 184,
                            width: 280,
                            textAlign: "center",
                            fontFamily: HAND,
                            fontSize: 17,
                            fontWeight: 700,
                            color: SLATE,
                            transform: "rotate(-2deg)",
                        }}
                    >
                        hands it over
                    </div>

                    {/* the callback card itself */}
                    <div
                        style={{
                            position: "absolute",
                            left: lerp(140, 690, introMove),
                            top: 288,
                            width: 196,
                            height: 64,
                            border: `2.5px solid ${AMBER}`,
                            borderRadius: 10,
                            background: "#FFF7E2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: MONO,
                            fontSize: 16,
                            fontWeight: 700,
                            color: INK,
                            transform: `rotate(${introMove * 7}deg)`,
                            boxShadow: "3px 4px 0 rgba(47,42,38,0.14)",
                        }}
                    >
                        function () {"{ … }"}
                    </div>

                    <div
                        style={{
                            position: "absolute",
                            left: 300,
                            top: 552,
                            fontFamily: HAND,
                            fontSize: 22,
                            fontWeight: 700,
                            color: AMBER,
                            opacity: 0.95,
                            transform: "rotate(-2deg)",
                        }}
                    >
                        will it call me back? maybe. maybe never.
                    </div>

                    <Stamp
                        text="THAT'S A CALLBACK"
                        color={RED}
                        size={38}
                        rotate={-7}
                        opacity={callbackStamp}
                        style={{ left: 372, top: 620 }}
                    />
                </div>
            )}

            {/* ---------------- pyramid ---------------- */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity: dimPyramid,
                    transform: `translateX(${shake}px) rotate(${shake * 0.05}deg)`,
                }}
            >
                {/* nesting bracket */}
                <svg
                    viewBox="0 0 40 520"
                    style={{ position: "absolute", left: 4, top: 62, width: 40, height: 500, overflow: "visible" }}
                >
                    <path
                        d="M 30 20 C 8 20, 8 120, 22 130 M 22 130 C 8 140, 8 240, 22 250 M 22 250 C 8 260, 8 360, 22 370 M 22 370 C 8 380, 8 470, 30 480"
                        fill="none"
                        stroke={BLUE}
                        strokeWidth="2.4"
                        strokeDasharray="8 6"
                        opacity={interpolate(frame, [B.s6Nests, B.s6Nests + 24], [0, 0.7], clamp0)}
                    />
                </svg>

                {PYRAMID.map((lvl, i) => {
                    const inn = appear(frame, lvl.at, ACT1_END, 0);
                    const slide = interpolate(frame, [lvl.at, lvl.at + 14], [20, 0], clamp0);
                    const isActive = activeLevel === i;
                    const isHell = frame >= B.s9Three && i <= 2;
                    const errTag = i < 3 && frame >= B.s11Errors + i * 14;
                    const errWords = ["err", "error", "e"];
                    const defended = frame >= B.s12Defend + i * 12;
                    return (
                        <div
                            key={i}
                            style={{
                                ...cardBase,
                                left: 24 + i * 30,
                                top: 64 + i * 112,
                                width: 530,
                                height: 90,
                                opacity: inn,
                                transform: `translateY(${slide}px) rotate(${i % 2 ? 0.5 : -0.4}deg)`,
                                borderColor: isActive ? AMBER : isHell ? RED : INK,
                                borderWidth: isActive ? 4 : 2.5,
                                background: isActive ? "#FFF7E2" : "#FFFFFF",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    height: "100%",
                                    padding: "0 14px",
                                    fontFamily: MONO,
                                    fontSize: 20,
                                    fontWeight: 700,
                                    whiteSpace: "pre",
                                    color: INK,
                                }}
                            >
                                {lvl.code}
                            </div>

                            {/* the err argument, on every layer */}
                            {errTag && (
                                <div
                                    style={{
                                        position: "absolute",
                                        right: 8,
                                        top: -12,
                                        opacity: interpolate(frame, [B.s11Errors + i * 14, B.s11Errors + i * 14 + 8], [0, 1], clamp0),
                                        transform: "rotate(4deg)",
                                    }}
                                >
                                    <Pill color={RED} bg="#FBE9E6" size={14}>
                                        {errWords[i]}
                                    </Pill>
                                    {defended && (
                                        <span style={{ marginLeft: 6, fontSize: 18 }}>🛡</span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* closing braces, hand-written */}
                <div
                    style={{
                        position: "absolute",
                        left: 160,
                        top: 508,
                        fontFamily: MONO,
                        fontSize: 22,
                        fontWeight: 700,
                        color: SLATE,
                        opacity: appear(frame, B.s6Nests, ACT1_END, 0),
                        letterSpacing: 18,
                    }}
                >
                    {"} } }"}
                </div>

                {/* hell stamp */}
                <Stamp
                    text="CALLBACK HELL"
                    color={RED}
                    size={38}
                    rotate={-8}
                    opacity={interpolate(frame, [B.s9Three, B.s9Three + 10], [0, 1], clamp0)}
                    style={{ left: 150, top: 548 }}
                />

                {/* not just the shape — outline */}
                <svg
                    viewBox="0 0 640 640"
                    style={{ position: "absolute", left: 0, top: 30, width: 640, height: 640, pointerEvents: "none" }}
                >
                    <path
                        d="M 18 44 C 160 20, 400 20, 590 44 C 616 180, 616 430, 590 620 C 420 640, 170 640, 18 616 C 4 470, 4 190, 18 44 Z"
                        fill="none"
                        stroke={RED}
                        strokeWidth="2.5"
                        strokeDasharray="10 8"
                        opacity={interpolate(frame, [B.s10Shape, B.s10Shape + 18], [0, 0.85], clamp0)}
                    />
                </svg>
            </div>

            {/* ---------------- side panel ---------------- */}
            <div style={{ position: "absolute", left: 660, top: 58, width: 380, height: 640 }}>
                {/* depth meter */}
                <div style={{ ...tile, position: "absolute", inset: 0, opacity: depthOp }}>
                    <div style={{ ...tileLabel, color: BLUE }}>nesting depth</div>
                    {[
                        { n: 1, label: "one level", tag: "fine", color: GREEN, at: B.s7One },
                        { n: 2, label: "two levels", tag: "getting ugly", color: AMBER, at: B.s8Two },
                        { n: 3, label: "three levels", tag: "callback hell", color: RED, at: B.s9Three },
                    ].map((row, i) => {
                        const on = frame >= row.at;
                        return (
                            <div key={i} style={{ marginBottom: 18 }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        fontFamily: HAND,
                                        fontWeight: 700,
                                        fontSize: 18,
                                        color: on ? row.color : SLATE,
                                    }}
                                >
                                    <span>
                                        {row.n} · {row.label}
                                    </span>
                                    <span
                                        style={{
                                            opacity: on ? 1 : 0.35,
                                            transform: `rotate(${i % 2 ? 2 : -2}deg)`,
                                            border: `2px ${on ? "solid" : "dashed"} ${on ? row.color : SLATE}`,
                                            borderRadius: 7,
                                            padding: "1px 8px",
                                            fontSize: 15,
                                        }}
                                    >
                                        {row.tag}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        marginTop: 6,
                                        height: 16,
                                        border: `2px solid ${on ? row.color : SLATE}`,
                                        borderRadius: "10px 6px 12px 8px / 8px 12px 6px 10px",
                                        background: "#FFFFFF",
                                        overflow: "hidden",
                                        opacity: on ? 1 : 0.45,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${interpolate(frame, [row.at, row.at + 16], [12, 100], clamp0)}%`,
                                            height: "100%",
                                            background: row.color,
                                            opacity: 0.75,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    <div style={{ flex: 1 }} />
                    <div
                        style={{
                            fontFamily: HAND,
                            fontSize: 17,
                            color: SLATE,
                            opacity: interpolate(frame, [B.s10Shape, B.s10Shape + 10], [0, 1], clamp0),
                        }}
                    >
                        …and that's only the shape.
                    </div>
                </div>

                {/* errors panel */}
                <div style={{ ...tile, position: "absolute", inset: 0, opacity: errorsOp }}>
                    <div style={{ ...tileLabel, color: RED }}>errors arrive as arguments</div>
                    {[
                        { lib: "lib A", tag: "err" },
                        { lib: "lib B", tag: "error" },
                        { lib: "lib C", tag: "e" },
                    ].map((row, i) => {
                        const on = frame >= B.s11Errors + i * 22;
                        const shield = frame >= B.s12Defend + i * 12;
                        return (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 16,
                                    opacity: on ? 1 : 0.25,
                                    transform: `translateX(${interpolate(frame, [B.s11Errors + i * 22, B.s11Errors + i * 22 + 10], [18, 0], clamp0)}px)`,
                                }}
                            >
                                <Pill color={RED} bg="#FBE9E6" size={15}>
                                    {row.tag}
                                </Pill>
                                <span style={{ fontSize: 16, color: SLATE }}>from {row.lib}</span>
                                <div style={{ flex: 1 }} />
                                {shield && (
                                    <span style={{ fontSize: 20, opacity: interpolate(frame, [B.s12Defend + i * 12, B.s12Defend + i * 12 + 8], [0, 1], clamp0) }}>
                                        🛡
                                    </span>
                                )}
                            </div>
                        );
                    })}
                    <div style={{ fontFamily: MONO, fontSize: 15, color: INK, lineHeight: 1.5 }}>
                        if ({`err`}) return done(err);
                    </div>
                    <div style={{ flex: 1 }} />
                    <div style={{ fontFamily: HAND, fontSize: 17, color: RED, fontWeight: 700 }}>
                        every layer. every library. defend everywhere.
                    </div>
                </div>

                {/* control panel */}
                <div style={{ ...tile, position: "absolute", inset: 0, opacity: controlOp }}>
                    <div style={{ ...tileLabel, color: AMBER }}>who's in control?</div>
                    <div style={{ position: "relative", height: 210, marginTop: 8 }}>
                        <div
                            style={{
                                position: "absolute",
                                left: 4,
                                top: 46,
                                width: 96,
                                height: 74,
                                border: `2.5px solid ${BLUE}`,
                                borderRadius: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: HAND,
                                fontWeight: 700,
                                fontSize: 20,
                                color: BLUE,
                                background: "#EFF6FC",
                            }}
                        >
                            YOU
                        </div>
                        <div
                            style={{
                                position: "absolute",
                                right: 4,
                                top: 46,
                                width: 132,
                                height: 74,
                                border: `2.5px solid ${SLATE}`,
                                borderRadius: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: HAND,
                                fontWeight: 700,
                                fontSize: 18,
                                color: INK,
                                background: "#F7F5F0",
                                textAlign: "center",
                            }}
                        >
                            LIBRARY
                            <br />
                            (somewhere else)
                        </div>

                        {/* the card that leaves your hand */}
                        <div
                            style={{
                                position: "absolute",
                                left: lerp(12, 160, handoff),
                                top: 150,
                                width: 128,
                                height: 54,
                                border: `2.5px solid ${AMBER}`,
                                borderRadius: 10,
                                background: "#FFF7E2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: MONO,
                                fontSize: 15,
                                fontWeight: 700,
                                color: INK,
                                transform: `rotate(${handoff * 8}deg)`,
                                opacity: interpolate(frame, [B.s13Control, B.s13Control + 10], [0, 1], clamp0),
                            }}
                        >
                            myCallback()
                        </div>

                        {/* marionette strings */}
                        <svg
                            viewBox="0 0 380 210"
                            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
                        >
                            <line x1="300" y1="120" x2={lerp(176, 250, handoff)} y2={lerp(150, 140, handoff)} stroke={SLATE} strokeWidth="2" strokeDasharray="5 5" opacity={strings} />
                            <line x1="310" y1="120" x2={lerp(196, 280, handoff)} y2={lerp(180, 170, handoff)} stroke={SLATE} strokeWidth="2" strokeDasharray="5 5" opacity={strings} />
                            <line x1="290" y1="120" x2={lerp(186, 220, handoff)} y2={lerp(200, 196, handoff)} stroke={SLATE} strokeWidth="2" strokeDasharray="5 5" opacity={strings} />
                        </svg>

                        {strings > 0 && (
                            <>
                                <Stamp
                                    text="when?"
                                    color={AMBER}
                                    size={15}
                                    rotate={-8}
                                    opacity={strings}
                                    style={{ left: 246, top: 6 }}
                                />
                                <Stamp
                                    text="whether?"
                                    color={RED}
                                    size={15}
                                    rotate={6}
                                    opacity={strings}
                                    style={{ left: 220, top: 206 }}
                                />
                            </>
                        )}
                    </div>

                    <div style={{ flex: 1 }} />

                    <div
                        style={{
                            fontFamily: HAND,
                            fontSize: 19,
                            fontWeight: 700,
                            color: RED,
                            lineHeight: 1.35,
                            opacity: inversion,
                            transform: `rotate(-1deg) scale(${lerp(0.9, 1, inversion)})`,
                        }}
                    >
                        That's inversion of control.
                        <div style={{ fontSize: 16, color: SLATE, fontWeight: 400, marginTop: 6 }}>
                            the library calls you — not the other way round.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ==================================================================
 * ACT ② — PROMISES: a value for later, then a flat chain
 * ================================================================== */

const CHAIN = [
    { name: "getUser()", tag: "user" },
    { name: "getPosts(user)", tag: "posts" },
    { name: "getComments(posts)", tag: "comments" },
];

const Act2: React.FC<{ frame: number }> = ({ frame }) => {
    const B = BEATS;

    const promiseIn = interpolate(frame, [B.s17Promise, B.s17Promise + 16], [0, 1], clamp0);
    const futureOp = appear(frame, B.s16Future, B.s17Promise, 10);
    const receiptOp = appear(frame, B.s18Instant, ACT2_END, 0);
    const statesOp = appear(frame, B.s18States, ACT2_END, 0);
    const thenOp = appear(frame, B.s19Then, ACT2_END, 0);

    const locketState: "pending" | "fulfilled" =
        frame >= B.s18States + 34 ? "fulfilled" : "pending";

    // chain flatten progress: mini pyramid becomes a horizontal row
    const flatten = interpolate(frame, [B.s20Flatten, B.s20Flatten + 62], [0, 1], clamp0);
    const chainOp = interpolate(frame, [B.s20Flatten, B.s20Flatten + 18], [0, 1], clamp0);
    const pyramidOp = interpolate(frame, [B.s20Flatten, B.s20Flatten + 24], [1, 0], clamp0);

    const linksOp = interpolate(frame, [B.s20Returns, B.s20Returns + 12], [0, 1], clamp0);
    const catchOp = interpolate(frame, [B.s21Catch, B.s21Catch + 12], [0, 1], clamp0);
    const finallyOp = interpolate(frame, [B.s21Finally, B.s21Finally + 12], [0, 1], clamp0);
    const lookOp = appear(frame, B.s22Look, B.s23Packaging, 14);
    const packageOp = interpolate(frame, [B.s23Packaging, B.s23Packaging + 10], [0, 1], clamp0);
    const baggageOp = interpolate(frame, [B.s23Baggage, B.s23Baggage + 12], [0, 1], clamp0);
    const readOp = interpolate(frame, [B.s24Read, B.s24Read + 12], [0, 1], clamp0);

    const xOf = (i: number) =>
        lerp([12, 42, 72][i], [12, 292, 572][i], flatten);
    const yOf = (i: number) => lerp([400, 478, 556][i], 400, flatten);

    return (
        <div style={{ position: "absolute", inset: 0 }}>
            {/* ---------------- top: what a promise is ---------------- */}
            <div
                style={{
                    ...tile,
                    position: "absolute",
                    left: 14,
                    top: 52,
                    width: 420,
                    height: 250,
                    opacity: futureOp,
                }}
            >
                <div style={{ ...tileLabel, color: BLUE }}>JavaScript needed…</div>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div style={{ fontFamily: HAND, fontSize: 25, fontWeight: 700, color: INK, lineHeight: 1.3 }}>
                        a value
                        <br />
                        for a<br />
                        future result?
                    </div>
                    <div
                        style={{
                            width: 120,
                            height: 120,
                            border: `3px dashed ${AMBER}`,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: HAND,
                            fontSize: 64,
                            color: AMBER,
                            transform: `rotate(${Math.sin(frame / 24) * 6}deg)`,
                        }}
                    >
                        ?
                    </div>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ fontFamily: HAND, fontSize: 17, color: SLATE }}>
                    something that stands in for the answer…
                </div>
            </div>

            {/* locket */}
            <div style={{ position: "absolute", left: 24, top: 54, opacity: promiseIn }}>
                <Locket
                    size={236}
                    state={locketState}
                    frame={frame}
                    value={frame >= B.s19Then + 22 ? "user" : undefined}
                    scale={lerp(0.8, 1, promiseIn)}
                />
                <div
                    style={{
                        textAlign: "center",
                        fontFamily: HAND,
                        fontSize: 22,
                        fontWeight: 700,
                        color: INK,
                        marginTop: -8,
                    }}
                >
                    A promise
                </div>
            </div>

            {/* receipt + states */}
            <div
                style={{
                    ...tile,
                    position: "absolute",
                    left: 286,
                    top: 54,
                    width: 420,
                    height: 250,
                    opacity: promiseIn,
                }}
            >
                <div style={{ ...tileLabel, color: GREEN }}>it returns instantly</div>
                <div
                    style={{
                        opacity: receiptOp,
                        background: "#FFFDF5",
                        border: `2px dashed ${SLATE}`,
                        borderRadius: 8,
                        padding: "10px 14px",
                        fontFamily: MONO,
                        fontSize: 18,
                        fontWeight: 700,
                        color: INK,
                        transform: `rotate(-1.5deg) translateY(${interpolate(frame, [B.s18Instant, B.s18Instant + 14], [16, 0], clamp0)}px)`,
                    }}
                >
                    Promise {"{"} &lt;pending&gt; {"}"}
                    <div style={{ fontFamily: HAND, fontSize: 14, color: SLATE, fontWeight: 400, marginTop: 4 }}>
                        a receipt for a result that isn't here yet
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14, opacity: statesOp }}>
                    {[
                        { t: "pending", c: AMBER, at: 0 },
                        { t: "fulfilled", c: GREEN, at: 10 },
                        { t: "rejected", c: RED, at: 20 },
                    ].map((s) => {
                        const on = frame >= B.s18States + s.at;
                        return (
                            <Pill
                                key={s.t}
                                color={on ? s.c : SLATE}
                                bg={on ? "#FFFFFF" : "#F7F5F0"}
                                size={14}
                                dashed={!on}
                                opacity={on ? 1 : 0.55}
                            >
                                {s.t}
                            </Pill>
                        );
                    })}
                </div>
            </div>

            {/* .then key */}
            <div
                style={{
                    ...tile,
                    position: "absolute",
                    left: 730,
                    top: 54,
                    width: 296,
                    height: 250,
                    opacity: thenOp,
                }}
            >
                <div style={{ ...tileLabel, color: AMBER }}>dot then unpacks it</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <Pill color={AMBER} bg="#FFF7E2" size={22}>
                        .then
                    </Pill>
                    <div
                        style={{
                            fontFamily: HAND,
                            fontSize: 15,
                            color: SLATE,
                            lineHeight: 1.4,
                        }}
                    >
                        insert key
                        <br />
                        → value pops out
                    </div>
                </div>
                <div style={{ flex: 1 }} />
                <div
                    style={{
                        alignSelf: "flex-start",
                        opacity: interpolate(frame, [B.s19Then + 18, B.s19Then + 28], [0, 1], clamp0),
                        transform: `translateY(${interpolate(frame, [B.s19Then + 18, B.s19Then + 28], [18, 0], clamp0)}px)`,
                    }}
                >
                    <Pill color={GREEN} bg="#E8F6EF" size={20}>
                        user ✓
                    </Pill>
                </div>
            </div>

            {/* ---------------- bottom: flatten into a chain ---------------- */}
            <div style={{ position: "absolute", left: 12, top: 374, opacity: pyramidOp, transform: `scale(${1.35})`, transformOrigin: "0 0" }}>
                <MiniPyramid x={0} y={0} />
            </div>

            <div style={{ position: "absolute", inset: 0, opacity: chainOp }}>
                {CHAIN.map((c, i) => {
                    const isLook = i === 1 && frame >= B.s22Look;
                    return (
                        <div
                            key={c.name}
                            style={{
                                ...cardBase,
                                left: xOf(i),
                                top: yOf(i),
                                width: 240,
                                height: 164,
                                padding: "12px 14px",
                                transform: `rotate(${(i - 1) * 1.2 + (1 - flatten) * (i - 1) * 2}deg)`,
                                borderColor: isLook ? BLUE : GREEN,
                            }}
                        >
                            <div style={{ fontFamily: MONO, fontSize: 21, fontWeight: 700, color: INK }}>
                                {c.name}
                            </div>
                            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                                <Pill color={GREEN} bg="#E8F6EF" size={13}>
                                    returns promise
                                </Pill>
                            </div>
                            <div style={{ flex: 1 }} />
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 22 }}>🔒</span>
                                <Pill color={GREEN} size={13} bg="#FFFFFF">
                                    {c.tag} ✓
                                </Pill>
                            </div>
                        </div>
                    );
                })}

                {/* connector arrows + .then labels */}
                {[0, 1].map((i) => (
                    <div key={i}>
                        <div
                            style={{
                                position: "absolute",
                                left: xOf(i) + 220,
                                top: 360,
                                width: 80,
                                opacity: linksOp,
                                textAlign: "center",
                                fontFamily: MONO,
                                fontSize: 14,
                                fontWeight: 700,
                                color: AMBER,
                            }}
                        >
                            .then
                        </div>
                        <svg
                            viewBox="0 0 40 18"
                            style={{
                                position: "absolute",
                                left: xOf(i) + 240,
                                top: 474,
                                width: 40,
                                height: 18,
                                opacity: linksOp,
                            }}
                        >
                            <line x1="0" y1="9" x2="30" y2="9" stroke={INK} strokeWidth="2.2" />
                            <path d="M 28 3 L 37 9 L 28 15" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                    </div>
                ))}

                {/* catch tray */}
                <div
                    style={{
                        position: "absolute",
                        left: 840,
                        top: 400,
                        width: 184,
                        height: 164,
                        border: `3px dashed ${RED}`,
                        borderRadius: "14px 7px 12px 8px / 8px 12px 7px 14px",
                        background: "#FDF1EF",
                        opacity: catchOp,
                        padding: 10,
                    }}
                >
                    <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: RED }}>.catch</div>
                    <div style={{ fontFamily: HAND, fontSize: 14, color: SLATE, marginTop: 4, lineHeight: 1.3 }}>
                        one place
                        <br />
                        for every error
                    </div>
                    <div style={{ position: "absolute", left: 14, bottom: 10, fontSize: 26 }}>🧺</div>
                </div>

                {/* error chips falling into catch */}
                {[0, 1, 2].map((i) => {
                    const at = B.s21Catch + 6 + i * 13;
                    const t = interpolate(frame, [at, at + 22], [0, 1], clamp0);
                    if (frame < at) return null;
                    return (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                left: lerp(xOf(i) + 100, 900, t),
                                top: lerp(470, 470, t),
                                opacity: 1 - t * 0.15,
                                transform: `translateY(${Math.sin(t * Math.PI) * -40}px) rotate(${t * 40}deg)`,
                            }}
                        >
                            <Pill color={RED} bg="#FBE9E6" size={14}>
                                err
                            </Pill>
                        </div>
                    );
                })}

                {/* finally broom */}
                <div
                    style={{
                        position: "absolute",
                        left: 840,
                        top: 586,
                        width: 184,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        opacity: finallyOp,
                    }}
                >
                    <span style={{ fontSize: 24, color: BLUE, fontWeight: 700 }}>↺</span>
                    <Pill color={BLUE} size={14}>
                        .finally cleanup
                    </Pill>
                </div>

                {/* magnifier: still callbacks inside */}
                {lookOp > 0 && (
                    <div
                        style={{
                            position: "absolute",
                            left: 330,
                            top: 388,
                            width: 260,
                            height: 260,
                            opacity: lookOp,
                            transform: `scale(${lerp(0.75, 1, lookOp)})`,
                            transformOrigin: "50% 50%",
                        }}
                    >
                        <svg viewBox="0 0 260 260" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                            <circle cx="122" cy="112" r="100" fill="#FFFFFF" stroke={BLUE} strokeWidth="4" />
                            <line x1="196" y1="190" x2="244" y2="242" stroke={INK} strokeWidth="10" strokeLinecap="round" />
                        </svg>
                        <div
                            style={{
                                position: "absolute",
                                left: 34,
                                top: 44,
                                width: 176,
                                fontFamily: MONO,
                                fontSize: 13,
                                fontWeight: 700,
                                color: INK,
                                lineHeight: 1.55,
                            }}
                        >
                            function (user) {"{"}
                            <br />
                            &nbsp;&nbsp;return getPosts(user);
                            <br />
                            {"}"}
                        </div>
                        <Stamp
                            text="still a callback"
                            color={RED}
                            size={16}
                            rotate={-7}
                            style={{ left: 28, top: 196 }}
                        />
                    </div>
                )}

                {/* nicer packaging */}
                {packageOp > 0 && (
                    <div style={{ position: "absolute", left: 300, top: 300, opacity: packageOp }}>
                        <div style={{ fontSize: 54, transform: "translateY(8px)" }}>🎀</div>
                        <Stamp text="nicer packaging" color={AMBER} size={18} rotate={-5} style={{ left: 52, top: -12 }} />
                    </div>
                )}

                {/* same baggage */}
                {baggageOp > 0 && (
                    <div
                        style={{
                            position: "absolute",
                            left: 596,
                            top: 590,
                            opacity: baggageOp,
                            transform: `translateY(${interpolate(frame, [B.s23Baggage, B.s23Baggage + 12], [18, 0], clamp0)}px)`,
                        }}
                    >
                        <div
                            style={{
                                border: `2.5px solid ${INK}`,
                                borderRadius: 10,
                                background: "#F7F0E2",
                                padding: "6px 12px",
                                fontFamily: HAND,
                                fontSize: 17,
                                fontWeight: 700,
                                color: INK,
                                transform: "rotate(2deg)",
                            }}
                        >
                            🧳 callbacks inside
                        </div>
                    </div>
                )}

                {/* read-top-to-bottom hint */}
                <div
                    style={{
                        position: "absolute",
                        left: 624,
                        top: 300,
                        opacity: readOp,
                        transform: `rotate(${interpolate(frame, [B.s24Read, B.s24Read + 14], [0, 4], clamp0)}deg)`,
                    }}
                >
                    <Stamp text="you still read sideways →" color={SLATE} size={18} rotate={-3} style={{ position: "relative" }} />
                </div>
            </div>
        </div>
    );
};

/* ==================================================================
 * ACT ③ — ASYNC/AWAIT: the staircase you can read top-to-bottom
 * ================================================================== */

const STAIR = [
    { code: "async function load() {", header: true },
    { code: "  const user = await getUser(id);" },
    { code: "  const posts = await getPosts(user);" },
    { code: "  const comments = await getComments(posts);" },
    { code: "  return comments;", tail: true },
];

const Act3: React.FC<{ frame: number }> = ({ frame }) => {
    const B = BEATS;

    const awaitStampOp = appear(frame, B.s25Await, B.s26Async + 20, 12);
    const asyncOp = interpolate(frame, [B.s26Async, B.s26Async + 10], [0, 1], clamp0);
    const threadOp = interpolate(frame, [B.s26Pause, B.s26Pause + 14], [0, 1], clamp0);
    const underOp = appear(frame, B.s27Under, B.s29Try, 12);
    const storyOp = appear(frame, B.s28Story, B.s30Control, 14);
    const tryOp = interpolate(frame, [B.s29Try, B.s29Try + 12], [0, 1], clamp0);
    const catchOp = interpolate(frame, [B.s29Catch, B.s29Catch + 12], [0, 1], clamp0);

    const storyThread = interpolate(frame, [B.s28Story, B.s28Story + 76], [0, 1], clamp0);

    const recapOp = interpolate(frame, [B.s30Control, B.s30Control + 16], [0, 1], clamp0);
    const finalOp = interpolate(frame, [B.s31Final, B.s31Final + 12], [0, 1], clamp0);

    return (
        <div style={{ position: "absolute", inset: 0 }}>
            {/* big await stamp while the idea lands */}
            <div
                style={{
                    position: "absolute",
                    left: 236,
                    top: 208,
                    opacity: awaitStampOp,
                    transform: `rotate(-6deg) scale(${lerp(0.8, 1, awaitStampOp)})`,
                }}
            >
                <Stamp text="await" color={AMBER} size={104} rotate={0} style={{ position: "relative", padding: "10px 34px" }} />
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 430,
                    textAlign: "center",
                    fontFamily: HAND,
                    fontSize: 30,
                    fontWeight: 700,
                    color: SLATE,
                    opacity: interpolate(frame, [2138, 2150], [0, 1], clamp0) * awaitStampOp,
                    transform: "rotate(-1deg)",
                }}
            >
                read it top to bottom ↓
            </div>

            {/* staircase */}
            {STAIR.map((s, i) => {
                const inn = interpolate(frame, [B.s26Async + i * 14, B.s26Async + i * 14 + 12], [0, 1], clamp0);
                const isAwait = i >= 1 && i <= 3;
                const pauseAt = B.s26Pause + (i - 1) * 20;
                const paused = isAwait && frame >= pauseAt;
                const settled =
                    isAwait &&
                    (i < 3 ? frame >= B.s26Pause + i * 20 : frame >= B.s28Story);
                return (
                    <div
                        key={i}
                        style={{
                            ...cardBase,
                            left: 18 + i * 20,
                            top: 56 + i * 112,
                            width: 572,
                            height: 92,
                            opacity: inn,
                            padding: "10px 14px",
                            borderColor: paused ? AMBER : settled ? GREEN : s.header ? BLUE : INK,
                            background: paused ? "#FFF7E2" : "#FFFFFF",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", height: "100%", gap: 10 }}>
                            <span style={{ fontFamily: MONO, fontSize: 16, color: "#B9B2A6", width: 18 }}>
                                {i + 1}
                            </span>
                            <span
                                style={{
                                    fontFamily: MONO,
                                    fontSize: s.header ? 20 : 18,
                                    fontWeight: 700,
                                    whiteSpace: "pre",
                                    color: INK,
                                }}
                            >
                                {s.code}
                            </span>
                        </div>

                        {/* amber pause bar on the left edge */}
                        {paused && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: 6,
                                    background: AMBER,
                                    opacity: interpolate(frame, [pauseAt, pauseAt + 6], [0, 1], clamp0),
                                }}
                            />
                        )}

                        {s.header && asyncOp > 0 && (
                            <span style={{ position: "absolute", right: 10, top: 10, opacity: asyncOp }}>
                                <Pill color={AMBER} bg="#FFF7E2" size={13}>
                                    async ✓
                                </Pill>
                            </span>
                        )}

                        {isAwait && (
                            <span
                                style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 10,
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: settled ? GREEN : AMBER,
                                }}
                            >
                                {settled ? "✓" : "⏳"}
                            </span>
                        )}
                    </div>
                );
            })}

            {/* try bracket */}
            <svg
                viewBox="0 0 60 560"
                style={{ position: "absolute", left: 0, top: 120, width: 60, height: 520, opacity: tryOp, overflow: "visible" }}
            >
                <path
                    d="M 48 8 C 14 8, 14 120, 34 140 C 14 160, 14 400, 34 420 C 14 440, 14 540, 48 552"
                    fill="none"
                    stroke={BLUE}
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <text x="2" y="96" fontFamily={MONO} fontSize="26" fontWeight="700" fill={BLUE}>
                    try
                </text>
            </svg>

            {/* catch tray */}
            <div
                style={{
                    position: "absolute",
                    left: 18,
                    top: 632,
                    width: 592,
                    height: 62,
                    border: `3px dashed ${RED}`,
                    borderRadius: "12px 6px 10px 7px / 7px 10px 6px 12px",
                    background: "#FDF1EF",
                    opacity: catchOp,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "0 14px",
                }}
            >
                <span style={{ fontFamily: MONO, fontSize: 19, fontWeight: 700, color: RED }}>catch (err)</span>
                <span style={{ fontFamily: HAND, fontSize: 15, color: SLATE }}>
                    one line catches it — the runtime does the plumbing
                </span>
                <span style={{ marginLeft: "auto", fontSize: 24 }}>🪣</span>
            </div>

            {/* thread monitor */}
            <div
                style={{
                    ...tile,
                    position: "absolute",
                    left: 638,
                    top: 50,
                    width: 388,
                    height: 186,
                    opacity: threadOp,
                }}
            >
                <div style={{ ...tileLabel, color: GREEN, fontSize: 19 }}>
                    the thread keeps running
                </div>
                <div style={{ position: "relative", height: 70, marginTop: 6 }}>
                    <svg viewBox="0 0 340 70" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                        <path
                            d="M 0 38 L 60 38 L 74 38 L 84 12 L 96 62 L 108 38 L 340 38"
                            fill="none"
                            stroke={GREEN}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="10 7"
                            strokeDashoffset={-frame * 2.4}
                            opacity={0.85}
                        />
                        <circle
                            cx={(frame * 2.6) % 340}
                            cy={(((frame * 2.6) % 340) > 84 && ((frame * 2.6) % 340) < 108) ? 38 : 38}
                            r="5"
                            fill={GREEN}
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                        />
                    </svg>
                </div>
                <div style={{ fontFamily: HAND, fontSize: 15, color: SLATE, lineHeight: 1.35 }}>
                    <span style={{ color: AMBER, fontWeight: 700 }}>await</span> pauses the function,
                    not the engine. Other work keeps moving.
                </div>
            </div>

            {/* underneath panel */}
            <div
                style={{
                    ...tile,
                    position: "absolute",
                    left: 638,
                    top: 252,
                    width: 388,
                    height: 164,
                    opacity: underOp,
                }}
            >
                <div style={{ ...tileLabel, color: AMBER, fontSize: 19 }}>
                    underneath: still promises
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <Pill
                        color={frame >= B.s27Then ? AMBER : SLATE}
                        bg={frame >= B.s27Then ? "#FFF7E2" : "#FFFFFF"}
                        size={14}
                    >
                        .then
                    </Pill>
                    <span style={{ fontFamily: MONO, fontSize: 14, color: INK }}>unwraps the value</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Pill
                        color={frame >= B.s27Catch ? RED : SLATE}
                        bg={frame >= B.s27Catch ? "#FBE9E6" : "#FFFFFF"}
                        size={14}
                    >
                        .catch
                    </Pill>
                    <span style={{ fontFamily: MONO, fontSize: 14, color: INK }}>receives the error</span>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ fontFamily: HAND, fontSize: 14, color: SLATE }}>
                    same machinery — new surface syntax.
                </div>
            </div>

            {/* story note */}
            <div
                style={{
                    ...tile,
                    position: "absolute",
                    left: 638,
                    top: 432,
                    width: 388,
                    height: 138,
                    opacity: storyOp,
                }}
            >
                <div style={{ ...tileLabel, color: GREEN, fontSize: 19 }}>
                    reads like the story it tells
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", fontFamily: MONO, fontSize: 14 }}>
                    <Pill color={BLUE} size={13}>user</Pill>
                    <span>→</span>
                    <Pill color={BLUE} size={13}>posts</Pill>
                    <span>→</span>
                    <Pill color={BLUE} size={13}>comments</Pill>
                </div>
                <div style={{ marginTop: 8, fontFamily: HAND, fontSize: 14, color: SLATE }}>
                    one line at a time, top to bottom.
                </div>
            </div>

            {/* awkward space filler: tiny "await" rule */}
            <div
                style={{
                    position: "absolute",
                    left: 638,
                    top: 586,
                    width: 388,
                    fontFamily: HAND,
                    fontSize: 15,
                    color: SLATE,
                    opacity: storyOp,
                }}
            >
                async marks it. await pauses it. the runtime handles the rest.
            </div>

            {/* red thread flowing down the staircase */}
            <svg
                viewBox="0 0 620 640"
                style={{ position: "absolute", left: 0, top: 30, width: 640, height: 660, pointerEvents: "none" }}
            >
                <path
                    d="M 80 96 C 120 130, 170 150, 200 165 C 230 205, 270 230, 300 275 C 330 315, 360 340, 390 390 C 415 425, 445 450, 470 500 C 485 535, 510 560, 540 600"
                    fill="none"
                    stroke={RED}
                    strokeWidth="3"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDashoffset={1 - storyThread}
                    opacity={storyThread * 0.75}
                />
            </svg>

            {/* ---------------- recap ---------------- */}
            <div
                style={{
                    position: "absolute",
                    inset: -2,
                    opacity: recapOp,
                    background:
                        "radial-gradient(rgba(47,42,38,0.05) 1px, transparent 1.2px) 0 0 / 24px 24px, #F4E8CC",
                    borderRadius: 18,
                    border: "2px solid rgba(47,42,38,0.16)",
                    padding: "20px 10px",
                }}
            >
                <div
                    style={{
                        fontFamily: HAND,
                        fontSize: 28,
                        fontWeight: 700,
                        color: INK,
                        textAlign: "center",
                        marginBottom: 4,
                    }}
                >
                    three eras · one problem
                </div>

                {[
                    { era: "① callbacks", gift: "control", color: BLUE, at: B.s30Control },
                    { era: "② promises", gift: "composition", color: GREEN, at: B.s30Composition },
                    { era: "③ async/await", gift: "readability", color: AMBER, at: B.s30Readability },
                ].map((col, i) => {
                    const on = frame >= col.at;
                    const x = 18 + i * 342;
                    return (
                        <div
                            key={col.era}
                            style={{
                                position: "absolute",
                                left: x,
                                top: 114,
                                width: 316,
                                height: 392,
                                border: `2.5px ${on ? "solid" : "dashed"} ${on ? col.color : SLATE}`,
                                borderRadius: "16px 8px 14px 9px / 9px 14px 8px 16px",
                                background: on ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                                padding: 14,
                                opacity: on ? 1 : 0.45,
                                transform: `translateY(${on ? 0 : 10}px)`,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div style={{ fontFamily: HAND, fontSize: 22, fontWeight: 700, color: col.color }}>
                                {col.era}
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: 4,
                                }}
                            >
                                {i === 0 && <MiniPyramid x={39} y={65} scale={1.06} />}
                                {i === 1 && <MiniChain x={8} y={115} scale={0.92} />}
                                {i === 2 && <MiniStair x={49} y={76} scale={1.06} />}
                            </div>
                            <div style={{ fontFamily: HAND, fontSize: 15, color: SLATE }}>gave us</div>
                            <div style={{ fontFamily: HAND, fontSize: 34, fontWeight: 700, color: col.color }}>
                                {col.gift}
                            </div>
                        </div>
                    );
                })}

                {/* dashed rule anchoring the payoff */}
                <div
                    style={{
                        position: "absolute",
                        left: 70,
                        right: 70,
                        top: 536,
                        borderTop: "2px dashed rgba(47,42,38,0.22)",
                        opacity: finalOp,
                    }}
                />

                {/* arrows between eras */}
                {[0, 1].map((i) => {
                    const at = i === 0 ? B.s30Composition : B.s30Readability;
                    const t = interpolate(frame, [at, at + 14], [0, 1], clamp0);
                    return (
                        <svg
                            key={i}
                            viewBox="0 0 40 40"
                            style={{
                                position: "absolute",
                                left: 330 + i * 342,
                                top: 292,
                                width: 36,
                                height: 36,
                                opacity: t,
                            }}
                        >
                            <path d="M 4 20 L 30 20 M 24 13 L 33 20 L 24 27" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    );
                })}

                {/* final line */}
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 564,
                        textAlign: "center",
                        opacity: finalOp,
                        transform: `translateY(${interpolate(frame, [B.s31Final, B.s31Final + 12], [12, 0], clamp0)}px)`,
                    }}
                >
                    <div style={{ fontFamily: HAND, fontSize: 40, fontWeight: 700, color: INK }}>
                        one problem. three shapes. same idea.
                    </div>
                    <div
                        style={{
                            margin: "8px auto 0",
                            width: 640 * finalOp,
                            height: 10,
                            borderRadius: 6,
                            background: "rgba(246,196,84,0.6)",
                            transform: "skewX(-14deg)",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

/* ==================================================================
 * SCENE + CODE PANEL + WRAPPERS
 * ================================================================== */

const ERAS = [
    { n: "①", label: "callbacks", color: BLUE, short: "control" },
    { n: "②", label: "promises", color: GREEN, short: "composition" },
    { n: "③", label: "async/await", color: AMBER, short: "readability" },
] as const;

const eraAt = (frame: number) =>
    frame < ACT1_END ? 0 : frame < ACT2_END ? 1 : 2;

const EraRail: React.FC<{ frame: number; size?: number }> = ({ frame, size = 1 }) => {
    const act = eraAt(frame);
    return (
        <div style={{ display: "flex", gap: 8 * size, alignItems: "center" }}>
            {ERAS.map((e, i) => {
                const on = i === act;
                return (
                    <div
                        key={e.label}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5 * size,
                            padding: `${3 * size}px ${9 * size}px`,
                            borderRadius: 9,
                            border: `2px ${on ? "solid" : "dashed"} ${on ? e.color : SLATE}`,
                            background: on ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)",
                            fontFamily: HAND,
                            fontSize: 15 * size,
                            fontWeight: 700,
                            color: on ? e.color : SLATE,
                            opacity: on ? 1 : 0.6,
                            whiteSpace: "nowrap",
                        }}
                    >
                        <span>{e.n}</span>
                        <span>{e.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

export const EvolutionScene: React.FC<{ frame: number }> = ({ frame }) => {
    const act = eraAt(frame);
    // Hard cuts at the sentence boundaries: a long dissolve between two
    // dense code layouts renders doubled text (unreadable), so the
    // outgoing act is gone before the incoming one starts.
    const a1Op = interpolate(frame, [1303, 1307], [1, 0], clamp0);
    const a2In = interpolate(frame, [1307, 1315], [0, 1], clamp0);
    const a2Out = interpolate(frame, [2125, 2129], [1, 0], clamp0);
    const a2Op = Math.min(a2In, a2Out);
    const a3Op = interpolate(frame, [2129, 2137], [0, 1], clamp0);

    const sub = [
        "the shape is the problem",
        "a value for a future result",
        "a staircase you can read",
    ][act];

    return (
        <div
            style={{
                width: 1040,
                height: 740,
                position: "relative",
                fontFamily: HAND,
                overflow: "hidden",
                borderRadius: 14,
            }}
        >
            <div
                style={{
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "0 6px",
                }}
            >
                <span
                    style={{
                        fontSize: 23,
                        fontWeight: 700,
                        color: ERAS[act].color,
                        transform: "rotate(-0.6deg)",
                    }}
                >
                    {ERAS[act].n} {ERAS[act].label}
                </span>
                <span style={{ fontFamily: HAND, fontSize: 15, color: SLATE }}>{sub}</span>
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", gap: 5 }}>
                    {ERAS.map((e, i) => (
                        <div
                            key={e.label}
                            style={{
                                width: i === act ? 30 : 10,
                                height: 10,
                                borderRadius: 6,
                                background: i === act ? e.color : "rgba(47,42,38,0.18)",
                            }}
                        />
                    ))}
                </div>
            </div>

            <div style={{ position: "absolute", inset: 0, top: 44, opacity: a1Op }}>
                <Act1 frame={frame} />
            </div>
            <div style={{ position: "absolute", inset: 0, top: 44, opacity: a2Op }}>
                <Act2 frame={frame} />
            </div>
            <div style={{ position: "absolute", inset: 0, top: 44, opacity: a3Op }}>
                <Act3 frame={frame} />
            </div>
        </div>
    );
};

/* --------------------------- code panel --------------------------- */

const HIGHLIGHTS: number[][][] = [
    [
        [], // 1 before async
        [0], // 2 gave a function a function
        [0], // 3 that's a callback
        [0], // 4 read the user
        [1], // 5 posts
        [2], // 6 comments
        [0], // 7 one level — fine
        [1], // 8 two levels — ugly
        [2, 3], // 9 three — callback hell
        [], // 10 not just the shape
        [3, 4], // 11 errors as arguments
        [0, 1, 2], // 12 every library — defend
        [], // 13 not in control
        [0], // 14 handed it away
        [], // 15 inversion of control
    ],
    [
        [], // 16 future value
        [], // 17 a promise
        [], // 18 returns instantly
        [1], // 19 dot then
        [1, 2], // 20 chains flatten
        [3], // 21 errors catch
        [1], // 22 still callbacks
        [], // 23 nicer packaging
        [], // 24 read top to bottom
    ],
    [
        [0], // 25 so we got await
        [0], // 26 async marks
        [1, 2, 3], // 27 await pauses
        [1, 2, 3], // 28 underneath
        [1, 2, 3], // 29 reads like a story
        [1, 2, 3], // 30 try catch
        [], // 31 recap
    ],
];

const ACT_START_PHASE = [0, 15, 24];

const CODE_LINES: React.ReactNode[][] = [
    [
        <>
            <span style={{ color: BLUE }}>getUser</span>(id, <span style={{ color: AMBER }}>function</span> (<span style={{ color: RED }}>err</span>, user) {"{"}
        </>,
        <>
            {"  "}<span style={{ color: BLUE }}>getPosts</span>(user, <span style={{ color: AMBER }}>function</span> (<span style={{ color: RED }}>err</span>, posts) {"{"}
        </>,
        <>
            {"    "}<span style={{ color: BLUE }}>getComments</span>(posts, <span style={{ color: AMBER }}>function</span> (<span style={{ color: RED }}>err</span>, comments) {"{"}
        </>,
        <>
            {"      "}<span style={{ color: AMBER }}>if</span> (<span style={{ color: RED }}>err</span>) <span style={{ color: AMBER }}>return</span> done(<span style={{ color: RED }}>err</span>);
        </>,
        <>
            {"      "}done(<span style={{ color: BLUE }}>null</span>, comments);
        </>,
        <>{"    });"}</>,
        <>{"  });"}</>,
        <>{"});"}</>,
    ],
    [
        <><span style={{ color: BLUE }}>getUser</span>(id)</>,
        <>{"  "}<span style={{ color: AMBER }}>.then</span>(user =&gt; <span style={{ color: BLUE }}>getPosts</span>(user))</>,
        <>{"  "}<span style={{ color: AMBER }}>.then</span>(posts =&gt; <span style={{ color: BLUE }}>getComments</span>(posts))</>,
        <>{"  "}<span style={{ color: RED }}>.catch</span>(err =&gt; handle(err))</>,
        <>{"  "}<span style={{ color: BLUE }}>.finally</span>(cleanup);</>,
    ],
    [
        <><span style={{ color: AMBER }}>async function</span> <span style={{ color: BLUE }}>load</span>() {"{"}</>,
        <>{"  "}<span style={{ color: AMBER }}>const</span> user = <span style={{ color: AMBER }}>await</span> <span style={{ color: BLUE }}>getUser</span>(id);</>,
        <>{"  "}<span style={{ color: AMBER }}>const</span> posts = <span style={{ color: AMBER }}>await</span> <span style={{ color: BLUE }}>getPosts</span>(user);</>,
        <>{"  "}<span style={{ color: AMBER }}>const</span> comments = <span style={{ color: AMBER }}>await</span> <span style={{ color: BLUE }}>getComments</span>(posts);</>,
        <>{"  "}<span style={{ color: AMBER }}>return</span> comments;</>,
        <>{"}"}</>,
    ],
];

const fieldNote = (frame: number): string => {
    if (frame < ACT1_END) {
        if (frame < BEATS.s11Errors)
            return "the shape is the problem: every step nests one level deeper than the last.";
        if (frame < BEATS.s14Handoff)
            return "errors don't throw here — they arrive as an argument, on every single layer.";
        return "you handed control away. the library decides if — and when — you ever hear back.";
    }
    if (frame < ACT2_END) {
        if (frame < BEATS.s21Catch)
            return "a promise is a receipt for a result that hasn't arrived yet.";
        if (frame < BEATS.s23Packaging)
            return "one flat chain, one catch — but still functions passed to functions.";
        return "nicer packaging. same callbacks inside.";
    }
    if (frame < BEATS.s30Control)
        return "await pauses this function — not the thread. the runtime handles the plumbing.";
    return "same idea, rearranged: control → composition → readability.";
};

const CodeCard: React.FC<{
    frame: number;
    height?: number;
    compact?: boolean;
}> = ({ frame, height, compact = false }) => {
    const act = eraAt(frame);
    const phase = phaseAt(frame);
    const localPhase = Math.max(0, Math.min(
        HIGHLIGHTS[act].length - 1,
        phase - ACT_START_PHASE[act]
    ));
    const active = HIGHLIGHTS[act][localPhase] ?? [];

    const actOp = (i: number) => {
        if (i === 0) return interpolate(frame, [1303, 1307], [1, 0], clamp0);
        if (i === 2) return interpolate(frame, [2129, 2137], [0, 1], clamp0);
        return Math.min(
            interpolate(frame, [1307, 1315], [0, 1], clamp0),
            interpolate(frame, [2125, 2129], [1, 0], clamp0)
        );
    };

    return (
        <div
            style={{
                ...sheet,
                height: height ?? 800,
                padding: compact ? 18 : 24,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div style={tape} />
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                }}
            >
                <div style={{ ...tileLabel, color: BLUE, marginBottom: 0, fontSize: compact ? 22 : 20 }}>
                    the code ⌘
                </div>
                <div
                    style={{
                        fontFamily: HAND,
                        fontSize: 15,
                        fontWeight: 700,
                        color: ERAS[act].color,
                        border: `2px solid ${ERAS[act].color}`,
                        borderRadius: 8,
                        padding: "1px 8px",
                        transform: "rotate(-1deg)",
                    }}
                >
                    {ERAS[act].label}
                </div>
            </div>

            <div style={{ position: "relative", flex: 1 }}>
                {CODE_LINES.map((lines, i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            inset: 0,
                            opacity: actOp(i),
                            pointerEvents: "none",
                        }}
                    >
                        {lines.map((line, li) => {
                            const isActive = i === act && active.includes(li);
                            return (
                                <div
                                    key={li}
                                    style={{
                                        display: "flex",
                                        fontFamily: MONO,
                                        fontSize: compact ? 21 : 19,
                                        fontWeight: 700,
                                        lineHeight: compact ? 1.55 : 1.6,
                                        whiteSpace: "pre",
                                        padding: "2px 8px",
                                        borderRadius: 8,
                                        background: isActive ? "rgba(246,196,84,0.36)" : "transparent",
                                        borderBottom: isActive ? `3px solid ${AMBER}` : "3px solid transparent",
                                        color: isActive ? INK : "#4A443D",
                                        transform: isActive ? "rotate(-0.25deg)" : "none",
                                    }}
                                >
                                    <span style={{ color: "#B9B2A6", width: 22, flexShrink: 0 }}>
                                        {li + 1}
                                    </span>
                                    <span>{line}</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div
                style={{
                    ...tile,
                    padding: compact ? "12px 14px" : "12px 14px",
                    marginTop: 10,
                    background: "#FFFDF5",
                }}
            >
                <div style={{ ...tileLabel, color: AMBER, fontSize: 17, marginBottom: 4 }}>
                    field note ✎
                </div>
                <div
                    style={{
                        fontFamily: HAND,
                        fontSize: compact ? 18 : 17,
                        color: INK,
                        lineHeight: 1.35,
                        minHeight: 44,
                    }}
                >
                    {fieldNote(frame)}
                </div>
            </div>
        </div>
    );
};

/* ------------------------- long-form film ------------------------- */

export const AsyncEvolution: React.FC = () => {
    const frame = useCurrentFrame();

    return (
        <AbsoluteFill
            style={{
                background: paperBackground,
                padding: "44px 54px",
                fontFamily: HAND,
                overflow: "hidden",
            }}
        >
            <Audio src={staticFile("asyncevolution-narration.mp3")} />
            <Audio src={staticFile("asyncevolution-sfx.wav")} volume={0.55} />

            <div
                style={{
                    height: 74,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 10,
                }}
            >
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            fontSize: 42,
                            fontWeight: 700,
                            color: INK,
                            transform: "rotate(-0.5deg)",
                            lineHeight: 1,
                        }}
                    >
                        async — The Evolution
                    </div>
                    <div
                        style={{
                            marginTop: 6,
                            fontFamily: HAND,
                            fontSize: 19,
                            color: SLATE,
                            letterSpacing: 0.5,
                        }}
                    >
                        callbacks → promises → await &nbsp;·&nbsp; one problem, three shapes
                    </div>
                </div>
                <EraRail frame={frame} size={1.1} />
            </div>

            <div style={{ display: "flex", gap: 26, height: 782 }}>
                <div style={{ width: 660, flexShrink: 0, transform: "rotate(-0.2deg)" }}>
                    <CodeCard frame={frame} />
                </div>

                <div
                    style={{
                        ...sheet,
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transform: "rotate(0.2deg)",
                    }}
                >
                    <div style={tape} />
                    <div style={{ transform: "scale(0.99)", transformOrigin: "center" }}>
                        <EvolutionScene frame={frame} />
                    </div>
                </div>
            </div>

            <Subtitles captions={ASYNC_CAPTIONS} transparent />
        </AbsoluteFill>
    );
};

/* --------------------------- vertical cuts ------------------------ */

const captionsFor = (start: number, end: number): Caption[] =>
    ASYNC_CAPTIONS.filter((c) => c.end > start && c.start < end).map((c) => ({
        start: Math.max(c.start, start) - start,
        end: Math.min(c.end, end) - start,
        text: c.text,
    }));

const EvolutionVertical: React.FC<{ start: number; end: number }> = ({
    start,
    end,
}) => {
    const local = useCurrentFrame();
    const f = local + start;
    const duration = end - start;

    return (
        <AbsoluteFill
            style={{
                background: paperBackground,
                padding: "34px 20px 0",
                fontFamily: HAND,
                overflow: "hidden",
            }}
        >
            <Audio src={staticFile("asyncevolution-narration.mp3")} startFrom={start} />
            <Audio src={staticFile("asyncevolution-sfx.wav")} startFrom={start} volume={0.55} />

            <div style={{ width: 1040, flexShrink: 0 }}>
                <div
                    style={{
                        fontSize: 52,
                        fontWeight: 700,
                        color: INK,
                        lineHeight: 1,
                        transform: "rotate(-0.5deg)",
                    }}
                >
                    async — The Evolution
                </div>
                <div
                    style={{
                        marginTop: 8,
                        fontSize: 23,
                        color: SLATE,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>callbacks → promises → await</span>
                    <EraRail frame={f} size={1.05} />
                </div>
            </div>

            <div style={{ ...sheet, width: 1040, padding: 12, marginTop: 16, flexShrink: 0 }}>
                <div style={tape} />
                <EvolutionScene frame={f} />
            </div>

            <div style={{ marginTop: 16, width: 1040, flexShrink: 0, transform: "rotate(-0.15deg)" }}>
                <CodeCard frame={f} height={520} compact />
            </div>

            <div
                style={{
                    marginTop: 16,
                    width: 1040,
                    height: 128,
                    border: `2.5px solid ${INK}`,
                    borderRadius: "18px 9px 16px 10px / 10px 16px 9px 18px",
                    background: "rgba(255,255,255,0.72)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    padding: "0 12px",
                }}
            >
                {ERAS.map((e, i) => {
                    const on = i === eraAt(f);
                    return (
                        <div key={e.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "50%",
                                    border: `3px ${on ? "solid" : "dashed"} ${on ? e.color : SLATE}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 24,
                                    fontWeight: 700,
                                    color: on ? e.color : SLATE,
                                    background: on ? "#FFFFFF" : "transparent",
                                }}
                            >
                                {e.n}
                            </div>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: on ? e.color : SLATE }}>
                                    {e.label}
                                </div>
                                <div style={{ fontSize: 15, color: SLATE }}>{e.short}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Subtitles captions={captionsFor(start, end)} transparent />

            {/* keep the duration explicit for future maintenance */}
            <div style={{ display: "none" }}>{duration}</div>
        </AbsoluteFill>
    );
};

export const ShortEvolutionHell: React.FC = () => (
    <EvolutionVertical start={0} end={ACT1_END} />
);

export const ShortEvolutionFix: React.FC = () => (
    <EvolutionVertical start={ACT1_END} end={ADURATION} />
);

export const ShortEvolutionFull: React.FC = () => (
    <EvolutionVertical start={0} end={ADURATION} />
);

