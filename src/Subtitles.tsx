import { AbsoluteFill, useCurrentFrame } from "remotion";

const captions = [
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

export const Subtitles: React.FC = () => {
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
                paddingBottom: 45,
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    color: "white",
                    fontSize: 28,
                    padding: "14px 24px",
                    borderRadius: 10,
                    textAlign: "center",
                    maxWidth: "85%",
                }}
            >
                {currentCaption.text}
            </div>
        </AbsoluteFill>
    );
};