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
 * VIDEO #5 v2 — SCOPE & CLOSURES — "Deep Current" design
 *
 * Own presentation system inspired by (not copied from) the user's
 * reference sample: dark canvas, BIG syntax-highlighted code with
 * opacity spotlight, one-clause kinetic caption, an orbit-ring scope
 * visualization, a depth-gauge progress tracker (nesting level), and
 * a scope visibility matrix in the recap. All original visuals.
 *
 * Single pre-mixed audio track (voice + bed in one WAV — no Remotion
 * multi-track attenuation). Acts hard-cut at sentence boundaries.
 *   ① THE HOUSE  global / function / block (+ var trap)
 *   ② THE CHAIN  orbit rings, the outward walk, lexical rule
 *   ③ THE CLOSURE  outer() returns inner; count survives; 1 2 3
 *   ④ RECAP  visibility matrix + the three questions
 * ================================================================== */

const BG = "#0C141D";
const ICE = "#DCE7F0";
const MUTED = "#7C8B99";
const MINT = "#5EEAD4";
const GOLD = "#F5C97B";
const CORAL = "#F97066";
const SKY = "#7DD3FC";
const COPPER = "#C98A4B";
const PUNCT = "#8FA3B5";
const UI = '"Segoe UI", "Inter", sans-serif';
const MONO = '"Consolas", monospace';

const clamp0 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------------- sentence beats ---------------- */
const S = (i: number) => SENT[i].s;

const B = {
  hook: S(0), lives: S(1), scopeIs: S(2), foundation: S(3),
  global: S(4), declare: S(5), open: S(6), search: S(7), arin: S(8),
  fn: S(9), belong: S(10), hello: S(11), outside: S(12), refErr1: S(13), private: S(14),
  blockA: S(15), braces: S(16), liveDie: S(17), varWall: S(18), varFn: S(19), trap: S(20),
  searchHow: S(21), innerReads: S(22), levels: S(23), outward: S(24), refErr2: S(25), written: S(26), lexical: S(27),
  closures: S(28), creates: S(29), careful: S(30), retFn: S(31), parens: S(32), finishes: S(33),
  shouldGo: S(34), notGone: S(35), holds: S(36), memory: S(37),
  callCounter: S(38), one: S(39), again1: S(40), two: S(41), again2: S(42), three: S(43),
  alive: S(44), privateState: S(45), try: S(46),
  soScope: S(47), keep: S(48), threeQ: S(49), q1: S(50), q2: S(51), q3: S(52), own: S(53),
};

export const CUT1 = B.searchHow; // house → chain
export const CUT2 = B.closures;  // chain → closure
export const CUT3 = B.soScope;   // closure → recap

export const VA_FRAMES = CUT1;
export const VB_FRAMES = ADURATION - CUT1;

/* ---------------- syntax tokenizer (no deps) ---------------- */
const TOKEN_RE =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(\b(?:const|let|var|function|return|if|for|of|true|false)\b)|(\b(?:console|log)\b)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;

const tokenize = (line: string): { t: string; c: string }[] => {
  const toks: { t: string; c: string }[] = [];
  TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN_RE.exec(line))) {
    const [txt, com, str, num, kw, con, idn] = m;
    if (com) toks.push({ t: txt, c: MUTED });
    else if (str) toks.push({ t: txt, c: GOLD });
    else if (num) toks.push({ t: txt, c: CORAL });
    else if (kw) toks.push({ t: txt, c: MINT });
    else if (con) toks.push({ t: txt, c: SKY });
    else if (idn) {
      const rest = line.slice(m.index + txt.length);
      toks.push({ t: txt, c: /^\s*\(/.test(rest) ? SKY : ICE });
    } else toks.push({ t: txt, c: PUNCT });
  }
  return toks;
};

/* ---------------- code data ---------------- */
type CodeAct = "house1" | "house2" | "house3" | "chain" | "closure";

const CODE: Record<CodeAct, { lines: string[]; label: string; color: string }> = {
  house1: {
    label: "global scope", color: SKY,
    lines: [
      'const name = "Arin";', "",
      "function greet() {", "  console.log(name);", "}", "",
      "greet();             // Arin", "console.log(name);   // Arin",
    ],
  },
  house2: {
    label: "function scope", color: MINT,
    lines: [
      "function greet() {", '  const message = "Hello!";', "  console.log(message);", "}", "",
      "greet();   // Hello!", "", "console.log(message);", "// ReferenceError!",
    ],
  },
  house3: {
    label: "block scope", color: GOLD,
    lines: [
      "if (true) {", "  let age = 25;", '  const city = "Kathmandu";', "}", "",
      "console.log(age);  // Error!", "", "if (true) {", "  var age = 25;", "}", "",
      "console.log(age);  // 25",
    ],
  },
  chain: {
    label: "lexical scope", color: SKY,
    lines: [
      'const country = "Nepal";', "",
      "function outer() {", '  const city = "Kathmandu";', "",
      "  function inner() {", '    const street = "Makalu";',
      "    console.log(street);", "    console.log(city);", "    console.log(country);",
      "  }", "", "  inner();", "}", "", "outer();",
    ],
  },
  closure: {
    label: "the closure", color: GOLD,
    lines: [
      "function outer() {", "  let count = 0;", "",
      "  function inner() {", "    count++;", "    console.log(count);", "  }", "",
      "  return inner;", "}", "", "const counter = outer();", "",
      "counter();  // 1", "counter();  // 2", "counter();  // 3",
    ],
  },
};

/* sentence index → active lines (opacity spotlight) */
const HIGHLIGHTS: Record<number, number[]> = {
  5: [0], 6: [0], 7: [2, 3, 6], 8: [6, 7],
  10: [0, 1], 11: [1, 2, 5], 12: [1], 13: [7, 8], 14: [1, 7],
  16: [0, 1, 2, 3], 17: [1, 2], 18: [7, 8], 19: [8, 11], 20: [8, 11],
  21: [0, 2, 5], 22: [6, 7, 8, 9], 23: [6, 7, 8, 9], 24: [7, 8, 9], 25: [9], 26: [2, 5], 27: [2, 5],
  29: [0, 1, 3], 30: [8], 31: [8], 32: [8],
  33: [9, 11], 34: [9], 35: [11], 36: [11, 13], 37: [1, 4, 13],
  38: [13], 39: [13], 40: [14], 41: [14], 42: [15], 43: [15],
  44: [13, 14, 15], 45: [1, 4], 46: [13, 14, 15],
};

const nearestSentence = (frame: number): number => {
  let lo = 0, hi = SENT.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (SENT[mid].s <= frame) lo = mid; else hi = mid - 1;
  }
  return lo;
};

const actCodeAt = (frame: number): CodeAct => {
  if (frame < B.fn) return "house1";
  if (frame < B.blockA) return "house2";
  if (frame < CUT1) return "house3";
  if (frame < CUT2) return "chain";
  return "closure";
};

/* ---------------- code panel ---------------- */
const CodePanel: React.FC<{ frame: number; compact?: boolean; height?: number }> = ({
  frame, compact = false, height,
}) => {
  const act = actCodeAt(frame);
  const data = CODE[act];
  const idx = nearestSentence(frame);
  let active = HIGHLIGHTS[idx] ?? [];

  // during sentence 23, walk the three console lines with the hops
  if (idx === 23) {
    const hop = Math.min(2, Math.floor((frame - B.levels) / (1.45 * 30)));
    if (frame >= B.levels) active = [6 + hop];
  }

  const fs = compact ? 26 : 36;
  const lh = compact ? 1.35 : 1.28;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: height ?? "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 34, height: 3, background: data.color, borderRadius: 2 }} />
        <div style={{ fontFamily: UI, fontSize: compact ? 19 : 22, fontWeight: 700, color: data.color, letterSpacing: 1 }}>
          {data.label}
        </div>
      </div>
      <div style={{ flex: 1, borderLeft: `2px solid rgba(201,138,75,0.35)`, paddingLeft: compact ? 14 : 22 }}>
        {data.lines.map((ln, i) => {
          const on = active.includes(i);
          return (
            <div
              key={i}
              style={{
                position: "relative",
                fontFamily: MONO,
                fontSize: fs,
                fontWeight: on ? 700 : 500,
                lineHeight: lh,
                whiteSpace: "pre",
                color: on ? ICE : "rgba(220,231,240,0.30)",
                transition: "none",
              }}
            >
              {on && (
                <div
                  style={{
                    position: "absolute", left: -22 - (compact ? 14 : 0), top: 2, bottom: 2,
                    width: 3, borderRadius: 2, background: COPPER,
                    opacity: 0.9,
                  }}
                />
              )}
              {on && (
                <div
                  style={{
                    position: "absolute", inset: `-2px -12px`, borderRadius: 8,
                    background: "rgba(94,234,212,0.05)",
                  }}
                />
              )}
              {tokenize(ln).map((tk, j) => (
                <span key={j} style={{ color: on ? tk.c : undefined }}>{tk.t}</span>
              ))}
              {ln === "" ? " " : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------- shared bits ---------------- */
const Orb: React.FC<{
  label: string; color: string; x: number; y: number; scale?: number; opacity?: number; glow?: number;
}> = ({ label, color, x, y, scale = 1, opacity = 1, glow = 0 }) => (
  <div
    style={{
      position: "absolute", left: x, top: y,
      transform: `scale(${scale})`, transformOrigin: "0 0", opacity,
    }}
  >
    <div
      style={{
        minWidth: 58, height: 58, padding: "0 12px",
        display: "grid", placeItems: "center",
        borderRadius: 999,
        border: `2.5px solid ${color}`,
        background: `radial-gradient(circle at 34% 30%, rgba(255,255,255,0.16), ${color}14 72%)`,
        boxShadow: glow ? `0 0 ${18 * glow}px ${color}66` : "none",
        fontFamily: MONO, fontSize: 14, fontWeight: 700, color: ICE,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  </div>
);

const Tag: React.FC<{
  text: string; color: string; x: number; y: number; size?: number; opacity?: number; rotate?: number;
  border?: boolean;
}> = ({ text, color, x, y, size = 26, opacity = 1, rotate = 0, border = true }) => (
  <div
    style={{
      position: "absolute", left: x, top: y,
      fontFamily: UI, fontSize: size, fontWeight: 700, color,
      padding: border ? "5px 16px" : 0,
      border: border ? `2px solid ${color}` : "none",
      borderRadius: border ? 10 : 0,
      background: border ? "rgba(12,20,29,0.72)" : "transparent",
      transform: `rotate(${rotate}deg)`,
      opacity, whiteSpace: "nowrap",
      letterSpacing: 0.5,
    }}
  >
    {text}
  </div>
);

/* burned-in caption: one clause, key terms colored, copper tide underline */
const TERM_RE = /(ReferenceError|closure[s]?|scope|var\b|one|two|three|React)/gi;
const termColor = (w: string): string | null => {
  const lw = w.toLowerCase();
  if (/referenceerror/.test(lw)) return CORAL;
  if (/closure/.test(lw)) return GOLD;
  if (/scope/.test(lw)) return MINT;
  if (/^var$/.test(lw)) return CORAL;
  if (/^(one|two|three)$/.test(lw)) return GOLD;
  if (/react/.test(lw)) return SKY;
  return null;
};

const Caps: React.FC<{ frame: number; compact?: boolean }> = ({ frame, compact = false }) => {
  const idx = SENT.findIndex((sn) => frame >= sn.s && frame < sn.e);
  if (idx < 0) return null;
  const line = SENT[idx].text;
  const parts: { t: string; c: string | null }[] = [];
  let last = 0;
  TERM_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TERM_RE.exec(line))) {
    if (m.index > last) parts.push({ t: line.slice(last, m.index), c: null });
    parts.push({ t: m[0], c: termColor(m[0]) });
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push({ t: line.slice(last), c: null });

  const underline = interpolate(frame, [SENT[idx].s, SENT[idx].s + 14], [0, 1], clamp0);
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0,
        bottom: compact ? 40 : 56,
        textAlign: "center",
        fontFamily: UI, fontSize: compact ? 34 : 40, fontWeight: 600,
        color: ICE, letterSpacing: 0.2,
        textShadow: "0 2px 18px rgba(5,10,16,0.9)",
        padding: "0 80px",
      }}
    >
      {parts.map((p, i) => (
        <span key={i} style={{ color: p.c ?? ICE, fontWeight: p.c ? 700 : 600 }}>{p.t}</span>
      ))}
      <div
        style={{
          position: "absolute", left: "50%", bottom: -14,
          width: 220 * underline, height: 2.5, borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${COPPER}, transparent)`,
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
};

/* depth gauge: nesting level 0..4 (right edge) */
const Gauge: React.FC<{ frame: number; compact?: boolean }> = ({ frame, compact }) => {
  const depth = frame < B.fn ? 0 : frame < B.blockA ? 1 : frame < CUT1 ? 2 : frame < CUT2 ? 3 : 4;
  const names = ["global", "function", "block", "chain", "closure"];
  const H = compact ? 300 : 560;
  const gap = H / 4;
  return (
    <div style={{ position: "absolute", right: compact ? 26 : 34, top: compact ? 120 : 170, height: H, width: compact ? 60 : 90 }}>
      <div style={{ position: "absolute", left: compact ? 12 : 20, top: 0, width: 2, height: H, background: "rgba(220,231,240,0.14)" }} />
      {[0, 1, 2, 3, 4].map((d) => {
        const y = d * gap;
        const on = d <= depth;
        return (
          <div key={d} style={{ position: "absolute", left: compact ? 12 : 20, top: y }}>
            <div
              style={{
                width: on ? 10 : 6, height: on ? 10 : 6, borderRadius: 999,
                background: on ? COPPER : "rgba(220,231,240,0.3)",
                transform: "translateX(-4px)",
                boxShadow: d === depth ? `0 0 12px ${COPPER}` : "none",
              }}
            />
            {!compact && (
              <div
                style={{
                  position: "absolute", left: 20, top: -9,
                  fontFamily: UI, fontSize: 15, fontWeight: on ? 700 : 500,
                  color: on ? (d === depth ? COPPER : ICE) : "rgba(220,231,240,0.35)",
                  whiteSpace: "nowrap",
                }}
              >
                {d} · {names[d]}
              </div>
            )}
          </div>
        );
      })}
      {/* travelling marker */}
      <div
        style={{
          position: "absolute", left: compact ? 12 : 20,
          top: depth * gap, transition: "none",
        }}
      >
        <div
          style={{
            width: 16, height: 16,
            transform: "translateX(-7px) rotate(45deg)",
            background: COPPER,
            boxShadow: `0 0 16px ${COPPER}99`,
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
};

/* ==================================================================
 * STAGE — 1000 × 800 scene area
 * ================================================================== */
const Stage: React.FC<{ frame: number }> = ({ frame }) => {
  const op = (a: number, b: number) => interpolate(frame, [a, b], [0, 1], clamp0);
  const out = (a: number, b: number) => interpolate(frame, [a, b], [1, 0], clamp0);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* ============ HOOK (0 → global) ============ */}
      {frame < B.global && (
        <div style={{ position: "absolute", inset: 0, opacity: out(B.global - 6, B.global) }}>
          {/* copper rope + hook lowering to catch the name orb */}
          <svg viewBox="0 0 1000 800" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <line
              x1={420} y1={-20} x2={420}
              y2={interpolate(frame, [B.hook, B.hook + 55], [80, 330], clamp0)}
              stroke={COPPER} strokeWidth="3" strokeDasharray="7 6"
            />
            <path
              d={`M 420 ${interpolate(frame, [B.hook, B.hook + 55], [80, 330], clamp0)}
                  c 0 24, -16 32, -16 48 c 0 18, 18 26, 32 16`}
              fill="none" stroke={COPPER} strokeWidth="4.5" strokeLinecap="round"
              opacity={interpolate(frame, [B.hook, B.hook + 20], [0, 1], clamp0)}
            />
          </svg>
          <Orb
            label="name" color={SKY}
            x={392} y={interpolate(frame, [B.hook + 45, B.hook + 70], [520, 372], clamp0)}
            scale={1.12} glow={1.4}
            opacity={op(B.hook + 35, B.hook + 55)}
          />
          <div
            style={{
              position: "absolute", left: 0, right: 0, top: 560, textAlign: "center",
              fontFamily: UI, fontSize: 34, fontWeight: 700, color: ICE, letterSpacing: 0.5,
              opacity: op(B.lives, B.lives + 12),
            }}
          >
            every variable lives <span style={{ color: MINT }}>somewhere</span>.
          </div>
          <Tag text="SCOPE" color={MINT} x={430} y={110} size={40} rotate={-3} opacity={op(B.scopeIs, B.scopeIs + 10)} />
        </div>
      )}

      {/* ============ ACT 1 — THE HOUSE ============ */}
      {frame >= B.global && frame < CUT1 && (
        <div style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [CUT1 - 4, CUT1], [1, 0], clamp0) }}>
          {/* ---- global: horizon ring + ripples ---- */}
          {frame < B.fn && (
            <div style={{ position: "absolute", inset: 0, opacity: out(B.fn - 4, B.fn) }}>
              <svg viewBox="0 0 1000 800" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <ellipse cx={380} cy={640} rx={310} ry={70} fill="none" stroke={SKY} strokeWidth="2.5" opacity={0.5} />
                {/* ripples while "the whole program can read it" */}
                {[0, 30, 60].map((d) => {
                  const p = ((frame - B.open + d) % 90) / 90;
                  const e = p >= 0 && p <= 1 ? p : 0;
                  return (
                    <ellipse
                      key={d} cx={380} cy={640}
                      rx={310 + e * 160} ry={70 + e * 60}
                      fill="none" stroke={SKY} strokeWidth={2.5 * (1 - e)}
                      opacity={frame >= B.open ? 0.55 * (1 - e) : 0}
                    />
                  );
                })}
                {/* greet reaches outward for name */}
                {frame >= B.search && frame < B.arin && (
                  <g opacity={0.9}>
                    <path
                      d={`M 380 560 C 400 520, 420 500, 444 486`}
                      fill="none" stroke={COPPER} strokeWidth="3" strokeDasharray="7 6"
                    />
                    <path d="M 436 480 L 452 484 L 442 498" fill="none" stroke={COPPER} strokeWidth="3" strokeLinecap="round" />
                  </g>
                )}
              </svg>
              <Orb label="name" color={SKY} x={352} y={596} scale={1.0} glow={1.2} opacity={op(B.declare, B.declare + 12)} />
              <Tag text="everyone can read it" color={MUTED} x={508} y={610} size={20} opacity={op(B.open, B.open + 10)} border={false} />
              <Tag text="global" color={SKY} x={330} y={500} size={22} opacity={op(B.global, B.global + 10)} />
            </div>
          )}

          {/* ---- function: walled cell ---- */}
          {frame >= B.fn && frame < B.blockA && (
            <div style={{ position: "absolute", inset: 0, opacity: out(B.blockA - 4, B.blockA) }}>
              <div
                style={{
                  position: "absolute", left: 210, top: 420, width: 340, height: 250,
                  borderRadius: 22,
                  border: `3px solid ${MINT}`,
                  boxShadow: `0 0 34px ${MINT}22, inset 0 0 24px ${MINT}11`,
                  background: "rgba(94,234,212,0.04)",
                  opacity: op(B.fn, B.fn + 12),
                }}
              />
              <Tag text="greet()" color={MINT} x={248} y={384} size={20} opacity={op(B.fn, B.fn + 12)} />
              <Orb label="message" color={MINT} x={282} y={512} scale={1.0} glow={1.1} opacity={op(B.belong, B.belong + 12)} />
              <Tag text="inside: Hello!" color={ICE} x={560} y={470} size={22} opacity={op(B.hello, B.hello + 10)} border={false} />
              {/* probe bounces off the wall */}
              {frame >= B.outside && (
                <svg viewBox="0 0 1000 800" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  <line x1={560} y1={330} x2={lerp(560, 500, interpolate(frame, [B.outside, B.outside + 16], [0, 1], clamp0))}
                    y2={lerp(330, 402, interpolate(frame, [B.outside, B.outside + 16], [0, 1], clamp0))}
                    stroke={CORAL} strokeWidth="3" strokeDasharray="7 6" opacity={0.85} />
                  <line x1={500} y1={402} x2={lerp(500, 590, interpolate(frame, [B.refErr1, B.refErr1 + 14], [0, 1], clamp0))}
                    y2={lerp(402, 350, interpolate(frame, [B.refErr1, B.refErr1 + 14], [0, 1], clamp0))}
                    stroke={CORAL} strokeWidth="3" strokeDasharray="7 6"
                    opacity={interpolate(frame, [B.refErr1, B.refErr1 + 6], [0, 0.85], clamp0)} />
                </svg>
              )}
              <Tag text="outside: ✗ does not exist" color={CORAL} x={560} y={300} size={20} opacity={op(B.outside, B.outside + 10)} />
              <Tag text="ReferenceError!" color={CORAL} x={600} y={220} size={30} rotate={-5} opacity={op(B.refErr1, B.refErr1 + 10)} />
            </div>
          )}

          {/* ---- block: braces wall, var slips through ---- */}
          {frame >= B.blockA && (
            <div style={{ position: "absolute", inset: 0 }}>
              <div
                style={{
                  position: "absolute", left: 120, top: 400,
                  fontFamily: MONO, fontSize: 150, fontWeight: 700, color: GOLD,
                  opacity: op(B.blockA, B.blockA + 12),
                  transform: `scaleX(${1 + 0.16 * interpolate(frame, [B.varWall, B.varWall + 14, B.varWall + 30], [0, 1, 0], clamp0)})`,
                }}
              >
                {"{"}
              </div>
              <div
                style={{
                  position: "absolute", left: 470, top: 400,
                  fontFamily: MONO, fontSize: 150, fontWeight: 700, color: GOLD,
                  opacity: op(B.blockA, B.blockA + 12),
                  transform: `scaleX(${1 - 0.16 * interpolate(frame, [B.varWall, B.varWall + 14, B.varWall + 30], [0, 1, 0], clamp0)})`,
                }}
              >
                {"}"}
              </div>
              {frame < B.varWall && (
                <>
                  <Orb label="age" color={GOLD} x={270} y={505} scale={0.85} opacity={op(B.liveDie, B.liveDie + 10)} />
                  <Orb label="city" color={GOLD} x={370} y={505} scale={0.85} opacity={op(B.liveDie, B.liveDie + 14)} />
                </>
              )}
              {/* var ignores the wall */}
              {frame >= B.varWall && (
                <Orb
                  label="var age" color={CORAL}
                  x={lerp(270, 700, interpolate(frame, [B.varWall, B.varWall + 24], [0, 1], clamp0))}
                  y={505} scale={0.85} glow={1.1}
                  opacity={op(B.varWall, B.varWall + 8)}
                />
              )}
              <Tag text="block { }" color={GOLD} x={255} y={360} size={22} opacity={op(B.blockA, B.blockA + 10)} />
              <Tag text="var: function-scoped" color={CORAL} x={560} y={430} size={24} rotate={-3} opacity={op(B.trap, B.trap + 10)} />
            </div>
          )}
        </div>
      )}

      {/* ============ ACT 2 — THE CHAIN (orbit rings) ============ */}
      {frame >= CUT1 && frame < CUT2 && (
        <div style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [CUT2 - 4, CUT2], [1, 0], clamp0) }}>
          <svg viewBox="0 0 1000 800" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {[90, 180, 270].map((r, i) => (
              <circle
                key={r} cx={330} cy={430} r={r}
                fill="none"
                stroke={i === 0 ? MINT : i === 1 ? SKY : COPPER}
                strokeWidth={2} strokeDasharray={i === 0 ? "none" : "3 7"}
                opacity={op(CUT1 + i * 8, CUT1 + 10 + i * 8) * 0.5}
              />
            ))}
            {/* depth labels (along each ring's upper-right diagonal, clear of orbs) */}
            {[90, 180, 270].map((r, i) => (
              <text
                key={r} x={330 + r * 0.71 + 14} y={430 - r * 0.71 + 5}
                textAnchor="start" fontFamily="Segoe UI" fontSize="15" fontWeight="700"
                fill={i === 0 ? MINT : i === 1 ? SKY : COPPER}
                opacity={op(CUT1 + i * 8, CUT1 + 12 + i * 8) * 0.8}
              >
                {["depth 2 — inner()", "depth 1 — outer()", "depth 0 — global"][i]}
              </text>
            ))}
            {/* the outward walk trail */}
            {frame >= B.levels && (
              <path
                d="M 330 340 L 330 250 L 330 160"
                fill="none" stroke={COPPER} strokeWidth="3" strokeDasharray="7 7"
                opacity={interpolate(frame, [B.levels, B.levels + 20], [0, 0.6], clamp0) * out(B.refErr2, B.refErr2 + 10)}
              />
            )}
            {/* comet hops outward during sentence 23 */}
            {frame >= B.levels && frame < B.refErr2 && (
              <g>
                {(() => {
                  const hop = Math.min(2, Math.floor((frame - B.levels) / (1.45 * 30)));
                  const t = interpolate(frame, [B.levels + hop * 1.45 * 30, B.levels + hop * 1.45 * 30 + 20], [0, 1], clamp0);
                  const y0 = 340 - hop * 90;
                  const y1 = 250 - hop * 90;
                  return (
                    <g opacity={0.95}>
                      <line x1={330} y1={y0} x2={330} y2={lerp(y0, y1, t)} stroke={GOLD} strokeWidth="2" opacity={0.5} />
                      <circle cx={330} cy={lerp(y0, y1, t)} r={9} fill={GOLD} opacity={0.28 + 0.6 * t} />
                      <circle cx={330} cy={lerp(y0, y1, t)} r={4.5} fill="#FFF7E2" />
                    </g>
                  );
                })()}
              </g>
            )}
            {/* nothing left → flies off and fizzles */}
            {frame >= B.refErr2 && (
              <g opacity={interpolate(frame, [B.refErr2, B.refErr2 + 8], [0, 1], clamp0) * out(B.refErr2 + 50, B.refErr2 + 70)}>
                <line x1={330} y1={160} x2={lerp(330, 640, interpolate(frame, [B.refErr2, B.refErr2 + 20], [0, 1], clamp0))}
                  y2={lerp(160, 80, interpolate(frame, [B.refErr2, B.refErr2 + 20], [0, 1], clamp0))}
                  stroke={CORAL} strokeWidth="2.5" strokeDasharray="6 6" opacity={0.8} />
              </g>
            )}
          </svg>
          {/* orbs stacked outward */}
          <Orb label="street" color={MINT} x={302} y={311} scale={0.9} opacity={op(CUT1 + 10, CUT1 + 22)} />
          <Orb label="city" color={SKY} x={302} y={221} scale={0.9} opacity={op(CUT1 + 16, CUT1 + 28)} />
          <Orb label="country" color={COPPER} x={302} y={131} scale={0.9} opacity={op(CUT1 + 22, CUT1 + 34)} />
          <Tag text="ReferenceError" color={CORAL} x={590} y={168} size={28} rotate={-4} opacity={op(B.refErr2, B.refErr2 + 10)} />
          <div
            style={{
              position: "absolute", left: 560, top: 300, width: 400,
              fontFamily: UI, fontSize: 24, fontWeight: 600, color: ICE, lineHeight: 1.5,
              opacity: op(B.lexical, B.lexical + 12),
            }}
          >
            the chain is decided by <span style={{ color: COPPER, fontWeight: 700 }}>where the code is written</span> — that is <span style={{ color: MINT, fontWeight: 700 }}>lexical scope</span>.
          </div>
          <Tag text="inner → outer → global" color={MUTED} x={560} y={480} size={18} opacity={op(B.lexical + 16, B.lexical + 26)} />
        </div>
      )}

      {/* ============ ACT 3 — THE CLOSURE ============ */}
      {frame >= CUT2 && frame < CUT3 && (
        <div style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [CUT3 - 4, CUT3], [1, 0], clamp0) }}>
          <Tag text="CLOSURES" color={GOLD} x={330} y={64} size={38} rotate={-3} opacity={op(CUT2 + 4, CUT2 + 14)} />

          {/* outer()'s world — a ring that ghosts away */}
          <svg viewBox="0 0 1000 800" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <circle
              cx={300} cy={430} r={160}
              fill="none"
              stroke={frame >= B.finishes ? COPPER : MINT}
              strokeWidth={frame >= B.memory ? 3.5 : 2.5}
              strokeDasharray={frame >= B.finishes ? "6 8" : "none"}
              opacity={
                frame < B.finishes
                  ? op(B.creates - 4, B.creates + 6) * 0.65
                  : interpolate(frame, [B.finishes, B.finishes + 16], [0.65, 0.22], clamp0) * (frame >= B.memory ? 1.35 : 1)
              }
            />
            {/* the bond thread from the ghost world to the travelling inner() */}
            {frame >= B.retFn && (
              <path
                d={`M 405 340 C 470 320, 500 300, ${lerp(460, 550, interpolate(frame, [B.retFn, B.retFn + 22], [0, 1], clamp0))} 268`}
                fill="none"
                stroke={COPPER}
                strokeWidth={frame >= B.memory ? 4 : 2.5}
                opacity={interpolate(frame, [B.retFn, B.retFn + 14], [0, 0.9], clamp0)}
              />
            )}
          </svg>

          {/* count orb at the heart of the ring — it never leaves */}
          <Orb
            label={frame >= B.three ? "count 3" : frame >= B.two ? "count 2" : frame >= B.one ? "count 1" : "count 0"}
            color={GOLD}
            x={252} y={402} scale={1.02}
            glow={frame >= B.memory ? 1.6 : frame >= B.notGone ? 1.0 : 0.4}
            opacity={op(B.creates, B.creates + 10)}
          />
          <Tag text="outer()" color={frame >= B.finishes ? MUTED : MINT} x={252} y={300} size={20}
            opacity={op(B.creates, B.creates + 10) * (frame >= B.finishes ? 0.5 : 1)} />

          {/* inner() travels out — the handover */}
          {frame >= B.retFn && (
            <div
              style={{
                position: "absolute",
                left: lerp(430, 520, interpolate(frame, [B.retFn, B.retFn + 22], [0, 1], clamp0)),
                top: 240,
                fontFamily: MONO, fontSize: 20, fontWeight: 700, color: ICE,
                border: `2.5px solid ${COPPER}`, borderRadius: 12,
                background: "rgba(12,20,29,0.85)", padding: "10px 18px",
                boxShadow: `0 0 22px ${COPPER}33`,
                transform: `rotate(${interpolate(frame, [B.retFn, B.retFn + 22], [-4, 2], clamp0)}deg)`,
                opacity: interpolate(frame, [B.retFn, B.retFn + 10], [0, 1], clamp0),
                whiteSpace: "nowrap",
              }}
            >
              const counter = <span style={{ color: GOLD }}>inner</span>
              <div style={{ fontFamily: UI, fontSize: 15, fontWeight: 700, color: COPPER, marginTop: 2 }}>
                ← hands over the function itself
              </div>
            </div>
          )}

          {/* careful panel */}
          {frame >= B.careful && frame < B.finishes && (
            <div
              style={{
                position: "absolute", left: 540, top: 350, width: 380,
                border: `2.5px solid ${CORAL}`, borderRadius: 14,
                background: "rgba(12,20,29,0.88)", padding: "12px 16px",
                opacity: interpolate(frame, [B.careful, B.careful + 8], [0, 1], clamp0),
              }}
            >
              <div style={{ fontFamily: UI, fontSize: 17, fontWeight: 700, color: CORAL, marginBottom: 8 }}>
                careful — not the same thing:
              </div>
              <div style={{ fontFamily: MONO, fontSize: 19, fontWeight: 700, color: ICE }}>
                return inner; <span style={{ color: MINT, fontSize: 16 }}> hands out the function</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 19, fontWeight: 700, color: ICE, marginTop: 6 }}>
                return inner(); <span style={{ color: CORAL, fontSize: 16 }}> runs it right now</span>
              </div>
            </div>
          )}

          {/* stamps */}
          <Tag text="outer is done…" color={MUTED} x={560} y={430} size={24} opacity={op(B.shouldGo, B.shouldGo + 8) * out(B.notGone + 2, B.notGone + 10)} border={false} />
          <Tag text="STILL THERE." color={CORAL} x={560} y={430} size={34} rotate={-4} opacity={op(B.notGone + 8, B.notGone + 16) * out(B.memory + 40, B.memory + 70)} />
          <Tag text="THAT'S A CLOSURE" color={GOLD} x={540} y={480} size={32} rotate={-3} opacity={op(B.memory, B.memory + 12) * out(B.callCounter + 26, B.callCounter + 52)} />

          {/* counter + numerals */}
          {frame >= B.callCounter && (
            <div
              style={{
                position: "absolute", left: 600, top: 560,
                fontFamily: MONO, fontSize: 22, fontWeight: 700, color: ICE,
                border: `2.5px solid ${ICE}`, borderRadius: 12,
                background: "rgba(12,20,29,0.85)", padding: "10px 18px",
                opacity: op(B.callCounter, B.callCounter + 8),
              }}
            >
              counter() <span style={{ color: MUTED, fontWeight: 500 }}>← call it</span>
            </div>
          )}
          {frame >= B.callCounter &&
            (["one", "two", "three"] as const).map((k, i) => {
              const shown = frame >= B[k];
              const active = SENT[nearestSentence(frame)].text.toLowerCase().replace(/[^a-z]/g, "") === k;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute", left: 604 + i * 92, top: 648,
                    fontFamily: MONO, fontSize: active ? 66 : 46,
                    fontWeight: 700,
                    color: active ? GOLD : shown ? ICE : "rgba(220,231,240,0.25)",
                    transform: `scale(${active ? 1.12 : 1})`, transformOrigin: "0 0",
                    opacity: shown ? 1 : 0.35,
                    textShadow: active ? `0 0 22px ${GOLD}66` : "none",
                  }}
                >
                  {i + 1}
                </div>
              );
            })}

          <Tag text="persistent private state" color={GOLD} x={560} y={640} size={22}
            opacity={op(B.privateState, B.privateState + 10) * out(B.try, B.try + 6)} border={false} />

          {/* try-it quiz */}
          {frame >= B.try && (
            <div
              style={{
                position: "absolute", left: 90, top: 620, width: 400,
                border: `2.5px solid ${SKY}`, borderRadius: 14,
                background: "rgba(12,20,29,0.88)", padding: "12px 16px",
                opacity: interpolate(frame, [B.try, B.try + 10], [0, 1], clamp0),
                transform: "rotate(-1deg)",
              }}
            >
              <div style={{ fontFamily: UI, fontSize: 18, fontWeight: 700, color: SKY }}>your turn</div>
              <div style={{ fontFamily: MONO, fontSize: 19, fontWeight: 700, color: ICE, marginTop: 6 }}>
                counter(); counter();
              </div>
              <div style={{ fontFamily: UI, fontSize: 19, fontWeight: 700, color: GOLD, marginTop: 6, opacity: op(B.try + 40, B.try + 50) }}>
                prints 1, then 2 — count kept going.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ ACT 4 — RECAP (visibility matrix) ============ */}
      {frame >= CUT3 && (
        <div style={{ position: "absolute", inset: 0, opacity: op(CUT3, CUT3 + 10) }}>
          <div
            style={{
              position: "absolute", left: 0, right: 0, top: 46, textAlign: "center",
              fontFamily: UI, fontSize: 40, fontWeight: 700, color: ICE,
            }}
          >
            <span style={{ color: MINT }}>scope</span> vs <span style={{ color: GOLD }}>closure</span>
          </div>

          {/* two definitions */}
          <div style={{ position: "absolute", left: 40, top: 120, width: 440 }}>
            <div style={{ fontFamily: UI, fontSize: 26, fontWeight: 700, color: MINT }}>scope</div>
            <div style={{ fontFamily: UI, fontSize: 21, color: ICE, lineHeight: 1.5, marginTop: 6 }}>
              decides <b>where</b> a variable can be seen — fixed by where the code is written.
            </div>
          </div>
          <div style={{ position: "absolute", left: 540, top: 120, width: 420 }}>
            <div style={{ fontFamily: UI, fontSize: 26, fontWeight: 700, color: GOLD }}>closure</div>
            <div style={{ fontFamily: UI, fontSize: 21, color: ICE, lineHeight: 1.5, marginTop: 6 }}>
              lets a function <b>keep</b> what it found — private state that survives.
            </div>
          </div>

          {/* visibility matrix: rows = who is reading, cols = the variable */}
          {(() => {
            const rows = ["top-level code", "greet()", "inner()", "counter()"];
            const cols = ["name", "message", "count"];
            const cells = [
              [1, 0, 0],
              [1, 1, 0],
              [1, 0, 1],
              [1, 0, 1],
            ];
            const x0 = 60, y0 = 300, cw = 150, rh = 56;
            const litFrom = B.soScope;
            return (
              <svg viewBox="0 0 1000 800" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {cols.map((c, ci) => (
                  <text
                    key={c} x={x0 + 220 + ci * cw + cw / 2} y={y0 - 12}
                    textAnchor="middle" fontFamily="Consolas" fontSize="18" fontWeight="700"
                    fill={ci === 2 ? GOLD : SKY}
                    opacity={op(litFrom, litFrom + 10)}
                  >
                    {c}
                  </text>
                ))}
                {rows.map((r, ri) => (
                  <g key={r} opacity={op(litFrom + ri * 8, litFrom + 16 + ri * 8)}>
                    <text x={x0} y={y0 + ri * rh + 30} fontFamily="Consolas" fontSize="18" fontWeight="700" fill={ICE}>
                      {r}
                    </text>
                    <line x1={x0} y1={y0 + ri * rh + 44} x2={x0 + 220 + cols.length * cw} y2={y0 + ri * rh + 44}
                      stroke="rgba(220,231,240,0.12)" strokeWidth="1" />
                    {cols.map((_, ci) => {
                      const yes = cells[ri][ci] === 1;
                      const at = litFrom + 20 + (ri * 3 + ci) * 5;
                      return (
                        <g key={ci} opacity={op(at, at + 8)}>
                          <text
                            x={x0 + 220 + ci * cw + cw / 2} y={y0 + ri * rh + 30}
                            textAnchor="middle" fontFamily="Segoe UI" fontSize="24" fontWeight="700"
                            fill={yes ? MINT : "rgba(249,112,102,0.75)"}
                          >
                            {yes ? "✓" : "✗"}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                ))}
              </svg>
            );
          })()}

          {/* three questions */}
          {[
            { at: B.q1, t: "why can inner() see count?" },
            { at: B.q2, t: "why can't the outside reach it?" },
            { at: B.q3, t: "why does count keep rising?" },
          ].map((q, i) => (
            <div
              key={i}
              style={{
                position: "absolute", left: 60 + i * 310, top: 600, width: 280,
                fontFamily: UI, fontSize: 19, fontWeight: 600, color: ICE,
                border: `2px dashed rgba(201,138,75,0.6)`, borderRadius: 12,
                padding: "12px 14px", background: "rgba(12,20,29,0.7)",
                opacity: op(q.at, q.at + 10),
                transform: `rotate(${(i - 1) * 1.2}deg)`,
              }}
            >
              <span style={{ color: GOLD, fontWeight: 700 }}>{i + 1}.</span> {q.t}
            </div>
          ))}

          <div
            style={{
              position: "absolute", left: 0, right: 0, top: 716, textAlign: "center",
              opacity: op(B.own, B.own + 12),
              transform: `translateY(${interpolate(frame, [B.own, B.own + 14], [12, 0], clamp0)}px)`,
            }}
          >
            <div style={{ fontFamily: UI, fontSize: 32, fontWeight: 700, color: ICE }}>
              answer all three — and you <span style={{ color: GOLD }}>own closures</span>.
            </div>
            <div style={{ fontFamily: UI, fontSize: 18, fontWeight: 600, color: MUTED, marginTop: 6 }}>
              next stop: React, with the foundation already laid.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==================================================================
 * LONG-FORM — 1920×1080
 * ================================================================== */
const headerChips = (frame: number) => [
  { l: "① house", at: B.global, c: MINT },
  { l: "② chain", at: CUT1, c: SKY },
  { l: "③ closure", at: CUT2, c: GOLD },
  { l: "④ recap", at: CUT3, c: COPPER },
];

const DeepCurrent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const gx = 480 + 330 * Math.sin((frame * 2 * Math.PI) / 2600);
  const gy = 300 + 220 * Math.cos((frame * 2 * Math.PI) / 3400);
  const hx = 1400 + 260 * Math.cos((frame * 2 * Math.PI) / 3000);
  return (
    <div
      style={{
        position: "absolute", inset: 0,
        background:
          `radial-gradient(700px 480px at ${gx}px ${gy}px, rgba(20,184,166,0.075), rgba(20,184,166,0) 70%),` +
          `radial-gradient(620px 440px at ${hx}px 700px, rgba(201,138,75,0.06), rgba(201,138,75,0) 70%),` +
          `linear-gradient(180deg, #0D1620 0%, #0C141D 55%, #0A1017 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(220,231,240,0.045) 1.2px, transparent 1.3px)",
          backgroundSize: "26px 26px",
        }}
      />
      {children}
    </div>
  );
};

const Header: React.FC<{ frame: number; compact?: boolean }> = ({ frame, compact }) => (
  <div style={{ position: "absolute", left: compact ? 36 : 50, top: compact ? 30 : 34, display: "flex", alignItems: "baseline", gap: 16 }}>
    <div style={{ fontFamily: UI, fontSize: compact ? 30 : 26, fontWeight: 700, color: ICE }}>
      scope &amp; closures
    </div>
    <div style={{ fontFamily: UI, fontSize: compact ? 17 : 15, fontWeight: 500, color: MUTED }}>
      where variables live
    </div>
    {compact && (
      <div style={{ display: "flex", gap: 6, marginLeft: 10 }}>
        {headerChips(frame).map((p) => (
          <div
            key={p.l}
            style={{
              fontFamily: UI, fontSize: 13, fontWeight: 700,
              color: frame >= p.at ? BG : MUTED,
              background: frame >= p.at ? p.c : "transparent",
              border: `1.5px solid ${frame >= p.at ? p.c : "rgba(220,231,240,0.3)"}`,
              borderRadius: 8, padding: "2px 8px",
            }}
          >
            {p.l}
          </div>
        ))}
      </div>
    )}
  </div>
);

const HeaderChipsLong: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", right: 130, top: 40, display: "flex", gap: 8 }}>
    {headerChips(frame).map((p) => (
      <div
        key={p.l}
        style={{
          fontFamily: UI, fontSize: 15, fontWeight: 700,
          color: frame >= p.at ? BG : MUTED,
          background: frame >= p.at ? p.c : "transparent",
          border: `2px solid ${frame >= p.at ? p.c : "rgba(220,231,240,0.3)"}`,
          borderRadius: 9, padding: "3px 10px",
        }}
      >
        {p.l}
      </div>
    ))}
  </div>
);

export const ScopeClosuresV2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <DeepCurrent>
        <Audio src={staticFile("scopeclosures2-mix.wav")} />
        <Header frame={frame} />
        <HeaderChipsLong frame={frame} />
        <Gauge frame={frame} />
        {/* scene */}
        <div style={{ position: "absolute", left: 20, top: 120, width: 1000, height: 800 }}>
          <Stage frame={frame} />
        </div>
        {/* code */}
        {frame < CUT3 && (
          <div style={{ position: "absolute", left: 1090, top: 150, width: 740, height: 780 }}>
            <CodePanel frame={frame} height={780} />
          </div>
        )}
        <Caps frame={frame} />
      </DeepCurrent>
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
      <Header frame={frame} compact />
      <Gauge frame={frame} compact />
      <div style={{ position: "absolute", left: 30, top: 100, width: 1000, height: 780 }}>
        <Stage frame={frame} />
      </div>
      {frame < CUT3 && (
        <div style={{ position: "absolute", left: 40, top: 900, width: 1000, height: 700 }}>
          <CodePanel frame={frame} compact height={700} />
        </div>
      )}
      <Caps frame={frame} compact />
    </>
  );
};

export const ShortScopeRoomsV2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <DeepCurrent>
        <Audio src={staticFile("scopeclosures2-mix.wav")} />
        <VerticalBody offset={0} f={frame} />
      </DeepCurrent>
    </AbsoluteFill>
  );
};

export const ShortScopeClosureV2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <DeepCurrent>
        <Audio src={staticFile("scopeclosures2-mix.wav")} startFrom={CUT1} />
        <VerticalBody offset={CUT1} f={frame} />
      </DeepCurrent>
    </AbsoluteFill>
  );
};

export const ShortScopeFullV2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <DeepCurrent>
        <Audio src={staticFile("scopeclosures2-mix.wav")} />
        <VerticalBody offset={0} f={frame} />
      </DeepCurrent>
    </AbsoluteFill>
  );
};
