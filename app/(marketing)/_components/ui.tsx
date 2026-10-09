import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1120px] px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

/** The italic serif voice. Used for one phrase in a headline, never a whole one. */
export function Accent({ children }: { children: ReactNode }) {
  return (
    <em className="font-accent font-medium italic tracking-[-0.02em]">
      {children}
    </em>
  );
}

type HeadingProps = {
  as?: "h1" | "h2";
  className?: string;
  children: ReactNode;
};

export function SectionHeading({ as: Tag = "h2", className, children }: HeadingProps) {
  return (
    <Tag
      className={cn(
        "text-balance text-[32px] font-bold leading-[1.06] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Lead({
  className,
  tone = "light",
  children,
}: {
  className?: string;
  tone?: "light" | "night";
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "text-pretty text-[17px] leading-[1.55] sm:text-lg",
        tone === "night" ? "text-night-muted" : "text-ink-2",
        className,
      )}
    >
      {children}
    </p>
  );
}

type CtaProps = {
  href: string;
  children: ReactNode;
  tone?: "ink" | "brand" | "light";
  className?: string;
  external?: boolean;
} & Omit<ComponentProps<"a">, "href" | "className" | "children">;

const CTA_TONES = {
  ink: "bg-ink text-white [&>span:last-child]:bg-brand [&>span:last-child]:text-ink",
  brand: "bg-brand text-ink [&>span:last-child]:bg-ink [&>span:last-child]:text-white",
  light: "bg-white text-ink [&>span:last-child]:bg-ink [&>span:last-child]:text-white",
} as const;

/** Primary action. Full width on phones so it is easy to reach with a thumb. */
export function Cta({ href, children, tone = "ink", className, external, ...rest }: CtaProps) {
  const classes = cn(
    "group inline-flex h-14 w-full items-center justify-between gap-4 rounded-full pl-6 pr-2 text-base font-semibold transition-transform duration-200 active:scale-[0.98] sm:w-auto",
    CTA_TONES[tone],
    className,
  );
  const content = (
    <>
      <span>{children}</span>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5">
        <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.25} />
      </span>
    </>
  );

  if (external) {
    return (
      <a className={classes} href={href} rel="noopener noreferrer" target="_blank" {...rest}>
        {content}
      </a>
    );
  }

  return (
    <Link className={classes} href={href} {...rest}>
      {content}
    </Link>
  );
}

export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      className={cn(
        "group inline-flex min-h-11 items-center gap-2 text-base font-semibold underline decoration-line decoration-2 underline-offset-[6px] transition-colors hover:decoration-ink",
        className,
      )}
      href={href}
    >
      {children}
      <ArrowRight
        aria-hidden="true"
        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
        strokeWidth={2.25}
      />
    </Link>
  );
}

export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
