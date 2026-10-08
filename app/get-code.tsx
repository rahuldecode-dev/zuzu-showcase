"use client";

import { ArrowRight, Check, Code2, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string };

/** "Get the code" button + email dialog. Posts to /api/subscribe. */
export function GetCode() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          company: form.get("company"),
          source: "demo-site",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Try again.");
      setStatus({ kind: "done" });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="absolute bottom-[11%] left-[2.2%] z-[1100] flex items-center gap-2 rounded-full border border-white/50 bg-black/15 px-4 py-2.5 font-condensed text-[max(12px,0.85cqw)] font-semibold tracking-wider text-white backdrop-blur-md transition-colors hover:bg-black/30 focus-visible:outline-2 focus-visible:outline-white max-md:top-[9%] max-md:right-[4%] max-md:bottom-auto max-md:left-auto max-md:text-xs"
      >
        <Code2 aria-hidden className="size-4" />
        GET THE CODE
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="get-code-title"
        onClose={() => status.kind !== "sending" && setStatus({ kind: "idle" })}
        className="m-auto w-[min(92vw,420px)] rounded-3xl bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-7">
          <button
            type="button"
            aria-label="Close"
            onClick={() => dialog.current?.close()}
            className="absolute top-4 right-4 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <X aria-hidden className="size-5" />
          </button>

          {status.kind === "done" ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[#10016c] text-white">
                <Check aria-hidden className="size-6" />
              </div>
              <h2 id="get-code-title" className="font-condensed text-2xl font-bold tracking-wide">
                CHECK YOUR INBOX
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                The GitHub link is on its way. Not there in a minute? Check Promotions or Spam.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <h2 id="get-code-title" className="font-condensed text-2xl font-bold tracking-wide">
                GET THE FULL SOURCE, FREE
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Next.js + Motion + Tailwind. Drop your email and I&apos;ll send the GitHub link, plus
                future free drops. Unsubscribe anytime.
              </p>
              <label htmlFor="get-code-email" className="sr-only">
                Email
              </label>
              <div className="mt-5 flex gap-2">
                <input
                  id="get-code-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 rounded-full border border-neutral-300 px-4 py-3 text-base outline-none focus:border-[#10016c] focus:ring-2 focus:ring-[#10016c]/20"
                />
                <button
                  type="submit"
                  disabled={status.kind === "sending"}
                  aria-label="Send me the code"
                  className="grid place-items-center rounded-full bg-[#10016c] px-4 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <ArrowRight aria-hidden className="size-5" />
                </button>
              </div>
              {/* Honeypot: hidden from people, filled by bots */}
              <input
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <p role="status" className="mt-3 min-h-5 text-sm text-red-600">
                {status.kind === "error" ? status.message : ""}
              </p>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
