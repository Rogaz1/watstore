import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Accent, Container, SectionHeading, TextLink } from "./ui";
import { USE_CASES } from "../_lib/useCases";

export function UseCaseRail() {
  return (
    <section className="mk-on-night overflow-hidden bg-night py-20 text-night-text lg:py-28">
      <Container>
        <div className="mk-reveal flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading className="max-w-xl">
            Made for the way <Accent>you</Accent> sell.
          </SectionHeading>
          <TextLink
            className="decoration-night-line hover:decoration-night-text"
            href="/use-cases"
          >
            See who uses Floxto
          </TextLink>
        </div>
      </Container>

      <ul className="mk-rail mx-auto mt-10 flex max-w-[1120px] snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:px-8 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible">
        {USE_CASES.map((useCase) => (
          <li className="w-[76%] shrink-0 snap-start sm:w-[44%] lg:w-auto" key={useCase.id}>
            <Link
              className="group flex h-full min-h-[232px] flex-col rounded-[28px] border border-night-line bg-night-2 p-6 transition-colors hover:border-brand/50"
              href={`/use-cases#${useCase.id}`}
            >
              <span className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-ink">
                  <useCase.icon aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={2} />
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-5 w-5 text-night-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                  strokeWidth={2}
                />
              </span>
              <span className="mt-auto block pt-8 text-[21px] font-bold leading-tight tracking-[-0.02em]">
                {useCase.title}
              </span>
              <span className="mt-2 block text-[15px] leading-snug text-night-muted">
                {useCase.short}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
