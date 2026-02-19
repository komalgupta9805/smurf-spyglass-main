import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle, Clock, Shield, Settings } from "lucide-react";
import WhyScorePanel from "@/components/WhyScorePanel";
import SettingsDrawer from "@/components/SettingsDrawer";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", path: "/" },
  { label: "Analytics", path: "/analytics" },
  { label: "Transaction Graph", path: "/graph" },
  { label: "Entities", path: "/entities" },
  { label: "Intervention", path: "/intervention" },
  { label: "Benchmark", path: "/benchmark" },
  { label: "Report", path: "/report" },
];

const DashboardLayout = () => {
  const processingTime = useAppStore((s) => s.processingTime);
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen grid-texture">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="flex items-center h-12 px-4 gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2 mr-4 shrink-0">
            <Shield size={20} className="text-primary" />
            <span className="font-bold text-sm tracking-tight hidden sm:inline">smurfatcher</span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-0.5 overflow-x-auto flex-1 scrollbar-none">
            {tabs.map((t) => (
              <NavLink
                key={t.path}
                to={t.path}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {processingTime !== null && (
              <div className="flex items-center gap-1.5 text-[10px] text-primary bg-primary/10 border border-primary/20 rounded-md px-2 py-0.5 font-bold uppercase tracking-tight">
                Last analysis: {processingTime}s
              </div>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Settings size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">System Settings</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 md:p-6 max-w-[1440px] mx-auto animate-fade-in">
        <Outlet />
      </main>

      <footer className="p-6 mt-auto border-t bg-muted/30">
        <div className="max-w-[1440px] mx-auto text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex flex-col items-center justify-center gap-1 opacity-60">
            <span className="flex items-center gap-2"><Shield size={10} className="text-primary" /> SPYGLASS AML ENGINE</span>
            <span>All outputs are non-binding analytical indicators intended for compliance review. Final decisions require human investigation.</span>
          </p>
        </div>
      </footer>

      <WhyScorePanel />
      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default DashboardLayout;
