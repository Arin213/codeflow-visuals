
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

    // Animate the arrow's starting position.
    const arrowStartY = interpolate(
        frame,
        [0, 333, 348, 633, 648, 834, 849],
        [110, 110, 337, 337, 157, 157, 202],
        {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        }
    );

    const arrowEndY = interpolate(
        frame,
        [0, 333, 348, 633, 648, 834, 849],
        [110, 110, 225, 225, 395, 395, 525],
        {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        }
    );
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

                {/* ANIMATED CONNECTING ARROW */}
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
                        <marker
                            id="arrowhead"
                            markerWidth="8"
                            markerHeight="8"
                            refX="6"
                            refY="3"
                            orient="auto"
                        >
                            <path
                                d="M0,0 L0,6 L6,3 Z"
                                fill="#F87171"
                            />
                        </marker>
                    </defs>

                    <path
                        d={`
                            M 320 ${arrowStartY}
                            C 390 ${arrowStartY},
                              440 ${arrowEndY},
                              510 ${arrowEndY}
                        `}
                        fill="none"
                        stroke="#F87171"
                        strokeWidth="5"
                        strokeLinecap="round"
                        markerEnd="url(#arrowhead)"
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
