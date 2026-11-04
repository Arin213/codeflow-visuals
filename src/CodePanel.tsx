
import { Subtitles } from "./Subtitles";
import {
    AbsoluteFill,
    Audio,
    staticFile,
    interpolate,
    useCurrentFrame,
} from "remotion";

const codeLines = [
    "function calculateTotal(price, quantity) {",
    "  const total = price * quantity;",
    "  return total;",
    "}",
    "",
    "const result = calculateTotal(100, 3);",
];

export const CodePanel: React.FC = () => {
    const frame = useCurrentFrame();

    // Four execution stages.
    const stage =
        frame < 333 ? 0 :
        frame < 633 ? 1 :
        frame < 834 ? 2 : 3;

    // Y anchors measured from the actual rendered layout (viewBox units).
    // The SVG viewBox (700 units tall) is stretched over the flex container
    // (148px..1020px on the 1080px canvas => 1.2457 px/unit), so
    // vbY = (pixelY - 148) / 1.2457.
    // Code-line row centers (px): 257.5, 306, 353, 494 -> 88, 127, 165, 278.
    // Right-panel targets (px): stage card 286.5, parameter values 463.5,
    // total value 608.5, returned value 736 -> 111, 253, 370, 472.
    // Stage changes at 333/633/834 are synced to the narration sentence
    // boundaries in public/narration.wav.
    const LINE_DECLARATION = 88;
    const LINE_CALC = 127;
    const LINE_RETURN = 165;
    const LINE_CALL = 278;
    const TARGET_STAGE_CARD = 111;
    const TARGET_PARAMS = 253;
    const TARGET_TOTAL = 370;
    const TARGET_RETURNED = 472;

    // Fade-in animations.
    const parameterOpacity = interpolate(
        frame,
        [333, 348],
        [0, 1],
        {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        }
    );

    const totalOpacity = interpolate(
        frame,
        [633, 648],
        [0, 1],
        {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        }
    );

    const returnOpacity = interpolate(
        frame,
        [834, 849],
        [0, 1],
        {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        }
    );

    // Highlight the active code line.
    const activeLine = [0, 5, 1, 2][stage];

    // Each thread transition takes 24 frames (0.8s at 30fps) — slower than
    // the original 15 frames, so the travelling light glides with the thread
    // instead of zipping across. Transitions still start exactly at the
    // narration sentence boundaries (333 / 633 / 834).

    // Animate the thread's starting and ending positions.
    const arrowStartY = interpolate(
        frame,
        [0, 333, 357, 633, 657, 834, 858],
        [
            LINE_DECLARATION, LINE_DECLARATION, LINE_CALL,
            LINE_CALL, LINE_CALC, LINE_CALC, LINE_RETURN,
        ],
        {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        }
    );

    const arrowEndY = interpolate(
        frame,
        [0, 333, 357, 633, 657, 834, 858],
        [
            TARGET_STAGE_CARD, TARGET_STAGE_CARD, TARGET_PARAMS,
            TARGET_PARAMS, TARGET_TOTAL, TARGET_TOTAL, TARGET_RETURNED,
        ],
        {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        }
    );

    // Progress of the travelling light for each execution flow.
    const flowProgress =
        frame < 333
            ? 0
            : frame < 357
                ? interpolate(frame, [333, 357], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                })
                : frame < 633
                    ? 1
                    : frame < 657
                        ? interpolate(frame, [633, 657], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        })
                        : frame < 834
                            ? 1
                            : frame < 858
                                ? interpolate(frame, [834, 858], [0, 1], {
                                    extrapolateLeft: "clamp",
                                    extrapolateRight: "clamp",
                                })
                                : 1;

    // Show the travelling light ONLY while it is moving.
    const flowOpacity = Math.max(
        interpolate(frame, [333, 336, 354, 357], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        }),
        interpolate(frame, [633, 636, 654, 657], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        }),
        interpolate(frame, [834, 837, 855, 858], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        })
    );

    // Calculate the moving light's position on the curved thread.
    const t = flowProgress;
    const inverseT = 1 - t;

    const lightX =
        inverseT * inverseT * inverseT * 320 +
        3 * inverseT * inverseT * t * 390 +
        3 * inverseT * t * t * 440 +
        t * t * t * 510;

    const lightY =
        inverseT * inverseT * inverseT * arrowStartY +
        3 * inverseT * inverseT * t * arrowStartY +
        3 * inverseT * t * t * arrowEndY +
        t * t * t * arrowEndY;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: "#101827",
                padding: 60,
                fontFamily: "Arial, sans-serif",
            }}
        >
            <Audio src={staticFile("narration.wav")} />

            <div
                style={{
                    color: "#FFFFFF",
                    fontSize: 42,
                    fontWeight: "bold",
                    marginBottom: 40,
                }}
            >
                How JavaScript Executes a Function
            </div>

            <div
                style={{
                    display: "flex",
                    flex: 1,
                    gap: 30,
                    position: "relative",
                }}
            >
                {/* LEFT: SOURCE CODE */}
                <div
                    style={{
                        flex: 1,
                        backgroundColor: "#1E293B",
                        borderRadius: 18,
                        padding: 30,
                        color: "#E2E8F0",
                    }}
                >
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
                                backgroundColor:
                                    activeLine === index ? "#334155" : "transparent",
                                color:
                                    activeLine === index ? "#FDE68A" : "#E2E8F0",
                                padding: "12px 10px",
                                borderRadius: 8,
                                fontFamily: "monospace",
                                fontSize: 21,
                                whiteSpace: "pre",
                            }}
                        >
                            <span style={{ color: "#64748B" }}>
                                {index + 1}{" "}
                            </span>
                            {line}
                        </div>
                    ))}
                </div>

                {/* RIGHT: EXECUTION VISUALIZATION */}
                <div
                    style={{
                        flex: 1,
                        backgroundColor: "#1E293B",
                        borderRadius: 18,
                        padding: 30,
                        color: "#FFFFFF",
                    }}
                >
                    <div
                        style={{
                            color: "#6EE7B7",
                            fontSize: 24,
                            fontWeight: "bold",
                            marginBottom: 30,
                        }}
                    >
                        EXECUTION VISUALIZATION
                    </div>

                    {/* Current stage */}
                    <div
                        style={{
                            backgroundColor: "#273449",
                            borderRadius: 12,
                            padding: 20,
                            marginBottom: 20,
                        }}
                    >
                        <div style={{ color: "#93C5FD", fontSize: 20 }}>
                            CURRENT STAGE
                        </div>

                        <div style={{ fontSize: 25, marginTop: 10 }}>
                            {[
                                "Function declaration",
                                "Function call",
                                "Calculation",
                                "Return value",
                            ][stage]}
                        </div>
                    </div>

                    {/* Function parameters */}
                    <div style={{ color: "#94A3B8", fontSize: 19 }}>
                        Function parameters
                    </div>

                    <div style={{ display: "flex", gap: 15, marginTop: 12 }}>
                        <div style={variableCard}>
                            <div style={labelStyle}>price</div>
                            <div
                                style={{
                                    ...valueStyle,
                                    opacity: parameterOpacity,
                                }}
                            >
                                {stage >= 1 ? "100" : "—"}
                            </div>
                        </div>

                        <div style={variableCard}>
                            <div style={labelStyle}>quantity</div>
                            <div
                                style={{
                                    ...valueStyle,
                                    opacity: parameterOpacity,
                                }}
                            >
                                {stage >= 1 ? "3" : "—"}
                            </div>
                        </div>
                    </div>

                    {/* Local variable */}
                    <div
                        style={{
                            color: "#94A3B8",
                            fontSize: 19,
                            marginTop: 30,
                            marginBottom: 12,
                        }}
                    >
                        Local variable: total
                    </div>

                    <div
                        style={{
                            backgroundColor: "#273449",
                            padding: 22,
                            borderRadius: 12,
                            textAlign: "center",
                            fontSize: 30,
                            color: "#FDE68A",
                        }}
                    >
                        <span style={{ opacity: totalOpacity }}>
                            {stage >= 2 ? "300" : "—"}
                        </span>
                    </div>

                    {/* Returned value */}
                    <div
                        style={{
                            backgroundColor: "#164E43",
                            borderRadius: 12,
                            padding: 22,
                            marginTop: 25,
                            textAlign: "center",
                        }}
                    >
                        <div style={{ color: "#A7F3D0", fontSize: 19 }}>
                            Returned value
                        </div>

                        <div
                            style={{
                                color: "#6EE7B7",
                                fontSize: 48,
                                fontWeight: "bold",
                            }}
                        >
                            <span style={{ opacity: returnOpacity }}>
                                {stage >= 3 ? "300" : "—"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ANIMATED CONNECTING THREAD */}
                <svg
                    viewBox="0 0 1000 700"
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
                        <filter id="threadGlow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        <marker
                            id="threadArrowhead"
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

                    {/* Permanently visible curved thread */}
                    <path
                        d={`
                            M 320 ${arrowStartY}
                            C 390 ${arrowStartY},
                              440 ${arrowEndY},
                              510 ${arrowEndY}
                        `}
                        fill="none"
                        stroke="#60A5FA"
                        strokeWidth="4"
                        strokeLinecap="round"
                        markerEnd="url(#threadArrowhead)"
                        filter="url(#threadGlow)"
                        opacity="0.95"
                    />

                    {/* Thread starting point */}
                    <circle
                        cx="320"
                        cy={arrowStartY}
                        r="4"
                        fill="#60A5FA"
                    />

                    {/* Travelling light: visible only during each flow */}
                    <circle
                        cx={lightX}
                        cy={lightY}
                        r="7"
                        fill="#FFFFFF"
                        stroke="#60A5FA"
                        strokeWidth="3"
                        filter="url(#threadGlow)"
                        opacity={flowOpacity}
                    />
                </svg>
            </div>

            <Subtitles />
        </AbsoluteFill>
    );
};

const variableCard: React.CSSProperties = {
    flex: 1,
    backgroundColor: "#273449",
    borderRadius: 12,
    padding: 20,
};

const labelStyle: React.CSSProperties = {
    color: "#94A3B8",
    fontSize: 19,
    marginBottom: 10,
};

const valueStyle: React.CSSProperties = {
    color: "#60A5FA",
    fontSize: 36,
    fontWeight: "bold",
};
