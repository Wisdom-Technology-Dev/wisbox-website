import { ArrowRight } from "lucide-react";
import { WisboxRobot } from "@/components/site/wisbox-robot";

/**
 * Brand welcome (~3.6s): the robot hops in, lands, waves, unfolds into a locker cabinet, and its door
 * opens onto the user page that is already rendered underneath. No choices; "スキップ" ends it at once.
 * Shown once per tab session on the plain top page only (see WELCOME_BOOT). Hidden by default, so
 * the site opens normally without JavaScript.
 */
export function WelcomeGate() {
  return (
    <div id="wb-welcome" role="region" aria-label="WISBOX ウェルカム">
      <div className="wbw-inner">
        <div className="wbw-stage">
          <span aria-hidden className="wbw-glow" />
          <div className="wbw-zoom">
            <span aria-hidden className="wbw-shadow" />
            <div className="wbw-actor">
              <WisboxRobot role="welcome" pose="rest" wide className="wbw-robot" button="WISBOX のキャラクター" buttonTabIndex={-1} buttonClassName="wbw-robot-btn" />
            </div>
          </div>
        </div>
        <div className="wbw-text">
          <p className="wbw-brand">WISBOX</p>
          <p className="wbw-hello">
            <span className="inline-block">こんにちは、</span>
            <span className="inline-block">WISBOXです。</span>
          </p>
        </div>
      </div>
      <button type="button" data-welcome-skip className="wbw-skip">
        スキップ
        <ArrowRight aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}
