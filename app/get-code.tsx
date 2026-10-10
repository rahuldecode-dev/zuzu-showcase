import { ArrowUpRight, Code2 } from "lucide-react";
import { REPO_URL } from "@/lib/site";

/** "Get the code" button: links straight to the GitHub repo. */
export function GetCode() {
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute bottom-[11%] left-[2.2%] z-[1100] flex items-center gap-2 rounded-full border border-white/50 bg-black/15 px-4 py-2.5 font-condensed text-[max(12px,0.85cqw)] font-semibold tracking-wider text-white backdrop-blur-md transition-colors hover:bg-black/30 focus-visible:outline-2 focus-visible:outline-white max-md:top-[9%] max-md:right-[4%] max-md:bottom-auto max-md:left-auto max-md:text-xs"
    >
      <Code2 aria-hidden className="size-4" />
      GET THE CODE
      <ArrowUpRight aria-hidden className="size-4" />
      <span className="sr-only">(GitHub, opens in a new tab)</span>
    </a>
  );
}
