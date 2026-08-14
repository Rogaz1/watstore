import Image from "next/image";

type FloxtoWordmarkProps = {
  className?: string;
};

export function FloxtoWordmark({ className = "" }: FloxtoWordmarkProps) {
  const logoClassName = `h-auto w-full object-contain ${className}`;

  return (
    <div className="mx-auto w-[148px] max-w-full sm:w-[160px]" aria-label="Floxto">
      <Image
        className={logoClassName}
        src="/branding/floxto-auth-wordmark-light-v2.png"
        alt="Floxto"
        width={1422}
        height={415}
        priority
      />
    </div>
  );
}
