import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import {
  useFonts, KeyField, BrandCard, Lockup, Demo as PairSegment,
  FPS, BG, INTRO, OUTRO, DEMO_LEN as PAIR_LEN,
} from "./PairDemo";
import { Demo as ShotSegment, DEMO_LEN as SHOT_LEN } from "./ScreenshotDemo";

/**
 * ReviewWalkthrough — a single continuous ~34s clip for App Store Review (NOT a marketing cut).
 *
 * A reviewer can't exercise Treadle without a companion Mac on their Wi-Fi, so this stitches the two
 * things they need to SEE, in one take: (1) pairing the iPad to the Mac with a 6-digit code (the
 * PairDemo segment), then (2) a press on the iPad making the Mac act — a screenshot (the ScreenshotDemo
 * segment). Both halves are the real split-screen screen recordings already used on the site; this just
 * plays them back to back under one branded intro/outro, so there is nothing new to record.
 *
 * Render:  npx remotion render ReviewWalkthrough videos/treadle-review-walkthrough.mp4
 * It deploys with the other clips to the Railway demo host; link it in the App Review notes only if a
 * reviewer asks for one continuous video (the two existing separate clips are enough on first submit).
 */
const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// INTRO | pairing | press→react | OUTRO
const PAIR_FROM = INTRO;
const SHOT_FROM = INTRO + PAIR_LEN;
const DEMO_END = SHOT_FROM + SHOT_LEN;
export const TOTAL_FRAMES = DEMO_END + OUTRO;

export const ReviewWalkthrough: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();

  // Intro brand card fades out just before the demo; the outro fades in after it.
  const introOp = interpolate(frame, [INTRO - 18, INTRO - 2], [1, 0], C);
  const introScale = interpolate(frame, [INTRO - 18, INTRO], [1, 1.1], { ...C, easing: Easing.in(Easing.cubic) });

  // Each demo segment fades in/out around its own window; a short crossfade bridges pairing → press.
  const pairOp = interpolate(frame, [PAIR_FROM - 14, PAIR_FROM + 6, SHOT_FROM - 8, SHOT_FROM + 8], [0, 1, 1, 0], C);
  const pairScale = interpolate(frame, [PAIR_FROM - 14, PAIR_FROM + 10], [0.94, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const shotOp = interpolate(frame, [SHOT_FROM - 8, SHOT_FROM + 8, DEMO_END, DEMO_END + 18], [0, 1, 1, 0], C);
  const shotScale = interpolate(frame, [SHOT_FROM - 8, SHOT_FROM + 10], [0.96, 1], { ...C, easing: Easing.out(Easing.cubic) });

  const lockOp = interpolate(frame, [INTRO + 6, INTRO + 24, DEMO_END, DEMO_END + 12], [0, 1, 1, 0], C);

  const outT = (frame - DEMO_END) / FPS;
  const outOp = interpolate(frame, [DEMO_END + 4, DEMO_END + 20], [0, 1], C);

  return (
    <AbsoluteFill style={{ background: BG }}>
      <KeyField frame={frame} />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse 70% 55% at 50% 92%, rgba(242,163,60,0.16), rgba(242,163,60,0) 70%)" }}
      />

      {/* Intro */}
      <AbsoluteFill style={{ opacity: introOp, scale: String(introScale) }}>
        <BrandCard t={frame / FPS} size={340} top={250} />
      </AbsoluteFill>

      {/* 1 — pairing (iPad ⇄ Mac, 6-digit code) */}
      <AbsoluteFill style={{ opacity: pairOp, scale: String(pairScale) }}>
        <Sequence from={PAIR_FROM} durationInFrames={PAIR_LEN + 24} layout="none">
          <PairSegment />
        </Sequence>
      </AbsoluteFill>

      {/* 2 — a press on the iPad makes the Mac act (screenshot) */}
      <AbsoluteFill style={{ opacity: shotOp, scale: String(shotScale) }}>
        <Sequence from={SHOT_FROM} durationInFrames={SHOT_LEN + 24} layout="none">
          <ShotSegment />
        </Sequence>
      </AbsoluteFill>

      {/* Persistent wordmark across the demo */}
      <AbsoluteFill style={{ opacity: lockOp }}>
        <Lockup />
      </AbsoluteFill>

      {/* Outro — brand + download URL */}
      <AbsoluteFill style={{ opacity: outOp }}>
        {outT > -1 && <BrandCard t={Math.max(0, outT) * 1.5} url size={300} top={200} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
