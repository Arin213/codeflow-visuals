import { Composition, Folder } from "remotion";
import { CodePanel } from "./CodePanel";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="CodeFlow-Visuals">
      <Composition
        id="CodePanel"
        component={CodePanel}
        durationInFrames={1076}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};