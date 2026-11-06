import { Composition, Folder } from "remotion";
import { CodePanel } from "./CodePanel";
import { EventLoop, DURATION } from "./EventLoop";
import { AsyncAwait, ADURATION } from "./AsyncAwait";

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
      {/* Video #2 — placeholder duration until narration WAV is measured */}
      <Composition
        id="EventLoop"
        component={EventLoop}
        durationInFrames={DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Video #3 — async/await deep dive, suspension-hook mechanic */}
      <Composition
        id="AsyncAwait"
        component={AsyncAwait}
        durationInFrames={ADURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};