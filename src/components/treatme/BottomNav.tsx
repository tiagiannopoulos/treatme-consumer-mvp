import { Link } from "@tanstack/react-router";
import { Home, ScanFace, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = {
  to: "/" | "/scan" | "/profile";
  label: string;
  icon: typeof Home;
  primary?: boolean;
};

const tabs: Tab[] = [
  { to: "/", label: "home", icon: Home },
  { to: "/scan", label: "scan", icon: ScanFace, primary: true },
  { to: "/profile", label: "my skin", icon: User },
];

export function BottomNav() {
  return (
    <nav
      aria-label="main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-[430px] grid-cols-3 px-8 pb-2 pt-2">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex justify-center">
            <Link
              to={tab.to}
              aria-label={tab.label}
              className="group flex min-h-11 flex-col items-center gap-1 rounded-xl px-5 py-1"
              activeOptions={{ exact: tab.to === "/" || tab.to === "/scan" }}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "grid place-items-center transition-colors",
                      tab.primary ? "-mt-4 size-12 rounded-full shadow-md" : "size-7",
                      tab.primary
                        ? isActive
                          ? "bg-hot text-white"
                          : "bg-ink text-cream"
                        : isActive
                          ? "text-hot"
                          : "text-ink-mute group-hover:text-ink-soft",
                    )}
                  >
                    <tab.icon
                      className={tab.primary ? "size-5" : "size-[18px]"}
                      strokeWidth={2.2}
                    />
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap text-[10px] font-semibold lowercase tracking-[0.04em]",
                      isActive ? "text-ink" : "text-ink-mute",
                    )}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
