import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronRight, Download, MessageCircle, RotateCcw } from "lucide-react";

import { AnalysisFooter } from "@/components/treatme/AnalysisFooter";
import { ScanPhoto } from "@/components/treatme/ScanPhoto";
import { SharePdfSheet } from "@/components/treatme/SharePdfSheet";
import { fetchSavedScan } from "@/lib/scan-history";
import {
  bandFor,
  bandTint,
  overallScore,
  SCAN_CONCERN_KEYS,
  SCAN_CONCERN_LABEL,
  toConcernRows,
} from "@/lib/scan-concerns";
import { useScan } from "@/lib/scan-store";
import { useScanPhotoSource } from "@/lib/scan-photo";
import { LOW_QUALITY_NOTE } from "@/lib/photo-check";
import { getRecommendations } from "@/lib/recommendations";
import { topConcerns } from "@/lib/skinAnalysis";

export const Route = createFileRoute("/scan/results")({
  validateSearch: (search: Record<string, unknown>): { id?: string } =>
    typeof search.id === "string" ? { id: search.id } : {},
  head: () => ({
    meta: [
      { title: "your skin snapshot · treatme" },
      {
        name: "description",
        content: "a simple cosmetic skin snapshot with clear priorities and next steps.",
      },
    ],
  }),
  component: ResultsPage,
});

const INGREDIENTS: Record<string, string[]> = {
  pores: ["niacinamide", "salicylic acid", "retinoid"],
  breakouts: ["salicylic acid", "benzoyl peroxide", "adapalene"],
  texture: ["retinoid", "lactic acid", "ceramides"],
  oiliness: ["niacinamide", "salicylic acid", "lightweight moisturizer"],
  redness: ["azelaic acid", "centella", "ceramides"],
  pigmentation: ["vitamin c", "azelaic acid", "daily spf"],
  uniformness: ["vitamin c", "niacinamide", "daily spf"],
  radiance: ["vitamin c", "lactic acid", "daily spf"],
  lines: ["retinoid", "peptides", "daily spf"],
  firmness: ["retinoid", "peptides", "daily spf"],
  volume_loss: ["peptides", "hyaluronic acid", "daily spf"],
  hydration: ["hyaluronic acid", "glycerin", "ceramides"],
  dark_circles: ["caffeine", "vitamin c", "daily spf"],
  under_eye_puffiness: ["caffeine", "peptides", "cool compress"],
  tear_trough: ["hyaluronic acid", "peptides", "daily spf"],
  eyelid_heaviness: ["peptides", "caffeine", "daily spf"],
};

function priorityCopy(score: number) {
  if (score >= 85) return "looking balanced";
  if (score >= 65) return "keep an eye on this";
  return "focus here first";
}

function ResultsPage() {
  const navigate = useNavigate();
  const { id: requestedId } = Route.useSearch();
  const { result, analysis, scanId, photoQuality, measured, hydrate, setResult } = useScan();
  const photoSource = useScanPhotoSource();
  const [shareOpen, setShareOpen] = useState(false);
  const [loading, setLoading] = useState(Boolean(requestedId && requestedId !== scanId));
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!requestedId || requestedId === scanId || loadedFor.current === requestedId) return;
    loadedFor.current = requestedId;
    let alive = true;
    setLoading(true);
    void (async () => {
      const saved = await fetchSavedScan(requestedId);
      if (!alive) return;
      setLoading(false);
      if (!saved) return;
      hydrate({
        scanId: saved.scanId,
        photoDataUrl: null,
        photoPath: saved.photoPath,
        landmarks: saved.landmarks,
        result: saved.result,
        analysis: saved.analysis,
        medicalFlag: saved.medicalFlag,
        photoQuality: saved.photoQuality,
        recommendations: [],
        goalRecommendations: [],
      });
      if (saved.result) {
        const { scanDriven, goalDriven } = await getRecommendations(topConcerns(saved.result), []);
        if (alive) setResult(saved.result, scanDriven, goalDriven);
      }
    })();
    return () => {
      alive = false;
    };
  }, [hydrate, requestedId, scanId, setResult]);

  const rows = useMemo(() => (result ? toConcernRows(result, measured) : []), [measured, result]);
  const ranked = useMemo(
    () =>
      rows
        .filter((row) => SCAN_CONCERN_KEYS.includes(row.concern_key))
        .sort((a, b) => a.score - b.score),
    [rows],
  );
  const priorities = ranked.slice(0, 3);
  const score = overallScore(ranked);
  const scoreBand = bandFor(score);
  const ingredientList = useMemo(
    () =>
      Array.from(new Set(priorities.flatMap((row) => INGREDIENTS[row.concern_key] ?? []))).slice(
        0,
        6,
      ),
    [priorities],
  );

  if (loading && !result) return <ResultsSkeleton />;

  if (!result) {
    return (
      <div className="px-6 pt-16 text-center">
        <p className="brand-eyebrow">no scan yet</p>
        <h1 className="brand-display mt-3 text-3xl lowercase">let's read your skin first.</h1>
        <Link
          to="/scan"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 font-semibold lowercase text-cream"
        >
          start a scan
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[430px] pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
      <header className="flex items-end justify-between gap-4 px-5 pt-5">
        <div>
          <p className="brand-eyebrow">your results</p>
          <h1 className="brand-display mt-2 text-[34px] lowercase">skin snapshot.</h1>
        </div>
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="grid size-10 place-items-center rounded-full border border-ink/15"
          aria-label="download snapshot"
        >
          <Download className="size-4" />
        </button>
      </header>

      <section className="mx-5 mt-5 overflow-hidden rounded-[28px] bg-ink text-white">
        <div className="grid grid-cols-[42%_1fr] items-stretch">
          <ScanPhoto source={photoSource} className="relative min-h-[210px]" />
          <div className="flex flex-col justify-center p-5">
            <p className="text-[11px] font-bold lowercase tracking-[0.08em] text-white/55">
              overall skin score
            </p>
            <div className="mt-3 flex items-end gap-1.5">
              <span className="brand-display text-[58px] leading-none">{score}</span>
              <span className="pb-1 text-[13px] text-white/50">/100</span>
            </div>
            <span
              className="mt-4 w-fit rounded-full px-3 py-1.5 text-[11px] font-bold lowercase text-ink"
              style={{ backgroundColor: bandTint(scoreBand) }}
            >
              {scoreBand}
            </span>
          </div>
        </div>
      </section>

      {photoQuality === "poor" && (
        <p className="mx-5 mt-3 rounded-[16px] bg-butter px-4 py-3 text-[11.5px] lowercase text-ink/65">
          {LOW_QUALITY_NOTE}
        </p>
      )}

      <section className="mt-8 px-5">
        <p className="brand-eyebrow">focus first</p>
        <h2 className="brand-display mt-2 text-[27px] lowercase">your top 3.</h2>
        <div className="mt-4 overflow-hidden rounded-[24px] border border-ink/10 bg-white">
          {priorities.map((row, index) => (
            <button
              key={row.concern_key}
              type="button"
              onClick={() =>
                navigate({ to: "/scan/concern/$key", params: { key: row.concern_key } })
              }
              className="flex w-full items-center gap-3 border-b border-ink/10 p-4 text-left last:border-0"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-bubblegum/45 text-[13px] font-bold">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold lowercase">
                  {SCAN_CONCERN_LABEL[row.concern_key]}
                </span>
                <span className="mt-0.5 block text-[11.5px] lowercase text-ink-mute">
                  {priorityCopy(row.score)}
                </span>
              </span>
              <span className="text-[13px] font-bold text-ink-mute">{row.score}</span>
              <ChevronRight className="size-4 shrink-0 text-ink-mute" />
            </button>
          ))}
        </div>
      </section>

      {ingredientList.length > 0 && (
        <section className="mx-5 mt-7 rounded-[24px] bg-mint/55 p-5">
          <p className="brand-eyebrow">simple next step</p>
          <h2 className="mt-2 text-[18px] font-bold lowercase">ingredients worth exploring</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {ingredientList.map((ingredient) => (
              <span
                key={ingredient}
                className="rounded-full bg-white px-3 py-2 text-[11.5px] font-semibold lowercase"
              >
                {ingredient}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[10.5px] leading-relaxed text-ink-mute">
            Start slowly and patch test. A professional can help you choose what fits your skin.
          </p>
        </section>
      )}

      <section className="px-5 pt-7">
        <button
          type="button"
          onClick={() => navigate({ to: "/scan/chat" })}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-hot px-5 text-[15px] font-bold lowercase text-white"
        >
          <MessageCircle className="size-4" />
          ask about my results
          <ArrowRight className="size-4" />
        </button>
        <Link
          to="/scan"
          className="mt-3 flex h-11 items-center justify-center gap-2 text-[12.5px] font-semibold lowercase text-ink-mute"
        >
          <RotateCcw className="size-3.5" />
          scan again
        </Link>
      </section>

      <AnalysisFooter className="px-5 pt-3 text-center" />

      <SharePdfSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        scanId={scanId}
        analysis={analysis}
      />
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[430px] px-5 pt-6" aria-hidden="true">
      <div className="h-9 w-48 animate-pulse rounded-full bg-ink/10" />
      <div className="mt-5 h-[210px] animate-pulse rounded-[28px] bg-ink/[0.07]" />
      <div className="mt-8 h-7 w-32 animate-pulse rounded-full bg-ink/10" />
      <div className="mt-4 h-52 animate-pulse rounded-[24px] bg-ink/[0.07]" />
    </div>
  );
}
