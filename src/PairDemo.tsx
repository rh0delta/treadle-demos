import React from "react";
import {
  AbsoluteFill, Easing, interpolate, staticFile, Sequence,
  useCurrentFrame, useVideoConfig, continueRender, delayRender,
} from "remotion";
import { Video } from "@remotion/media";
import PAD_TOP from "./padA_top.json";

export const FPS = 30;
export const INTRO = 84;       // branded intro
export const DEMO_LEN = 588;   // demo frames shown before the outro takes over
export const OUTRO = 110;
export const TOTAL_FRAMES = INTRO + DEMO_LEN + OUTRO;

// ---- palette ---------------------------------------------------------------
const AMBER = "#F2A33C";
const KEY = "#1C1C21";
const HAIR = "#2A2A32";
const INK = "#f4f2ee";
const MUTED = "#9a97a1";
export const BG = "#0C0C0E";

// ---- font ------------------------------------------------------------------
export const useFonts = () => {
  const [handle] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    const faces = [600, 700].map(
      (w) => new FontFace("InterDemo", `url(${staticFile(`fonts/inter-latin-${w}-normal.woff2`)})`, { weight: String(w) }),
    );
    Promise.all(faces.map((f) => f.load())).then((l) => {
      l.forEach((f) => document.fonts.add(f));
      continueRender(handle);
    });
  }, [handle]);
};
const FONT = "InterDemo, Inter, system-ui, sans-serif";

// ---- geometry --------------------------------------------------------------
const MAC = { w: 920, h: 544, srcW: 2040, srcH: 1206 };
const PAD = { w: 664, h: 498, srcW: 2732, srcH: 2048 };

type View = { x: number; y: number; w: number };
const MAC_W: View = { x: 0, y: 0, w: 2040 };
const MAC_MENU: View = { x: 900, y: 0, w: 1000 };   // Treadle menu, top right
const MAC_WIN: View = { x: 40, y: 100, w: 1400 };   // Settings window (stays above the Service/IP row)
const PAD_W: View = { x: 0, y: 0, w: 2732 };
const PAD_K: View = { x: 700, y: 0, w: 1332 };   // pairing card + top of the keyboard

const macKeys: [number, View][] = [[0, MAC_MENU], [2.0, MAC_MENU], [3.0, MAC_WIN], [30, MAC_WIN]];
const padKeys: [number, View][] = [[0, PAD_W], [8.0, PAD_W], [8.9, PAD_K], [15.4, PAD_K], [16.3, PAD_W], [30, PAD_W]];

const cam = (t: number, keys: [number, View][]): View => {
  const ts = keys.map((k) => k[0]);
  const ease = Easing.inOut(Easing.cubic);
  const o = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease } as const;
  return {
    x: interpolate(t, ts, keys.map((k) => k[1].x), o),
    y: interpolate(t, ts, keys.map((k) => k[1].y), o),
    w: interpolate(t, ts, keys.map((k) => k[1].w), o),
  };
};


const mix = (a: string, b: string, p: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * p)).join(",")})`;
};
const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---- brand: the real Treadle icon, drawn from treadle-icon.svg geometry ------
const POS = [80, 204, 328];
const ORDER = [0, 1, 2, 5, 8, 7, 6, 3, 4]; // outside-in, centre key last

const Keypad: React.FC<{ size: number; t: number; press: number }> = ({ size, t, press }) => {
  const k = size / 512;
  const bg = interpolate(t, [0, 0.3], [0, 1], C);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 512, height: 512, scale: String(k), transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 114, background: "#0C0C0E", border: `4px solid ${HAIR}`, boxSizing: "border-box", opacity: bg }} />
        {ORDER.map((idx, n) => {
          const mid = idx === 4;
          const p = interpolate(t, [0.15 + n * 0.07, 0.15 + n * 0.07 + 0.45], [0, 1], { ...C, easing: Easing.out(Easing.back(1.8)) });
          const lit = mid ? press : 0;
          const sc = mid ? p * (1 - 0.12 * Math.sin(Math.PI * Math.min(1, press * 1.4)) + 0.06 * press) : p;
          return (
            <div
              key={idx}
              style={{
                position: "absolute", left: POS[idx % 3], top: POS[Math.floor(idx / 3)], width: 104, height: 104, borderRadius: 24,
                boxSizing: "border-box", background: mix(KEY, AMBER, lit), border: `4px solid ${mix(HAIR, AMBER, lit)}`,
                opacity: Math.min(1, p * 1.5), scale: String(Math.max(0, sc)),
                boxShadow: `0 0 ${90 * lit}px ${24 * lit}px rgba(242,163,60,${0.55 * lit})`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export const BrandCard: React.FC<{ t: number; url?: boolean; size: number; top: number }> = ({ t, url, size, top }) => {
  const tp = 1.05; // the amber key "press"
  const press = interpolate(t, [tp, tp + 0.15], [0, 1], C);
  const ring = (t - tp) / 0.8;
  const iconTop = top, wordTop = top + size + 40;
  return (
    <>
      <div style={{ position: "absolute", left: 960 - size / 2, top: iconTop }}>
        <Keypad size={size} t={t} press={press} />
        {ring > 0 && ring < 1 && (
          <div
            style={{
              position: "absolute", left: size / 2 - size * 0.1, top: size / 2 - size * 0.1, width: size * 0.2, height: size * 0.2,
              borderRadius: size * 0.05, border: `6px solid ${AMBER}`, boxSizing: "border-box",
              scale: String(interpolate(ring, [0, 1], [1, 6], { easing: Easing.out(Easing.cubic) })),
              opacity: interpolate(ring, [0, 1], [0.8, 0]),
            }}
          />
        )}
      </div>
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: wordTop, textAlign: "center", fontFamily: FONT, fontWeight: 700,
          fontSize: 128, letterSpacing: "-0.03em", color: INK, lineHeight: 1,
          opacity: interpolate(t, [1.2, 1.55], [0, 1], C), translate: `0px ${interpolate(t, [1.2, 1.6], [24, 0], { ...C, easing: Easing.out(Easing.cubic) })}px`,
        }}
      >
        Treadle
      </div>
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: wordTop + 160, textAlign: "center", fontFamily: FONT, fontWeight: 600,
          fontSize: 42, color: MUTED, opacity: interpolate(t, [1.5, 1.85], [0, 1], C),
        }}
      >
        Your iPad as a button panel for your <span style={{ color: AMBER }}>Mac</span>
      </div>
      {url && (
        <div
          style={{
            position: "absolute", left: 0, right: 0, top: wordTop + 250, textAlign: "center", fontFamily: FONT, fontWeight: 700,
            fontSize: 40, letterSpacing: "0.04em", color: AMBER, opacity: interpolate(t, [1.9, 2.3], [0, 1], C),
          }}
        >
          gettreadle.ca
        </div>
      )}
    </>
  );
};

// slowly drifting field of faint keys behind everything
export const KeyField: React.FC<{ frame: number }> = ({ frame }) => {
  const cell = 120;
  const off = (frame * 0.35) % cell;
  const cols = 18, rows = 11;
  return (
    <AbsoluteFill
      style={{
        opacity: 0.55, overflow: "hidden",
        WebkitMaskImage: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 38%, #000 100%)",
        maskImage: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 38%, #000 100%)",
      }}
    >
      <div style={{ position: "absolute", left: -cell + off, top: -cell + off * 0.6, width: cols * cell, height: rows * cell }}>
        {Array.from({ length: cols * rows }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute", left: (i % cols) * cell + 12, top: Math.floor(i / cols) * cell + 12, width: cell - 24, height: cell - 24,
              borderRadius: 22, background: "#111114", border: `2px solid #1b1b20`, boxSizing: "border-box",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// small persistent lockup: mark + wordmark
export const Lockup: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
    <Keypad size={46} t={9} press={0} />
    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: INK, letterSpacing: "-0.01em" }}>Treadle</div>
  </div>
);

// ---- captions --------------------------------------------------------------
const CAPTIONS: { text: string; from: number; to: number }[] = [
  { text: "Open *Devices* on your Mac", from: 0.2, to: 3.6 },
  { text: "Tap *Pair a device*", from: 3.7, to: 5.4 },
  { text: "Your Mac shows a *6-digit code*", from: 5.5, to: 8.0 },
  { text: "Type it on your *iPad*", from: 8.1, to: 14.3 },
  { text: "Tap *Pair*", from: 14.4, to: 15.7 },
  { text: "*Paired.* Your Mac and iPad are linked", from: 15.8, to: 99 },
];

const Caption: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", top: 70, left: 80, right: 80, height: 120 }}>
    {CAPTIONS.map((c, i) => {
      const op = interpolate(t, [c.from, c.from + 0.25, c.to - 0.25, c.to], [0, 1, 1, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      const ty = interpolate(t, [c.from, c.from + 0.35], [18, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
      });
      const last = i === CAPTIONS.length - 1;
      return (
        <div
          key={i}
          style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            opacity: last ? interpolate(t, [c.from, c.from + 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : op,
            translate: `0px ${ty}px`,
            fontFamily: FONT, fontWeight: 700, fontSize: 76, letterSpacing: "-0.02em", color: INK, textAlign: "center",
          }}
        >
          <span>
            {c.text.split("*").map((part, k) =>
              k % 2 ? <span key={k} style={{ color: AMBER }}>{part}</span> : <React.Fragment key={k}>{part}</React.Fragment>,
            )}
          </span>
        </div>
      );
    })}
  </div>
);

// ---- device pieces ---------------------------------------------------------
const Screen: React.FC<{
  w: number; h: number; srcW: number; srcH: number; view: View; radius: number;
  src: string; children?: React.ReactNode;
}> = ({ w, h, srcW, srcH, view, radius, src, children }) => {
  const s = w / view.w;
  return (
    <div style={{ width: w, height: h, overflow: "hidden", borderRadius: radius, position: "relative", background: "#000" }}>
      <div
        style={{
          position: "absolute", left: 0, top: 0, width: srcW, height: srcH, transformOrigin: "0 0",
          scale: String(s), translate: `${-view.x * s}px ${-view.y * s}px`,
        }}
      >
        <Video src={staticFile(src)} muted style={{ position: "absolute", left: 0, top: 0, width: srcW, height: srcH }} />
        {children}
      </div>
    </div>
  );
};

const Label: React.FC<{ children: string }> = ({ children }) => (
  <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 34, color: MUTED, letterSpacing: "0.01em" }}>{children}</div>
);

const Ripple: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => {
  const p = (t - t0) / 0.6;
  if (p < 0 || p > 1) return null;
  const size = interpolate(p, [0, 1], [80, 300], { easing: Easing.out(Easing.cubic) });
  return (
    <div
      style={{
        position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: "50%",
        border: `12px solid ${AMBER}`, opacity: interpolate(p, [0, 0.15, 1], [0, 0.9, 0]),
      }}
    />
  );
};

// connector between the two devices
const ROW_LEFT = 80, MAC_OUT = MAC.w + 24, GAP = 120;
const LINE_X0 = ROW_LEFT + MAC_OUT, LINE_X1 = LINE_X0 + GAP, LINE_Y = 545;
const TAPS = [14.8];

const Connector: React.FC<{ t: number }> = ({ t }) => (
  <>
    {[0, 1, 2].map((k) => {
      // lights up iPad -> Mac: key 2 first, key 0 last
      const lit = TAPS.reduce((m, t0) => {
        const d = t - (t0 + 0.05 + (2 - k) * 0.09);
        const v = d < 0 ? 0 : interpolate(d, [0, 0.08, 0.5], [0, 1, 0], { extrapolateRight: "clamp" });
        return Math.max(m, v);
      }, 0);
      const x = LINE_X0 + 12 + k * 36;
      return (
        <div
          key={k}
          style={{
            position: "absolute", left: x, top: LINE_Y - 12, width: 24, height: 24, borderRadius: 7,
            background: mix(KEY, AMBER, lit), border: `2px solid ${mix(HAIR, AMBER, lit)}`,
            boxShadow: `0 0 ${34 * lit}px ${8 * lit}px rgba(242,163,60,${0.5 * lit})`,
            scale: String(1 + 0.18 * lit),
          }}
        />
      );
    })}
  </>
);

const PAIR_END = 476; // frame where the iPad leaves the pairing card for the Desk
const MASK = "#0f0e11";
// hides the status bar and the Mac's local IP while the pairing card is on screen, then the IP in the Desk side panel
const PadMasks: React.FC<{ frame: number }> = ({ frame }) => {
  const f = Math.min(frame, (PAD_TOP as number[]).length - 1);
  const top = (PAD_TOP as number[])[f];
  // "Loading… Fetching config from <local IP>" screen between pairing and the Desk
  const loading = frame >= 473 && frame <= 479;
  if (frame < PAIR_END && top > 0) {
    return (
      <>
        {loading && <div style={{ position: "absolute", left: 900, top: 980, width: 930, height: 120, background: "#000" }} />}
        <div style={{ position: "absolute", left: 0, top: 0, width: 2732, height: 84, background: "#000" }} />
        <div style={{ position: "absolute", left: 990, top: top + 786, width: 200, height: 48, background: MASK }} />
      </>
    );
  }
  return (
    <>
      {loading && <div style={{ position: "absolute", left: 900, top: 980, width: 930, height: 120, background: "#000" }} />}
      <div style={{ position: "absolute", left: 2150, top: 642, width: 190, height: 50, background: MASK }} />
    </>
  );
};

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const mv = cam(t, macKeys);
  const pv = cam(t, padKeys);
  return (
    <AbsoluteFill>
      <Caption t={t} />
      <div
        style={{
          position: "absolute", top: 235, left: ROW_LEFT, right: ROW_LEFT, height: 700,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        {/* Mac */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <div style={{ height: 600, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div
              style={{
                padding: 12, background: "#1b1b1f", borderRadius: "22px 22px 8px 8px", border: "1px solid #2e2e34",
                boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
              }}
            >
              <Screen {...MAC} view={mv} radius={10} src="mac_a.webm" />
            </div>
            <div style={{ width: MAC_OUT + 70, height: 14, margin: "0 -35px", background: "linear-gradient(#2d2d33,#1a1a1e)", borderRadius: "0 0 20px 20px" }} />
          </div>
          <Label>Mac</Label>
        </div>

        {/* iPad */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <div style={{ height: 600, display: "flex", alignItems: "center" }}>
            <div
              style={{
                padding: 16, background: "#121214", borderRadius: 44, border: "2px solid #34343a",
                boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
              }}
            >
              <Screen {...PAD} view={pv} radius={28} src="ipad_a.webm">
                <PadMasks frame={frame} />
                {TAPS.map((t0, i) => (
                  <Ripple key={i} t={t} t0={t0} x={1366} y={784} />
                ))}
              </Screen>
            </div>
          </div>
          <Label>iPad</Label>
        </div>
      </div>
      <Connector t={t} />
    </AbsoluteFill>
  );
};

export const PairDemo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const O = INTRO + DEMO_LEN;

  const introOp = interpolate(frame, [INTRO - 18, INTRO - 2], [1, 0], C);
  const introScale = interpolate(frame, [INTRO - 18, INTRO], [1, 1.1], { ...C, easing: Easing.in(Easing.cubic) });
  const demoOp = interpolate(frame, [INTRO - 14, INTRO + 6, O, O + 18], [0, 1, 1, 0], C);
  const demoScale = interpolate(frame, [INTRO - 14, INTRO + 10], [0.94, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const lockOp = interpolate(frame, [INTRO + 6, INTRO + 24, O, O + 12], [0, 1, 1, 0], C);
  const outT = (frame - O) / FPS;
  const outOp = interpolate(frame, [O + 4, O + 20], [0, 1], C);

  return (
    <AbsoluteFill style={{ background: BG }}>
      <KeyField frame={frame} />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse 70% 55% at 50% 92%, rgba(242,163,60,0.16), rgba(242,163,60,0) 70%)" }}
      />

      <AbsoluteFill style={{ opacity: introOp, scale: String(introScale) }}>
        <BrandCard t={frame / FPS} size={340} top={250} />
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: demoOp, scale: String(demoScale) }}>
        <Sequence from={INTRO} durationInFrames={DEMO_LEN + 24} layout="none">
          <Demo />
        </Sequence>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: lockOp }}>
        <Lockup />
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: outOp }}>
        {outT > -1 && <BrandCard t={Math.max(0, outT) * 1.5} url size={300} top={200} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
