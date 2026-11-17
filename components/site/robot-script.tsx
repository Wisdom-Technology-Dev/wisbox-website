"use client";

import Script from "next/script";
import { useEffect } from "react";

/** Loads the robot behaviour and the inquiry form once; re-scans robots when a page mounts. */
export function RobotScript() {
  useEffect(() => {
    (window as Window & { WBR?: { scan: () => void } }).WBR?.scan();
  }, []);
  return (
    <>
      <Script src="/wisbox-robot.js" strategy="afterInteractive" />
      <Script src="/wisbox-inquiry.js" strategy="afterInteractive" />
    </>
  );
}
