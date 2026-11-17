/**
 * WISBOX guide robot, redrawn as SVG from the brand artwork so its parts can move.
 * Arms (shoulder + elbow), eyes, face mask, antenna light and the locker door are
 * separate groups; `data-pose` on the root selects a pose (see globals.css), and
 * /wisbox-robot.js switches poses in response to page actions.
 */

export type RobotPose =
  | "rest"
  | "wave"
  | "joy"
  | "deposit"
  | "pickup"
  | "think"
  | "ok"
  | "point-l"
  | "point-l-more"
  | "point-r"
  | "point-r-more"
  | "guide"
  | "present";

const c = {
  ink: "#212830",
  arm: "#28313a",
  orange: "#df7914",
  orangeDeep: "#b35f0e",
  body: "#f5f5f3",
  bodyStroke: "#cccccb",
  eye: "#7ed1fd",
  panel: "#22272d",
  panelInner: "#e6e6f0",
  row: "#fefefe",
  rowStroke: "#e2e6ea",
  frame: "#e9e9e7",
  frameStroke: "#d6d6d3",
  door: "#fefefe",
  doorStroke: "#dcdcda",
  line: "#d4d3cf",
  handle: "#2c353e",
  hinge: "#a7aab1",
  wheel: "#303340",
  hub: "#878b94",
  shadow: "#101920",
  cavity: "#2b323a",
  parcel: "#d39a5b",
  parcelTape: "#f0d6ac",
};

function Parcel({ x, y, className }: { x: number; y: number; className: string }) {
  return (
    <g className={className}>
      <rect x={x} y={y} width="112" height="86" rx="10" fill={c.parcel} />
      <rect x={x + 48} y={y} width="16" height="86" fill={c.parcelTape} />
      <rect x={x} y={y} width="112" height="86" rx="10" fill="none" stroke="#b47b3d" strokeWidth="5" />
    </g>
  );
}

/** One arm, drawn pointing left from the shoulder; the right arm is the mirrored copy. */
function Arm({ side }: { side: "l" | "r" }) {
  const x = side === "l" ? 282 : 1050;
  return (
    <g transform={`translate(${x} 520)${side === "r" ? " scale(-1 1)" : ""}`}>
      <g className={`wbr-sh wbr-sh-${side}`}>
        {/* invisible circle centres the bounding box on the shoulder joint */}
        <circle r="400" fill="none" />
        <path className="wbr-rim" d="M0 0 Q-60 8 -120 0" fill="none" stroke="#fff" strokeWidth="52" strokeLinecap="round" />
        <path d="M0 0 Q-60 8 -120 0" fill="none" stroke={c.arm} strokeWidth="40" strokeLinecap="round" />
        <g transform="translate(-120 0)">
          <g className={`wbr-el wbr-el-${side}`}>
            <circle r="300" fill="none" />
            <path className="wbr-rim" d="M0 0 Q-70 -12 -140 0" fill="none" stroke="#fff" strokeWidth="52" strokeLinecap="round" />
            <path d="M0 0 Q-70 -12 -140 0" fill="none" stroke={c.arm} strokeWidth="40" strokeLinecap="round" />
            <g transform="translate(-195 0)">
              {side === "r" ? (
                /* envelope prop, held in the right hand (hidden until a scene needs it) */
                <g transform="translate(-40 -150)">
                <g className="wbr-env">
                  <rect x="-115" y="-76" width="230" height="152" rx="16" fill="#fff" stroke={c.orangeDeep} strokeWidth="9" />
                  <path d="M-106 -64 L0 16 L106 -64" fill="none" stroke={c.orangeDeep} strokeWidth="9" strokeLinejoin="round" />
                </g>
                </g>
              ) : null}
              <circle r="62" fill={c.orange} />
              <path
                d="M-34 -14 q10 -16 26 -6 q12 10 2 24 M-6 -30 q18 -14 32 2 q10 14 -4 28"
                fill="none"
                stroke={c.orangeDeep}
                strokeWidth="6"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

/** Side locker module that slides out from behind the body (welcome scene only). */
function Module({ side }: { side: "l" | "r" }) {
  const x0 = side === "l" ? -160 : 1032;
  const doors = [0, 1, 2, 3, 4, 5];
  return (
    <g className={`wbr-mod wbr-mod-${side}`}>
      <rect x={x0} y="330" width="460" height="690" rx="46" fill={c.body} stroke={c.bodyStroke} strokeWidth="10" />
      {doors.map((i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const dx = side === "l" ? x0 + 30 + col * 212 : x0 + 30 + col * 212;
        const dy = 362 + row * 217;
        return (
          <g key={i} className={`wbr-mdoor wbr-md${side === "l" ? i : 5 - i}`}>
            <rect x={dx} y={dy} width="188" height="196" rx="18" fill={c.door} stroke={c.doorStroke} strokeWidth="5" />
            <rect x={dx + 150} y={dy + 70} width="16" height="56" rx="8" fill={c.handle} />
            {row === 0 && col === (side === "l" ? 1 : 0) ? <circle cx={dx + 40} cy={dy + 38} r="13" fill={c.orange} /> : null}
          </g>
        );
      })}
      <rect x={x0 + 70} y="1012" width="70" height="22" rx="11" fill={c.wheel} className="wbr-foot" />
      <rect x={x0 + 320} y="1012" width="70" height="22" rx="11" fill={c.wheel} className="wbr-foot" />
    </g>
  );
}

export function WisboxRobot({
  role,
  pose = "rest",
  className = "",
  wide = false,
  button,
  buttonClassName = "",
  buttonTabIndex,
}: {
  /** Which page behaviour drives this robot: hero, flow, faq or invite. */
  role: string;
  pose?: RobotPose;
  className?: string;
  /** Welcome scene: wider canvas plus side locker modules for the unfold. */
  wide?: boolean;
  /** When set, the robot is wrapped in a real button with this accessible name (clicks play a scene). */
  button?: string;
  buttonClassName?: string;
  buttonTabIndex?: number;
}) {
  const svg = (
    <svg
      viewBox={wide ? "-260 -20 1852 1200" : "-110 30 1552 1120"}
      className={`wbr ${className}`}
      data-robot={role}
      data-pose={pose}
      data-rest={pose}
      aria-hidden="true"
      focusable="false"
    >
      {/* move: short horizontal travel of the whole robot (shadow included) */}
      <g className="wbr-move">
      {/* ground shadow reacts to lifts and leans */}
      <g transform="translate(666 1085)">
        <g className="wbr-shadow">
          <ellipse rx="432" ry="46" fill={c.shadow} />
        </g>
      </g>
      {/* nesting: lift (vertical) > lean (pointer/idle) > fig (performance tilt) > squash (slight body give) */}
      <g className="wbr-lift">
        <g transform="translate(666 1040)">
          <g className="wbr-lean">
            <circle r="1200" fill="none" />
            <g className="wbr-fig">
              <circle r="1200" fill="none" />
              <g className="wbr-squash">
                <circle r="1200" fill="none" />
                <g transform="translate(-666 -1040)">
                  {/* antenna pivots at its base */}
                  <g transform="translate(668 222)">
                    <g className="wbr-antenna">
                      <circle r="200" fill="none" />
                      <g transform="translate(-668 -222)">
                        <rect className="wbr-stem" x="661" y="132" width="14" height="92" rx="7" fill={c.arm} />
                        <circle className="wbr-ant" cx="668" cy="101" r="35" fill={c.orange} />
                        <circle cx="679" cy="90" r="9" fill="#fff" opacity="0.45" />
                      </g>
                    </g>
                  </g>

                  {/* thought bubble with a question mark (FAQ scenes) */}
                  <g transform="translate(1040 110)">
                  <g className="wbr-q">
                    <circle r="112" fill="#fff" stroke={c.bodyStroke} strokeWidth="9" />
                    <circle cx="-100" cy="108" r="22" fill="#fff" stroke={c.bodyStroke} strokeWidth="7" />
                    <text y="50" textAnchor="middle" fontSize="150" fontWeight="800" fill={c.orange} fontFamily="'Helvetica Neue',Arial,sans-serif">?</text>
                  </g>
                  </g>

                  <Arm side="l" />
                  <Arm side="r" />

                  {wide ? (
                    <>
                      <Module side="l" />
                      <Module side="r" />
                    </>
                  ) : null}

                  {/* wheels */}
                  <g className="wbr-wheels">
                    {[463, 870].map((cx) => (
                      <g key={cx} className={`wbr-wheel-g wbr-wheel-${cx === 463 ? "l" : "r"}`}>
                        <circle className="wbr-wheel" cx={cx} cy="1040" r="61" fill={c.wheel} />
                        <path d={`M${cx} 998 V1082 M${cx - 42} 1040 H${cx + 42}`} stroke="#4a505d" strokeWidth="9" strokeLinecap="round" />
                        <circle cx={cx} cy="1040" r="25" fill={c.hub} />
                      </g>
                    ))}
                  </g>

                  {/* body */}
                  <rect x="285" y="219" width="762" height="804" rx="74" fill={c.body} stroke={c.bodyStroke} strokeWidth="10" />

                  {/* face: gaze (pointer/idle) > eyes (performance look) */}
                  <g className="wbr-face">
                    <rect x="387" y="266" width="558" height="188" rx="94" fill={c.ink} />
                    <g className="wbr-gaze">
                      <g className="wbr-eyes">
                        <g className="wbr-eyeballs">
                          <g className="wbr-eye wbr-eye-l">
                            <circle cx="570" cy="360" r="60" fill={c.eye} />
                            <circle className="wbr-hl" cx="590" cy="337" r="20" fill="#fff" />
                            <circle cx="550" cy="384" r="8" fill="#fff" opacity="0.7" />
                          </g>
                          <g className="wbr-eye wbr-eye-r">
                            <circle cx="763" cy="360" r="60" fill={c.eye} />
                            <circle className="wbr-hl" cx="783" cy="337" r="20" fill="#fff" />
                            <circle cx="743" cy="384" r="8" fill="#fff" opacity="0.7" />
                          </g>
                        </g>
                        <g className="wbr-happy" fill="none" stroke={c.eye} strokeWidth="22" strokeLinecap="round">
                          <path d="M522 378 Q570 316 618 378" />
                          <path d="M715 378 Q763 316 811 378" />
                        </g>
                      </g>
                    </g>
                  </g>

                  {/* WISBOX panel */}
                  <rect x="347" y="513" width="303" height="372" rx="30" fill={c.panel} />
                  <rect x="366" y="532" width="266" height="334" rx="22" fill={c.panelInner} />
                  <rect x="366" y="532" width="266" height="81" rx="22" fill={c.orange} />
                  <rect x="366" y="580" width="266" height="33" fill={c.orange} />
                  <text
                    x="499"
                    y="589"
                    textAnchor="middle"
                    fontSize="44"
                    fontWeight="800"
                    letterSpacing="4"
                    fill="#fff"
                    fontFamily="'Hiragino Sans','Noto Sans JP','Helvetica Neue',Arial,sans-serif"
                  >
                    WISBOX
                  </text>
                  {[630, 709, 789].map((y) => (
                    <rect key={y} className="wbr-row" x="383" y={y} width="233" height="60" rx="14" fill={c.row} stroke={c.rowStroke} strokeWidth="4" />
                  ))}

                  {/* locker: frame, cavity, parcel (moved by script), door on its hinge */}
                  <rect x="688" y="508" width="302" height="382" rx="30" fill={c.frame} stroke={c.frameStroke} strokeWidth="6" />
                  <rect className="wbr-cavity" x="716" y="536" width="246" height="326" rx="20" fill={c.cavity} />
                  <rect x="732" y="742" width="214" height="8" rx="4" fill="#3b444f" />
                  <Parcel x={786} y={652} className="wbr-parcel" />
                  <g className="wbr-door">
                    <rect x="716" y="536" width="246" height="326" rx="20" fill={c.door} stroke={c.doorStroke} strokeWidth="5" />
                    <circle cx="825" cy="609" r="19" fill={c.orange} />
                    <rect x="763" y="656" width="123" height="16" rx="8" fill={c.line} />
                    <rect x="763" y="692" width="87" height="16" rx="8" fill="#dcdbd8" />
                    <rect x="916" y="646" width="25" height="106" rx="12" fill={c.handle} />
                    <rect className="wbr-door-shade" x="716" y="536" width="246" height="326" rx="20" fill="#1c232b" opacity="0" />
                  </g>
                  <rect x="697" y="568" width="18" height="58" rx="8" fill={c.hinge} />
                  <rect x="697" y="772" width="18" height="58" rx="8" fill={c.hinge} />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
      </g>
    </svg>
  );
  if (!button) return svg;
  return (
    <button
      type="button"
      data-robot-button={role}
      aria-label={button}
      tabIndex={buttonTabIndex}
      className={`wbr-button ${buttonClassName}`}
    >
      {svg}
    </button>
  );
}
