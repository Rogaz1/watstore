import Image from "next/image";

type FloxtoWordmarkProps = {
  className?: string;
};

export function FloxtoWordmark({ className = "" }: FloxtoWordmarkProps) {
  const logoClassName = `h-auto w-full object-contain ${className}`;

  return (
    <div className="mx-auto w-[148px] max-w-full sm:w-[160px]" aria-label="Floxto">
      <Image
        className={`${logoClassName} dark:hidden`}
        src="/branding/floxto-auth-wordmark-light-v2.png"
        alt="Floxto"
        width={1422}
        height={415}
        priority
      />
      <Image
        aria-hidden="true"
        className={`${logoClassName} hidden dark:block`}
        src="/branding/floxto-auth-wordmark-dark-v2.png"
        alt=""
        width={1473}
        height={436}
        priority
      />
    </div>
  );
}
