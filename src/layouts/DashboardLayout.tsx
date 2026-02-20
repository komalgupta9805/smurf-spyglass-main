import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle, Clock, Shield, Settings, Lightbulb } from "lucide-react";
import WhyScorePanel from "@/components/WhyScorePanel";
import SettingsDrawer from "@/components/SettingsDrawer";
import AIInsightPanel from "@/components/AIInsightPanel";
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
  const hasAnalysis = useAppStore((s) => s.hasAnalysis);
  const showAIPanel = useAppStore((s) => s.showAIPanel);
  const toggleAIPanel = useAppStore((s) => s.toggleAIPanel);
  const patternInterpretations = useAppStore((s) => s.patternInterpretations);
  const riskExplanations = useAppStore((s) => s.riskExplanations);
  const investigationRecommendations = useAppStore((s) => s.investigationRecommendations);
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen grid-texture">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl border-border/40 shadow-sm">
        <div className="flex items-center h-12 px-4 gap-2 max-w-[1440px] mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-2 mr-4 shrink-0">
            <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-1.5">
              <Shield size={20} className="text-primary" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">smurfatcher</span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-0.5 overflow-x-auto flex-1 scrollbar-none">
            {tabs.map((t) => (
              <NavLink
                key={t.path}
                to={t.path}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all duration-200 hover:scale-105",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
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
              <div className="flex items-center gap-1.5 text-[10px] text-primary bg-primary/10 border border-primary/30 rounded-md px-2 py-0.5 font-bold uppercase tracking-tight animate-pulse-glow">
                <Clock size={12} />
                Last: {processingTime}s
              </div>
            )}

            {hasAnalysis && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleAIPanel}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-all duration-200 hover:scale-110"
                  >
                    <Lightbulb size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">AI Insights & Interpretations</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-all duration-200 hover:scale-110"
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

      <footer className="p-6 mt-auto border-t bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex flex-col items-center justify-center gap-1 opacity-70">
            <span className="flex items-center gap-2"><Shield size={10} className="text-primary" /> SPYGLASS AML ENGINE</span>
            <span className="text-[9px]">All outputs are non-binding analytical indicators intended for compliance review. Final decisions require human investigation.</span>
          </p>
        </div>
      </footer>

      <WhyScorePanel />
      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AIInsightPanel
        patterns={patternInterpretations}
        riskExplanations={riskExplanations}
        recommendations={investigationRecommendations}
        panelOpen={showAIPanel}
        onClose={() => useAppStore.setState({ showAIPanel: false })}
      />
    </div>
  );
};

export default DashboardLayout;
