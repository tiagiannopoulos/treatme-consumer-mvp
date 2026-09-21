import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Check, LockKeyhole, Sparkles } from "lucide-react";

import { useScan } from "@/lib/scan-store";

export const Route = createFileRoute("/")({
  head: () => {
    const title = "treatme | understand your skin from one selfie";
    const description =
      "take one selfie and get a simple cosmetic skin snapshot with clear priorities and next steps.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  const { result } = useScan();

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-[430px] flex-col px-5 pb-5 pt-4">
      <section className="flex flex-1 flex-col justify-center py-8">
        <div className="mx-auto grid size-20 place-items-center rounded-[28px] bg-bubblegum/55">
          <Sparkles className="size-8 text-hot" strokeWidth={2} />
        </div>

        <div className="mt-7 text-center">
          <p className="brand-eyebrow">your personal skin guide</p>
          <h1 className="brand-display mx-auto mt-3 max-w-[340px] text-[48px] leading-[0.92] lowercase sm:text-[54px]">
            know your skin<span className="text-hot">.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[330px] text-[15px] leading-relaxed text-ink-mute">
            Take one selfie. See what stands out and what to focus on first—in plain English.
          </p>
        </div>

        <Link
          to="/scan"
          className="mt-8 flex h-16 w-full items-center justify-center gap-3 rounded-[22px] bg-ink px-6 text-[17px] font-bold lowercase text-white shadow-[0_14px_35px_rgba(17,17,17,0.16)]"
        >
          <Camera className="size-5 text-bubblegum" strokeWidth={2.3} />
          scan my skin
          <ArrowRight className="size-5" />
        </Link>

        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-semibold lowercase text-ink-mute">
          <span>one selfie</span>
          <span className="size-1 rounded-full bg-ink/20" />
          <span>about 30 seconds</span>
          <span className="size-1 rounded-full bg-ink/20" />
          <span>private</span>
        </div>

        {result && (
          <Link
            to="/scan/results"
            className="mt-5 flex items-center justify-between rounded-[20px] border border-ink/10 bg-mint/60 px-4 py-3.5 text-[13px] font-bold lowercase"
          >
            <span className="inline-flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-full bg-white">
                <Check className="size-4" strokeWidth={2.5} />
              </span>
              view my latest results
            </span>
            <ArrowRight className="size-4" />
          </Link>
        )}
      </section>

      <section className="rounded-[22px] bg-[#fff8fb] px-4 py-3.5">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 size-4 shrink-0 text-hot" />
          <p className="text-[11.5px] leading-relaxed text-ink-mute">
            Your photo is analyzed only for your cosmetic skin snapshot. Saving it is always your
            choice.
          </p>
        </div>
      </section>

      <p className="mx-auto mt-4 max-w-[360px] text-center text-[10px] leading-relaxed text-ink-mute">
        Cosmetic education only—not medical advice or a diagnosis.
      </p>
    </div>
  );
}
