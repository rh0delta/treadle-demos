import { Composition } from "remotion";
import { ClipboardDemo, TOTAL_FRAMES } from "./ClipboardDemo";
import { ScreenshotDemo, TOTAL_FRAMES as SHOT_FRAMES } from "./ScreenshotDemo";

import { PairDemo, TOTAL_FRAMES as PAIR_FRAMES } from "./PairDemo";
import { GestureDemo, TOTAL_FRAMES as GESTURE_FRAMES } from "./GestureDemo";
import { HoldDemo, TOTAL_FRAMES as HOLD_FRAMES } from "./HoldDemo";
import { ReviewWalkthrough, TOTAL_FRAMES as REVIEW_FRAMES } from "./ReviewWalkthrough";

export const RemotionRoot = () => (
  <>
    <Composition id="ClipboardDemo" component={ClipboardDemo} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="ScreenshotDemo" component={ScreenshotDemo} durationInFrames={SHOT_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="PairDemo" component={PairDemo} durationInFrames={PAIR_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="GestureDemo" component={GestureDemo} durationInFrames={GESTURE_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="HoldDemo" component={HoldDemo} durationInFrames={HOLD_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="ReviewWalkthrough" component={ReviewWalkthrough} durationInFrames={REVIEW_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
