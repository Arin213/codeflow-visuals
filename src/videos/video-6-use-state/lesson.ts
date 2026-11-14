/* ==================================================================
 * Video #6 — "Why useState Remembers" — lesson data.
 * The kit-style edit surface: beats, listings, highlights, terms,
 * and the ARROW specs (code line → stage target).
 * ================================================================== */
import { SENT } from "./timing";

/* ---------- palette (Deep Current, same brand) ---------- */
export const BG = "#0C141D";
export const ICE = "#DCE7F0";
export const MUTED = "#7C8B99";
export const PUNCT = "#8FA3B5";
export const MINT = "#5EEAD4";
export const GOLD = "#F5C97B";
export const CORAL = "#F97066";
export const SKY = "#7DD3FC";
export const COPPER = "#C98A4B";
export const UI = '"Segoe UI", "Inter", sans-serif';
export const MONO = '"Consolas", monospace';
export const clamp0 = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const FPS = 30;

const S = (i: number) => SENT[i].s;

/* ---------- sentence anchors ---------- */
export const B = {
  hook0: S(0),
  hook1: S(1),
  code: S(2),
  button: S(3),
  fn: S(4),
  rerun: S(5),
  zero: S(6),
  notZero: S(7),
  why: S(8),
  closures: S(9),
  outside: S(10),
  box: S(11),
  rebuilt: S(12),
  boxStays: S(13),
  window: S(14),
  look: S(15),
  setLocal: S(16),
  schedule: S(17),
  click: S(18),
  record: S(19),
  rerun2: S(20),
  screen: S(21),
  handback: S(22),
  trick: S(23),
  trick2: S(24),
  whichBox: S(25),
  cantSee: S(26),
  seq: S(27),
  slotClaim: S(28),
  slot0: S(29),
  slot1: S(30),
  position: S(31),
  contract: S(32),
  forever: S(33),
  whyRule: S(34),
  ifBreak: S(35),
  ifRuns: S(36),
  shift: S(37),
  bleed1: S(38),
  bleed2: S(39),
  chaos: S(40),
  rulesExist: S(41),
  topLevel: S(42),
  noException: S(43),
  noBleed: S(44),
  recap: S(45),
  forgets: S(46),
  remembers: S(47),
  arrowLine: S(48),
  isClosure: S(49),
  mystery: S(50),
  timeout: S(51),
  notBug: S(52),
  boxMoved: S(53),
  snapshot: S(54),
  readArrow: S(55),
  ownWindow: S(56),
  memory: S(57),
  final: S(58),
};

/* first cut → second short starts here (the "closures" cliffhanger) */
export const CUT = B.closures;

/* ---------- code listings ---------- */
/* lines are referenced by index in HIGHLIGHTS + ARROWS — keep stable */
export const CODE = {
  counter: {
    label: "Counter.tsx",
    color: SKY,
    lines: [
      "function Counter() {",
      "  const [count, setCount] = useState(0);",
      "",
      "  const inc = () =>",
      "    setCount(count + 1);",
      "",
      "  return (",
      "    <button onClick={inc}>",
      "      clicked {count} times",
      "    </button>",
      "  );",
      "}",
    ],
  },
  /* two-hook component for the slots section: line 1 = first call,
   * line 3 = second call (matches the slot arrows + narration). */
  slots: {
    label: "Profile.tsx",
    color: GOLD,
    lines: [
      "function Profile() {",
      '  const [name] = useState("Ada");',
      "",
      "  const [age] = useState(27);",
      "",
      "  return (",
      "    <ProfileCard name={name} age={age} />",
      "  );",
      "}",
    ],
  },
  broken: {
    label: "Broken.tsx",
    color: CORAL,
    lines: [
      "function Broken() {",
      "  const [a] = useState(0);",
      "  if (cond) {",
      "    const [b] = useState(1);",
      "  }",
      "  const [c] = useState(2);",
      "  return null;",
      "}",
    ],
  },
} as const;

export type ActName = keyof typeof CODE;

export const actAt = (frame: number): ActName => {
  if (frame >= B.ifBreak && frame < B.recap) return "broken";
  if (frame < B.ifBreak && frame >= B.whichBox) return "slots";
  return "counter";
};

/* ---------- sentence → lit line indexes (opacity spotlight) ----------
 * NOTE: SPEC uses SENTENCE INDICES (not frames). B.* are frames. */
const ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const SPEC: Array<[number, number, number[]]> = [
  [2, 4, ALL], // here is the component / returns a button
  [4, 5, [0]], // just a function
  [6, 7, [0]], // fresh run → zero (line 0)
  [7, 10, [1]], // isn't zero / why / closures → useState line
  [10, 12, [1]], // outside / box
  [12, 13, ALL], // torn down + rebuilt
  [13, 16, [1]], // box never moves / window / looks outward
  [16, 19, [3, 4]], // setCount doesn't change local / schedules
  [19, 20, [4]], // records the new value
  [21, 22, [7, 8]], // screen updates → button lines
  [22, 25, [1]], // same box fresh window / trick
  [25, 28, [0]], // which box / can't see / sequence
  [28, 29, [1, 3]], // hook calls claim slots
  [29, 30, [1]], // first call slot zero → line 1
  [30, 31, [3]], // second call slot one → line 3
  [31, 35, [1, 3]], // position / contract / forever / can't loop
  [35, 37, [2]], // if hides a hook (broken act)
  [37, 38, [1, 3, 5]], // calls shift
  [38, 39, [3]], // slot one ← slot zero's value
  [39, 40, [5]], // slot two gets whatever's left
  [40, 41, [3, 5]], // chaos
  [41, 48, ALL], // rules / recap
  [48, 50, [1]], // the arrow line / that arrow is a closure
  [50, 55, []], // setTimeout mystery (handled on stage)
  [55, 58, [1]], // read the arrow / own window / box is memory
  [58, 59, ALL], // final
];

export const HIGHLIGHTS: Record<number, number[]> = {};
for (const [from, to, lines] of SPEC) {
  for (let i = from; i < to; i++) HIGHLIGHTS[i] = lines;
}

/* sentences where the spotlight SWEEPS the body top→bottom (the re-run) */
export const SWEEP_AT = [5, 20];
/* the "broken" act: sweep through the calls shift */
export const SWEEP_BROKEN_AT = [37];

/* ---------- caption vocabulary ---------- */
export const TERMS: Record<string, string> = {
  usestate: MINT,
  count: GOLD,
  setcount: GOLD,
  react: SKY,
  closure: COPPER,
  slot: COPPER,
  render: SKY,
  hook: SKY,
};

/* ---------- header chips ---------- */
export const CHIPS = [
  { label: "① the re-run", at: B.rerun, color: SKY },
  { label: "② the box", at: B.box, color: MINT },
  { label: "③ the slots", at: B.slotClaim, color: GOLD },
  { label: "④ the arrow", at: B.arrowLine, color: COPPER },
];

export const TITLE = "why useState remembers";
export const SUBTITLE = "closures, one render at a time";
export const MIX = "video6-mix.wav";

/* ---------- ARROW SPECS ----------
 * The V6 signature: execution-flow arrows FROM a code line TO a stage
 * target. Coordinates are STAGE-LOCAL (1000×800 stage canvas).
 * line = code listing line index; rendered per-layout so verticals
 * get correct geometry automatically.
 * ---------------------------------------------------------------- */
export type ArrowSpec = {
  s: number; // SENTENCE INDEX that draws the arrow (not a frame!)
  line: number; // source code line
  tx: number; // stage-local target x
  ty: number; // stage-local target y
  color: string;
  at2?: number; // optional second draw (recreated) at another sentence index
};

export const ARROWS: ArrowSpec[] = [
  // useState(0) line → the state box (kept OUTSIDE the function)
  { s: 10, line: 1, tx: 350, ty: 620, color: COPPER },
  // the box hands back to `count` (the window)
  { s: 14, line: 1, tx: 350, ty: 620, color: MINT },
  { s: 22, line: 1, tx: 350, ty: 620, color: MINT },
  // setCount → the box (records the new value)
  { s: 19, line: 4, tx: 350, ty: 620, color: COPPER },
  // button JSX → the rendered button chip (screen updates)
  { s: 21, line: 8, tx: 620, ty: 640, color: SKY },
  // two call sites → their slots (position, not name)
  { s: 29, line: 1, tx: 560, ty: 560, color: COPPER },
  { s: 30, line: 3, tx: 560, ty: 660, color: COPPER },
];
