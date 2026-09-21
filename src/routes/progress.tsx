import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, LockKeyhole, RefreshCw, TrendingUp } from "lucide-react";

import { MyScans } from "@/components/treatme/profile/MyScans";
import { PillButton } from "@/components/treatme/PillButton";
import { useAuth } from "@/lib/auth";
import { useScan } from "@/lib/scan-store";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "track my skin | treatme" },
      {
        name: "description",
        content: "save and compare your cosmetic skin snapshots over time.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { user, ready, openAuth } = useAuth();
  const { result } = useScan();

  if (!ready) {
    return (
      <div className="px-6 pt-10 text-[13px] lowercase text-ink-mute">loading your progress...</div>
    );
  }

  if (!user) {
    return (
      <div className="px-6 pt-8">
        <div className="rounded-[28px] bg-butter p-6">
          <span className="grid size-12 place-items-center rounded-full bg-white">
            <LockKeyhole className="size-5" />
          </span>
          <h1 className="brand-display mt-5 text-[32px] lowercase">see your skin change.</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            Create an account to save snapshots, rescan in consistent conditions, and compare what
            changes over time.
          </p>
          <PillButton
            fullWidth
            className="mt-6"
            onClick={() => openAuth({ reason: "sign in to save and compare your skin snapshots." })}
          >
            log in or sign up
          </PillButton>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-8 pt-6">
      <p className="brand-eyebrow">your timeline</p>
      <h1 className="brand-display mt-2 text-[36px] lowercase">track what changes.</h1>
      <p className="mt-3 max-w-[360px] text-[14px] leading-relaxed text-ink-mute">
        Repeat your photo in similar lighting and positioning for the fairest comparison.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-[22px] bg-mint p-4">
          <TrendingUp className="size-5" />
          <p className="mt-5 text-[13px] font-bold lowercase">compare snapshots</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-mute">
            Look for direction over time, not perfection in one photo.
          </p>
        </div>
        <div className="rounded-[22px] bg-bubblegum/45 p-4">
          <CalendarDays className="size-5" />
          <p className="mt-5 text-[13px] font-bold lowercase">rescan in 30 days</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-mute">
            Give a routine or treatment enough time before comparing.
          </p>
        </div>
      </div>

      <Link
        to="/scan"
        className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[14px] font-bold lowercase text-white"
      >
        <RefreshCw className="size-4" />
        {result ? "take another scan" : "take my first scan"}
        <ArrowRight className="size-4" />
      </Link>

      <MyScans />

      <p className="mt-8 text-[10.5px] leading-relaxed text-ink-mute">
        Photo-based estimates can vary with lighting, camera, makeup, positioning, and hydration.
        TreatMe is cosmetic and educational only and does not diagnose skin conditions.
      </p>
    </div>
  );
}
