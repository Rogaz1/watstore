"use client";

import { Accordion } from "radix-ui";
import { Plus } from "lucide-react";
import type { FaqItem } from "../_lib/site";

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <Accordion.Root className="flex flex-col gap-3" collapsible type="single">
      {items.map((item) => (
        <Accordion.Item
          className="overflow-hidden rounded-[22px] border border-line bg-white transition-colors data-[state=open]:border-ink/25"
          key={item.question}
          value={item.question}
        >
          <Accordion.Header asChild>
            <h3>
              <Accordion.Trigger className="group flex min-h-[68px] w-full items-center justify-between gap-4 px-5 py-4 text-left text-[17px] font-semibold leading-snug sm:px-6">
                {item.question}
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-ink transition-[transform,background-color,color] duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:bg-ink group-data-[state=open]:text-white">
                  <Plus aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.25} />
                </span>
              </Accordion.Trigger>
            </h3>
          </Accordion.Header>
          <Accordion.Content className="mk-accordion overflow-hidden">
            <p className="px-5 pb-5 pr-10 text-base leading-relaxed text-ink-2 sm:px-6">
              {item.answer}
            </p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
