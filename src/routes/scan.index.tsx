import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { PillButton } from "@/components/treatme/PillButton";
import { useScan } from "@/lib/scan-store";
import { recordConsent } from "@/lib/scan-consent";
import { warmFacemesh } from "@/lib/facemesh";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/scan/")({
  head: () => ({
    meta: [
      { title: "scan my skin | treatme" },
      {
        name: "description",
        content:
          "take one selfie for a cosmetic skin snapshot, top priorities, and educational options to explore.",
      },
      { property: "og:title", content: "scan my skin | treatme" },
      {
        property: "og:description",
        content:
          "take one selfie for a cosmetic skin snapshot, top priorities, and educational options to explore.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConsentPage,
});

function ConsentPage() {
  const navigate = useNavigate();
  const { setStorePhoto } = useScan();
  const { requireAuth } = useAuth();
  const [consented, setConsented] = useState(false);
  const [keepPhoto, setKeepPhoto] = useState(false);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    setStorePhoto(keepPhoto);
    warmFacemesh();
    await recordConsent(keepPhoto);
    navigate({ to: "/scan/capture" });
  };

  const onAccept = () => {
    if (!consented || busy) return;
    requireAuth(() => {
      void start();
    }, "sign in to protect your scan and keep your results private.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-5">
      <div className="w-full max-w-[360px] rounded-[26px] bg-white p-6 shadow-xl">
        <h1 className="brand-display text-[26px] lowercase leading-tight">
          before your scan<span className="text-hot">.</span>
        </h1>

        <p className="mt-3 text-[13.5px] leading-relaxed lowercase text-ink-mute">
          treatme is for cosmetic and educational use only. results are not intended to diagnose,
          treat, or cure any medical condition. always consult a licensed professional before
          undergoing a medical or cosmetic procedure.
        </p>

        <p className="mt-3 text-[12.5px] leading-relaxed lowercase text-ink-mute">
          we analyze a photo of your face to estimate visible skin concerns. your photo and the map
          built from it are biometric information, and you can delete saved scans from your profile.
        </p>

        <button
          type="button"
          onClick={() => setConsented((v) => !v)}
          aria-pressed={consented}
          className="mt-5 flex w-full items-start gap-3 text-left"
        >
          <span
            className={cn(
              "mt-[1px] grid size-5 shrink-0 place-items-center rounded-[7px] border transition-colors",
              consented ? "border-ink bg-ink text-cream" : "border-ink/25 bg-transparent",
            )}
          >
            {consented && <Check className="size-[13px]" strokeWidth={3} />}
          </span>
          <span className="text-[13.5px] leading-snug lowercase">
            i accept the disclaimer and consent to treatme processing my photo to create a cosmetic
            skin snapshot.
          </span>
        </button>

        <p className="mt-3 text-[12.5px] lowercase text-ink-mute">
          <Link to="/privacy" className="underline underline-offset-2">
            privacy policy
          </Link>
          <span> · </span>
          <Link to="/terms" className="underline underline-offset-2">
            terms
          </Link>
          <span> · </span>
          <Link to="/skin-analysis" className="underline underline-offset-2">
            what is skin analysis?
          </Link>
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
          <span className="text-[13px] leading-snug lowercase">
            save my photo so i can compare future scans
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={keepPhoto}
            aria-label="save my photo so i can compare future scans"
            onClick={() => setKeepPhoto((v) => !v)}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors",
              keepPhoto ? "bg-ink" : "bg-ink/15",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white transition-all",
                keepPhoto ? "left-[22px]" : "left-0.5",
              )}
            />
          </button>
        </div>

        <div className="mt-6 flex gap-3">
          <PillButton variant="outline" className="flex-1" onClick={() => navigate({ to: "/" })}>
            no
          </PillButton>
          <PillButton className="flex-1" disabled={!consented || busy} onClick={onAccept}>
            {busy ? "opening camera" : "continue"}
          </PillButton>
        </div>
      </div>
    </div>
  );
}
