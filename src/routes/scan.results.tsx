import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronRight, Download, MessageCircle } from "lucide-react";
import { useScan } from "@/lib/scan-store";
import { toConcernRows, SCAN_CONCERN_LABEL, SCAN_CONCERN_KEYS } from "@/lib/scan-concerns";
import { LOW_QUALITY_NOTE } from "@/lib/photo-check";
import { treatmentsForConcerns } from "@/lib/concern-treatments";
import { useScanPhotoSource } from "@/lib/scan-photo";
import { ScanPhoto } from "@/components/treatme/ScanPhoto";
import { AnalysisFooter } from "@/components/treatme/AnalysisFooter";
import { SharePdfSheet } from "@/components/treatme/SharePdfSheet";
import { SaveTreatmentButton } from "@/components/treatme/SaveTreatmentButton";
import { fetchSavedScan } from "@/lib/scan-history";
import { getRecommendations } from "@/lib/recommendations";
import { topConcerns } from "@/lib/skinAnalysis";
import { FaceMap } from "@/components/treatme/FaceMap";
import { MarkerOverlay } from "@/components/treatme/MarkerOverlay";
import { markerDrawing } from "@/lib/marker-shapes";
import { findIndicator, skinIndicatorsQuery } from "@/lib/skin-indicators";

export const Route = createFileRoute("/scan/results")({
  validateSearch: (search: Record<string, unknown>): { id?: string } =>
    typeof search.id === "string" ? { id: search.id } : {},
  head: () => ({
    meta: [
      { title: "your skin snapshot · treatme" },
      {
        name: "description",
        content:
          "understand what your cosmetic skin scan noticed and explore what may be worth asking about.",
      },
      { property: "og:title", content: "your skin snapshot · treatme" },
      {
        property: "og:description",
        content:
          "understand what your cosmetic skin scan noticed and explore what may be worth asking about.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResultsPage,
});

const FINDING_COPY: Record<string, string> = {
  pores: "pore visibility stood out here",
  breakouts: "visible blemish activity stood out",
  texture: "surface texture looked less even",
  oiliness: "shine and congestion stood out",
  redness: "visible redness stood out",
  pigmentation: "uneven pigment stood out",
  uniformness: "tone looked less even",
  radiance: "skin looked a little less luminous",
  lines: "visible lines stood out",
  firmness: "visible firmness may be worth watching",
  volume_loss: "facial volume patterns stood out",
  hydration: "skin looked less hydrated",
  dark_circles: "under-eye darkness stood out",
  under_eye_puffiness: "under-eye puffiness stood out",
  tear_trough: "under-eye hollowing stood out",
  eyelid_heaviness: "the upper-eye area stood out",
  symmetry: "small differences between sides stood out",
  fine_lines: "fine lines stood out",
};

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
  symmetry: ["daily spf", "barrier moisturizer"],
  fine_lines: ["retinoid", "peptides", "daily spf"],
};

function findingCopy(key: string) {
  return FINDING_COPY[key] ?? "this area stood out in your photo";
}

function ingredientsFor(key: string) {
  return INGREDIENTS[key] ?? ["gentle cleanser", "barrier moisturizer", "daily spf"];
}

function priorityLabel(score: number) {
  if (score >= 90) return "minimal";
  if (score >= 80) return "low visibility";
  if (score >= 50) return "some visibility";
  return "more visible";
}

function experienceLabel(slug: string, family: string | null) {
  const value = `${slug} ${family ?? ""}`.toLowerCase();
  if (/botox|filler|inject|biostim|prp|microneedl|mesotherapy/.test(value)) return "needle-based";
  return "no needles";
}

function ResultsPage() {
  const navigate = useNavigate();
  const { id: requestedId } = Route.useSearch();
  const { result, analysis, scanId, photoQuality, measured, landmarks, hydrate, setResult } =
    useScan();
  const photoSource = useScanPhotoSource();
  const [shareOpen, setShareOpen] = useState(false);
  const [loading, setLoading] = useState(Boolean(requestedId && requestedId !== scanId));
  const loadedFor = useRef<string | null>(null);

  // reopening a saved scan from the profile tab: the scores are a few kilobytes
  // of json, so they land first and the screen renders straight away. the photo
  // and the treatment matches arrive afterwards, they never gate the page.
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
        // in the background: the screen is already up by now
        const { scanDriven, goalDriven } = await getRecommendations(topConcerns(saved.result), []);
        if (alive) setResult(saved.result, scanDriven, goalDriven);
      }
    })();
    return () => {
      alive = false;
    };
  }, [requestedId, scanId, hydrate, setResult]);

  const rows = useMemo(() => (result ? toConcernRows(result, measured) : []), [result, measured]);
  // symmetry is persisted but is not one of the four groups, so it stays out
  // of the headline ordering and the treatment matching.
  const ordered = useMemo(() => [...rows].sort((a, b) => a.score - b.score), [rows]);
  const { data: indicators = [] } = useQuery(skinIndicatorsQuery());

  // the four groups only: symmetry and fine lines render, but do not drive matching
  const grid = useMemo(
    () => ordered.filter((r) => SCAN_CONCERN_KEYS.includes(r.concern_key)),
    [ordered],
  );
  const worst = grid[0];
  const priorities = grid.slice(0, 3);
  const strongest = grid[grid.length - 1];

  const { data: matches = [] } = useQuery({
    queryKey: ["concern-treatments", grid.map((r) => `${r.concern_key}:${r.score}`).join(",")],
    queryFn: () => treatmentsForConcerns(grid, 5),
    enabled: grid.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  if (loading && !result) return <ResultsSkeleton />;

  if (!result) {
    return (
      <div className="px-6 pt-12 text-center">
        <p className="brand-eyebrow">no scan yet</p>
        <h1 className="brand-display text-3xl mt-2">let's read your skin first.</h1>
        <div className="mt-6">
          <Link to="/scan">
            <span className="inline-flex items-center justify-center rounded-full bg-ink text-cream h-12 px-6 font-semibold lowercase">
              scan me
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
      <header className="px-6" style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="brand-eyebrow">your results</p>
            <h1 className="brand-display mt-2 text-[32px] lowercase">your skin snapshot.</h1>
          </div>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/15"
            aria-label="download snapshot"
          >
            <Download className="size-4" />
          </button>
        </div>
        <p className="mt-3 max-w-[360px] text-[13px] leading-relaxed text-ink-mute">
          Here is what stood out in this photo, in plain English. Start with the priorities—not
          every visible detail needs action.
        </p>
        {photoQuality === "poor" && (
          <p className="mt-2 rounded-xl bg-butter px-3 py-2 text-[12px] lowercase text-ink/65">
            {LOW_QUALITY_NOTE}
          </p>
        )}
      </header>

      {/* the photo lives here and only here */}
      <div className="mt-4 mx-6 rounded-3xl overflow-hidden border border-ink/10">
        <ScanPhoto source={photoSource} className="relative aspect-[4/5]" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 px-6">
        {worst && (
          <div className="rounded-[22px] bg-bubblegum/50 p-4">
            <p className="text-[11px] font-bold lowercase text-ink-mute">priority #1</p>
            <p className="mt-2 text-[19px] font-bold lowercase leading-tight">
              {SCAN_CONCERN_LABEL[worst.concern_key]}
            </p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft">
              {findingCopy(worst.concern_key)}
            </p>
          </div>
        )}
        {strongest && (
          <div className="rounded-[22px] bg-mint p-4">
            <p className="text-[11px] font-bold lowercase text-ink-mute">strongest area</p>
            <p className="mt-2 text-[19px] font-bold lowercase leading-tight">
              {SCAN_CONCERN_LABEL[strongest.concern_key]}
            </p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft">
              This appeared to need less attention in this photo.
            </p>
          </div>
        )}
      </div>

      <section className="mt-8 px-6">
        <p className="brand-eyebrow">what to focus on</p>
        <h2 className="brand-display mt-2 text-[26px] lowercase">your top 3 priorities.</h2>
        <div className="mt-4 space-y-2">
          {priorities.map((row, index) => {
            const ind = findIndicator(indicators, row.concern_key);
            return (
              <button
                key={row.concern_key}
                type="button"
                onClick={() =>
                  navigate({
                    to: "/scan/concern/$key",
                    params: { key: ind?.slug ?? row.concern_key },
                  })
                }
                className="flex w-full items-center gap-3 rounded-[20px] border border-ink/10 bg-white p-4 text-left"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-butter text-[13px] font-bold">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold lowercase">
                    {ind?.name ?? SCAN_CONCERN_LABEL[row.concern_key]}
                  </span>
                  <span className="mt-0.5 block text-[12px] lowercase text-ink-mute">
                    {priorityLabel(row.score)} · {findingCopy(row.concern_key)}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-ink-mute" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8 px-6">
        <p className="brand-eyebrow">at-home options</p>
        <h2 className="brand-display mt-2 text-[24px] lowercase">ingredients to explore.</h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-mute">
          Start slowly and patch test. A professional can help you choose what fits your skin and
          current routine.
        </p>
        <div className="mt-4 space-y-3">
          {priorities.map((row) => (
            <div key={row.concern_key} className="rounded-[20px] bg-[#fff8fb] p-4">
              <p className="text-[13px] font-bold lowercase">
                for {SCAN_CONCERN_LABEL[row.concern_key]}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ingredientsFor(row.concern_key).map((ingredient) => (
                  <span
                    key={ingredient}
                    className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[11.5px] font-semibold lowercase"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* the detail */}
      <div className="mt-8">
        <div className="px-6">
          <p className="brand-eyebrow">your full snapshot</p>
          <h2 className="brand-display text-[24px] mt-2 lowercase">area by area.</h2>
          <p className="text-[13px] text-ink/55 mt-1 lowercase">
            tap any area for a plain-English breakdown
          </p>
        </div>
        <div className="mt-4 overflow-x-auto scrollbar-none">
          <div className="flex gap-3 px-6 pb-2">
            {ordered.map((row) => {
              const ind = findIndicator(indicators, row.concern_key);
              // ten strongest only: more than that is mud at this size
              const drawing = markerDrawing({
                regions: row.regions,
                accent: ind?.accent ?? "#F8A1C6",
                overlayKind: ind?.overlayKind ?? "patches_soft",
                score: row.score,
                landmarks,
                seed: scanId,
                limit: 10,
              });
              return (
                <button
                  key={row.concern_key}
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/scan/concern/$key",
                      params: { key: ind?.slug ?? row.concern_key },
                    })
                  }
                  className="text-left shrink-0 w-[112px]"
                >
                  {photoSource.url ? (
                    <ScanPhoto
                      source={photoSource}
                      alt={`your photo with ${ind?.name ?? row.concern_key} marked`}
                      className="w-[112px] aspect-[3/4] rounded-2xl border border-ink/10"
                    >
                      {drawing.shapes.length > 0 && (
                        <MarkerOverlay
                          regions={row.regions}
                          accent={ind?.accent ?? "#F8A1C6"}
                          overlayKind={ind?.overlayKind ?? "patches_soft"}
                          drawing={drawing}
                        />
                      )}
                    </ScanPhoto>
                  ) : (
                    <FaceMap
                      compact
                      overlayKind={ind?.overlayKind ?? "patches_soft"}
                      accent={ind?.accent ?? "#F8A1C6"}
                      region={ind?.region ?? "full_face"}
                      score={row.score}
                      className="w-[112px] rounded-2xl border border-ink/10"
                    />
                  )}
                  <p className="mt-2 text-[13px] font-semibold lowercase leading-tight">
                    {ind?.name ?? SCAN_CONCERN_LABEL[row.concern_key]}
                  </p>
                  <p className="text-[12px] text-ink/55">{priorityLabel(row.score)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* professional options */}
      <div className="mt-8 px-6">
        <p className="brand-eyebrow">professional options</p>
        <h2 className="brand-display text-[24px] mt-2 lowercase">scan suggestions.</h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-mute">
          Educational options matched to what stood out—not a prescription or treatment plan.
        </p>

        <div className="mt-4 rounded-3xl border border-ink/10 bg-white divide-y divide-ink/10 overflow-hidden">
          {matches.length === 0 ? (
            <p className="p-5 text-[14px] text-ink-mute">
              we're lining up options for your snapshot. check back in a moment.
            </p>
          ) : (
            matches.map((m) => (
              <div key={m.slug} className="flex items-center gap-2 pr-3">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/treatment/$slug", params: { slug: m.slug } })}
                  className="min-w-0 flex-1 text-left px-4 py-4 flex items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[16px] lowercase leading-tight">{m.name}</p>
                    <p className="text-[12px] text-ink-mute mt-1 lowercase">
                      explore for {m.concernLabel}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-mint px-2 py-1 text-[10px] font-semibold lowercase">
                        {experienceLabel(m.slug, m.family)}
                      </span>
                      {m.downtime && (
                        <span className="rounded-full bg-butter px-2 py-1 text-[10px] font-semibold lowercase">
                          downtime: {m.downtime}
                        </span>
                      )}
                    </div>
                  </div>
                  {m.priceFrom !== null && (
                    <p className="text-[13px] font-semibold shrink-0">
                      from ${Math.round(m.priceFrom)}
                    </p>
                  )}
                  <ChevronRight className="size-5 text-ink-mute shrink-0" />
                </button>
                <SaveTreatmentButton
                  slug={m.slug}
                  name={m.name}
                  size={18}
                  className="size-9 shrink-0"
                />
              </div>
            ))
          )}
        </div>
      </div>

      <AnalysisFooter className="mt-6 px-6" />

      {/* saved + download links */}
      <div className="px-6 mt-4 flex items-center justify-center gap-5">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 text-[13px] text-ink/55 lowercase"
        >
          <Check className="size-3.5" aria-hidden="true" />
          saved to your profile
        </Link>
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="text-[13px] text-ink/55 lowercase underline underline-offset-4"
        >
          download
        </button>
      </div>

      {/* sticky ask bar */}
      <div
        className="fixed inset-x-0 z-30 px-6 pt-4 pb-3 bg-gradient-to-t from-cream via-cream to-transparent"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/scan/chat" })}
          className="w-full h-12 rounded-full text-[15px] font-semibold lowercase text-cream"
          style={{ backgroundColor: "#FF1F87" }}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <MessageCircle className="size-4" />
            ask treatme about my results
          </span>
        </button>
      </div>

      <SharePdfSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        scanId={scanId}
        analysis={analysis}
      />
    </div>
  );
}

/** the shape of the real screen, so nothing jumps when the scores land */
function ResultsSkeleton() {
  return (
    <div className="pb-24" aria-hidden="true">
      <div
        className="px-6 flex items-center justify-between gap-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <div className="h-7 w-48 rounded-full bg-ink/10 animate-pulse" />
        <div className="h-9 w-20 rounded-full bg-ink/10 animate-pulse" />
      </div>
      <div className="mt-4 mx-6 rounded-3xl aspect-[4/5] bg-ink/[0.06] animate-pulse" />
      <div className="mt-4 px-6 grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[92px] rounded-2xl bg-ink/[0.06] animate-pulse" />
        ))}
      </div>
      <div className="mt-8 px-6">
        <div className="h-6 w-32 rounded-full bg-ink/10 animate-pulse" />
      </div>
      <div className="mt-4 flex gap-3 px-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="size-[112px] shrink-0 rounded-2xl bg-ink/[0.06] animate-pulse" />
        ))}
      </div>
      <div className="mt-8 mx-6 h-52 rounded-3xl bg-ink/[0.06] animate-pulse" />
    </div>
  );
}
