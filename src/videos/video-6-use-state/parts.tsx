/* ==================================================================
 * Video #6 — "Why useState Remembers" — visual system.
 * 3B1B-flavored Deep Current: big drawn geometry, smooth easing, and
 * the V6 signature — execution-flow ARROWS from code lines to the
 * stage visuals/output. Self-contained module (kit-style).
 * ================================================================== */
import React from "react";
import { interpolate } from "remotion";
import { ADURATION, SENT } from "./timing";
import {
  B,
  BG,
  CHIPS,
  clamp0,
  CODE,
  COPPER,
  CORAL,
  GOLD,
  ICE,
  MINT,
  MONO,
  MUTED,
  PUNCT,
  SKY,
  SUBTITLE,
  TERMS,
  TITLE,
  UI,
  ARROWS,
  actAt,
  HIGHLIGHTS,
  SWEEP_AT,
  SWEEP_BROKEN_AT,
  type ActName,
} from "./lesson";

/* ---------------- helpers ---------------- */
const nearestSentence = (frame: number): number => {
  let lo = 0;
  let hi = SENT.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (SENT[mid].s <= frame) lo = mid;
    else hi = mid - 1;
  }
  return lo;
};

const sentenceAt = (frame: number): number =>
  SENT.findIndex((sn) => frame >= sn.s && frame < sn.e);

/* ---------------- tokenizer (no deps) ---------------- */
const TOKEN_RE =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|(\b(?:function|const|let|return|if|new|useEffect|setTimeout|console|log|useState|setCount|onClick)\b)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;

type Tok = { t: string; c: string };
const tokenize = (line: string): Tok[] => {
  const toks: Tok[] = [];
  TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN_RE.exec(line))) {
    const [txt, com, dstr, sstr, num, kw, idn] = m;
    if (com) toks.push({ t: txt, c: MUTED });
    else if (dstr || sstr) toks.push({ t: txt, c: GOLD });
    else if (num) toks.push({ t: txt, c: CORAL });
    else if (kw) toks.push({ t: txt, c: MINT });
    else if (idn) {
      const rest = line.slice(m.index + txt.length);
      toks.push({ t: txt, c: /^\s*\(/.test(rest) ? SKY : ICE });
    } else toks.push({ t: txt, c: PUNCT });
  }
  return toks;
};

/* ---------------- code panel ---------------- */
export const CodePanel: React.FC<{
  frame: number;
  compact?: boolean;
}> = ({ frame, compact = false }) => {
  const actName: ActName = actAt(frame);
  const act = CODE[actName];
  const idx = nearestSentence(frame);
  const nLines = act.lines.length;

  let active = HIGHLIGHTS[idx] ?? [];
  const sweeping =
    (actName === "counter" && SWEEP_AT.includes(idx)) ||
    (actName === "broken" && SWEEP_BROKEN_AT.includes(idx));
  if (sweeping && frame >= SENT[idx].s) {
    const per = Math.max(4, Math.floor((SENT[idx].e - SENT[idx].s) / nLines));
    const at = Math.min(nLines - 1, Math.floor((frame - SENT[idx].s) / per));
    active = [at];
  }

  const fs = compact ? 24 : 30;
  const lh = compact ? 1.32 : 1.33;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          marginBottom: compact ? 10 : 16,
        }}
      >
        <div style={{ width: 34, height: 3, background: act.color, borderRadius: 2 }} />
        <div
          style={{
            fontFamily: UI,
            fontSize: compact ? 17 : 21,
            fontWeight: 700,
            color: act.color,
            letterSpacing: 1,
          }}
        >
          {act.label}
        </div>
      </div>
      <div
        style={{
          borderLeft: "2px solid rgba(201,138,75,0.35)",
          paddingLeft: compact ? 12 : 20,
        }}
      >
        {act.lines.map((ln, i) => {
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
                color: on ? ICE : "rgba(220,231,240,0.28)",
              }}
            >
              {on && (
                <div
                  style={{
                    position: "absolute",
                    left: -20 - (compact ? 12 : 0),
                    top: 2,
                    bottom: 2,
                    width: 3,
                    borderRadius: 2,
                    background: COPPER,
                    opacity: 0.9,
                  }}
                />
              )}
              {on && (
                <div
                  style={{
                    position: "absolute",
                    inset: "-2px -12px",
                    borderRadius: 8,
                    background: "rgba(94,234,212,0.05)",
                  }}
                />
              )}
              {tokenize(ln).map((tk, j) => (
                <span key={j} style={{ color: on ? tk.c : undefined }}>
                  {tk.t}
                </span>
              ))}
              {ln === "" ? " " : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------- kinetic caption ---------------- */
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const Caps: React.FC<{ frame: number; compact?: boolean }> = ({
  frame,
  compact = false,
}) => {
  const idx = sentenceAt(frame);
  if (idx < 0) return null;
  const line = SENT[idx].text;

  const words = Object.keys(TERMS);
  const TERM_RE =
    words.length > 0 ? new RegExp(`(${words.map(escapeRe).join("|")})\\w*`, "gi") : null;

  const parts: { t: string; c: string | null }[] = [];
  if (TERM_RE) {
    let last = 0;
    TERM_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = TERM_RE.exec(line))) {
      const lw = m[0].toLowerCase();
      const hit = words.find((w) => lw.startsWith(w));
      if (m.index > last) parts.push({ t: line.slice(last, m.index), c: null });
      parts.push({ t: m[0], c: hit ? TERMS[hit] : null });
      last = m.index + m[0].length;
    }
    if (last < line.length) parts.push({ t: line.slice(last), c: null });
  } else {
    parts.push({ t: line, c: null });
  }

  const underline = interpolate(frame, [SENT[idx].s, SENT[idx].s + 14], [0, 1], clamp0);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: compact ? 46 : 64,
        textAlign: "center",
        fontFamily: UI,
        fontSize: compact ? 33 : 38,
        fontWeight: 600,
        color: ICE,
        letterSpacing: 0.2,
        textShadow: "0 2px 18px rgba(5,10,16,0.9)",
        padding: "0 80px",
      }}
    >
      {parts.map((p, i) => (
        <span key={i} style={{ color: p.c ?? ICE, fontWeight: p.c ? 700 : 600 }}>
          {p.t}
        </span>
      ))}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -14,
          width: 220 * underline,
          height: 2.5,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${COPPER}, transparent)`,
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
};

/* ---------------- header ---------------- */
export const Header: React.FC<{ frame: number; compact?: boolean }> = ({
  frame,
  compact = false,
}) => (
  <div
    style={{
      position: "absolute",
      left: compact ? 36 : 50,
      right: compact ? 36 : 50,
      top: compact ? 26 : 32,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
    }}
  >
    <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
      <div style={{ fontFamily: UI, fontSize: compact ? 28 : 25, fontWeight: 700, color: ICE }}>
        {TITLE}
      </div>
      <div style={{ fontFamily: UI, fontSize: compact ? 15 : 14, fontWeight: 500, color: MUTED }}>
        {SUBTITLE}
      </div>
    </div>
    <div style={{ display: "flex", gap: 6 }}>
      {CHIPS.map((p) => (
        <div
          key={p.label}
          style={{
            fontFamily: UI,
            fontSize: 12,
            fontWeight: 700,
            color: frame >= p.at ? BG : MUTED,
            background: frame >= p.at ? p.color : "transparent",
            border: `1.5px solid ${frame >= p.at ? p.color : "rgba(220,231,240,0.3)"}`,
            borderRadius: 8,
            padding: "2px 8px",
            whiteSpace: "nowrap",
          }}
        >
          {p.label}
        </div>
      ))}
    </div>
  </div>
);

/* ---------------- background (Deep Current canvas) ---------------- */
export const Current: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrameSafe();
  const gx = 480 + 330 * Math.sin((frame * 2 * Math.PI) / 2600);
  const gy = 300 + 220 * Math.cos((frame * 2 * Math.PI) / 3400);
  const hx = 1400 + 260 * Math.cos((frame * 2 * Math.PI) / 3000);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          `radial-gradient(700px 480px at ${gx}px ${gy}px, rgba(20,184,166,0.075), rgba(20,184,166,0) 70%),` +
          `radial-gradient(620px 440px at ${hx}px 700px, rgba(201,138,75,0.06), rgba(201,138,75,0) 70%),` +
          `linear-gradient(180deg, #0D1620 0%, ${BG} 55%, #0A1017 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(220,231,240,0.045) 1.2px, transparent 1.3px)",
          backgroundSize: "26px 26px",
        }}
      />
      {children}
    </div>
  );
};

/* useCurrentFrame via a tiny shim so Current works in any composition */
import { useCurrentFrame } from "remotion";
function useCurrentFrameSafe(): number {
  return useCurrentFrame();
}

/* ---------------- ARROW — the V6 signature ----------------
 * Execution-flow arrow from a code line to a stage target.
 * Bezier with animated draw-in + arrowhead. curve = -1 arcs upward,
 * +1 arcs downward (used to distinguish overlapping paths).
 * --------------------------------------------------------- */
const useFrame = useCurrentFrame;

const Arrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  at: number;
  frame: number; // GLOBAL frame (offset already applied by the caller)
  dur?: number;
  curve?: number;
}> = ({ x1, y1, x2, y2, color, at, frame, dur = 120, curve = 1 }) => {
  if (frame < at || frame > at + dur) return null;
  const cx = (x1 + x2) / 2;
  const cy = curve >= 0 ? Math.min(y1, y2) - 46 : Math.max(y1, y2) + 46;
  const L = Math.hypot(x2 - x1, y2 - y1);
  const dash = L * 1.4;
  const draw = interpolate(frame, [at, at + 14], [0, 1], clamp0);
  const fadeOut = interpolate(frame, [at + dur - 10, at + dur], [1, 0], clamp0);
  const headAt = interpolate(frame, [at + 10, at + 16], [0, 1], clamp0);
  const ang = (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI;
  return (
    <g opacity={fadeOut}>
      <path
        d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.16 * draw}
        strokeDasharray={dash}
        strokeDashoffset={dash * (1 - draw)}
      />
      <path
        d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeDasharray={dash}
        strokeDashoffset={dash * (1 - draw)}
      />
      <g
        transform={`translate(${x2} ${y2}) rotate(${ang})`}
        opacity={headAt}
      >
        <polygon points="0,0 -14,-6 -14,6" fill={color} />
      </g>
    </g>
  );
};

/* overlay: all arrows for a given layout, in ROOT coordinates */
export const ArrowOverlay: React.FC<{
  stageLeft: number;
  stageTop: number;
  codeX: number;
  codeY0: number;
  lineH: number;
  frame: number; // GLOBAL frame
  width?: number;
  height?: number;
}> = ({ stageLeft, stageTop, codeX, codeY0, lineH, frame, width = 1920, height = 1080 }) => {
  const arrows = ARROWS.flatMap((a) => {
    const at = SENT[a.s].s;
    const dur = Math.max(90, SENT[a.s].e - SENT[a.s].s + 40);
    const list: Array<{ at: number; dur: number; curve: number; color: string }> = [
      { at, dur, curve: 1, color: a.color },
    ];
    if (a.at2 !== undefined) {
      const at2 = SENT[a.at2].s;
      const dur2 = Math.max(90, SENT[a.at2].e - SENT[a.at2].s + 40);
      list.push({ at: at2, dur: dur2, curve: -1, color: a.color });
    }
    return list.map((w) => ({ ...a, ...w }));
  });
  return (
    <svg
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {arrows.map((a, i) => (
        <Arrow
          key={i}
          x1={codeX - 6}
          y1={codeY0 + 64 + a.line * lineH}
          x2={stageLeft + a.tx}
          y2={stageTop + a.ty}
          color={a.color}
          at={a.at}
          frame={frame}
          dur={a.dur}
          curve={a.curve}
        />
      ))}
    </svg>
  );
};

/* ---------------- shared scene bits (stage-local, 1000×800) ---------------- */
const Machine: React.FC<{ frame: number; flash?: boolean; label?: string }> = ({
  frame,
  flash = false,
  label = "Counter()",
}) => {
  const sweepY = 160 + ((frame * 3.2) % 240);
  const flick = flash ? 0.45 + 0.55 * Math.abs(Math.sin(frame / 7)) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: 150,
        top: 120,
        width: 700,
        height: 300,
        borderRadius: 20,
        border: `2.5px solid ${SKY}`,
        background: "rgba(125,211,252,0.05)",
        opacity: flick,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 16,
          fontFamily: MONO,
          fontSize: 26,
          fontWeight: 700,
          color: SKY,
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: sweepY,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${SKY}, transparent)`,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 24,
          top: 16,
          fontFamily: UI,
          fontSize: 16,
          fontWeight: 600,
          color: MUTED,
        }}
      >
        runs top → bottom
      </div>
    </div>
  );
};

const Box: React.FC<{ value: number | string; sub?: string }> = ({ value, sub }) => (
  <div style={{ position: "absolute", left: 240, top: 560, textAlign: "left" }}>
    <div
      style={{
        display: "inline-block",
        fontFamily: MONO,
        fontSize: 34,
        fontWeight: 700,
        color: ICE,
        padding: "14px 30px",
        borderRadius: 16,
        border: `3px solid ${MINT}`,
        background: "radial-gradient(circle at 34% 30%, rgba(255,255,255,0.14), rgba(94,234,212,0.07) 72%)",
        boxShadow: "0 0 34px rgba(94,234,212,0.22)",
      }}
    >
      count: {value}
    </div>
    {sub && (
      <div style={{ fontFamily: UI, fontSize: 17, fontWeight: 600, color: MUTED, marginTop: 10 }}>
        {sub}
      </div>
    )}
  </div>
);

const Tag: React.FC<{
  text: string;
  color: string;
  x: number;
  y: number;
  at: number;
  size?: number;
  rotate?: number;
  border?: boolean;
}> = ({ text, color, x, y, at, size = 24, rotate = 0, border = true }) => {
  const frame = useFrame();
  const op = interpolate(frame, [at, at + 10], [0, 1], clamp0);
  if (frame < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: UI,
        fontSize: size,
        fontWeight: 700,
        color,
        padding: border ? "5px 16px" : 0,
        border: border ? `2px solid ${color}` : "none",
        borderRadius: border ? 10 : 0,
        background: border ? "rgba(12,20,29,0.72)" : "transparent",
        transform: `rotate(${rotate}deg)`,
        opacity: op,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

/* ---------------- the stage ---------------- */
export const Stage: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* ===== A · HOOK: the machine that never resets ===== */}
      {frame < B.closures && (
        <div style={{ position: "absolute", inset: 0 }}>
          <Machine frame={frame} />
          <Tag text="the whole component" color={SKY} x={620} y={170} at={B.code} size={24} />
          <Tag text="↘ on the right" color={MUTED} x={640} y={216} at={B.code + 20} size={20} border={false} />
          <div style={{ position: "absolute", left: 240, top: 560 }}>
            <div
              style={{
                display: "inline-block",
                fontFamily: MONO,
                fontSize: 40,
                fontWeight: 700,
                color: ICE,
                padding: "16px 34px",
                borderRadius: 18,
                border: `3px solid ${GOLD}`,
                background: "rgba(12,20,29,0.72)",
                boxShadow: "0 0 30px rgba(245,201,123,0.18)",
              }}
            >
              clicked 3 times
            </div>
          </div>
          <Tag text="× hundreds of runs" color={MUTED} x={250} y={660} at={B.hook0 + 20} size={20} border={false} />
          <Tag text="count never resets to zero" color={GOLD} x={640} y={690} at={B.hook1} size={26} rotate={-1.5} />
          <Tag text="should be 0!" color={CORAL} x={640} y={500} at={B.zero} size={24} rotate={2} />
        </div>
      )}

      {/* ===== B · THE BOX: React's world ===== */}
      {frame >= B.closures && frame < B.click && (
        <div style={{ position: "absolute", inset: 0 }}>
          {/* React's world */}
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 80,
              width: 920,
              height: 640,
              borderRadius: 24,
              border: `2.5px dashed rgba(125,211,252,0.45)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 24,
                top: 14,
                fontFamily: UI,
                fontSize: 20,
                fontWeight: 700,
                color: SKY,
                letterSpacing: 1,
              }}
            >
              REACT'S WORLD
            </div>
          </div>
          {/* your function — rebuilt every render */}
          <div
            style={{
              position: "absolute",
              left: 170,
              top: 150,
              width: 660,
              height: 260,
              borderRadius: 18,
              border: `2.5px solid ${SKY}`,
              background: "rgba(125,211,252,0.05)",
              opacity:
                frame >= B.rebuilt && frame < B.window
                  ? 0.4 + 0.6 * Math.abs(Math.sin((frame - B.rebuilt) / 6))
                  : 1,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 14,
                fontFamily: MONO,
                fontSize: 24,
                fontWeight: 700,
                color: SKY,
              }}
            >
              Counter()
            </div>
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 60,
                fontFamily: UI,
                fontSize: 17,
                fontWeight: 600,
                color: MUTED,
              }}
            >
              torn down + rebuilt every render
            </div>
          </div>
          {/* the box — outside the function */}
          <Box
            value={3}
            sub={frame >= B.boxStays ? "the box never moves" : "in React's world — not in yours"}
          />
          {frame >= B.window && (
            <Tag text="the window" color={MINT} x={560} y={480} at={B.window + 8} size={22} />
          )}
          {frame >= B.look && (
            <Tag text="reading count = looking outward" color={MINT} x={130} y={720} at={B.look} size={22} />
          )}
        </div>
      )}

      {/* ===== C · THE CLICK: three things happen ===== */}
      {frame >= B.click && frame < B.whichBox && (
        <div style={{ position: "absolute", inset: 0 }}>
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 80,
              width: 920,
              height: 640,
              borderRadius: 24,
              border: "2.5px dashed rgba(125,211,252,0.45)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 24,
                top: 14,
                fontFamily: UI,
                fontSize: 20,
                fontWeight: 700,
                color: SKY,
                letterSpacing: 1,
              }}
            >
              REACT'S WORLD
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 170,
              top: 150,
              width: 660,
              height: 260,
              borderRadius: 18,
              border: `2.5px solid ${SKY}`,
              background: "rgba(125,211,252,0.05)",
              opacity:
                frame >= B.rerun2 && frame < B.screen
                  ? 0.4 + 0.6 * Math.abs(Math.sin((frame - B.rerun2) / 6))
                  : 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 14,
                fontFamily: MONO,
                fontSize: 24,
                fontWeight: 700,
                color: SKY,
              }}
            >
              Counter()
            </div>
          </div>
          <Box
            value={frame >= B.record ? 4 : 3}
            sub={frame >= B.record ? "recorded the new value" : "in React's world"}
          />
          {/* the three numbered chips */}
          <div style={{ position: "absolute", right: 60, top: 100, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { n: "①", label: "record", at: B.click, on: B.record, c: COPPER },
              { n: "②", label: "re-run", at: B.click, on: B.rerun2, c: SKY },
              { n: "③", label: "screen", at: B.click, on: B.screen, c: MINT },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  fontFamily: UI,
                  fontSize: 24,
                  fontWeight: 700,
                  color: frame >= s.on ? s.c : "rgba(220,231,240,0.35)",
                  border: `2px solid ${frame >= s.on ? s.c : "rgba(220,231,240,0.25)"}`,
                  borderRadius: 12,
                  padding: "8px 18px",
                  background: "rgba(12,20,29,0.72)",
                  opacity: frame >= s.at ? 1 : 0.25,
                }}
              >
                {s.n} {s.label}
              </div>
            ))}
          </div>
          {/* the rendered button */}
          {frame >= B.screen && (
            <div style={{ position: "absolute", left: 500, top: 600 }}>
              <div
                style={{
                  display: "inline-block",
                  fontFamily: MONO,
                  fontSize: 30,
                  fontWeight: 700,
                  color: MINT,
                  padding: "12px 26px",
                  borderRadius: 14,
                  border: `2.5px solid ${MINT}`,
                  background: "rgba(12,20,29,0.72)",
                }}
              >
                clicked 4 times
              </div>
            </div>
          )}
          {frame >= B.trick && (
            <Tag text="a new run — an old value" color={GOLD} x={190} y={450} at={B.trick} size={28} rotate={-1.2} />
          )}
        </div>
      )}

      {/* ===== D · THE SLOTS ===== */}
      {frame >= B.whichBox && frame < B.ifBreak && (
        <div style={{ position: "absolute", inset: 0 }}>
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 80,
              width: 920,
              height: 640,
              borderRadius: 24,
              border: "2.5px dashed rgba(125,211,252,0.45)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 24,
                top: 14,
                fontFamily: UI,
                fontSize: 20,
                fontWeight: 700,
                color: SKY,
              }}
            >
              REACT'S WORLD
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 170,
              top: 150,
              width: 660,
              height: 260,
              borderRadius: 18,
              border: `2.5px solid ${SKY}`,
              background: "rgba(125,211,252,0.05)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 14,
                fontFamily: MONO,
                fontSize: 24,
                fontWeight: 700,
                color: SKY,
              }}
            >
              Profile()
            </div>
            {frame >= B.cantSee && (
              <div
                style={{
                  position: "absolute",
                  left: 22,
                  top: 60,
                  fontFamily: UI,
                  fontSize: 17,
                  fontWeight: 600,
                  color: CORAL,
                }}
              >
                ✗ React can't see inside
              </div>
            )}
          </div>
          {/* slot chips */}
          {[
            { label: "slot 0", y: 560, at: B.slot0 },
            { label: "slot 1", y: 660, at: B.slot1 },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                position: "absolute",
                left: 500,
                top: s.y,
                opacity: frame >= s.at ? 1 : 0,
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 30,
                  fontWeight: 700,
                  color: frame >= B.contract ? MINT : COPPER,
                  padding: "10px 24px",
                  borderRadius: 12,
                  border: `2.5px solid ${frame >= B.contract ? MINT : COPPER}`,
                  background: "rgba(12,20,29,0.72)",
                }}
              >
                {frame >= B.contract ? "✓ " : ""}
                {s.label}
              </div>
            </div>
          ))}
          {frame >= B.position && (
            <Tag text="by position — not by name" color={GOLD} x={190} y={430} at={B.position} size={25} />
          )}
          {frame >= B.whyRule && (
            <Tag text="no loops · no branches" color={CORAL} x={210} y={720} at={B.whyRule} size={23} />
          )}
        </div>
      )}

      {/* ===== E · THE BREAK ===== */}
      {frame >= B.ifBreak && frame < B.recap && (
        <div style={{ position: "absolute", inset: 0 }}>
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 80,
              width: 920,
              height: 640,
              borderRadius: 24,
              border: "2.5px dashed rgba(249,112,102,0.5)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 24,
                top: 14,
                fontFamily: UI,
                fontSize: 20,
                fontWeight: 700,
                color: CORAL,
              }}
            >
              THE ORDER BREAKS
            </div>
          </div>
          {/* slot chips — shift + bleed */}
          {[
            { label: "slot 0", y: 560, at: 0 },
            { label: "slot 1", y: 660, at: 0 },
            { label: "slot 2", y: 740, at: B.bleed2 },
          ].map((s, k) => {
            const wob =
              frame >= B.shift && k > 0
                ? Math.sin((frame - B.shift) / 5) * (k === 1 ? 8 : 14)
                : 0;
            return (
              <div
                key={s.label}
                style={{
                  position: "absolute",
                  left: 460 + wob,
                  top: s.y,
                  opacity: frame >= s.at ? 1 : 0.25,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 28,
                    fontWeight: 700,
                    color: frame >= B.chaos ? CORAL : COPPER,
                    padding: "10px 22px",
                    borderRadius: 12,
                    border: `2.5px solid ${frame >= B.chaos ? CORAL : COPPER}`,
                    background: "rgba(12,20,29,0.72)",
                  }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
          {frame >= B.bleed1 && (
            <svg style={{ position: "absolute", inset: 0 }} viewBox="0 0 1000 800">
              <path
                d="M 440 590 Q 420 640 452 690"
                stroke={CORAL}
                strokeWidth={3}
                fill="none"
                strokeDasharray="8 6"
                opacity={0.85}
              />
              <path
                d="M 440 690 Q 400 620 452 600"
                stroke={CORAL}
                strokeWidth={3}
                fill="none"
                strokeDasharray="8 6"
                opacity={0.85}
              />
            </svg>
          )}
          {frame >= B.chaos && (
            <Tag text="state bleeds — chaos" color={CORAL} x={200} y={430} at={B.chaos} size={28} rotate={-1.5} />
          )}
          {frame >= B.rulesExist && (
            <div
              style={{
                position: "absolute",
                left: 90,
                top: 440,
                fontFamily: UI,
                fontSize: 26,
                fontWeight: 700,
                color: MINT,
                border: `2.5px solid ${MINT}`,
                borderRadius: 12,
                padding: "10px 20px",
                background: "rgba(12,20,29,0.72)",
              }}
            >
              Rules of Hooks: top level, every render
            </div>
          )}
        </div>
      )}

      {/* ===== F · PAYOFF: the arrow ===== */}
      {frame >= B.recap && (
        <div style={{ position: "absolute", inset: 0 }}>
          {/* your function — forgets */}
          <div
            style={{
              position: "absolute",
              left: 190,
              top: 140,
              width: 620,
              height: 210,
              borderRadius: 18,
              border: "2.5px solid rgba(125,211,252,0.5)",
              background: "rgba(125,211,252,0.04)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 14,
                fontFamily: MONO,
                fontSize: 24,
                fontWeight: 700,
                color: SKY,
              }}
            >
              Counter()
            </div>
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 62,
                fontFamily: UI,
                fontSize: 18,
                fontWeight: 600,
                color: MUTED,
              }}
            >
              forgets everything on each run
            </div>
          </div>
          {/* the store — remembers */}
          <Box value={7} sub="forgets nothing" />
          {/* the closure arrow — recreated every render */}
          {frame >= B.arrowLine && (
            <svg style={{ position: "absolute", inset: 0 }} viewBox="0 0 1000 800">
              {(() => {
                const t = Math.min(
                  1,
                  (frame - B.arrowLine) / ((SENT[48].e - SENT[48].s) * 0.9)
                );
                const re = frame >= B.arrowLine + 40 ? 0.999 : t; // second draw impression
                const dash = 620;
                return (
                  <g opacity={frame >= B.isClosure ? 1 : 0.85}>
                    <path
                      d="M 800 330 Q 640 420 420 560"
                      stroke={COPPER}
                      strokeWidth={3.4}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={dash}
                      strokeDashoffset={dash * (1 - re)}
                    />
                    <g transform={`translate(420 560) rotate(${(Math.atan2(560 - 420, 420 - 640) * 180) / Math.PI})`}>
                      <polygon points="0,0 -16,-7 -16,7" fill={COPPER} opacity={re} />
                    </g>
                  </g>
                );
              })()}
            </svg>
          )}
          {frame >= B.isClosure && frame < B.readArrow && (
            <Tag text="= closure" color={COPPER} x={560} y={400} at={B.isClosure} size={26} />
          )}
          {/* setTimeout mystery */}
          {frame >= B.mystery && (
            <div
              style={{
                position: "absolute",
                left: 60,
                top: 695,
                fontFamily: MONO,
                fontSize: 22,
                fontWeight: 600,
                color: ICE,
                padding: "12px 18px",
                borderRadius: 12,
                border: "2px solid rgba(220,231,240,0.3)",
                background: "rgba(12,20,29,0.8)",
                whiteSpace: "pre",
              }}
            >
              {`setTimeout(() => {\n  console.log(count); // 3 — old!\n}, 3000);`}
            </div>
          )}
          {frame >= B.notBug && frame < B.readArrow && (
            <Tag text="your snapshot ≠ the box now" color={GOLD} x={560} y={660} at={B.notBug} size={21} />
          )}
          {/* recap ladder */}
          {frame >= B.readArrow && frame < B.final && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 395,
                textAlign: "center",
                fontFamily: UI,
                fontSize: 26,
                fontWeight: 600,
                color: ICE,
                opacity: interpolate(frame, [B.readArrow, B.readArrow + 10], [0, 1], clamp0),
              }}
            >
              read the arrow, not the name
              <div style={{ marginTop: 10, color: SKY }}>every render has its own window</div>
              <div style={{ marginTop: 10, color: MINT }}>the box is the memory</div>
            </div>
          )}
          {/* final card */}
          {frame >= B.final && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                background: "rgba(10,16,23,0.88)",
              }}
            >
              <div
                style={{
                  fontFamily: UI,
                  fontSize: 46,
                  fontWeight: 800,
                  color: MINT,
                  textAlign: "center",
                  textShadow: "0 0 44px rgba(94,234,212,0.35)",
                  transform: `scale(${interpolate(frame, [B.final, B.final + 14], [0.94, 1], clamp0)})`,
                }}
              >
                useState = a closure
                <br />
                with a memory
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { ADURATION };
