import type { CSSProperties } from "react";
import { AbsoluteFill } from "remotion";

/* ==================================================================
 * 📦 PUBLISH KIT ART — rendered by Remotion, zero external cost
 *
 * Six still compositions (each 1 frame long):
 *   ChannelBanner      2560×1440 — YouTube channel art (safe band
 *                      1546×423 centered — all text inside it)
 *   ThumbFunctionExec  1280×720  — Video #1 thumbnail
 *   ThumbEventLoop     1280×720  — Video #2 thumbnail
 *   ThumbAsyncAwait    1280×720  — Video #3 thumbnail
 *   ProfileMark        800×800   — channel profile picture
 *   VideoWatermark     150×150   — transparent video watermark (CF)
 *
 * Style: the same sketchnote language as the videos — milk-tea aged
 * paper, ink borders, wobbly sheets, marker palette.
 * Render with:
 *   npx remotion still src/index.ts ChannelBanner publish/youtube/banner.png --frame=0
 * ================================================================== */

const INK = "#2F2A26";
const BLUE = "#2B6CB0";
const AMBER = "#D97706";
const GREEN = "#2F855A";
const RED = "#B3392B";
const HAND = '"Segoe Print", "Comic Sans MS", cursive';
const MONO = '"Consolas", monospace';

const paperBackground =
    `radial-gradient(rgba(47,42,38,0.06) 1.2px, transparent 1.4px) 0 0 / 26px 26px,` +
    `radial-gradient(620px 420px at 10% 6%, rgba(150,104,56,0.10), transparent 70%),` +
    `radial-gradient(800px 620px at 94% 96%, rgba(150,104,56,0.13), transparent 72%),` +
    `radial-gradient(520px 360px at 88% 10%, rgba(150,104,56,0.07), transparent 70%),` +
    `radial-gradient(700px 500px at 4% 90%, rgba(150,104,56,0.09), transparent 70%),` +
    `linear-gradient(165deg, #F4E7C8 0%, #F1E2BD 45%, #EAD5A6 100%)`;

const sheetBase = (w: number): CSSProperties => ({
    background: "#FFFFFF",
    border: `3px solid ${INK}`,
    borderRadius: "22px 10px 18px 12px / 12px 18px 10px 22px",
    boxShadow: `${w * 0.006}px ${w * 0.008}px 0 rgba(47,42,38,0.14)`,
});

const ChunkyLabel: React.FC<{
    children: string;
    fontSize: number;
    color?: string;
    underline?: boolean;
}> = ({ children, fontSize, color = INK, underline = false }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
        <span
            style={{
                fontFamily: HAND,
                fontWeight: 700,
                fontSize,
                lineHeight: 1.16,
                color,
                letterSpacing: 1,
            }}
        >
            {children}
        </span>
        {underline && (
            <div
                style={{
                    position: "absolute",
                    left: "-2%",
                    bottom: -fontSize * 0.12,
                    width: "104%",
                    height: fontSize * 0.14,
                    borderRadius: fontSize * 0.08,
                    background: "rgba(246,196,84,0.55)",
                    transform: "skewX(-14deg) rotate(-0.6deg)",
                }}
            />
        )}
    </div>
);

/* ---------------- banner doodles (pure SVG ink strokes) ---------------- */

const StackDoodle: React.FC<{
    width: number;
    labels: { text: string; tone?: "blue" | "amber" | "slate" }[];
}> = ({ width, labels }) => {
    const n = labels.length;
    const boxH = width * 0.17;
    return (
        <div
            style={{
                position: "relative",
                width: width,
                height: boxH * n + (boxH * 0.4),
            }}
        >
            {labels.map((row, i) => {
                // first label = top of the stack (most recent frame)
                const top = i * boxH * 1.02;
                const tone = row.tone ?? "slate";
                const palette =
                    tone === "blue"
                        ? { bg: "#E3EFF9", border: BLUE, color: "#1E4E79" }
                        : tone === "amber"
                          ? { bg: "#FDF3D0", border: AMBER, color: "#8C4A03" }
                          : { bg: "#FFFFFF", border: INK, color: "#8A8378" };
                return (
                    <div
                        key={i}
                        style={{
                            ...sheetBase(width),
                            position: "absolute",
                            top,
                            left: 0,
                            width,
                            height: boxH,
                            display: "grid",
                            placeItems: "center",
                            fontFamily: MONO,
                            fontWeight: 700,
                            fontSize: width * 0.075,
                            color: palette.color,
                            background: palette.bg,
                            borderColor: palette.border,
                        }}
                    >
                        {row.text}
                    </div>
                );
            })}
        </div>
    );
};

const SLATE_TEXT = () => "#8A8378";

const HookCardDoodle: React.FC<{ scale: number }> = ({ scale }) => (
    <div style={{ position: "relative", width: 340 * scale, height: 200 * scale }}>
        {/* J-hook + cable */}
        <svg
            viewBox="0 0 200 220"
            style={{
                position: "absolute",
                left: 130 * scale,
                top: -46 * scale,
                width: 90 * scale,
                height: 120 * scale,
                overflow: "visible",
            }}
        >
            <path
                d="M 60 -90 C 58 -40, 62 -10, 60 40"
                stroke={INK}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M 60 40 L 60 78 A 21 21 0 1 1 39 78 L 39 62"
                stroke={INK}
                strokeWidth="13"
                fill="none"
                strokeLinecap="round"
            />
        </svg>
        {/* ring handle */}
        <div
            style={{
                position: "absolute",
                left: 150 * scale,
                top: -12 * scale,
                width: 28 * scale,
                height: 28 * scale,
                borderRadius: "50%",
                border: `4px solid ${INK}`,
                background: "#F4E7C8",
            }}
        />
        {/* card */}
        <div
            style={{
                ...sheetBase(400),
                position: "absolute",
                left: 0,
                top: 16 * scale,
                width: 330 * scale,
                height: 130 * scale,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transform: "rotate(-1.5deg)",
                transformOrigin: "50% 0%",
            }}
        >
            <div
                style={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 44 * scale,
                    color: INK,
                }}
            >
                showData()
            </div>
            <div
                style={{
                    fontFamily: HAND,
                    fontWeight: 700,
                    fontSize: 22 * scale,
                    color: "#6B6357",
                }}
            >
                <span style={{ color: AMBER }}>await</span> getData()
            </div>
        </div>
    </div>
);

/* ================================================================ */

export const ChannelBanner: React.FC = () => (
    <AbsoluteFill style={{ background: paperBackground }}>
        {/* faint sketches outside the safe band (TV-visible zone only) */}
        <svg viewBox="0 0 2560 1440" style={{ position: "absolute", inset: 0 }}>
            <g opacity="0.14" stroke={INK} fill="none" strokeLinecap="round">
                <text
                    x="220" y="330" fontSize="60" fontFamily={MONO}
                    fontWeight="700" fill={INK} stroke="none"
                >
                    async
                </text>
                <text
                    x="2250" y="340" fontSize="52" fontFamily={MONO}
                    fontWeight="700" fill={INK} stroke="none"
                >
                    {"{ }"}
                </text>
                <text
                    x="300" y="1240" fontSize="52" fontFamily={MONO}
                    fontWeight="700" fill={INK} stroke="none"
                >
                    await
                </text>
                <circle cx="2250" cy="1200" r="46" strokeWidth="5" />
                <path d="M 2250 1154 L 2250 1180" strokeWidth="4" />
                <text
                    x="2110" y="1262" fontSize="30" fontFamily={MONO}
                    fontWeight="700" fill={SLATE_TEXT()} stroke="none"
                >
                    loop
                </text>
            </g>

            {/* dashed red thread connecting the two doodles under the headline */}
            <path
                d="M 660 972 C 950 1030, 1600 1030, 1890 968"
                stroke={RED}
                strokeWidth="6"
                strokeDasharray="20 13"
                fill="none"
                opacity="0.75"
            />
        </svg>

        {/* left doodle: mini call stack */}
        <div style={{ position: "absolute", left: 560, top: 742 }}>
            <StackDoodle
                width={290}
                labels={[
                    { text: "showData()", tone: "blue" },
                    { text: "global" },
                    { text: "global" },
                ]}
            />
        </div>

        {/* right doodle: hook catching the card */}
        <div style={{ position: "absolute", left: 1730, top: 762 }}>
            <HookCardDoodle scale={0.86} />
        </div>

        {/* headline — strictly inside the 1546×423 safe band */}
        <div
            style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 560,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <ChunkyLabel fontSize={148}>CodeFlow Visuals</ChunkyLabel>
            <div
                style={{
                    marginTop: 34,
                    fontFamily: HAND,
                    fontWeight: 700,
                    fontSize: 56,
                    color: "#5C5347",
                }}
            >
                Complex code. Clear visuals.
            </div>
        </div>
    </AbsoluteFill>
);

/* ---------------- profile picture (800×800) + video watermark (150×150) ---------------- */

/* "CF" monogram: same hand-drawn card language; content is centered so
 * YouTube's circular masks (profile picture, watermark) never clip it. */
const CFMonogram: React.FC<{ size: number }> = ({ size }) => (
    <div
        style={{
            ...sheetBase(size * 0.6),
            width: size * 0.6,
            height: size * 0.6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `rotate(-2deg)`,
            position: "relative",
        }}
    >
        <span style={{ fontFamily: HAND, fontWeight: 700, fontSize: size * 0.27, color: INK, lineHeight: 1 }}>
            C
        </span>
        <span style={{ fontFamily: HAND, fontWeight: 700, fontSize: size * 0.27, color: BLUE, lineHeight: 1, marginLeft: size * 0.01 }}>
            F
        </span>
        {/* dashed red swash under the letters */}
        <svg
            viewBox="0 0 100 24"
            style={{
                position: "absolute",
                left: size * 0.13,
                bottom: size * 0.075,
                width: size * 0.34,
                height: size * 0.082,
                overflow: "visible",
            }}
        >
            <path
                d="M 3 8 C 22 20, 70 22, 96 7"
                stroke={RED}
                strokeWidth="4"
                strokeDasharray="7 5"
                fill="none"
                strokeLinecap="round"
                opacity="0.85"
            />
        </svg>
    </div>
);

export const ProfileMark: React.FC = () => (
    <AbsoluteFill style={{ background: paperBackground }}>
        {/* faint doodles in the corners (outside the circular mask) */}
        <svg viewBox="0 0 800 800" style={{ position: "absolute", inset: 0 }}>
            <g opacity="0.30" strokeLinecap="round" fill="none">
                <text x="86" y="122" fontSize="54" fontFamily={MONO} fontWeight="700" fill={INK} stroke="none">
                    {"{ }"}
                </text>
                <text x="560" y="742" fontSize="46" fontFamily={MONO} fontWeight="700" fill={INK} stroke="none">
                    await
                </text>
                <circle cx="672" cy="118" r="38" stroke={AMBER} strokeWidth="7" />
                <path d="M 672 80 L 672 96" stroke={AMBER} strokeWidth="5" />
            </g>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <CFMonogram size={800} />
        </div>
    </AbsoluteFill>
);

/* Transparent PNG, ink letters with a white halo — legible on both the
 * milk-tea paper scenes and the dark runtime scenes. */
export const VideoWatermark: React.FC = () => (
    <AbsoluteFill style={{ background: "transparent", display: "grid", placeItems: "center" }}>
        <div
            style={{
                display: "flex",
                alignItems: "baseline",
                transform: "rotate(-4deg)",
                filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.25))",
            }}
        >
            <span
                style={{
                    fontFamily: HAND,
                    fontWeight: 700,
                    fontSize: 74,
                    lineHeight: 1,
                    color: INK,
                    textShadow:
                        "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff",
                }}
            >
                C
            </span>
            <span
                style={{
                    fontFamily: HAND,
                    fontWeight: 700,
                    fontSize: 74,
                    lineHeight: 1,
                    color: BLUE,
                    marginLeft: 2,
                    textShadow:
                        "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff",
                }}
            >
                F
            </span>
        </div>
        <svg viewBox="0 0 100 20" style={{ position: "absolute", left: 24, bottom: 26, width: 56, height: 12 }}>
            <path
                d="M 4 6 C 22 18, 70 19, 96 5"
                stroke={RED}
                strokeWidth="4"
                strokeDasharray="7 5"
                fill="none"
                strokeLinecap="round"
                opacity="0.85"
            />
        </svg>
    </AbsoluteFill>
);

/* ---------------- thumbnails (1280×720) ---------------- */

const ArrowThread: React.FC<{
    d: string;
    width?: number;
}> = ({ d, width = 6 }) => (
    <path
        d={d}
        stroke={RED}
        strokeWidth={width}
        strokeDasharray="18 12"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
    />
);

export const ThumbFunctionExec: React.FC = () => (
    <AbsoluteFill style={{ background: paperBackground, padding: 46 }}>
        {/* big three-line headline (78px so line 1 clears the code sheet) */}
        <div style={{ position: "absolute", left: 56, top: 92, display: "flex", flexDirection: "column", gap: 10 }}>
            <ChunkyLabel fontSize={78} underline>
                How JavaScript
            </ChunkyLabel>
            <ChunkyLabel fontSize={78} underline>
                runs your
            </ChunkyLabel>
            <ChunkyLabel fontSize={78} color={BLUE} underline>
                FUNCTION
            </ChunkyLabel>
        </div>

        {/* code sheet */}
        <div
            style={{
                ...sheetBase(400),
                position: "absolute",
                right: 56,
                top: 96,
                width: 430,
                padding: "24px 26px",
                transform: "rotate(1.2deg)",
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 34,
                color: INK,
            }}
        >
            <div style={{ whiteSpace: "pre" }}>{`calculateTotal(
  100, 3);`}</div>
            <div style={{ marginTop: 12, color: GREEN, fontSize: 32 }}>
                ⇒ returns 300
            </div>
        </div>

        {/* execution thread down to the stack doodle */}
        <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <ArrowThread d="M 950 300 C 900 420, 560 500, 330 556" />
            <path d="M 352 542 L 330 556 L 356 570" fill="none" stroke={RED} strokeWidth="8" strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", left: 96, top: 500 }}>
            <StackDoodle
                width={310}
                labels={[
                    { text: "calculateTotal()", tone: "blue" },
                    { text: "global" },
                    { text: "global" },
                ]}
            />
        </div>

        {/* series stamp */}
        <div
            style={{
                position: "absolute",
                right: 52,
                bottom: 44,
                fontFamily: HAND,
                fontWeight: 700,
                fontSize: 40,
                color: INK,
                transform: "rotate(-1.4deg)",
                background: "rgba(253,243,208,0.92)",
                border: `3px solid ${INK}`,
                borderRadius: "16px 8px 14px 9px / 9px 14px 8px 16px",
                padding: "10px 26px",
            }}
        >
            JavaScript · Visualized
        </div>
    </AbsoluteFill>
);

export const ThumbEventLoop: React.FC = () => (
    <AbsoluteFill style={{ background: paperBackground, padding: 46 }}>
        {/* headline */}
        <div
            style={{
                position: "absolute",
                left: 56,
                top: 66,
                display: "flex",
                flexDirection: "column",
                gap: 14,
            }}
        >
            <div
                style={{
                    ...sheetBase(400),
                    display: "inline-block",
                    padding: "14px 28px",
                    transform: "rotate(-1deg)",
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 52,
                    color: INK,
                    alignSelf: "flex-start",
                }}
            >
                setTimeout(fn, 0)
            </div>
            <ChunkyLabel fontSize={100} underline>
                will NEVER go
            </ChunkyLabel>
            <ChunkyLabel fontSize={100} color={RED}>
                FIRST!
            </ChunkyLabel>
        </div>

        {/* event loop ring + timer chip + stack */}
        <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {/* loop hub (raised so it clears the stamp) */}
            <circle cx="1010" cy="446" r="112" stroke={INK} strokeWidth="10" fill="#FFFFFF" />
            <path d="M 1010 334 A 112 112 0 0 1 1122 446" fill="none" stroke={AMBER} strokeWidth="12" strokeLinecap="round" />
            <path d="M 1122 446 L 1099 433 M 1122 446 L 1133 467" fill="none" stroke={AMBER} strokeWidth="8" strokeLinecap="round" />
            <text
                x="1010" y="440" textAnchor="middle" fontFamily={HAND}
                fontWeight="700" fontSize="44" fill={INK}
            >
                event
            </text>
            <text
                x="1010" y="490" textAnchor="middle" fontFamily={HAND}
                fontWeight="700" fontSize="44" fill={INK}
            >
                loop
            </text>
            {/* travelling timer chip */}
            <rect
                x="618" y="430" width="150" height="48" rx="12"
                fill="#E3EFF9" stroke={BLUE} strokeWidth="6"
            />
            <text
                x="693" y="464" textAnchor="middle" fontFamily={MONO}
                fontWeight="700" fontSize="30" fill="#1E4E79"
            >
                timer
            </text>
            <ArrowThread d="M 772 454 C 830 410, 870 392, 902 378" width={5} />
        </svg>
        <div style={{ position: "absolute", left: 96, top: 508 }}>
            <StackDoodle
                width={300}
                labels={[
                    { text: "setTimeout", tone: "amber" },
                    { text: 'log("Start")' },
                    { text: 'log("End")' },
                ]}
            />
        </div>

        <div
            style={{
                position: "absolute",
                right: 44,
                bottom: 26,
                fontFamily: HAND,
                fontWeight: 700,
                fontSize: 36,
                color: INK,
                transform: "rotate(-1.2deg)",
                background: "rgba(253,243,208,0.92)",
                border: `3px solid ${INK}`,
                borderRadius: "16px 8px 14px 9px / 9px 14px 8px 16px",
                padding: "8px 22px",
            }}
        >
            JavaScript · Visualized
        </div>
    </AbsoluteFill>
);

export const ThumbAsyncAwait: React.FC = () => (
    <AbsoluteFill style={{ background: paperBackground, padding: 46 }}>
        {/* headline */}
        <div
            style={{
                position: "absolute",
                left: 60,
                top: 70,
                display: "flex",
                flexDirection: "column",
                gap: 8,
            }}
        >
            <div style={{ position: "relative", alignSelf: "flex-start" }}>
                <ChunkyLabel fontSize={128} color={AMBER}>
                    await
                </ChunkyLabel>
            </div>
            <ChunkyLabel fontSize={84} underline>
                and JavaScript
            </ChunkyLabel>
            <ChunkyLabel fontSize={84} color={RED}>
                hangs it!
            </ChunkyLabel>
        </div>

        {/* hand-drawn amber circle around "await" */}
        <svg
            viewBox="0 0 1280 720"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
            <path
                d="M 54 96 C 90 34, 250 22, 372 40 C 470 54, 448 158, 300 168 C 170 176, 66 172, 58 130"
                fill="none"
                stroke={AMBER}
                strokeWidth="9"
                strokeLinecap="round"
                opacity="0.85"
            />
            {/* dashed thread from call card to hook card */}
            <ArrowThread d="M 700 560 C 640 590, 520 600, 420 592" width={5} />
        </svg>

        {/* hook + hanging card, right side */}
        <div style={{ position: "absolute", left: 858, top: 168 }}>
            <HookCardDoodle scale={1.05} />
        </div>

        {/* console truth sheet bottom-left */}
        <div
            style={{
                ...sheetBase(400),
                position: "absolute",
                left: 74,
                top: 428,
                width: 400,
                padding: "16px 24px",
                transform: "rotate(-1.2deg)",
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 34,
            }}
        >
            <div style={{ color: BLUE }}>{"console.log(\"A\")"}</div>
            <div style={{ color: BLUE }}>{"console.log(\"C\")"}</div>
            <div style={{ color: GREEN }}>{"console.log(\"B\")"}</div>
            <div
                style={{
                    marginTop: 8,
                    fontFamily: HAND,
                    fontWeight: 700,
                    fontSize: 28,
                    color: "#6B6357",
                }}
            >
                that order — every time!
            </div>
        </div>

        <div
            style={{
                position: "absolute",
                right: 52,
                bottom: 40,
                fontFamily: HAND,
                fontWeight: 700,
                fontSize: 40,
                color: INK,
                transform: "rotate(-1.3deg)",
                background: "rgba(253,243,208,0.92)",
                border: `3px solid ${INK}`,
                borderRadius: "16px 8px 14px 9px / 9px 14px 8px 16px",
                padding: "10px 26px",
            }}
        >
            JavaScript · Visualized
        </div>
    </AbsoluteFill>
);
