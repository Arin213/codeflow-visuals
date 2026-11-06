import { AbsoluteFill, useCurrentFrame } from "remotion";

/** Captions for Video #1: JavaScript function execution.
 *  Timings were measured against public/narration.wav and are synced — do NOT modify
 *  without permission. */
export const functionExecutionCaptions: Caption[] = [
    { start: 0, end: 74, text: "Let's see how JavaScript executes a function." },

    { start: 93, end: 194, text: "First, we declare a function called calculateTotal." },

    { start: 210, end: 309, text: "This tells JavaScript what task the function will perform." },

    { start: 332, end: 480, text: "Next, we call the function and pass two arguments: 100 and 3." },

    { start: 480, end: 614, text: "JavaScript assigns these values to the parameters: price and quantity." },

    { start: 632, end: 738, text: "Then it multiplies the two values and stores the result..." },

    { start: 738, end: 834, text: "300 in a local variable called total." },

    { start: 834, end: 972, text: "Finally, the function returns 300 to the place where it was called." },

    { start: 972, end: 1076, text: "That's how a JavaScript function executes, step by step." },
];


export type Caption = {
    start: number;
    end: number;
    text: string;
};

export const Subtitles: React.FC<{
    captions: Caption[];
    /** Sketch/notebook mode: transparent background, ink text (Videos #1/#2 untouched). */
    transparent?: boolean;
}> = ({ captions, transparent = false }) => {
    const frame = useCurrentFrame();

    const currentCaption = captions.find(
        (caption) => frame >= caption.start && frame < caption.end
    );

    if (!currentCaption) return null;

    return (
        <AbsoluteFill
            style={{
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: 55,
                paddingLeft: 80,
                paddingRight: 80,
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    backgroundColor: transparent
                        ? "rgba(0, 0, 0, 0)"
                        : "rgba(0, 0, 0, 0.88)",
                    color: transparent ? "#3A2E1E" : "#FFFFFF",
                    fontSize: transparent ? 36 : 38,
                    fontWeight: transparent ? 700 : 600,
                    lineHeight: 1.35,
                    padding: transparent ? "12px 24px" : "16px 30px",
                    borderRadius: 12,
                    textAlign: "center",
                    maxWidth: "90%",
                    fontFamily: transparent
                        ? '"Segoe Print", "Comic Sans MS", cursive'
                        : "Arial, sans-serif",
                    boxShadow:
                        transparent
                            ? "none"
                            : "0 4px 18px rgba(0, 0, 0, 0.25)",
                    textShadow: transparent
                        ? "0 1px 0 rgba(243,231,203,0.95), 0 0 8px rgba(243,231,203,0.95)"
                        : "none",
                }}
            >
                {currentCaption.text}
            </div>
        </AbsoluteFill>
    );
};
