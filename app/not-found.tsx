import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 py-16 text-center text-ink">
      <Link aria-label="Floxto home" href="/">
        <Image
          alt="Floxto"
          className="h-8 w-auto"
          height={415}
          priority
          sizes="140px"
          src="/branding/floxto-wordmark-light-transparent.png"
          width={1422}
        />
      </Link>
      <h1 className="mt-10 text-balance text-[40px] font-bold leading-[1.02] tracking-[-0.04em] sm:text-[56px]">
        This page is{" "}
        <em className="font-accent font-medium italic tracking-[-0.02em]">not here.</em>
      </h1>
      <p className="mt-4 max-w-[32ch] text-[17px] leading-relaxed text-ink-2">
        The link may be old or mistyped. If you were looking for a store, check the link with
        the seller.
      </p>
      <Link
        className="mt-8 flex h-14 items-center rounded-full bg-ink px-7 text-base font-semibold text-white transition-transform active:scale-[0.98]"
        href="/"
      >
        Go to floxto.com
      </Link>
    </main>
  );
}
