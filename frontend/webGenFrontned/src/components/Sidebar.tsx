import {
  LayoutGrid,
  LogOut,
  Sparkles,
  Terminal,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 border-b border-sidebar-border bg-sidebar p-4 md:h-screen md:w-64 md:border-r md:border-b-0">
      <NavLink to="/dashboard" className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Sparkles className="size-5" />
        </span>

        <span className="font-mono text-lg font-semibold tracking-tight">
          AiWebGen
        </span>
      </NavLink>

      <nav className="flex flex-1 flex-col gap-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`
          }
        >
          <LayoutGrid className="size-4" />
          Projects
        </NavLink>

        <div className="mt-4 rounded-md border border-sidebar-border bg-background/40 p-3">
          <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <Terminal className="size-3.5" />
            tip
          </p>

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Describe the site you want. The AI writes the files, you preview
            them live.
          </p>
        </div>
      </nav>

      <div className="space-y-3 border-t border-sidebar-border pt-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-elevated font-mono text-xs uppercase">
            {(username ?? "?").slice(0, 2)}
          </span>

          <span className="truncate text-sm">
            {username ?? "Account"}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}