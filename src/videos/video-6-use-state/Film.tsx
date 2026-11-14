/* ==================================================================
 * Video #6 films — ONE 16:9 master + three verticals from the SAME
 * timeline (startFrom + frame offset). The arrow overlay and stage
 * geometry are computed per-layout, so verticals get correct arrows
 * automatically.
 *
 *   V6Film         1920×1080 — the full film (~2:44)
 *   V6ShortFirst   1080×1920 — 0 → CUT (the hook + "Why?")
 *   V6ShortSecond  1080×1920 — CUT → end (closures → payoff)
 *   V6ShortFull    1080×1920 — everything
 * ================================================================== */
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { ADURATION } from "./timing";
import { ArrowOverlay, Caps, CodePanel, Current, Header, Stage } from "./parts";
import { CUT, MIX } from "./lesson";

/* ---------------- 16:9 master ---------------- */
const LONG = {
  stageLeft: 40,
  stageTop: 130,
  codeX: 1080,
  codeY0: 150,
  lineH: 40,
};

const Body: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame() + offset;
  return (
    <>
      <Header frame={frame} />
      <div style={{ position: "absolute", left: LONG.stageLeft, top: LONG.stageTop, width: 1000, height: 800 }}>
        <Stage frame={frame} />
      </div>
      <div style={{ position: "absolute", left: LONG.codeX, top: LONG.codeY0, width: 760 }}>
        <CodePanel frame={frame} />
      </div>
      <ArrowOverlay
        stageLeft={LONG.stageLeft}
        stageTop={LONG.stageTop}
        codeX={LONG.codeX}
        codeY0={LONG.codeY0}
        lineH={LONG.lineH}
        frame={frame}
      />
      <Caps frame={frame} />
    </>
  );
};

export const V6Film: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0C141D" }}>
      <Current>
        <Audio src={staticFile(MIX)} />
        <Body offset={0} />
      </Current>
    </AbsoluteFill>
  );
};

/* ---------------- verticals ---------------- */
const VERT = {
  stageLeft: 40,
  stageTop: 150,
  codeX: 60,
  codeY0: 985,
  lineH: 32,
};

const VerticalBody: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame() + offset;
  return (
    <>
      <Header frame={frame} compact />
      <div
        style={{
          position: "absolute",
          left: VERT.stageLeft,
          top: VERT.stageTop,
          width: 1000,
          height: 800,
          transform: "scale(1.0)",
        }}
      >
        <Stage frame={frame} />
      </div>
      <div style={{ position: "absolute", left: VERT.codeX, top: VERT.codeY0, width: 980 }}>
        <CodePanel frame={frame} compact />
      </div>
      <ArrowOverlay
        stageLeft={VERT.stageLeft}
        stageTop={VERT.stageTop}
        codeX={VERT.codeX}
        codeY0={VERT.codeY0}
        lineH={VERT.lineH}
        frame={frame}
        width={1080}
        height={1920}
      />
      <Caps frame={frame} compact />
    </>
  );
};

const Vertical: React.FC<{ startFrom?: number }> = ({ startFrom = 0 }) => {
  return (
    <AbsoluteFill style={{ background: "#0C141D" }}>
      <Current>
        <Audio src={staticFile(MIX)} startFrom={startFrom} />
        <VerticalBody offset={startFrom} />
      </Current>
    </AbsoluteFill>
  );
};

export const V6ShortFirst: React.FC = () => <Vertical startFrom={0} />;
export const V6ShortSecond: React.FC = () => <Vertical startFrom={CUT} />;
export const V6ShortFull: React.FC = () => <Vertical startFrom={0} />;

/* durations for Root registration */
export const DUR_FILM = ADURATION;
export const DUR_FIRST = CUT;
export const DUR_SECOND = ADURATION - CUT;
