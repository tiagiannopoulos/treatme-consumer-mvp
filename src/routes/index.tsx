import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Camera,
  Check,
  Eye,
  LockKeyhole,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useScan } from "@/lib/scan-store";

export const Route = createFileRoute("/")({
  head: () => {
    const title = "treatme | understand your skin from one selfie";
    const description =
      "take one selfie and get a clear, cosmetic skin snapshot, your top priorities, and options to explore. educational, private, and easy to understand.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "https://treatmeapp.com/" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: "https://treatmeapp.com/" }],
    };
  },
  component: HomePage,
});

const STEPS = [
  {
    number: "01",
    title: "scan",
    body: "take or upload one clear, makeup-free selfie.",
    icon: Camera,
    tone: "bg-bubblegum/55",
  },
  {
    number: "02",
    title: "understand",
    body: "see what stands out across your forehead, cheeks, nose and eye area.",
    icon: Eye,
    tone: "bg-butter",
  },
  {
    number: "03",
    title: "explore",
    body: "learn which ingredients and cosmetic treatments may be worth asking about.",
    icon: Sparkles,
    tone: "bg-mint",
  },
];

function HomePage() {
  const { result } = useScan();

  return (
    <div className="overflow-hidden pb-8">
      <section className="px-6 pb-8 pt-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-2 text-[11px] font-bold lowercase tracking-tight">
          <span className="size-1.5 rounded-full bg-hot" />
          cosmetic skin education, made personal
        </div>

        <h1 className="brand-display mt-7 max-w-[340px] text-[48px] leading-[0.9] lowercase sm:text-[56px]">
          your face,
          <br />
          <span className="text-hot">explained.</span>
        </h1>
        <p className="mt-5 max-w-[370px] text-[16px] leading-relaxed text-ink-soft">
          One selfie gives you a plain-English skin snapshot, the areas worth focusing on, and
          options you can explore next.
        </p>

        <Link
          to="/scan"
          className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-[16px] font-bold lowercase text-white shadow-[0_10px_30px_rgba(17,17,17,0.16)]"
        >
          <Sparkles className="size-5 text-bubblegum" strokeWidth={2.2} />
          scan my skin
          <ArrowRight className="size-5" />
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-semibold lowercase text-ink-mute">
          <span className="inline-flex items-center gap-1.5">
            <Camera className="size-3.5" /> one selfie
          </span>
          <span className="inline-flex items-center gap-1.5">
            <RefreshCw className="size-3.5" /> about 30 seconds
          </span>
          <span className="inline-flex items-center gap-1.5">
            <LockKeyhole className="size-3.5" /> you control your photo
          </span>
        </div>

        {result && (
          <Link
            to="/scan/results"
            className="mt-5 flex items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 py-3 text-[13px] font-semibold lowercase"
          >
            <span className="inline-flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-bubblegum/55">
                <Check className="size-4" strokeWidth={2.5} />
              </span>
              your latest snapshot is ready
            </span>
            <ArrowRight className="size-4" />
          </Link>
        )}
      </section>

      <section className="rounded-t-[36px] bg-[#fff8fb] px-6 py-9">
        <p className="brand-eyebrow">how it works</p>
        <h2 className="brand-display mt-2 text-[30px] lowercase">scan. understand. explore.</h2>

        <div className="mt-6 space-y-3">
          {STEPS.map(({ number, title, body, icon: Icon, tone }) => (
            <div
              key={number}
              className="flex gap-4 rounded-[24px] border border-ink/[0.07] bg-white p-4"
            >
              <div className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tone}`}>
                <Icon className="size-5" strokeWidth={2} />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-[11px] font-bold tracking-[0.12em] text-ink-mute">{number}</p>
                <h3 className="mt-1 text-[17px] font-bold lowercase">{title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-mute">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-9">
        <div className="rounded-[28px] bg-ink p-6 text-white">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10">
              <MessageCircle className="size-5 text-bubblegum" />
            </span>
            <div>
              <p className="brand-eyebrow !text-bubblegum">ask treatme</p>
              <h2 className="brand-display mt-2 text-[28px] lowercase">
                your scan, in conversation.
              </h2>
            </div>
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-white/70">
            Ask what your results mean, compare options, or tell us you want low downtime, no
            needles, subtle maintenance, or a more noticeable change.
          </p>
          {result ? (
            <Link
              to="/scan/chat"
              search={{ treatment: undefined }}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-bold lowercase text-ink"
            >
              ask about my scan
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <Link
              to="/scan"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-bold lowercase text-ink"
            >
              scan first
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      </section>

      <section className="px-6">
        <div className="rounded-[24px] border border-ink/10 bg-mint/55 p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5" strokeWidth={2.2} />
            <h2 className="text-[15px] font-bold lowercase">your results stay independent.</h2>
          </div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
            Providers cannot pay to change your scan or influence what TreatMe notices. Paid
            placement never changes your skin snapshot.
          </p>
        </div>

        <p className="mx-auto mt-5 max-w-[360px] text-center text-[10.5px] leading-relaxed text-ink-mute">
          TreatMe is for cosmetic and educational use only. Results are not intended to diagnose,
          treat, or cure any medical condition. Always consult a licensed professional before
          undergoing a medical or cosmetic procedure.
        </p>
      </section>
    </div>
  );
}
