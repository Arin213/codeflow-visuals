import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ADURATION, SENT } from "./timing";

/* ==================================================================
 * VIDEO #5 — SCOPE & CLOSURES ("where variables live")
 *
 * Same sketchnote universe as V3/V4, with a new dusk-paper canvas:
 * a cooler gradient wash, a copper rope + fishing-hook motif in the
 * header of every sheet (the "hook" brand thread), and noticeably
 * bigger/bolder code than V4 (27px vs 19–21px).
 *
 * Acts (hard cuts at sentence boundaries — never dissolve between
 * dense text layouts, the V4 lesson):
 *   ① THE HOUSE  — three rooms: global / function / block (+ var trap)
 *   ② THE CHAIN  — nested scopes, the outward walk, lexical rule
 *   ③ THE CLOSURE— outer() returns inner; count survives; 1,2,3
 *   ④ RECAP      — scope vs closure + the three questions
 * ================================================================== */

const INK = "#2F2A26";
const BLUE = "#2B6CB0";
const AMBER = "#D97706";
const GREEN = "#2F855A";
const RED = "#B3392B";
const SLATE = "#8A8378";
const COPPER = "#A8683A";
const HAND = '"Segoe Print", "Comic Sans MS", cursive';
const MONO = '"Consolas", monospace';

const clamp0 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* canvas: dusk paper — cooler than V4's milk tea */
const duskPaper = {
    background:
        `radial-gradient(1150px 640px at 28% 8%, rgba(255,248,228,0.6), rgba(255,255,255,0) 62%),` +
        `linear-gradient(180deg, #DCE3EA 0%, rgba(220,227,234,0) 26%),` +
        `linear-gradient(180deg, #EFE3C4 0%, #F4E7C8 38%, #EAD5A6 100%)`,
} as const;

/* ---------------- sentence-driven beats ---------------- */
const S = (i: number) => SENT[i].s;

const B = {
    hook: S(0), decide: S(1), scopeIs: S(2), rooms: S(3), born: S(4),
    global: S(5), declare: S(6), greet: S(7), arinAgain: S(8), outward: S(9),
    fnScope: S(10), belong: S(11), hello: S(12), cannot: S(13), refErr1: S(14),
    leaks: S(15), block: S(16), braces: S(17), liveDie: S(18), varBreaks: S(19),
    varFn: S(20), trap: S(21),
    search: S(22), innerSees: S(23), chain: S(24), refErr2: S(25), lexical: S(26),
    closures: S(27), remembers: S(28),
    step1: S(29), born2: S(30), step2: S(31), itself: S(32), careful: S(33),
    retFn: S(34), parens: S(35), step3: S(36), disappear: S(37), dont: S(38),
    holds: S(39), memory: S(40),
    step4: S(41), up: S(42), one: S(43), again1: S(44), two: S(45),
    again2: S(46), three: S(47), alive: S(48), private: S(49), hooks: S(50),
    try: S(51), predict: S(52),
    so1: S(53), so2: S(54), survives: S(55), threeQ: S(56), q1: S(57),
    q2: S(58), q3: S(59), own: S(60),
};

export const CUT1 = B.search;   // act 1 → act 2
export const CUT2 = B.closures; // act 2 → act 3
export const CUT3 = B.so1;      // act 3 → recap

export const VA_FRAMES = CUT1;
export const VB_FRAMES = ADURATION - CUT1;

/* ---------------- shared bits ---------------- */
const Sheet: React.FC<{
    x: number; y: number; w: number; h: number;
    children?: React.ReactNode; style?: React.CSSProperties; opacity?: number;
}> = ({ x, y, w, h, children, style, opacity = 1 }) => (
    <div
        style={{
            position: "absolute",
            left: x, top: y, width: w, height: h,
            background: "#FFFDF6",
            border: `2.5px solid ${INK}`,
            borderRadius: "18px 9px 15px 10px / 10px 15px 9px 18px",
            boxShadow: "5px 7px 0 rgba(47,42,38,0.13)",
            opacity,
            ...style,
        }}
    >
        {/* copper rope along the top edge — the hook brand thread */}
        <svg
            viewBox={`0 0 ${w} 30`}
            preserveAspectRatio="none"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 30, pointerEvents: "none" }}
        >
            <path
                d={`M 0 15 C ${w * 0.25} ${8 + (w % 7)}, ${w * 0.5} 22, ${w * 0.75} 13 S ${w} 16, ${w} 15`}
                fill="none"
                stroke={COPPER}
                strokeWidth="3.2"
                strokeLinecap="round"
                opacity={0.65}
            />
        </svg>
        {children}
    </div>
);

/* the fishing hook glyph — lowered by a rope, catches variables */
const HookGlyph: React.FC<{ x: number; y: number; scale?: number; drop?: number }> = ({
    x, y, scale = 1, drop = 0,
}) => (
    <svg
        width={64 * scale}
        height={110 * scale}
        viewBox="0 0 64 110"
        style={{ position: "absolute", left: x, top: y + drop, overflow: "visible" }}
    >
        <line x1="32" y1="-220" x2="32" y2="34" stroke={COPPER} strokeWidth="3" strokeDasharray="6 5" />
        <path
            d="M 32 30 C 32 46, 20 52, 20 64 C 20 78, 34 84, 44 76 M 44 76 L 40 62 M 44 76 L 52 68"
            fill="none"
            stroke={COPPER}
            strokeWidth="4.5"
            strokeLinecap="round"
        />
    </svg>
);

const Stamp: React.FC<{
    text: string; color: string; size?: number; rotate?: number;
    opacity?: number; style?: React.CSSProperties;
}> = ({ text, color, size = 40, rotate = -6, opacity = 1, style }) => (
    <div
        style={{
            position: "absolute",
            fontFamily: HAND,
            fontSize: size,
            fontWeight: 700,
            color,
            border: `4px solid ${color}`,
            borderRadius: 12,
            padding: "6px 22px",
            transform: `rotate(${rotate}deg) scale(${0.85 + 0.15 * opacity})`,
            opacity,
            background: "rgba(255,252,242,0.85)",
            boxShadow: "4px 5px 0 rgba(47,42,38,0.16)",
            whiteSpace: "nowrap",
            ...style,
        }}
    >
        {text}
    </div>
);

const Pill: React.FC<{ color: string; size?: number; children: React.ReactNode;
    style?: React.CSSProperties; rotate?: number }> = ({ color, size = 16, children, style, rotate = 0 }) => (
    <span
        style={{
            display: "inline-block",
            fontFamily: HAND,
            fontSize: size,
            fontWeight: 700,
            color,
            border: `2px solid ${color}`,
            borderRadius: 9,
            padding: "3px 10px",
            background: "#FFFDF5",
            whiteSpace: "nowrap",
            transform: `rotate(${rotate}deg)`,
            ...style,
        }}
    >
        {children}
    </span>
);

/* a variable orb */
const Orb: React.FC<{
    label: string; color: string; x: number; y: number; scale?: number; opacity?: number;
}> = ({ label, color, x, y, scale = 1, opacity = 1 }) => (
    <div
        style={{
            position: "absolute",
            left: x, top: y,
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
            opacity,
        }}
    >
        <div
            style={{
                width: "auto",
                minWidth: 64,
                height: 64,
                borderRadius: 999,
                padding: "0 12px",
                border: `3px solid ${color}`,
                background: `radial-gradient(circle at 34% 30%, #FFFFFF, ${color}22 70%)`,
                boxShadow: `3px 4px 0 rgba(47,42,38,0.14)`,
                display: "grid",
                placeItems: "center",
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 700,
                color: INK,
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </div>
    </div>
);

/* a room in the house */
const Room: React.FC<{
    x: number; y: number; w: number; h: number; label: string; color: string;
    opacity?: number; dashed?: boolean; door?: "open" | "closed" | "none";
    children?: React.ReactNode;
}> = ({ x, y, w, h, label, color, opacity = 1, dashed = false, door = "none", children }) => (
    <div
        style={{
            position: "absolute",
            left: x, top: y, width: w, height: h,
            border: `3px ${dashed ? "dashed" : "solid"} ${color}`,
            borderRadius: 14,
            background: dashed ? "rgba(255,253,246,0.25)" : "rgba(255,253,246,0.72)",
            opacity,
            boxShadow: dashed ? "none" : "4px 5px 0 rgba(47,42,38,0.10)",
        }}
    >
        <div
            style={{
                position: "absolute",
                top: -14, left: 14,
                fontFamily: HAND,
                fontSize: 18,
                fontWeight: 700,
                color,
                background: "#F4E7C8",
                padding: "0 10px",
                borderRadius: 8,
                border: `2px solid ${color}`,
            }}
        >
            {label}
        </div>
        {door !== "none" && (
            <div
                style={{
                    position: "absolute",
                    right: 12, bottom: 12,
                    width: 26, height: 40,
                    border: `3px solid ${color}`,
                    borderBottom: "none",
                    borderRadius: "8px 8px 0 0",
                    opacity: 0.8,
                    background: door === "open" ? "#FFFDF6" : color + "22",
                }}
            />
        )}
        {children}
    </div>
);

/* ---------------- burned-in captions (clause cues) ---------------- */
const Caps: React.FC<{ frame: number; compact?: boolean }> = ({ frame, compact = false }) => {
    const idx = SENT.findIndex((sn) => frame >= sn.s && frame < sn.e);
    if (idx < 0) return null;
    const line = SENT[idx].text;
    return (
        <div
            style={{
                position: "absolute",
                left: 0, right: 0,
                bottom: compact ? 26 : 44,
                textAlign: "center",
                fontFamily: HAND,
                fontSize: compact ? 30 : 34,
                fontWeight: 700,
                color: INK,
                textShadow: "0 2px 0 rgba(244,231,200,0.9), 0 0 14px rgba(244,231,200,0.9)",
                padding: "0 60px",
            }}
        >
            {line}
        </div>
    );
};

/* ---------------- code data (bigger + bolder than V4) ---------------- */
type CodeAct = "house1" | "house2" | "house3" | "chain" | "closure";

const CODE: Record<CodeAct, { lines: string[]; label: string; color: string }> = {
    house1: {
        label: "global scope",
        color: BLUE,
        lines: [
            'const name = "Arin";',
            "",
            "function greet() {",
            "  console.log(name);",
            "}",
            "",
            "greet();             // Arin",
            "console.log(name);   // Arin",
        ],
    },
    house2: {
        label: "function scope",
        color: GREEN,
        lines: [
            "function greet() {",
            '  const message = "Hello!";',
            "  console.log(message);",
            "}",
            "",
            "greet();   // Hello!",
            "",
            "console.log(message);",
            "// ReferenceError!",
        ],
    },
    house3: {
        label: "block scope",
        color: AMBER,
        lines: [
            "if (true) {",
            "  let age = 25;",
            '  const city = "Kathmandu";',
            "}",
            "",
            "console.log(age);  // Error!",
            "",
            "if (true) {",
            "  var age = 25;",
            "}",
            "",
            "console.log(age);  // 25",
        ],
    },
    chain: {
        label: "lexical scope",
        color: BLUE,
        lines: [
            'const country = "Nepal";',
            "",
            "function outer() {",
            '  const city = "Kathmandu";',
            "",
            "  function inner() {",
            '    const street = "Makalu";',
            "    console.log(street);",
            "    console.log(city);",
            "    console.log(country);",
            "  }",
            "",
            "  inner();",
            "}",
            "",
            "outer();",
        ],
    },
    closure: {
        label: "the closure",
        color: AMBER,
        lines: [
            "function outer() {",
            "  let count = 0;",
            "",
            "  function inner() {",
            "    count++;",
            "    console.log(count);",
            "  }",
            "",
            "  return inner;",
            "}",
            "",
            "const counter = outer();",
            "",
            "counter();  // 1",
            "counter();  // 2",
            "counter();  // 3",
        ],
    },
};

/* highlight map: sentence index → highlighted line numbers */
const HIGHLIGHTS: Record<number, number[]> = {
    6: [0], 7: [2, 3, 6], 8: [6, 7], 9: [3, 6, 7],
    11: [0, 1], 12: [1, 2, 5], 13: [7], 14: [7, 8], 15: [1, 7],
    17: [0, 1, 2, 3], 18: [1, 2, 5], 19: [7, 8], 20: [8, 11], 21: [8, 11],
    22: [0, 2, 5], 23: [6, 7, 8, 9], 24: [7, 8, 9], 25: [9], 26: [2, 5],
    29: [0, 1], 30: [1, 3], 31: [8], 32: [8], 33: [8], 34: [8], 35: [8],
    36: [9, 11], 37: [9], 38: [11], 39: [11, 13], 40: [1, 4, 13],
    41: [13], 42: [4, 5], 43: [13], 44: [14], 45: [14], 46: [15], 47: [15],
    48: [13, 14, 15], 49: [1], 50: [1], 51: [13, 14, 15], 52: [13, 14, 15],
};

const actCodeAt = (frame: number): CodeAct => {
    if (frame < B.fnScope) return "house1";
    if (frame < B.block) return "house2";
    if (frame < CUT1) return "house3";
    if (frame < CUT2) return "chain";
    return "closure";
};

/* field note (bottom of the code sheet) */
const fieldNote = (frame: number): string => {
    if (frame < B.rooms) return "watch where each variable lands.";
    if (frame < B.global) return "one house. three rooms.";
    if (frame < B.outward) return "not in this room? look in the one above.";
    if (frame < B.fnScope) return "the search always walks outward.";
    if (frame < B.block) return "locals stay in. the world stays out.";
    if (frame < B.varBreaks) return "let + const = block's law.";
    if (frame < CUT1) return "var ignores walls. 2019 said: stop using it.";
    if (frame < B.chain) return "scopes nest like boxes inside boxes.";
    if (frame < B.refErr2) return "inner reads all three. easy.";
    if (frame < B.lexical) return "one hop at a time, outward.";
    if (frame < CUT2) return "the chain is decided by where code is written.";
    if (frame < B.step2) return "outer makes count + inner, then hands inner out.";
    if (frame < B.careful) return "return the function — don't call it.";
    if (frame < B.step3) return "return inner ≠ return inner()";
    if (frame < B.dont) return "outer is done… so count should be gone?";
    if (frame < B.step4) return "count survives. that's the whole trick.";
    if (frame < B.alive) return "every call reuses the same count.";
    if (frame < B.try) return "private state that outlives its owner.";
    if (frame < B.so1) return "your turn: counter() twice → what prints?";
    return "scope = where. closure = what survives.";
};

const CodeCard: React.FC<{ frame: number; compact?: boolean; height?: number }> = ({
    frame, compact = false, height,
}) => {
    const act = actCodeAt(frame);
    const data = CODE[act];
    const fs = compact ? 22 : 27;
    const lh = compact ? 1.38 : 1.42;
    const hl = HIGHLIGHTS[frame >= 0 ? nearestSentence(frame) : 0] ?? [];

    // act crossfade — hard cuts, no dissolve between different listings
    const opacity = 1;

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: height ?? "auto",
                background: "#FFFDF6",
                border: `2.5px solid ${INK}`,
                borderRadius: "16px 8px 14px 9px / 9px 14px 8px 16px",
                boxShadow: "5px 7px 0 rgba(47,42,38,0.13)",
                padding: compact ? "16px 18px" : "20px 26px",
                display: "flex",
                flexDirection: "column",
                opacity,
            }}
        >
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                <div style={{ fontFamily: HAND, fontSize: compact ? 20 : 24, fontWeight: 700, color: data.color }}>
                    {data.label}
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ fontFamily: HAND, fontSize: compact ? 15 : 17, color: SLATE }}>
                    {frame < B.rooms ? "code is coming…" : "source ✎"}
                </div>
            </div>
            <div style={{ flex: 1 }}>
                {data.lines.map((ln, i) => {
                    const on = hl.includes(i);
                    return (
                        <div
                            key={i}
                            style={{
                                fontFamily: MONO,
                                fontSize: fs,
                                fontWeight: on ? 700 : 500,
                                lineHeight: lh,
                                color: on ? INK : "rgba(47,42,38,0.55)",
                                background: on ? "rgba(217,119,6,0.14)" : "transparent",
                                borderRadius: 6,
                                whiteSpace: "pre",
                            }}
                        >
                            {ln || " "}
                        </div>
                    );
                })}
            </div>
            <div
                style={{
                    marginTop: 8,
                    borderTop: "2px dashed rgba(47,42,38,0.2)",
                    paddingTop: 8,
                    fontFamily: HAND,
                    fontSize: compact ? 16 : 18,
                    fontWeight: 700,
                    color: SLATE,
                }}
            >
                field note ✎ {fieldNote(frame)}
            </div>
        </div>
    );
};

const nearestSentence = (frame: number): number => {
    let lo = 0, hi = SENT.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (SENT[mid].s <= frame) lo = mid; else hi = mid - 1;
    }
    return lo;
};

/* ==================================================================
 * THE STAGE — 1040 × 740 scene area, act-stacked with hard cuts
 * ================================================================== */
const Stage: React.FC<{ frame: number }> = ({ frame }) => {
    const op = (a: number, b: number) => interpolate(frame, [a, b], [0, 1], clamp0);
    const out = (a: number, b: number) => interpolate(frame, [a, b], [1, 0], clamp0);

    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            {/* ============ HOOK + TITLE (0 → scopeIs) ============ */}
            {frame < B.rooms && (
                <div style={{ position: "absolute", inset: 0, opacity: out(B.rooms - 8, B.rooms) }}>
                    {/* rope + hook lowering, catching the orb */}
                    <HookGlyph x={488} y={-40} scale={1.15} drop={interpolate(frame, [B.hook, B.hook + 50], [0, 210], clamp0)} />
                    <Orb
                        label="name"
                        color={BLUE}
                        x={455}
                        y={interpolate(frame, [B.hook + 40, B.hook + 70], [420, 268], clamp0)}
                        opacity={op(B.hook + 30, B.hook + 50)}
                        scale={1.15}
                    />
                    <div
                        style={{
                            position: "absolute", left: 0, right: 0, top: 560,
                            textAlign: "center",
                            fontFamily: HAND, fontSize: 34, fontWeight: 700, color: INK,
                            opacity: op(B.hook + 10, B.hook + 30),
                        }}
                    >
                        every variable lives somewhere.
                    </div>
                    <div
                        style={{
                            position: "absolute", left: 0, right: 0, top: 612,
                            textAlign: "center",
                            fontFamily: HAND, fontSize: 24, fontWeight: 700, color: COPPER,
                            opacity: op(B.decide, B.decide + 12),
                        }}
                    >
                        …and JavaScript decides where — before your code even runs.
                    </div>
                    <Stamp
                        text="SCOPE"
                        color={INK}
                        size={56}
                        rotate={-4}
                        opacity={op(B.scopeIs, B.scopeIs + 10)}
                        style={{ left: 380, top: 96 }}
                    />
                </div>
            )}

            {/* ============ ACT 1 — THE HOUSE ============ */}
            {frame < CUT1 && frame >= B.rooms && (
                <div style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [CUT1 - 4, CUT1], [1, 0], clamp0) }}>
                    {/* the three rooms */}
                    <Room x={40} y={78} w={430} h={150} label="GLOBAL" color={BLUE}
                        dashed={frame < B.global}
                        door={frame >= B.global ? "open" : "none"}
                        opacity={frame < B.rooms ? 0 : op(B.rooms + 6, B.rooms + 18)}>
                        {frame >= B.global && (
                            <Orb label="name" color={BLUE} x={168} y={44} scale={0.95}
                                opacity={op(B.global + 8, B.global + 20)} />
                        )}
                        {frame >= B.global && (
                            <div style={{ position: "absolute", left: 150, top: 8, fontFamily: HAND, fontSize: 15, color: SLATE }}>
                                everyone can read this
                            </div>
                        )}
                    </Room>

                    <Room x={40} y={268} w={430} h={150} label="FUNCTION" color={GREEN}
                        dashed={frame < B.fnScope}
                        door={frame >= B.fnScope ? "closed" : "none"}
                        opacity={op(B.rooms + 10, B.rooms + 22)}>
                        {frame >= B.fnScope && (
                            <Orb label="message" color={GREEN} x={140} y={44} scale={0.95}
                                opacity={op(B.fnScope + 8, B.fnScope + 20)} />
                        )}
                    </Room>

                    <Room x={40} y={458} w={430} h={150} label="BLOCK { }" color={AMBER}
                        dashed={frame < B.block}
                        opacity={op(B.rooms + 14, B.rooms + 26)}>
                        {frame >= B.liveDie && (
                            <>
                                <Orb label="age" color={AMBER} x={110} y={44} scale={0.8}
                                    opacity={op(B.liveDie + 4, B.liveDie + 12) * out(B.varBreaks + 20, B.varBreaks + 40)} />
                                <Orb label="city" color={AMBER} x={210} y={44} scale={0.8}
                                    opacity={op(B.liveDie + 8, B.liveDie + 16) * out(B.varBreaks + 20, B.varBreaks + 40)} />
                            </>
                        )}
                        {/* var slips through the wall */}
                        {frame >= B.varBreaks && (
                            <Orb
                                label="var age"
                                color={RED}
                                x={lerp(150, 470, interpolate(frame, [B.varBreaks, B.varBreaks + 26], [0, 1], clamp0))}
                                y={44}
                                scale={0.85}
                                opacity={op(B.varBreaks, B.varBreaks + 10)}
                            />
                        )}
                    </Room>

                    {/* the search: function room → global room */}
                    {frame >= B.greet && frame < B.fnScope && (
                        <svg viewBox="0 0 1040 740" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                            <path
                                d="M 300 312 C 306 290, 306 264, 300 242"
                                fill="none" stroke={AMBER} strokeWidth="3" strokeDasharray="8 7"
                                opacity={0.9}
                            />
                            <path d="M 290 254 L 300 238 L 310 254" fill="none" stroke={AMBER} strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    )}

                    {/* outward rule stamp */}
                    <Stamp text="SEARCHES OUTWARD ↑" color={BLUE} size={30} rotate={-5}
                        opacity={op(B.outward, B.outward + 10) * out(B.fnScope - 6, B.fnScope)}
                        style={{ left: 500, top: 120 }} />

                    {/* function-scope notes */}
                    <div
                        style={{
                            position: "absolute", left: 500, top: 300, width: 470,
                            opacity: op(B.cannot, B.cannot + 10),
                        }}
                    >
                        <Pill color={GREEN} size={17}>inside greet(): “Hello!” ✓</Pill>
                        <div style={{ height: 10 }} />
                        <Pill color={RED} size={17} rotate={-2}>outside: ✗ message is not defined</Pill>
                    </div>
                    <Stamp text="ReferenceError!" color={RED} size={34} rotate={-7}
                        opacity={op(B.refErr1, B.refErr1 + 10) * out(B.block - 6, B.block)}
                        style={{ left: 520, top: 430 }} />

                    {/* var verdict */}
                    <Stamp text="var ignores walls" color={RED} size={30} rotate={-5}
                        opacity={op(B.varFn, B.varFn + 10)}
                        style={{ left: 500, top: 470 }} />
                    <div
                        style={{
                            position: "absolute", left: 500, top: 540, width: 470,
                            fontFamily: HAND, fontSize: 24, fontWeight: 700, color: INK,
                            opacity: op(B.trap, B.trap + 12),
                        }}
                    >
                        the one legacy trap. print 25 from nowhere.
                    </div>
                </div>
            )}

            {/* ============ ACT 2 — THE CHAIN ============ */}
            {frame >= CUT1 && frame < CUT2 && (
                <div style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [CUT2 - 4, CUT2], [1, 0], clamp0) }}>
                    {/* nested boxes */}
                    <Room x={60} y={90} w={560} h={470} label="GLOBAL — country" color={BLUE} opacity={op(CUT1, CUT1 + 10)}>
                        <Orb label="country" color={BLUE} x={440} y={30} scale={0.9} opacity={op(CUT1 + 10, CUT1 + 22)} />
                        <Room x={40} y={110} w={480} h={320} label="outer() — city" color={GREEN} opacity={op(CUT1 + 8, CUT1 + 20)}>
                            <Orb label="city" color={GREEN} x={350} y={30} scale={0.85} opacity={op(CUT1 + 14, CUT1 + 26)} />
                            <Room x={34} y={100} w={400} h={180} label="inner() — street" color={AMBER} opacity={op(CUT1 + 18, CUT1 + 30)}>
                                <Orb label="street" color={AMBER} x={70} y={58} scale={0.85} opacity={op(CUT1 + 24, CUT1 + 36)} />
                            </Room>
                        </Room>
                    </Room>

                    {/* chain walk: three hops with numbers */}
                    {frame >= B.chain && frame < B.refErr2 && (
                        <svg viewBox="0 0 1040 740" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                            {[
                                { x1: 250, y1: 400, x2: 470, y2: 268, n: "1" },
                                { x1: 470, y1: 268, x2: 528, y2: 162, n: "2" },
                            ].map((h, i) => {
                                const t = interpolate(frame, [B.chain + i * 26, B.chain + i * 26 + 22], [0, 1], clamp0);
                                if (t <= 0) return null;
                                return (
                                    <g key={i} opacity={t}>
                                        <line x1={h.x1} y1={h.y1} x2={lerp(h.x1, h.x2, t)} y2={lerp(h.y1, h.y2, t)}
                                            stroke={COPPER} strokeWidth="3.4" strokeDasharray="8 6" />
                                        <circle cx={lerp(h.x1, h.x2, t)} cy={lerp(h.y1, h.y2, t)} r="13"
                                            fill="#FFFDF6" stroke={COPPER} strokeWidth="2.5" />
                                        <text x={lerp(h.x1, h.x2, t)} y={lerp(h.y1, h.y2, t) + 5}
                                            textAnchor="middle" fontFamily="Consolas" fontSize="14" fontWeight="700" fill={COPPER}>
                                            {h.n}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    )}

                    {/* the fourth hop into the void → ReferenceError */}
                    {frame >= B.refErr2 && (
                        <svg viewBox="0 0 1040 740" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                            <line x1="555" y1="140" x2="672" y2="92" stroke={RED} strokeWidth="3" strokeDasharray="8 6" opacity={0.85} />
                            <path d="M 660 82 L 678 90 L 666 106" fill="none" stroke={RED} strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    )}
                    <Stamp text="ReferenceError" color={RED} size={32} rotate={-6}
                        opacity={op(B.refErr2, B.refErr2 + 10)}
                        style={{ left: 700, top: 70 }} />

                    {/* lexical note */}
                    <div
                        style={{
                            position: "absolute", left: 660, top: 300, width: 340,
                            fontFamily: HAND, fontSize: 23, fontWeight: 700, color: INK,
                            opacity: op(B.lexical, B.lexical + 12), transform: "rotate(-1deg)",
                        }}
                    >
                        “lexical” = decided by where the functions are
                        <span style={{ color: COPPER }}> written</span>.
                    </div>
                    <div
                        style={{
                            position: "absolute", left: 660, top: 420,
                            opacity: op(B.lexical + 20, B.lexical + 32),
                        }}
                    >
                        <Pill color={BLUE} size={16}>inner → outer → global</Pill>
                    </div>
                </div>
            )}

            {/* ============ ACT 3 — THE CLOSURE ============ */}
            {frame >= CUT2 && frame < CUT3 && (
                <div style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [CUT3 - 4, CUT3], [1, 0], clamp0) }}>
                    <Stamp text="CLOSURES" color={AMBER} size={44} rotate={-4}
                        opacity={op(CUT2 + 4, CUT2 + 14)}
                        style={{ left: 350, top: 70 }} />
                    <div
                        style={{
                            position: "absolute", left: 0, right: 0, top: 148, textAlign: "center",
                            fontFamily: HAND, fontSize: 22, fontWeight: 700, color: SLATE,
                            opacity: op(B.remembers, B.remembers + 12) * out(B.step1 - 4, B.step1),
                        }}
                    >
                        a function that remembers its outer variables — even after outer() is done.
                    </div>

                    {/* the outer() room */}
                    <div style={{ opacity: out(B.step3 + 30, B.step3 + 52) }}>
                        <Room x={70} y={200} w={430} h={210} label="outer()" color={GREEN}
                            dashed={frame >= B.step3}
                            opacity={op(B.step1 - 6, B.step1 + 6)}>
                            <Orb label="count 0" color={GREEN} x={70} y={80} scale={0.95}
                                opacity={op(B.born2, B.born2 + 12)} />
                            <div
                                style={{
                                    position: "absolute", left: 190, top: 74,
                                    fontFamily: MONO, fontSize: 20, fontWeight: 700, color: INK,
                                    border: `2.5px solid ${GREEN}`, borderRadius: 10,
                                    background: "#FFFDF6", padding: "8px 14px",
                                    opacity: op(B.born2 + 8, B.born2 + 20),
                                }}
                            >
                                function inner()
                            </div>
                        </Room>
                    </div>

                    {/* step 2: return inner — the function itself travels out */}
                    {frame >= B.step2 && (
                        <>
                            <svg viewBox="0 0 1040 740" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                                <line x1="330" y1="320" x2="620" y2="252" stroke={COPPER} strokeWidth="3" strokeDasharray="8 6"
                                    opacity={interpolate(frame, [B.step2, B.step2 + 16], [0, 0.9], clamp0)} />
                                <path d="M 610 244 L 628 252 L 612 264" fill="none" stroke={COPPER} strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            <div
                                style={{
                                    position: "absolute",
                                    left: lerp(340, 640, interpolate(frame, [B.step2, B.step2 + 22], [0, 1], clamp0)),
                                    top: 210,
                                    fontFamily: MONO, fontSize: 21, fontWeight: 700, color: INK,
                                    border: `3px solid ${COPPER}`, borderRadius: 12,
                                    background: "#FFF7E2", padding: "10px 18px",
                                    boxShadow: "4px 5px 0 rgba(47,42,38,0.14)",
                                    transform: `rotate(${interpolate(frame, [B.step2, B.step2 + 22], [-6, 2], clamp0)}deg)`,
                                    opacity: interpolate(frame, [B.step2, B.step2 + 10], [0, 1], clamp0),
                                }}
                            >
                                const counter = inner ← the function itself
                            </div>
                        </>
                    )}

                    {/* careful panel */}
                    {frame >= B.careful && frame < B.step3 && (
                        <div
                            style={{
                                position: "absolute", left: 640, top: 300, width: 360,
                                border: `3px solid ${RED}`, borderRadius: 14,
                                background: "rgba(255,249,240,0.94)", padding: "12px 16px",
                                opacity: interpolate(frame, [B.careful, B.careful + 8], [0, 1], clamp0),
                            }}
                        >
                            <div style={{ fontFamily: HAND, fontSize: 19, fontWeight: 700, color: RED }}>
                                careful — these are different:
                            </div>
                            <div style={{ fontFamily: MONO, fontSize: 19, fontWeight: 700, color: INK, marginTop: 8 }}>
                                return inner; <span style={{ color: GREEN }}>→ hands out the function</span>
                            </div>
                            <div style={{ fontFamily: MONO, fontSize: 19, fontWeight: 700, color: INK, marginTop: 6 }}>
                                return inner(); <span style={{ color: RED }}>→ runs it right now</span>
                            </div>
                        </div>
                    )}

                    {/* step 3: outer fades to a ghost — count stays, roped */}
                    {frame >= B.step3 && (
                        <>
                            {/* the rope that keeps count alive */}
                            <svg viewBox="0 0 1040 740" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                                <path
                                    d="M 500 250 C 560 240, 600 260, 640 300 C 660 320, 660 350, 640 370"
                                    fill="none"
                                    stroke={frame >= B.memory ? COPPER : SLATE}
                                    strokeWidth={frame >= B.memory ? 4.5 : 3}
                                    strokeDasharray={frame >= B.memory ? undefined : "8 6"}
                                    opacity={interpolate(frame, [B.step3, B.step3 + 14], [0, 0.95], clamp0)}
                                />
                            </svg>
                            <div style={{ position: "absolute", left: 560, top: 300 }}>
                                {/* count orb persists */}
                                <Orb
                                    label={frame >= B.three ? "count 3" : frame >= B.two ? "count 2" : frame >= B.one ? "count 1" : "count 0"}
                                    color={AMBER}
                                    x={0}
                                    y={interpolate(frame, [B.step3, B.step3 + 20], [60, 0], clamp0)}
                                    scale={1.05}
                                    opacity={interpolate(frame, [B.step3 + 10, B.step3 + 22], [0, 1], clamp0)}
                                />
                            </div>
                            <Stamp text="THEY DON'T." color={RED} size={40} rotate={-5}
                                opacity={op(B.dont, B.dont + 10) * out(B.memory + 40, B.memory + 70)}
                                style={{ left: 130, top: 300 }} />
                            <Stamp text="THAT'S A CLOSURE" color={COPPER} size={38} rotate={-4}
                                opacity={op(B.memory, B.memory + 12)}
                                style={{ left: 110, top: 390 }} />
                        </>
                    )}

                    {/* the counter + big numerals */}
                    <div
                        style={{
                            position: "absolute", left: 620, top: 380,
                            fontFamily: MONO, fontSize: 26, fontWeight: 700, color: INK,
                            border: `3px solid ${INK}`, borderRadius: 12,
                            background: "#FFFDF6", padding: "12px 20px",
                            opacity: op(B.step4, B.step4 + 10),
                            boxShadow: "4px 5px 0 rgba(47,42,38,0.14)",
                        }}
                    >
                        counter() <span style={{ color: SLATE }}>← call it</span>
                    </div>

                    {frame >= B.step4 && (["one", "two", "three"] as const).map((k, i) => {
                        const shown = frame >= B[k];
                        const idx = SENT.findIndex((sn) => frame >= sn.s && frame < sn.e);
                        const active = idx >= 0 && (SENT[idx].text.toLowerCase().trim() === k);
                        return (
                            <div
                                key={k}
                                style={{
                                    position: "absolute",
                                    left: 700 + i * 100,
                                    top: 470,
                                    fontFamily: MONO,
                                    fontSize: shown ? 64 : 40,
                                    fontWeight: 700,
                                    color: shown ? AMBER : "rgba(47,42,38,0.25)",
                                    transform: `scale(${active ? 1.18 : 1})`,
                                    transition: "none",
                                    opacity: shown ? 1 : 0.35,
                                }}
                            >
                                {i + 1}
                            </div>
                        );
                    })}

                    <div
                        style={{
                            position: "absolute", left: 0, right: 0, top: 580, textAlign: "center",
                            fontFamily: HAND, fontSize: 26, fontWeight: 700, color: INK,
                            opacity: op(B.alive, B.alive + 12),
                        }}
                    >
                        the same variable, kept alive between calls.
                    </div>
                    <div
                        style={{
                            position: "absolute", left: 0, right: 0, top: 628, textAlign: "center",
                            fontFamily: HAND, fontSize: 30, fontWeight: 700, color: GREEN,
                            opacity: op(B.private, B.private + 12),
                        }}
                    >
                        persistent private state
                        <span style={{ color: SLATE, fontSize: 20 }}> — the foundation React's hooks are built on</span>
                    </div>

                    {/* try-it quiz */}
                    {frame >= B.try && (
                        <div
                            style={{
                                position: "absolute", left: 120, top: 560, width: 430,
                                border: `3px solid ${BLUE}`, borderRadius: 14,
                                background: "#FFFDF6", padding: "12px 16px",
                                opacity: interpolate(frame, [B.try, B.try + 10], [0, 1], clamp0),
                                transform: "rotate(-1.2deg)",
                            }}
                        >
                            <div style={{ fontFamily: HAND, fontSize: 20, fontWeight: 700, color: BLUE }}>
                                try it yourself ✎
                            </div>
                            <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: INK, marginTop: 6 }}>
                                counter(); counter();
                            </div>
                            <div style={{ fontFamily: HAND, fontSize: 22, fontWeight: 700, color: AMBER, marginTop: 6, opacity: op(B.predict, B.predict + 10) }}>
                                prints 1, then 2 — count kept going.
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ============ ACT 4 — RECAP ============ */}
            {frame >= CUT3 && (
                <div style={{ position: "absolute", inset: 0, opacity: op(CUT3, CUT3 + 10) }}>
                    <div
                        style={{
                            position: "absolute", left: 0, right: 0, top: 70, textAlign: "center",
                            fontFamily: HAND, fontSize: 40, fontWeight: 700, color: INK,
                        }}
                    >
                        scope vs closure
                    </div>

                    {/* two panels */}
                    <Sheet x={80} y={150} w={400} h={330} opacity={op(B.so1, B.so1 + 12)}>
                        <div style={{ fontFamily: HAND, fontSize: 28, fontWeight: 700, color: BLUE, padding: "20px 22px 0" }}>
                            scope
                        </div>
                        <div style={{ fontFamily: HAND, fontSize: 22, color: INK, padding: "10px 22px", lineHeight: 1.45 }}>
                            decides <b>where</b> a variable can be seen.
                        </div>
                        <div style={{ fontFamily: HAND, fontSize: 19, color: SLATE, padding: "0 22px" }}>
                            based on lexical structure.
                        </div>
                        <div style={{ position: "absolute", bottom: 20, left: 22 }}>
                            <Pill color={BLUE} size={16}>global · function · block</Pill>
                        </div>
                    </Sheet>
                    <Sheet x={560} y={150} w={400} h={330} opacity={op(B.so2, B.so2 + 12)}>
                        <div style={{ fontFamily: HAND, fontSize: 28, fontWeight: 700, color: COPPER, padding: "20px 22px 0" }}>
                            closure
                        </div>
                        <div style={{ fontFamily: HAND, fontSize: 22, color: INK, padding: "10px 22px", lineHeight: 1.45 }}>
                            lets a function <b>keep</b> its outer variables.
                        </div>
                        <div style={{ fontFamily: HAND, fontSize: 19, color: SLATE, padding: "0 22px" }}>
                            created when the environment is retained.
                        </div>
                        <div style={{ position: "absolute", bottom: 20, left: 22 }}>
                            <Pill color={COPPER} size={16}>persistent private state</Pill>
                        </div>
                    </Sheet>

                    {/* three questions */}
                    {[
                        { at: B.q1, t: "why can inner() see count?" },
                        { at: B.q2, t: "why can't the outside reach it?" },
                        { at: B.q3, t: "why does count keep rising?" },
                    ].map((q, i) => (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                left: 120 + i * 300,
                                top: 520,
                                width: 270,
                                fontFamily: HAND,
                                fontSize: 21,
                                fontWeight: 700,
                                color: INK,
                                border: `2.5px dashed ${INK}`,
                                borderRadius: 12,
                                padding: "12px 14px",
                                background: "rgba(255,253,246,0.8)",
                                opacity: op(q.at, q.at + 10),
                                transform: `rotate(${(i - 1) * 1.4}deg)`,
                            }}
                        >
                            <span style={{ color: AMBER }}>{i + 1}.</span> {q.t}
                        </div>
                    ))}

                    {/* final line */}
                    <div
                        style={{
                            position: "absolute", left: 0, right: 0, top: 640, textAlign: "center",
                            opacity: op(B.own, B.own + 12),
                            transform: `translateY(${interpolate(frame, [B.own, B.own + 14], [14, 0], clamp0)}px)`,
                        }}
                    >
                        <div style={{ fontFamily: HAND, fontSize: 36, fontWeight: 700, color: INK }}>
                            answer all three — and you own closures.
                        </div>
                        <div style={{ fontFamily: HAND, fontSize: 20, fontWeight: 700, color: SLATE, marginTop: 8 }}>
                            next stop: React, with the foundation already laid.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ==================================================================
 * LONG-FORM — 1920×1080: stage left, big bold code right, captions
 * ================================================================== */
export const ScopeClosures: React.FC = () => {
    const frame = useCurrentFrame();
    return (
        <AbsoluteFill style={duskPaper}>
            <Audio src={staticFile("scopeclosures-narration.mp3")} />
            <Audio src={staticFile("scopeclosures-bed.wav")} />

            {/* film header */}
            <div
                style={{
                    position: "absolute", left: 60, top: 36,
                    display: "flex", alignItems: "baseline", gap: 18,
                }}
            >
                <div style={{ fontFamily: HAND, fontSize: 34, fontWeight: 700, color: INK }}>
                    scope &amp; closures
                </div>
                <div style={{ fontFamily: HAND, fontSize: 19, color: SLATE }}>
                    where variables live — a visual field guide
                </div>
            </div>
            <div style={{ position: "absolute", right: 60, top: 40, display: "flex", gap: 8 }}>
                {[
                    { l: "① house", at: B.rooms, c: GREEN },
                    { l: "② chain", at: CUT1, c: BLUE },
                    { l: "③ closure", at: CUT2, c: AMBER },
                    { l: "④ recap", at: CUT3, c: COPPER },
                ].map((p) => (
                    <div
                        key={p.l}
                        style={{
                            fontFamily: HAND, fontSize: 16, fontWeight: 700,
                            color: frame >= p.at ? "#FFFDF6" : SLATE,
                            background: frame >= p.at ? p.c : "transparent",
                            border: `2px solid ${frame >= p.at ? p.c : SLATE}`,
                            borderRadius: 9, padding: "3px 10px",
                        }}
                    >
                        {p.l}
                    </div>
                ))}
            </div>

            {/* stage */}
            <div style={{ position: "absolute", left: 60, top: 120, width: 1040, height: 740 }}>
                <Stage frame={frame} />
            </div>

            {/* code sheet — bigger + bolder */}
            <div style={{ position: "absolute", left: 1140, top: 120, width: 720, height: 745 }}>
                <CodeCard frame={frame} height={745} />
            </div>

            <Caps frame={frame} />
        </AbsoluteFill>
    );
};

/* ==================================================================
 * VERTICALS — 1080×1920
 * ================================================================== */
const VerticalBody: React.FC<{ offset: number; f: number }> = ({ offset, f }) => {
    const frame = f + offset;
    return (
        <>
            <div style={{ position: "absolute", left: 0, right: 0, top: 34, textAlign: "center" }}>
                <div style={{ fontFamily: HAND, fontSize: 42, fontWeight: 700, color: INK }}>
                    scope &amp; closures
                </div>
                <div style={{ fontFamily: HAND, fontSize: 20, color: SLATE, marginTop: 2 }}>
                    where variables live
                </div>
            </div>
            <div
                style={{
                    position: "absolute", left: 8, top: 130,
                    width: 1064, height: 758,
                    transform: "scale(1.0)",
                    transformOrigin: "0 0",
                }}
            >
                <Stage frame={frame} />
            </div>
            <div style={{ position: "absolute", left: 30, top: 908, width: 1020, height: 640 }}>
                <CodeCard frame={frame} compact height={640} />
            </div>
            <Caps frame={frame} compact />
        </>
    );
};

export const ShortScopeRooms: React.FC = () => {
    const frame = useCurrentFrame();
    return (
        <AbsoluteFill style={duskPaper}>
            <Audio src={staticFile("scopeclosures-narration.mp3")} />
            <Audio src={staticFile("scopeclosures-bed.wav")} />
            <VerticalBody offset={0} f={frame} />
        </AbsoluteFill>
    );
};

export const ShortScopeClosure: React.FC = () => {
    const frame = useCurrentFrame();
    return (
        <AbsoluteFill style={duskPaper}>
            <Audio src={staticFile("scopeclosures-narration.mp3")} startFrom={CUT1} />
            <Audio src={staticFile("scopeclosures-bed.wav")} startFrom={CUT1} />
            <VerticalBody offset={CUT1} f={frame} />
        </AbsoluteFill>
    );
};

export const ShortScopeFull: React.FC = () => {
    const frame = useCurrentFrame();
    return (
        <AbsoluteFill style={duskPaper}>
            <Audio src={staticFile("scopeclosures-narration.mp3")} />
            <Audio src={staticFile("scopeclosures-bed.wav")} />
            <VerticalBody offset={0} f={frame} />
        </AbsoluteFill>
    );
};
