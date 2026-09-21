import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { z } from "zod";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useScan } from "@/lib/scan-store";

const ConsultChatClient = lazy(() =>
  import("@/components/treatme/ConsultChatClient").then((module) => ({
    default: module.ConsultChatClient,
  })),
);

export const Route = createFileRoute("/scan/chat")({
  validateSearch: z.object({ treatment: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "chat with treatme" },
      {
        name: "description",
        content: "ask what your skin snapshot means and explore cosmetic options.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { treatment } = Route.useSearch();
  const { result, sessionReady } = useScan();

  if (!sessionReady) return <ChatFallback />;
  if (!result) {
    return (
      <div className="px-6 pt-10 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-bubblegum/50">
          <Sparkles className="size-6" />
        </span>
        <p className="brand-eyebrow mt-5">ask treatme</p>
        <h1 className="brand-display mt-2 text-[32px] lowercase">let's scan first.</h1>
        <p className="mx-auto mt-3 max-w-[320px] text-[14px] leading-relaxed text-ink-mute">
          Ask TreatMe works best when it can use your skin snapshot and priorities as context.
        </p>
        <Link
          to="/scan"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-[14px] font-bold lowercase text-white"
        >
          scan my skin
        </Link>
      </div>
    );
  }

  return (
    <ClientOnly fallback={<ChatFallback />}>
      <Suspense fallback={<ChatFallback />}>
        <ConsultChatClient treatmentSlug={treatment} />
      </Suspense>
    </ClientOnly>
  );
}

function ChatFallback() {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-5.5rem)]">
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <Link
          to="/scan/results"
          className="inline-flex items-center gap-1 text-[13px] font-semibold lowercase text-ink-mute"
        >
          <ArrowLeft className="size-4" /> back to results
        </Link>
        <h1 className="brand-eyebrow">ask treatme</h1>
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="rounded-3xl border border-line bg-card p-5">
          <p className="brand-eyebrow">loading</p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-mute">pulling in your chat.</p>
        </div>
      </div>
    </div>
  );
}
