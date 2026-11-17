/* WISBOX guide robot behaviour. Plain JS so the same file runs in the app and in the single-file HTML.
 *
 * Each action is staged: the eyes notice the target, the body leans, the arm acts, and the antenna and
 * shadow follow a beat later before everything settles. Parts are separate SVG groups, so their motions
 * never overwrite each other: lift > lean > fig > squash for the body, gaze > eyes for the eyes, shoulder >
 * elbow for each arm, the door rotates on its hinge.
 *
 * Motion uses the Web Animations API. Each animation commits its end state as an inline style, and a new
 * action starts from wherever the robot currently is, so interruptions blend instead of jumping.
 * Reduced motion: no performances or idle motion; the robot switches between static CSS poses.
 *
 * Every visible robot is wrapped in a real <button data-robot-button>. A press plays one short scene for
 * that place (notice -> eyes -> body -> arm -> follow-through -> settle). One robot performs at a time;
 * a press while a scene is playing only gets a glance, never a queue. */
(function () {
  if (window.WBR) return;

  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var canAnimate = typeof Element !== "undefined" && !!Element.prototype.animate;
  function reduced() {
    return !canAnimate || !!(mq && mq.matches);
  }

  var E = {
    out: "cubic-bezier(.2,.8,.2,1)",
    inOut: "cubic-bezier(.45,0,.25,1)",
    back: "cubic-bezier(.3,1.35,.5,1)",
    soft: "cubic-bezier(.25,.1,.25,1)",
  };
  var deg = function (n) {
    return "rotate(" + n + "deg)";
  };
  var tr = function (x, y) {
    return "translate(" + x + "px," + y + "px)";
  };
  var PARCEL = { cavity: tr(0, 0), depositHand: tr(450, -80), pickupHand: tr(523, -260) };

  var robots = [];

  function make(svg) {
    var q = function (s) {
      return svg.querySelector(s);
    };
    var rest = svg.getAttribute("data-rest") || "rest";
    var side = rest === "point-l" ? "l" : rest === "point-r" ? "r" : null;
    var r = {
      svg: svg,
      role: svg.getAttribute("data-robot"),
      side: side,
      p: {
        lift: q(".wbr-lift"), lean: q(".wbr-lean"), fig: q(".wbr-fig"), squash: q(".wbr-squash"),
        shadow: q(".wbr-shadow"), ant: q(".wbr-antenna"), antBall: q(".wbr-ant"),
        face: q(".wbr-face"), gaze: q(".wbr-gaze"), eyes: q(".wbr-eyes"), balls: q(".wbr-eyeballs"),
        happy: q(".wbr-happy"), eyeL: q(".wbr-eye-l"), eyeR: q(".wbr-eye-r"),
        shL: q(".wbr-sh-l"), elL: q(".wbr-el-l"), shR: q(".wbr-sh-r"), elR: q(".wbr-el-r"),
        door: q(".wbr-door"), shade: q(".wbr-door-shade"), parcel: q(".wbr-parcel"),
        wheels: q(".wbr-wheels"), cavity: q(".wbr-cavity"),
        move: q(".wbr-move"), wheelL: q(".wbr-wheel-l"), wheelR: q(".wbr-wheel-r"),
        env: q(".wbr-env"), qm: q(".wbr-q"),
      },
      rows: Array.prototype.slice.call(svg.querySelectorAll(".wbr-row")),
      loops: [],
      turn: 0,
      wheelDeg: 0,
      k: 1,
      anims: [],
      fx: [],
      timers: [],
      busy: false,
      visible: false,
      watching: false,
    };
    /* resting values each performance returns to */
    r.idle = {
      shL: deg(-62), elL: deg(-18), shR: deg(-50), elR: deg(-38), face: tr(0, 0),
    };
    if (side === "l") {
      r.idle.shL = deg(-8);
      r.idle.elL = deg(-8);
      r.idle.face = tr(-8, 0);
    }
    if (rest === "present") {
      r.idle.shR = deg(-4);
      r.idle.elR = deg(-14);
      r.idle.shL = deg(-52);
    }
    if (side === "r") {
      r.idle.shR = deg(-8);
      r.idle.elR = deg(-8);
      r.idle.face = tr(8, 0);
    }
    return r;
  }

  /* ---------- animation plumbing ---------- */
  function to(r, el, frames, dur, delay, easing) {
    if (!el) return null;
    if (!Array.isArray(frames)) frames = [frames];
    var k = r.k || 1;
    var a = el.animate(frames, { duration: dur * k, delay: (delay || 0) * k, easing: easing || E.out, fill: "forwards" });
    r.anims.push(a);
    a.onfinish = function () {
      try {
        a.commitStyles();
      } catch (e) {}
      a.cancel();
      var i = r.anims.indexOf(a);
      if (i >= 0) r.anims.splice(i, 1);
    };
    if (!r.visible || document.hidden) a.pause();
    return a;
  }
  /* Transient beats (blink, sway, hop, nod) end where they started, so they are never committed:
   * an interruption cannot leave an eye half shut or the body in mid-air. */
  function fx(r, el, frames, dur, delay, easing, iterations) {
    if (!el) return null;
    var k = r.k || 1;
    var a = el.animate(frames, { duration: dur * k, delay: (delay || 0) * k, easing: easing || E.soft, iterations: iterations || 1 });
    r.fx.push(a);
    a.onfinish = a.oncancel = function () {
      var i = r.fx.indexOf(a);
      if (i >= 0) r.fx.splice(i, 1);
    };
    if (!r.visible || document.hidden) a.pause();
    return a;
  }
  function later(r, fn, ms) {
    r.timers.push(setTimeout(fn, ms * (r.k || 1)));
  }
  /* endless cycles (running): tracked separately so a scene change can end them cleanly */
  function loop(r, el, frames, dur, delay, easing) {
    var a = fx(r, el, frames, dur, delay, easing || "linear", Infinity);
    if (a) r.loops.push(a);
    return a;
  }
  function stopLoops(r) {
    r.loops.forEach(function (a) {
      a.cancel();
    });
    r.loops = [];
  }
  /* Interrupt: freeze every part where it is, so the next action continues from there. */
  function stop(r) {
    r.timers.forEach(clearTimeout);
    r.timers = [];
    r.anims.slice().forEach(function (a) {
      try {
        a.commitStyles();
      } catch (e) {}
      a.cancel();
    });
    r.anims = [];
  }
  function begin(r, total) {
    stop(r);
    stopLoops(r);
    claim(r);
    r.busy = true;
    r.sceneStart = Date.now();
    r.sceneDur = total * (r.k || 1);
    r.watching = false;
    r.p.gaze.style.transform = "";
    r.p.lean.style.transform = "";
    calm(r);
    later(r, function () {
      r.busy = false;
      r.lastEnd = Date.now();
    }, total);
  }
  function calm(r) {
    to(r, r.p.balls, { opacity: 1 }, 120, 0);
    to(r, r.p.happy, { opacity: 0 }, 120, 0);
    to(r, r.p.antBall, { fill: "#df7914" }, 200, 0);
  }

  /* small reusable beats */
  function happy(r, on, delay) {
    to(r, r.p.balls, { opacity: on ? 0 : 1 }, 140, delay);
    to(r, r.p.happy, { opacity: on ? 1 : 0 }, 180, delay);
  }
  function antennaSway(r, delay, amp) {
    amp = amp || 7;
    fx(r, r.p.ant, [{ transform: deg(0) }, { transform: deg(amp) }, { transform: deg(-amp * 0.55) }, { transform: deg(amp * 0.22) }, { transform: deg(0) }], 820, delay, E.soft);
  }
  function blink(r, oneEye, delay) {
    var eyes = oneEye ? [r.p.eyeR] : [r.p.eyeL, r.p.eyeR];
    eyes.forEach(function (eye) {
      fx(r, eye, [{ transform: "scaleY(1)" }, { transform: "scaleY(.08)", offset: 0.45 }, { transform: "scaleY(1)" }], 170, delay || 0, E.inOut);
    });
  }
  function nod(r, delay, depth) {
    fx(r, r.p.lift, [{ transform: tr(0, 0) }, { transform: tr(0, depth || 14), offset: 0.42 }, { transform: tr(0, 0) }], 480, delay, E.inOut);
  }
  function hop(r, delay, height) {
    var h = -(height || 26);
    fx(r, r.p.squash, [{ transform: "scale(1,1)" }, { transform: "scale(1.03,.96)", offset: 0.22 }, { transform: "scale(.985,1.025)", offset: 0.5 }, { transform: "scale(1.02,.98)", offset: 0.82 }, { transform: "scale(1,1)" }], 720, delay, E.soft);
    fx(r, r.p.lift, [{ transform: tr(0, 0) }, { transform: tr(0, 3), offset: 0.2 }, { transform: tr(0, h), offset: 0.5 }, { transform: tr(0, 2), offset: 0.82 }, { transform: tr(0, 0) }], 720, delay, E.soft);
    fx(r, r.p.shadow, [{ transform: "scale(1,1)", opacity: 1 }, { transform: "scale(1.03,1)", offset: 0.2 }, { transform: "scale(.86,.9)", opacity: 0.75, offset: 0.5 }, { transform: "scale(1.03,1)", opacity: 1, offset: 0.82 }, { transform: "scale(1,1)", opacity: 1 }], 720, delay, E.soft);
  }
  function armsHome(r, delay) {
    to(r, r.p.shL, { transform: r.idle.shL }, 560, delay, E.back);
    to(r, r.p.elL, { transform: r.idle.elL }, 520, (delay || 0) + 70, E.back);
    to(r, r.p.shR, { transform: r.idle.shR }, 560, delay, E.back);
    to(r, r.p.elR, { transform: r.idle.elR }, 520, (delay || 0) + 70, E.back);
  }
  function bodyHome(r, delay) {
    to(r, r.p.fig, { transform: deg(0) }, 560, delay, E.back);
    to(r, r.p.squash, { transform: "scale(1,1)" }, 400, delay, E.out);
    to(r, r.p.shadow, { transform: "scale(1,1)", opacity: 1 }, 400, delay, E.out);
  }
  function eyesHome(r, delay) {
    to(r, r.p.eyes, { transform: tr(0, 0) }, 340, delay, E.out);
  }

  /* ---------- shared scene pieces ---------- */
  /* one performer at a time: anyone else mid-scene settles back home */
  function claim(r) {
    robots.forEach(function (o) {
      if (o !== r && o.busy && o.role !== "welcome" && o.role !== "form") settle(o);
    });
  }
  function settle(r) {
    stop(r);
    stopLoops(r);
    r.k = 1;
    home(r, 0);
    later(r, function () {
      r.busy = false;
      r.lastEnd = Date.now();
    }, 600);
  }
  /* everything back to the resting stance of this robot */
  function home(r, delay) {
    var p = r.p;
    armsHome(r, delay);
    bodyHome(r, delay);
    eyesHome(r, delay);
    happy(r, false, delay);
    to(r, p.face, { transform: r.idle.face }, 420, delay, E.inOut);
    to(r, p.move, { transform: tr(0, 0) }, 520, delay, E.inOut);
    to(r, p.door, { transform: "scale(1,1)" }, 420, delay, E.inOut);
    to(r, p.shade, { opacity: 0 }, 300, delay, E.out);
    to(r, p.parcel, { opacity: 0 }, 220, delay, E.out);
    to(r, p.env, { opacity: 0, transform: "scale(1)" }, 220, delay, E.out);
    to(r, p.qm, { opacity: 0, transform: "scale(.6)" }, 220, delay, E.out);
    to(r, p.antBall, { fill: "#df7914" }, 260, delay, E.out);
  }
  /* a press while busy: a glance and a blink, nothing queued */
  function nudge(r) {
    blink(r, false, 0);
    fx(r, r.p.gaze, [{ transform: tr(0, 0) }, { transform: tr(10, -4), offset: 0.4 }, { transform: tr(0, 0) }], 520, 0, E.inOut);
  }
  /* wheels roll by a number of turns (sign = direction), with the shadow following the body */
  function roll(r, turns, dur, delay, easing) {
    r.wheelDeg += turns * 360;
    to(r, r.p.wheelL, { transform: deg(r.wheelDeg) }, dur, delay, easing || E.inOut);
    to(r, r.p.wheelR, { transform: deg(r.wheelDeg) }, dur, delay, easing || E.inOut);
  }
  /* short slide of the whole robot: lean into the move, roll, brake with a little overshoot */
  function slide(r, dx, dur, delay, keepArms) {
    var dir = dx < 0 ? -1 : 1;
    to(r, r.p.fig, { transform: deg(dir * 4) }, 260, delay, E.out);                    // leans into the move
    to(r, r.p.move, { transform: tr(dx, 0) }, dur, delay + 60, E.inOut);
    roll(r, (dx / 380), dur, delay + 60);
    if (!keepArms) {
      fx(r, r.p.shL, [{ transform: r.idle.shL }, { transform: deg(-30) }, { transform: r.idle.shL }], dur, delay + 60, E.inOut);
      fx(r, r.p.shR, [{ transform: r.idle.shR }, { transform: deg(-78) }, { transform: r.idle.shR }], dur, delay + 60, E.inOut);
    }
    to(r, r.p.fig, [{ transform: deg(dir * 4) }, { transform: deg(-dir * 3), offset: 0.45 }, { transform: deg(0) }], 520, delay + dur - 40, E.inOut); // brakes, rocks back
    to(r, r.p.ant, [{ transform: deg(-dir * 10) }, { transform: deg(dir * 8) }, { transform: deg(-dir * 3) }, { transform: deg(0) }], 760, delay + dur, E.soft); // antenna catches up last
  }
  /* running in place (form scenes): forward lean, wheels, alternating arms, a light bob, trailing antenna */
  function runLoop(r, dir) {
    dir = dir || 1;
    to(r, r.p.fig, { transform: deg(dir * 5) }, 260, 0, E.out);
    to(r, r.p.elL, { transform: deg(40) }, 260, 0, E.out);
    loop(r, r.p.wheelL, [{ transform: deg(r.wheelDeg) }, { transform: deg(r.wheelDeg + dir * 360) }], 420, 0);
    loop(r, r.p.wheelR, [{ transform: deg(r.wheelDeg) }, { transform: deg(r.wheelDeg + dir * 360) }], 420, 0);
    loop(r, r.p.shL, [{ transform: deg(-78) }, { transform: deg(-28) }, { transform: deg(-78) }], 520, 0, E.inOut);
    loop(r, r.p.lift, [{ transform: tr(0, 0) }, { transform: tr(0, -10) }, { transform: tr(0, 0) }], 260, 0, E.inOut);
    loop(r, r.p.ant, [{ transform: deg(-dir * 12) }, { transform: deg(-dir * 4) }, { transform: deg(-dir * 12) }], 520, 0, E.inOut);
    loop(r, r.p.shadow, [{ transform: "scale(1,1)" }, { transform: "scale(.94,.92)" }, { transform: "scale(1,1)" }], 260, 0, E.inOut);
  }
  function stopRun(r) {
    stopLoops(r);
    roll(r, 0.35, 520, 0, E.out);                                                          // wheels coast to a stop
    to(r, r.p.fig, [{ transform: deg(5) }, { transform: deg(-3), offset: 0.5 }, { transform: deg(0) }], 560, 0, E.inOut);
    to(r, r.p.ant, [{ transform: deg(-10) }, { transform: deg(8) }, { transform: deg(-3) }, { transform: deg(0) }], 720, 80, E.soft);
    to(r, r.p.elL, { transform: r.idle.elL }, 420, 0, E.back);
    to(r, r.p.shL, { transform: r.idle.shL }, 420, 0, E.back);
  }
  function wave(r, delay, times) {
    to(r, r.p.shR, { transform: deg(20) }, 380, delay, E.back);
    to(r, r.p.elR, { transform: deg(62) }, 360, delay + 70, E.back);
    var f = [{ transform: deg(62) }];
    for (var i = 0; i < (times || 2); i++) f.push({ transform: deg(30) }, { transform: deg(68) });
    to(r, r.p.elR, f, 380 * (times || 2), delay + 440, E.inOut);
  }
  function door(r, open, delay) {
    if (open) {
      to(r, r.p.door, { transform: "scale(.2,1.03)" }, 480, delay, E.out);
      to(r, r.p.shade, { opacity: 0.3 }, 480, delay, E.out);
    } else {
      to(r, r.p.door, [{ transform: "scale(.2,1.03)" }, { transform: "scale(1.04,1)", offset: 0.72 }, { transform: "scale(1,1)" }], 440, delay, E.inOut);
      to(r, r.p.shade, { opacity: 0 }, 340, delay, E.out);
    }
  }
  function popIn(r, el, delay) {
    to(r, el, [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "scale(1.12)", offset: 0.65 }, { opacity: 1, transform: "scale(1)" }], 360, delay, E.out);
  }

  /* ---------- hero (user page): first-view greeting, then three rotating responses ---------- */
  function heroWelcome(r) {
    begin(r, 2700);
    to(r, r.p.eyes, { transform: tr(12, -4) }, 260, 0);
    to(r, r.p.fig, { transform: deg(2.5) }, 420, 180, E.inOut);
    wave(r, 420, 2);
    armsHome(r, 1800);
    bodyHome(r, 1850);
    eyesHome(r, 2050);
    antennaSway(r, 2000, 8);
  }
  /* 1: notices you, leans in, waves, a happy blink */
  function heroGreet(r, gx, gy) {
    begin(r, 2100);
    to(r, r.p.eyes, { transform: tr(gx, gy) }, 200, 0);                                  // eyes first
    to(r, r.p.fig, { transform: deg(gx > 0 ? 3 : -3) }, 380, 160, E.inOut);              // body follows
    to(r, r.p.squash, { transform: "scale(1.012,.985)" }, 360, 160, E.inOut);
    wave(r, 300, 2);                                                                        // then the arm
    antennaSway(r, 520, 7);                                                                 // antenna lags
    happy(r, true, 1340);
    blink(r, true, 1500);
    armsHome(r, 1500);
    bodyHome(r, 1540);
    eyesHome(r, 1600);
    happy(r, false, 1950);
  }
  /* 2: rolls a short way, brakes, looks back at you and invites with the hand */
  function heroSlide(r) {
    var dx = -150;
    begin(r, 2450);
    to(r, r.p.eyes, { transform: tr(-26, 2) }, 200, 0);                                    // looks where it is going
    slide(r, dx, 620, 140);
    to(r, r.p.eyes, { transform: tr(18, 2) }, 260, 860, E.out);                             // looks back at you
    to(r, r.p.face, { transform: tr(14, 0) }, 340, 900, E.inOut);
    to(r, r.p.shR, { transform: deg(10) }, 420, 980, E.back);                               // "this way"
    to(r, r.p.elR, { transform: deg(-6) }, 400, 1040, E.back);
    happy(r, true, 1080);
    happy(r, false, 1650);
    armsHome(r, 1560);
    to(r, r.p.face, { transform: r.idle.face }, 380, 1600, E.inOut);
    to(r, r.p.move, { transform: tr(0, 0) }, 640, 1680, E.inOut);                          // rolls back home
    roll(r, 150 / 380, 640, 1680);
    eyesHome(r, 1720);
    to(r, r.p.fig, [{ transform: deg(2) }, { transform: deg(-1.5), offset: 0.6 }, { transform: deg(0) }], 520, 1880, E.inOut);
  }
  /* 3: opens its own door, shows a parcel, puts it back, closes, nods */
  function heroParcel(r) {
    begin(r, 2500);
    to(r, r.p.eyes, { transform: tr(30, 16) }, 220, 0);                                    // glances at its door
    to(r, r.p.fig, { transform: deg(2) }, 380, 120, E.inOut);
    door(r, true, 260);
    to(r, r.p.parcel, [{ transform: PARCEL.cavity, opacity: 0 }, { transform: PARCEL.cavity, opacity: 1 }], 160, 520);
    to(r, r.p.shR, { transform: deg(2) }, 440, 540, E.back);                                // reaches in
    to(r, r.p.elR, { transform: deg(-6) }, 420, 600, E.back);
    to(r, r.p.parcel, [{ transform: PARCEL.cavity }, { transform: tr(180, -190), offset: 0.55 }, { transform: tr(300, -230) }], 520, 760, E.inOut); // shows it
    to(r, r.p.eyes, { transform: tr(10, -2) }, 300, 900, E.out);                             // "look"
    happy(r, true, 1000);
    to(r, r.p.parcel, [{ transform: tr(300, -230) }, { transform: tr(150, -160), offset: 0.45 }, { transform: PARCEL.cavity }], 460, 1380, E.inOut); // back in
    happy(r, false, 1420);
    armsHome(r, 1500);
    door(r, false, 1760);
    to(r, r.p.parcel, { opacity: 0 }, 120, 2100);
    bodyHome(r, 1800);
    eyesHome(r, 1820);
    happy(r, true, 2000);
    nod(r, 2000, 12);
    antennaSway(r, 2120, 6);
    happy(r, false, 2400);
  }

  /* ---------- flow: deposit / pickup stories (illustration only) ---------- */
  function flowDeposit(r) {
    r.k = 0.8;
    begin(r, 3100);
    to(r, r.p.eyes, { transform: tr(30, 16) }, 240, 0);
    to(r, r.p.fig, { transform: deg(2.5) }, 420, 120, E.inOut);
    to(r, r.p.shR, { transform: deg(-25) }, 480, 260, E.back);
    to(r, r.p.elR, { transform: deg(-22) }, 460, 330, E.back);
    to(r, r.p.parcel, [{ transform: PARCEL.depositHand, opacity: 0 }, { transform: PARCEL.depositHand, opacity: 1 }], 220, 380);
    door(r, true, 620);
    to(r, r.p.parcel, [{ transform: PARCEL.depositHand }, { transform: tr(230, -150), offset: 0.45 }, { transform: PARCEL.cavity }], 640, 1060, E.inOut);
    to(r, r.p.shR, { transform: deg(-40) }, 520, 1060, E.inOut);
    to(r, r.p.elR, { transform: deg(-30) }, 520, 1100, E.inOut);
    door(r, false, 1760);
    armsHome(r, 1900);
    bodyHome(r, 1950);
    eyesHome(r, 2050);
    happy(r, true, 2150);
    nod(r, 2180);
    antennaSway(r, 2330, 6);
    happy(r, false, 2900);
    later(r, function () {
      r.k = 1;
    }, 3100);
  }
  function flowPickup(r) {
    r.k = 0.8;
    begin(r, 3150);
    to(r, r.p.parcel, [{ transform: PARCEL.cavity, opacity: 0 }, { transform: PARCEL.cavity, opacity: 1 }], 120, 0);
    to(r, r.p.eyes, { transform: tr(30, 16) }, 240, 0);
    to(r, r.p.fig, { transform: deg(2.5) }, 420, 120, E.inOut);
    door(r, true, 320);
    to(r, r.p.shR, { transform: deg(2) }, 520, 640, E.back);
    to(r, r.p.elR, { transform: deg(-6) }, 500, 720, E.back);
    to(r, r.p.parcel, [{ transform: PARCEL.cavity }, { transform: tr(260, -200), offset: 0.5 }, { transform: PARCEL.pickupHand }], 660, 840, E.inOut);
    to(r, r.p.eyes, { transform: tr(40, -6) }, 420, 860, E.out);
    to(r, r.p.shR, { transform: deg(9) }, 300, 1540, E.out);
    to(r, r.p.parcel, { transform: tr(600, -282), opacity: 0 }, 420, 1600, E.soft);
    happy(r, true, 1580);
    door(r, false, 1780);
    armsHome(r, 1850);
    bodyHome(r, 1880);
    eyesHome(r, 1950);
    wave(r, 2000, 1);
    armsHome(r, 2750);
    antennaSway(r, 2350, 7);
    happy(r, false, 2950);
    later(r, function () {
      r.k = 1;
    }, 3150);
  }

  /* ---------- FAQ ---------- */
  function towards(r, el, ax, ay) {
    var rb = r.svg.getBoundingClientRect();
    var db = el.getBoundingClientRect();
    var dx = db.left + Math.min(db.width, 320) / 2 - (rb.left + rb.width / 2);
    var dy = db.top + 24 - (rb.top + rb.height * 0.3);
    var d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    return { x: Math.round((dx / d) * (ax || 28)), y: Math.round((dy / d) * (ay || 16)), right: dx > Math.abs(dy) * 0.6 };
  }
  /* opening a question: a light glance and a nod, never the full scene */
  function faqLight(r, details) {
    if (r.busy) {
      var g0 = towards(r, details);
      fx(r, r.p.gaze, [{ transform: tr(0, 0) }, { transform: tr(g0.x * 0.5, g0.y * 0.5), offset: 0.4 }, { transform: tr(0, 0) }], 600, 0, E.inOut);
      return;
    }
    var g = towards(r, details);
    begin(r, 1100);
    to(r, r.p.eyes, { transform: tr(g.x, g.y) }, 220, 0);
    to(r, r.p.fig, { transform: deg(-2) }, 380, 120, E.inOut);
    nod(r, 520, 10);
    antennaSway(r, 600, 4);
    eyesHome(r, 820);
    bodyHome(r, 820);
  }
  /* 1: tilts and thinks (antenna turns blue), then gets it and nods */
  function faqThink(r) {
    begin(r, 2150);
    to(r, r.p.eyes, { transform: tr(-14, -16) }, 260, 0);
    to(r, r.p.fig, { transform: deg(-5) }, 460, 140, E.inOut);
    to(r, r.p.shadow, { transform: "translateX(-10px)" }, 460, 140, E.inOut);
    to(r, r.p.shR, { transform: deg(30) }, 480, 240, E.back);                               // hand to the head
    to(r, r.p.elR, { transform: deg(80) }, 460, 310, E.back);
    to(r, r.p.antBall, { fill: "#7ed1fd" }, 320, 360, E.out);
    fx(r, r.p.ant, [{ transform: deg(0) }, { transform: deg(-9) }, { transform: deg(6) }, { transform: deg(-4) }, { transform: deg(0) }], 900, 420, E.soft);
    to(r, r.p.eyes, { transform: tr(-22, -18) }, 380, 760, E.inOut);
    to(r, r.p.antBall, { fill: "#df7914" }, 260, 1300, E.out);                              // got it
    happy(r, true, 1300);
    nod(r, 1340, 14);
    to(r, r.p.fig, { transform: deg(0) }, 520, 1400, E.back);
    to(r, r.p.shadow, { transform: "translateX(0px)" }, 480, 1400, E.out);
    armsHome(r, 1440);
    eyesHome(r, 1500);
    happy(r, false, 1950);
  }
  /* 2: looks at the question list, points to it, looks back at you */
  function faqPoint(r) {
    var list = document.querySelector('[data-robot-zone="faq"]');
    var g = list ? towards(r, list) : { x: 26, y: 6, right: true };
    begin(r, 2100);
    to(r, r.p.eyes, { transform: tr(g.x, g.y) }, 220, 0);
    to(r, r.p.fig, { transform: deg(2.5) }, 400, 140, E.inOut);
    to(r, r.p.shR, { transform: deg(g.right ? 8 : -22) }, 460, 260, E.back);
    to(r, r.p.elR, { transform: deg(g.right ? -6 : -12) }, 440, 330, E.back);
    fx(r, r.p.elR, [{ transform: deg(g.right ? -6 : -12) }, { transform: deg(g.right ? -16 : -22), offset: 0.5 }, { transform: deg(g.right ? -6 : -12) }], 420, 780, E.inOut); // little emphasis
    antennaSway(r, 520, 5);
    to(r, r.p.eyes, { transform: tr(0, 2) }, 320, 1150, E.inOut);                         // back to you
    happy(r, true, 1260);
    blink(r, false, 1300);
    armsHome(r, 1500);
    bodyHome(r, 1520);
    eyesHome(r, 1600);
    happy(r, false, 1900);
  }
  /* 3: a question mark pops up, it thinks, the mark goes and it confirms */
  function faqQuestion(r) {
    begin(r, 2250);
    popIn(r, r.p.qm, 120);
    to(r, r.p.eyes, { transform: tr(20, -18) }, 280, 200, E.out);                           // looks up at it
    to(r, r.p.fig, { transform: deg(-3) }, 440, 300, E.inOut);
    fx(r, r.p.qm, [{ transform: "scale(1) rotate(0deg)" }, { transform: "scale(1) rotate(-8deg)" }, { transform: "scale(1) rotate(6deg)" }, { transform: "scale(1) rotate(0deg)" }], 640, 520, E.inOut);
    antennaSway(r, 620, 6);
    to(r, r.p.qm, { opacity: 0, transform: "scale(.5) translateY(-30px)" }, 320, 1180, E.out); // it is gone
    to(r, r.p.eyes, { transform: tr(0, 0) }, 260, 1200, E.out);
    happy(r, true, 1260);
    to(r, r.p.fig, { transform: deg(0) }, 420, 1260, E.back);
    to(r, r.p.shR, { transform: deg(20) }, 380, 1300, E.back);                               // "OK"
    to(r, r.p.elR, { transform: deg(65) }, 360, 1360, E.back);
    nod(r, 1420, 10);
    armsHome(r, 1820);
    happy(r, false, 2050);
  }

  /* ---------- contact (user page): picks up an envelope, rolls to the button, opens the form ---------- */
  function inviteArm(r) {
    return r.side === "l" ? [r.p.shL, r.p.elL] : [r.p.shR, r.p.elR];
  }
  function inviteIntro(r) {
    var dir = r.side === "l" ? -1 : 1;
    var arm = inviteArm(r);
    begin(r, 2400);
    to(r, r.p.eyes, { transform: tr(dir * 30, 8) }, 260, 0);
    to(r, r.p.face, { transform: tr(dir * 24, 0) }, 400, 180, E.inOut);
    to(r, r.p.fig, { transform: deg(dir * 2) }, 420, 200, E.inOut);
    to(r, arm[0], { transform: deg(10) }, 500, 320, E.back);
    to(r, arm[1], { transform: deg(-6) }, 480, 390, E.back);
    to(r, r.p.eyes, { transform: tr(0, 0) }, 380, 980, E.inOut);
    to(r, r.p.face, { transform: r.idle.face }, 420, 1000, E.inOut);
    antennaSway(r, 1100, 6);
    to(r, arm[0], { transform: r.side === "l" ? r.idle.shL : r.idle.shR }, 620, 1700, E.inOut);
    to(r, arm[1], { transform: r.side === "l" ? r.idle.elL : r.idle.elR }, 600, 1760, E.inOut);
    to(r, r.p.fig, { transform: deg(0) }, 560, 1700, E.inOut);
  }
  function inviteFocus(r, on) {
    var dir = r.side === "l" ? -1 : 1;
    var arm = inviteArm(r);
    stop(r);
    r.watching = false;
    r.p.gaze.style.transform = "";
    if (on) {
      r.busy = true;
      to(r, r.p.eyes, { transform: tr(dir * 32, 8) }, 200, 0);
      to(r, r.p.face, { transform: tr(dir * 24, 0) }, 320, 60, E.inOut);
      to(r, r.p.fig, { transform: deg(dir * 2.5) }, 360, 80, E.inOut);
      to(r, arm[0], { transform: deg(14) }, 380, 140, E.back);
      to(r, arm[1], [{ transform: deg(-6) }, { transform: deg(-20), offset: 0.5 }, { transform: deg(-10) }], 540, 200, E.inOut);
      happy(r, true, 220);
      antennaSway(r, 420, 5);
    } else {
      to(r, r.p.eyes, { transform: tr(0, 0) }, 320, 0);
      happy(r, false, 0);
      to(r, r.p.face, { transform: r.idle.face }, 400, 60, E.inOut);
      to(r, r.p.fig, { transform: deg(0) }, 500, 80, E.back);
      to(r, arm[0], { transform: r.side === "l" ? r.idle.shL : r.idle.shR }, 520, 120, E.back);
      to(r, arm[1], { transform: r.side === "l" ? r.idle.elL : r.idle.elR }, 500, 170, E.back);
      antennaSway(r, 320, 4);
      later(r, function () {
        r.busy = false;
      }, 700);
    }
  }
  /* returns the delay (ms) after which the form should open; the scene keeps going behind the dialog */
  function inviteEnvelope(r) {
    var dir = r.side === "l" ? -1 : 1;
    begin(r, 2300);
    to(r, r.p.eyes, { transform: tr(0, 2) }, 180, 0);                                      // looks at you
    blink(r, false, 120);
    to(r, r.p.shR, { transform: deg(4) }, 340, 160, E.back);                                // picks up an envelope
    to(r, r.p.elR, { transform: deg(40) }, 320, 210, E.back);
    popIn(r, r.p.env, 260);
    slide(r, dir * 110, 420, 380, true);                                                     // rolls toward the button
    to(r, r.p.eyes, { transform: tr(dir * 30, 8) }, 220, 520, E.out);
    to(r, r.p.face, { transform: tr(dir * 22, 0) }, 300, 560, E.inOut);
    var arm = inviteArm(r);
    to(r, arm[0], { transform: deg(12) }, 340, 760, E.back);                                 // "please"
    to(r, arm[1], { transform: deg(-8) }, 320, 820, E.back);
    happy(r, true, 820);
    home(r, 1500);                                                                           // back to its spot
    roll(r, -dir * 110 / 380, 520, 1500);
    return 900;
  }

  /* ---------- facility page: introduces the lockers (illustration, no real control) ---------- */
  function facilityRows(r) {
    begin(r, 2250);
    to(r, r.p.eyes, { transform: tr(-22, 18) }, 220, 0);                                     // looks at its own lockers
    to(r, r.p.fig, { transform: deg(-2) }, 380, 140, E.inOut);
    to(r, r.p.shR, { transform: deg(6) }, 440, 240, E.back);                                  // presenting hand
    to(r, r.p.elR, { transform: deg(-10) }, 420, 300, E.back);
    r.rows.forEach(function (row, i) {                                                         // compartments answer in turn
      fx(r, row, [{ fill: "#fefefe" }, { fill: "#fff1dc", offset: 0.35 }, { fill: "#fefefe" }], 520, 420 + i * 170, E.inOut);
    });
    fx(r, r.p.door, [{ transform: "scale(1,1)" }, { transform: "scale(.86,1.01)", offset: 0.4 }, { transform: "scale(1,1)" }], 420, 960, E.inOut);
    to(r, r.p.eyes, { transform: tr(0, 2) }, 300, 1300, E.inOut);                             // checks with you
    happy(r, true, 1360);
    nod(r, 1400, 10);
    antennaSway(r, 1480, 5);
    armsHome(r, 1600);
    bodyHome(r, 1620);
    eyesHome(r, 1700);
    happy(r, false, 2000);
  }
  function facilityCheck(r) {
    begin(r, 2250);
    to(r, r.p.antBall, { fill: "#7ed1fd" }, 240, 0, E.out);                                  // "checking"
    to(r, r.p.eyes, { transform: tr(-24, 10) }, 260, 60, E.inOut);                            // scans left to right
    to(r, r.p.eyes, { transform: tr(26, 12) }, 520, 360, E.inOut);
    to(r, r.p.fig, { transform: deg(2) }, 520, 360, E.inOut);
    r.rows.forEach(function (row) {
      fx(r, row, [{ fill: "#fefefe" }, { fill: "#e9f6fe", offset: 0.3 }, { fill: "#e9f6fe", offset: 0.7 }, { fill: "#fefefe" }], 760, 420, E.inOut);
    });
    to(r, r.p.shade, { opacity: 0.25 }, 300, 760, E.out);                                     // opens a little
    to(r, r.p.door, { transform: "scale(.55,1.02)" }, 300, 760, E.out);
    to(r, r.p.door, { transform: "scale(1,1)" }, 420, 1160, E.back);
    to(r, r.p.shade, { opacity: 0 }, 300, 1160, E.out);
    to(r, r.p.antBall, { fill: "#df7914" }, 260, 1300, E.out);
    to(r, r.p.eyes, { transform: tr(0, 0) }, 280, 1320, E.out);
    happy(r, true, 1360);
    to(r, r.p.shR, { transform: deg(20) }, 360, 1380, E.back);                                 // "all good"
    to(r, r.p.elR, { transform: deg(65) }, 340, 1440, E.back);
    antennaSway(r, 1500, 5);
    armsHome(r, 1860);
    bodyHome(r, 1860);
    happy(r, false, 2100);
  }

  /* ---------- idle life: irregular blinks and glances, never in sync ---------- */
  function idleLoop(r) {
    later_idle(r, 1800 + Math.random() * 4200);
  }
  function later_idle(r, ms) {
    clearTimeout(r.idleT);
    r.idleT = setTimeout(function () {
      if (!r.svg.isConnected) return;
      if (r.visible && !document.hidden && !r.busy && !r.watching) {
        var roll = Math.random();
        if (roll < 0.6) {
          blink(r, false, 0);
          if (roll < 0.12) blink(r, false, 260);
        } else {
          var gx = Math.round(Math.random() * 36 - 18);
          var gy = Math.round(Math.random() * 14 - 8);
          r.p.gaze.style.transform = tr(gx, gy);
          setTimeout(function () {
            if (!r.watching) r.p.gaze.style.transform = "";
          }, 900 + Math.random() * 700);
        }
      }
      later_idle(r, 2600 + Math.random() * 4600);
    }, ms);
  }

  /* ---------- pointer: look at the cursor only when it comes near ---------- */
  var px = 0, py = 0, raf = 0;
  function watch() {
    raf = 0;
    robots.forEach(function (r) {
      if (!r.visible || r.busy) return;
      var b = r.svg.getBoundingClientRect();
      var cx = b.left + b.width / 2, cy = b.top + b.height * 0.32;
      var dx = px - cx, dy = py - cy;
      var d = Math.sqrt(dx * dx + dy * dy);
      var R = Math.max(170, b.width * 1.5);
      if (d < R) {
        var k = Math.min(1, d / (R * 0.5));
        r.watching = true;
        r.p.gaze.style.transform = tr(Math.round((dx / (d || 1)) * 26 * k), Math.round((dy / (d || 1)) * 14 * k));
        r.p.lean.style.transform = deg(Math.max(-2.5, Math.min(2.5, (dx / R) * 3)));
      } else if (r.watching) {
        r.watching = false;
        r.p.gaze.style.transform = "";
        r.p.lean.style.transform = "";
      }
    });
  }
  document.addEventListener(
    "pointermove",
    function (e) {
      if (e.pointerType !== "mouse" || reduced()) return;
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(watch);
    },
    { passive: true }
  );

  /* pause everything off screen or in a background tab */
  function setRunning(r) {
    var run = r.visible && !document.hidden;
    r.anims.concat(r.fx).forEach(function (a) {
      if (run) a.play();
      else a.pause();
    });
  }
  document.addEventListener("visibilitychange", function () {
    robots.forEach(setRunning);
  });

  /* ---------- wiring ---------- */
  function register(svg) {
    if (svg._wbr) return svg._wbr;
    var r = make(svg);
    svg._wbr = r;
    robots.push(r);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          var en = entries[entries.length - 1];
          r.visible = en.isIntersecting;
          setRunning(r);
          if (!r.visible && r.busy && r.role !== "welcome" && r.role !== "form") settle(r); // nothing keeps acting off screen
          if (r.visible && r.onFirstView && en.intersectionRatio >= 0.5) {
            var f = r.onFirstView;
            r.onFirstView = null;
            f();
          }
        },
        { threshold: [0, 0.5] }
      ).observe(svg);
    } else {
      r.visible = true;
    }
    if (!reduced()) idleLoop(r);
    return r;
  }

  /* reduced motion: an instant pose change instead of a scene */
  function flash(r, pose, ms) {
    clearTimeout(r.reduceT);
    r.svg.setAttribute("data-pose", pose);
    r.reduceT = setTimeout(function () {
      r.svg.setAttribute("data-pose", r.svg.getAttribute("data-rest") || "rest");
    }, ms || 1000);
  }

  function initButton(btn) {
    var svg = btn.querySelector("svg[data-robot]");
    if (!svg || btn._wbrInit) return;
    btn._wbrInit = true;
    var r = register(svg);
    var role = r.role;
    if (role === "hero" && !reduced() && !greeted()) {
      r.onFirstView = function () {
        setTimeout(function () {
          if (!r.busy && !welcomeOpen()) heroWelcome(r);
        }, 350);
      };
    }
    /* hover (mouse) and keyboard focus are the main trigger: an instant glance, then one scene.
     * pointerenter/leave fire once for the whole button, so moving inside the robot never restarts it. */
    btn.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") hoverIn(r);
    });
    btn.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") hoverOut(r);
    });
    btn.addEventListener("focus", function () {
      var fv = true;
      try {
        fv = btn.matches(":focus-visible");
      } catch (err) {}
      if (fv) hoverIn(r);
    });
    btn.addEventListener("blur", function () {
      hoverOut(r);
    });
    /* click / tap: the contact robot opens its form at once; the others give one more response */
    btn.addEventListener("click", function () {
      r.onFirstView = null;
      if (role === "welcome") return welcomeTap(r);
      if (role === "invite") return inviteClick(r, btn);
      if (reduced()) return still(r);
      if (r.busy) return nudge(r); // a scene is already playing: a glance, nothing queued
      play(r);
    });
  }

  /* the scene for this place; consecutive plays rotate so the same one never repeats back to back */
  function play(r) {
    var n = r.turn++;
    if (r.role === "hero") [heroGreetFront, heroSlide, heroParcel][n % 3](r);
    else if (r.role === "flow") playFlow(r);
    else if (r.role === "faq") [faqThink, faqPoint, faqQuestion][n % 3](r);
    else if (r.role === "facility") [facilityRows, facilityCheck][n % 2](r);
    else if (r.role === "invite") inviteEnvelope(r); // hover only: never opens the form
  }
  function heroGreetFront(r) {
    heroGreet(r, -8, 4);
  }
  function still(r) {
    if (r.role === "flow") return syncFlow(false);
    flash(r, r.role === "faq" ? "ok" : r.role === "facility" ? "point-r-more" : r.role === "invite" ? "point-l-more" : "joy");
  }
  var COOLDOWN = 900; // after a scene ends, a quick re-entry only gets a glance
  function hoverIn(r) {
    r.hovered = true;
    if (r.role === "welcome") {
      if (!r.tapT || Date.now() - r.tapT > 1500) {
        r.tapT = Date.now();
        welcomeTap(r);
      }
      return;
    }
    if (reduced()) return still(r);
    if (r.busy || (r.lastEnd && Date.now() - r.lastEnd < COOLDOWN)) return nudge(r);
    blink(r, false, 0); // immediate "I see you" before the scene gets going
    play(r);
  }
  /* leaving early: the scene winds down to the resting stance smoothly; near its end, it just finishes */
  function hoverOut(r) {
    r.hovered = false;
    if (r.role === "welcome" || reduced() || !r.busy || !r.sceneStart) return;
    if (Date.now() - r.sceneStart < (r.sceneDur || 0) * 0.55) settle(r);
  }

  /* contact robot: same entry as the form button; the form never waits for the whole scene */
  /* contact robot: a click or tap opens the matching form right away (the hover already played the
   * envelope scene; touch users are never asked to tap twice). Focus returns to this robot on close. */
  function inviteClick(r, btn) {
    var wrap = btn.closest("[data-robot-invite]");
    var formBtn = wrap && wrap.querySelector("[data-inquiry-open]");
    var kind = formBtn ? formBtn.getAttribute("data-inquiry-open") : "personal";
    if (window.WBQ) window.WBQ.open(kind, btn);
    if (!reduced() && !r.busy) {
      blink(r, false, 0);
      happy(r, true, 0);
      happy(r, false, 700);
    }
  }

  function initInvite(wrap) {
    var svg = wrap.querySelector("svg[data-robot]");
    if (!svg || wrap._wbrInit) return;
    wrap._wbrInit = true;
    var r = register(svg);
    var rest = svg.getAttribute("data-rest");
    if (!reduced() && r.role === "invite") {
      r.onFirstView = function () {
        inviteIntro(r);
      };
    }
    function control(t) {
      return t && t.closest ? t.closest("a, button:not([data-robot-button])") : null;
    }
    function set(on) {
      if (r.hover === on) return;
      if (on && r.busy) return; // do not cut a scene short for a hover
      r.hover = on;
      if (reduced()) svg.setAttribute("data-pose", on ? rest + "-more" : rest);
      else inviteFocus(r, on);
    }
    wrap.addEventListener("mouseover", function (e) {
      if (control(e.target)) set(true);
    });
    wrap.addEventListener("mouseout", function (e) {
      var c = control(e.target);
      if (c && !c.contains(e.relatedTarget)) set(false);
    });
    wrap.addEventListener("focusin", function (e) {
      if (control(e.target)) set(true);
    });
    wrap.addEventListener("focusout", function (e) {
      if (control(e.target)) set(false);
    });
  }

  /* ---------- flow ---------- */
  var flowPose = null;
  function currentFlow() {
    var pickup = document.getElementById("tab-pickup");
    return pickup && pickup.getAttribute("aria-selected") === "true" ? "pickup" : "deposit";
  }
  function playFlow(r) {
    if (currentFlow() === "pickup") flowPickup(r);
    else flowDeposit(r);
  }
  function syncFlow(animate) {
    var svg = document.querySelector('svg[data-robot="flow"]');
    if (!svg) return;
    var r = register(svg);
    var pose = currentFlow();
    document.querySelectorAll("[data-flow-say]").forEach(function (n) {
      n.hidden = n.getAttribute("data-flow-say") !== pose;
    });
    if (reduced()) {
      svg.setAttribute("data-pose", pose);
      flowPose = pose;
      return;
    }
    if (pose === flowPose && animate) return;
    flowPose = pose;
    if (!animate) return;
    playFlow(r); // switching tabs blends from wherever the previous story was
  }
  function onTabAction(e) {
    if (e.target && e.target.closest && e.target.closest('[role="tab"]')) {
      setTimeout(function () {
        syncFlow(true);
      }, 30);
    }
  }
  document.addEventListener("click", onTabAction);
  document.addEventListener("keyup", onTabAction);

  /* ---------- FAQ: opening a question gets a light response ---------- */
  document.addEventListener(
    "toggle",
    function (e) {
      var d = e.target;
      if (!d || d.tagName !== "DETAILS" || !d.open || d.hasAttribute("data-faq-more")) return;
      var zone = d.closest("[data-robot-zone]");
      if (!zone) return;
      var svg = document.querySelector('svg[data-robot="' + zone.getAttribute("data-robot-zone") + '"]');
      if (!svg) return;
      var r = register(svg);
      if (reduced()) return flash(r, "ok", 800);
      faqLight(r, d);
    },
    true
  );

  /* ---------- welcome scene (lifecycle lives in the boot script; this adds the acting) ---------- */
  var root = document.documentElement;
  function welcomeOpen() {
    return root.getAttribute("data-welcome") === "show";
  }
  function greeted() {
    try {
      return !!sessionStorage.getItem("wbWelcomeShown");
    } catch (e) {
      return false;
    }
  }
  /* The welcome story. CSS moves the robot along its hop and unfolds the side modules (so travel starts at
   * first paint); this adds the body acting on the same clock, then opens the door onto the page.
   *   in the air: arms out for balance, wheels dangle, antenna trails, eyes on the landing spot
   *   0.76s lands: body gives a little, arms swing down, antenna catches up
   *   1.0s looks at you, eyes light up, leans in, one short wave
   *   1.9–2.6s unfolds into a cabinet (CSS)
   *   2.6s looks at its door, smiles; 2.65s the door swings open; 3.0s the page grows out of the doorway */
  function welcomeAct(r, since, gate, api) {
    var p = r.p;
    var at = function (ms) {
      return Math.max(0, ms - since);
    };
    begin(r, 3800);
    if (since < 650) {
      to(r, p.eyes, { transform: tr(-16, 16) }, 200, 0);
      to(r, p.shL, { transform: deg(28) }, 280, at(40), E.out);
      to(r, p.elL, { transform: deg(36) }, 280, at(80), E.out);
      to(r, p.shR, { transform: deg(26) }, 280, at(60), E.out);
      to(r, p.elR, { transform: deg(40) }, 280, at(100), E.out);
      to(r, p.wheels, { transform: tr(0, 16) }, 320, at(120), E.out);
      to(r, p.ant, { transform: deg(-12) }, 320, at(100), E.out);
    }
    if (since < 1000) {
      to(r, p.wheels, { transform: tr(0, 0) }, 120, at(700), E.out);
      fx(r, p.squash, [{ transform: "scale(1,1)" }, { transform: "scale(1.05,.93)", offset: 0.3 }, { transform: "scale(.985,1.025)", offset: 0.65 }, { transform: "scale(1,1)" }], 440, at(760), E.soft);
      armsHome(r, at(790));
      to(r, p.ant, [{ transform: deg(-12) }, { transform: deg(9) }, { transform: deg(-4) }, { transform: deg(1.5) }, { transform: deg(0) }], 760, at(780), E.soft);
    }
    if (since < 1800) {
      to(r, p.eyes, { transform: tr(0, -3) }, 220, at(1000), E.out);
      r.svg.querySelectorAll(".wbr-hl").forEach(function (hl) {
        fx(r, hl, [{ transform: "scale(1)" }, { transform: "scale(1.3)", offset: 0.4 }, { transform: "scale(1)" }], 420, at(1060), E.out);
      });
      to(r, p.fig, { transform: deg(2.5) }, 340, at(1080), E.inOut);
      to(r, p.shR, { transform: deg(20) }, 340, at(1120), E.back);
      to(r, p.elR, { transform: deg(60) }, 320, at(1170), E.back);
      happy(r, true, at(1160));
      to(r, p.elR, [{ transform: deg(60) }, { transform: deg(30) }, { transform: deg(68) }, { transform: deg(32) }, { transform: deg(62) }], 520, at(1400), E.inOut);
      happy(r, false, at(1880));
    }
    if (since < 2500) {
      armsHome(r, at(1880));
      to(r, p.fig, { transform: deg(0) }, 420, at(1880), E.back);
      antennaSway(r, at(1980), 6);
      r.svg.querySelectorAll(".wbr-hl").forEach(function (hl) {
        fx(r, hl, [{ transform: "scale(1)" }, { transform: "scale(1.25)", offset: 0.4 }, { transform: "scale(1)" }], 380, at(2420), E.out);
      });
    }
    to(r, p.eyes, { transform: tr(30, 18) }, 260, at(2560), E.out);              // looks at its door
    to(r, p.fig, { transform: deg(1.5) }, 380, at(2580), E.inOut);
    happy(r, true, at(2680));
    to(r, p.door, [{ transform: "scale(1,1) skewY(0deg)" }, { transform: "scale(.55,1.03) skewY(-5deg)", offset: 0.45 }, { transform: "scale(.16,1.05) skewY(-7deg)" }], 520, at(2650), E.inOut);
    to(r, p.shade, { opacity: 0.35 }, 520, at(2650), E.inOut);
    antennaSway(r, at(2760), 5);
    r.timers.push(setTimeout(function () {
      welcomeReveal(r, gate, api);
    }, at(3020)));
  }
  /* the page underneath grows out of the doorway (a hole in the scene), then the scene is closed */
  function welcomeReveal(r, gate, api) {
    if (!api.isOpen()) return;
    try {
      var c = r.p.cavity.getBoundingClientRect();
      var W = window.innerWidth, H = window.innerHeight;
      var L = c.left + c.width * 0.2, T = c.top, R = c.right, B = c.bottom;
      var poly = function (l, t, rr, b) {
        return "polygon(evenodd, 0px 0px, " + W + "px 0px, " + W + "px " + H + "px, 0px " + H + "px, 0px 0px, " +
          l + "px " + t + "px, " + rr + "px " + t + "px, " + rr + "px " + b + "px, " + l + "px " + b + "px, " + l + "px " + t + "px)";
      };
      var a = gate.animate(
        [{ clipPath: poly(L, T, R, B) }, { clipPath: poly(L - 24, T - 18, R + 24, B + 18), offset: 0.22 }, { clipPath: poly(-40, -40, W + 40, H + 40) }],
        { duration: 680, easing: "cubic-bezier(.6,0,.3,1)", fill: "forwards" }
      );
      gate._reveal = a;
      a.onfinish = function () {
        api.close();
        a.cancel();
      };
    } catch (e) {
      api.close();
    }
  }

  /* a tap during the welcome: a quick happy blink, without touching the scene's clock or the skip button */
  function welcomeTap(r) {
    if (reduced()) return;
    blink(r, false, 0);
    fx(r, r.p.balls, [{ opacity: 1 }, { opacity: 0, offset: 0.2 }, { opacity: 0, offset: 0.8 }, { opacity: 1 }], 520, 120, E.inOut);
    fx(r, r.p.happy, [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], 520, 120, E.inOut);
    antennaSway(r, 160, 6);
  }

  function initWelcome() {
    var gate = document.getElementById("wb-welcome");
    var api = window.__wbWelcome;
    if (!gate || !api || gate._wbw) return;
    gate._wbw = true;
    var svg = gate.querySelector("svg[data-robot]");
    var r = svg ? register(svg) : null;
    function act() {
      if (!r || reduced() || !api.isOpen()) return;
      try {
        r.visible = true;
        welcomeAct(r, Math.max(0, Date.now() - (api.t0 || Date.now())), gate, api);
      } catch (e) {
        api.close(); // never let the acting keep the scene up
      }
    }
    document.querySelectorAll("[data-welcome-replay]").forEach(function (b) {
      if (reduced()) return;
      b.hidden = false;
      b.addEventListener("click", function () {
        window.scrollTo(0, 0);
        if (gate._reveal) gate._reveal.cancel();
        if (r) {
          stop(r);
          r.svg.querySelectorAll("[style]").forEach(function (n) {
            n.removeAttribute("style");
          });
        }
        api.open();
        act();
      });
    });
    act();
  }

  /* ---------- form robot (inquiry dialog): a clone of the page robot driven by the form's real state ---------- */
  function mini(svg) {
    var r = register(svg);
    r.visible = true;
    r.idle.face = tr(0, 0);
    var api = {
      reduced: reduced,
      reset: function () {
        stop(r);
        stopLoops(r);
        r.k = 1;
        r.busy = false;
        r.svg.querySelectorAll("[style]").forEach(function (n) {
          n.removeAttribute("style");
        });
        r.wheelDeg = 0;
        r.svg.setAttribute("data-pose", "rest");
      },
      /* rolling along (preparing / sending); envelope in hand when sending */
      run: function (withEnvelope) {
        if (reduced()) return r.svg.setAttribute("data-pose", withEnvelope ? "hold" : "rest");
        stop(r);
        stopLoops(r);
        r.busy = true;
        to(r, r.p.eyes, { transform: tr(26, 2) }, 200, 0);
        if (withEnvelope) {
          to(r, r.p.env, { opacity: 1, transform: "scale(1)" }, 200, 0);
          to(r, r.p.shR, { transform: deg(4) }, 300, 0, E.back);
          to(r, r.p.elR, { transform: deg(40) }, 300, 40, E.back);
        } else {
          loop(r, r.p.shR, [{ transform: deg(-28) }, { transform: deg(-78) }, { transform: deg(-28) }], 520, 0, E.inOut);
        }
        runLoop(r, 1);
      },
      /* slows down and stops where it is (failure: no delivery, no celebration) */
      halt: function () {
        if (reduced()) return r.svg.setAttribute("data-pose", "rest");
        stop(r);
        stopRun(r);
        to(r, r.p.env, { opacity: 0 }, 260, 200, E.out);
        armsHome(r, 120);
        to(r, r.p.eyes, { transform: tr(-6, 10) }, 300, 300, E.out);                        // a small, apologetic look down
        to(r, r.p.fig, { transform: deg(-2) }, 420, 400, E.inOut);
        later(r, function () {
          r.busy = false;
        }, 900);
      },
      /* accepted: brakes, reaches into the mailbox, turns to you, a happy wave. onDrop fires when the
       * envelope goes in (raise the mailbox flag); the whole thing is about 1.9s */
      deliver: function (onDrop) {
        if (reduced()) {
          r.svg.setAttribute("data-pose", "joy");
          if (onDrop) onDrop();
          return;
        }
        stop(r);
        stopRun(r);
        r.busy = true;
        to(r, r.p.eyes, { transform: tr(30, -4) }, 220, 360, E.out);                           // looks at the mailbox
        to(r, r.p.shR, { transform: deg(14) }, 360, 420, E.back);                                // reaches out
        to(r, r.p.elR, { transform: deg(-4) }, 340, 470, E.back);
        to(r, r.p.env, { opacity: 0, transform: "scale(.5) translateY(30px)" }, 260, 860, E.inOut); // drops it in
        later(r, function () {
          if (onDrop) onDrop();
        }, 900);
        to(r, r.p.eyes, { transform: tr(0, 0) }, 280, 1080, E.inOut);                          // turns to you
        happy(r, true, 1140);
        wave(r, 1160, 1);
        armsHome(r, 1900);
        antennaSway(r, 1200, 6);
        later(r, function () {
          r.busy = false;
        }, 2300);
      },
      /* gentle nudge on a validation error: looks at the form, tilts, points down */
      hint: function () {
        if (reduced() || r.busy) return;
        begin(r, 1200);
        to(r, r.p.eyes, { transform: tr(-12, 16) }, 220, 0);
        to(r, r.p.fig, { transform: deg(-3) }, 360, 120, E.inOut);
        to(r, r.p.shR, { transform: deg(-22) }, 380, 180, E.back);
        to(r, r.p.elR, { transform: deg(-12) }, 360, 240, E.back);
        antennaSway(r, 300, 4);
        armsHome(r, 760);
        bodyHome(r, 780);
        eyesHome(r, 800);
      },
      /* confirm step: holds the envelope and looks down at the summary */
      hold: function (on) {
        if (reduced()) return r.svg.setAttribute("data-pose", on ? "hold" : "rest");
        stop(r);
        if (on) {
          to(r, r.p.shR, { transform: deg(4) }, 340, 0, E.back);
          to(r, r.p.elR, { transform: deg(40) }, 320, 50, E.back);
          popIn(r, r.p.env, 120);
          to(r, r.p.eyes, { transform: tr(-10, 14) }, 300, 200, E.out);
          antennaSway(r, 320, 4);
        } else {
          to(r, r.p.env, { opacity: 0 }, 200, 0, E.out);
          armsHome(r, 0);
          eyesHome(r, 0);
        }
      },
      /* completion page: a press only plays a little celebration */
      celebrate: function () {
        if (reduced()) {
          clearTimeout(r.reduceT);
          r.svg.setAttribute("data-pose", "joy");
          return;
        }
        if (r.busy) return nudge(r);
        begin(r, 1400);
        happy(r, true, 0);
        to(r, r.p.shL, { transform: deg(20) }, 360, 80, E.back);
        to(r, r.p.shR, { transform: deg(20) }, 360, 50, E.back);
        to(r, r.p.elL, { transform: deg(64) }, 340, 140, E.back);
        to(r, r.p.elR, { transform: deg(64) }, 340, 110, E.back);
        hop(r, 120, 22);
        roll(r, 0.25, 500, 140);
        antennaSway(r, 480, 8);
        armsHome(r, 860);
        happy(r, false, 1250);
      },
    };
    return api;
  }

  function scan() {
    document.querySelectorAll("[data-robot-button]").forEach(initButton);
    document.querySelectorAll("[data-robot-invite]").forEach(initInvite);
    document.querySelectorAll("svg[data-robot]").forEach(function (svg) {
      if (svg.getAttribute("data-robot") !== "form") register(svg);
    });
    flowPose = null;
    syncFlow(false);
    initWelcome();
  }

  window.WBR = { scan: scan, mini: mini };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scan);
  else scan();
})();
