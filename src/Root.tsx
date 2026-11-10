import { Composition, Folder } from "remotion";
import { CodePanel } from "./CodePanel";
import { EventLoop, DURATION } from "./EventLoop";
import { AsyncAwait, ADURATION } from "./AsyncAwait";
import {
  AsyncEvolution,
  ShortEvolutionHell,
  ShortEvolutionFix,
  ShortEvolutionFull,
  ADURATION as EVOLUTION_DURATION,
} from "./AsyncEvolution";
import {
  ChannelBanner,
  ThumbFunctionExec,
  ThumbEventLoop,
  ThumbAsyncAwait,
  ThumbEvolution,
  ProfileMark,
  VideoWatermark,
} from "./PublishArt";
import {
  ShortCPrintsBeforeB,
  ShortAsyncFull,
  ShortHookLatch,
  ShortQueueJump,
  ShortTimeoutRace,
  ShortFunctionExec,
} from "./Shorts";

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
      {/* Video #4 — the evolution of async: callbacks → promises → await */}
      <Composition
        id="AsyncEvolution"
        component={AsyncEvolution}
        durationInFrames={EVOLUTION_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Folder name="Shorts">
        <Composition
          id="ShortCPrintsBeforeB"
          component={ShortCPrintsBeforeB}
          durationInFrames={1634}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="ShortHookLatch"
          component={ShortHookLatch}
          durationInFrames={775}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="ShortAsyncFull"
          component={ShortAsyncFull}
          durationInFrames={5346}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="ShortQueueJump"
          component={ShortQueueJump}
          durationInFrames={1672}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="ShortTimeoutRace"
          component={ShortTimeoutRace}
          durationInFrames={1494}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="ShortFunctionExec"
          component={ShortFunctionExec}
          durationInFrames={1072}
          fps={30}
          width={1080}
          height={1920}
        />
        {/* Video #4 verticals — measured windows from the same timeline */}
        <Composition
          id="ShortEvolutionHell"
          component={ShortEvolutionHell}
          durationInFrames={1307}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="ShortEvolutionFix"
          component={ShortEvolutionFix}
          durationInFrames={1657}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="ShortEvolutionFull"
          component={ShortEvolutionFull}
          durationInFrames={2964}
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>
      <Folder name="Publish-Kit">
        <Composition
          id="ChannelBanner"
          component={ChannelBanner}
          durationInFrames={1}
          fps={30}
          width={2560}
          height={1440}
        />
        <Composition
          id="ThumbFunctionExec"
          component={ThumbFunctionExec}
          durationInFrames={1}
          fps={30}
          width={1280}
          height={720}
        />
        <Composition
          id="ThumbEventLoop"
          component={ThumbEventLoop}
          durationInFrames={1}
          fps={30}
          width={1280}
          height={720}
        />
        <Composition
          id="ThumbAsyncAwait"
          component={ThumbAsyncAwait}
          durationInFrames={1}
          fps={30}
          width={1280}
          height={720}
        />
        <Composition
          id="ThumbEvolution"
          component={ThumbEvolution}
          durationInFrames={1}
          fps={30}
          width={1280}
          height={720}
        />
        <Composition
          id="ProfileMark"
          component={ProfileMark}
          durationInFrames={1}
          fps={30}
          width={800}
          height={800}
        />
        <Composition
          id="VideoWatermark"
          component={VideoWatermark}
          durationInFrames={1}
          fps={30}
          width={150}
          height={150}
        />
      </Folder>
    </Folder>
  );
};