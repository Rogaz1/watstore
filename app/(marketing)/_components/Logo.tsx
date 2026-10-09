import Image from "next/image";

type LogoProps = {
  tone?: "light" | "dark";
  className?: string;
  priority?: boolean;
};

/** The official Floxto wordmark. `tone` is the surface it sits on. */
export function Logo({ tone = "light", className = "h-[26px] w-auto", priority }: LogoProps) {
  return tone === "light" ? (
    <Image
      alt="Floxto"
      className={className}
      height={415}
      priority={priority}
      sizes="120px"
      src="/branding/floxto-wordmark-light-transparent.png"
      width={1422}
    />
  ) : (
    <Image
      alt="Floxto"
      className={className}
      height={436}
      priority={priority}
      sizes="140px"
      src="/branding/floxto-wordmark-dark-transparent.png"
      width={1473}
    />
  );
}
