import Image from "next/image";
import { cn } from "../ui";

type ProductPhotoProps = {
  src: string;
  /** Rendered width, so phones download a small file. */
  sizes: string;
  className?: string;
  priority?: boolean;
};

/** A product photo in the example store. Decorative, so it has no alt text. */
export function ProductPhoto({ src, sizes, className, priority }: ProductPhotoProps) {
  return (
    <Image
      alt=""
      className={cn("h-full w-full object-cover", className)}
      height={800}
      priority={priority}
      sizes={sizes}
      src={src}
      width={800}
    />
  );
}
