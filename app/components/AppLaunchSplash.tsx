"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function isStandaloneApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean(navigator.standalone))
  );
}

export function AppLaunchSplash() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isStandaloneApp()) {
      return;
    }

    if (window.sessionStorage.getItem("floxto-launch-splash-seen") === "true") {
      return;
    }

    window.sessionStorage.setItem("floxto-launch-splash-seen", "true");
    const frame = window.requestAnimationFrame(() => setIsVisible(true));

    const timer = window.setTimeout(() => setIsVisible(false), 1600);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-dvh flex-col bg-white text-[#1C1917] dark:bg-[#111110] dark:text-white">
      <div className="flex flex-1 items-center justify-center px-10">
        <Image
          alt="Floxto"
          priority
          className="h-auto w-[184px] max-w-[68vw] dark:hidden"
          height={415}
          src="/branding/floxto-wordmark-light-transparent.png"
          width={1422}
        />
        <Image
          alt="Floxto"
          priority
          className="hidden h-auto w-[184px] max-w-[68vw] dark:block"
          height={436}
          src="/branding/floxto-wordmark-dark-transparent.png"
          width={1473}
        />
      </div>
      <p className="pb-16 text-center text-sm font-semibold text-[#78716C] dark:text-[#A8A29E]">
        Simple. Fast. Professional.
      </p>
    </div>
  );
}
