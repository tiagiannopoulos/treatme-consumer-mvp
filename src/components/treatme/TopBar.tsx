import { Link, useRouterState } from "@tanstack/react-router";
import { User } from "lucide-react";

function titleFor(pathname: string) {
  if (pathname.startsWith("/progress")) return "progress";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/scan/chat")) return "ask";
  if (pathname.startsWith("/scan")) return "skin scan";

  return "home";
}

export function TopBar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  // the results screen renders its own header; the global bar would duplicate
  // the "analysis results" title and the profile button.
  if (pathname.startsWith("/scan/results")) return null;
  const title = titleFor(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-line/50 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-baseline gap-3">
          <Link
            to="/"
            className="brand-display text-[25px] tracking-[-0.05em] leading-none lowercase"
          >
            treatme<span className="text-hot">.</span>
          </Link>
          {title !== "home" && (
            <span className="text-[11px] font-bold lowercase tracking-[0.08em] text-ink-mute">
              {title}
            </span>
          )}
        </div>
        <Link
          to="/profile"
          className="size-9 rounded-full bg-ink text-cream grid place-items-center"
          aria-label="profile"
        >
          <User className="size-4" strokeWidth={2.2} />
        </Link>
      </div>
    </header>
  );
}
