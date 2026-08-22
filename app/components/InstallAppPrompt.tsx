"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "../i18n/LanguageProvider";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isRunningStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean(navigator.standalone))
  );
}

function isIosSafari() {
  const userAgent = window.navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari =
    /Safari/.test(userAgent) &&
    !/CriOS|FxiOS|EdgiOS|Chrome|Android/.test(userAgent);

  return isIos && isSafari;
}

export function InstallAppPrompt() {
  const { t } = useI18n();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    if (isRunningStandalone()) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setShowIosInstructions(isIosSafari());
    });

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setShowIosInstructions(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (installPrompt) {
    return (
      <div className="mt-4 rounded-2xl border border-[#E7E4DF] bg-[#FAF9F7] p-4 text-center">
        <p className="text-xs font-medium leading-5 text-[#78716C]">
          {t("install.prompt")}
        </p>
        <button
          className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#1C1917] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.99]"
          type="button"
          onClick={handleInstall}
        >
          <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t("install.button")}
        </button>
      </div>
    );
  }

  if (showIosInstructions) {
    return (
      <p className="mt-4 rounded-2xl border border-[#E7E4DF] bg-[#FAF9F7] px-4 py-3 text-center text-xs font-medium leading-5 text-[#78716C]">
        {t("install.ios")}
      </p>
    );
  }

  return null;
}
