import { Link, useLocation } from "@tanstack/react-router";
import { Home, Library } from "lucide-react";

export function BottomNav() {
  const { pathname } = useLocation();
  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/library", label: "Library", icon: Library },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}