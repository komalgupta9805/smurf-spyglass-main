import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { HelpCircle, Info, MessageSquare, Shield, FileText, Settings2, ExternalLink, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

interface SettingsDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SettingsDrawer = ({ open, onOpenChange }: SettingsDrawerProps) => {
    const { settings, updateSettings } = useAppStore();
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" || "system";
        setTheme(savedTheme);
    }, []);

    const toggleTheme = (newTheme: "light" | "dark" | "system") => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        
        const html = document.documentElement;
        if (newTheme === "system") {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            html.classList.toggle("dark", isDark);
        } else {
            html.classList.toggle("dark", newTheme === "dark");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] overflow-y-auto">
                <SheetHeader className="pb-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <Settings2 size={18} className="text-primary" />
                        System Configuration
                    </SheetTitle>
                    <SheetDescription>Manage display preferences and assistance</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-8 pb-12 text-sm">
                    {/* Theme Selection */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            Theme
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => toggleTheme("light")}
                                className={`p-3 rounded-lg border transition-all ${theme === "light" ? "bg-primary/10 border-primary" : "border-border hover:border-primary/50"}`}
                            >
                                <Sun size={16} className="mx-auto mb-1" />
                                <span className="text-xs font-medium">Light</span>
                            </button>
                            <button
                                onClick={() => toggleTheme("dark")}
                                className={`p-3 rounded-lg border transition-all ${theme === "dark" ? "bg-primary/10 border-primary" : "border-border hover:border-primary/50"}`}
                            >
                                <Moon size={16} className="mx-auto mb-1" />
                                <span className="text-xs font-medium">Dark</span>
                            </button>
                            <button
                                onClick={() => toggleTheme("system")}
                                className={`p-3 rounded-lg border transition-all ${theme === "system" ? "bg-primary/10 border-primary" : "border-border hover:border-primary/50"}`}
                            >
                                <Settings2 size={16} className="mx-auto mb-1" />
                                <span className="text-xs font-medium">System</span>
                            </button>
                        </div>
                    </section>

                    <Separator />

                    {/* Display Preferences */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            Display Preferences
                        </h3>
                        <TooltipProvider>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <Label className="text-sm">Edge Labels</Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle size={10} className="text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-[200px] text-[11px]">
                                                    When enabled, graph links display aggregated transaction information such as total transferred amount or transaction count. This does not affect analysis results.
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">Show transaction information on graph connections</p>
                                    </div>
                                    <Switch
                                        checked={settings.defaultEdgeLabel !== "none"}
                                        onCheckedChange={(checked) => updateSettings({ defaultEdgeLabel: checked ? "amount" : "none" })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <Label className="text-sm">Risk Badge Style</Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle size={10} className="text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-[200px] text-[11px]">
                                                    Controls the visual style of risk badges shown across the application. Does not change risk scores or classifications.
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">Modern high-contrast risk indicators</p>
                                    </div>
                                    <Switch checked={true} disabled />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <Label className="text-sm">Confidence Indicators</Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle size={10} className="text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-[200px] text-[11px]">
                                                    Displays confidence levels that indicate how strongly the detected patterns support the risk assessment.
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">Show analytical confidence scores</p>
                                    </div>
                                    <Switch checked={true} disabled />
                                </div>
                            </div>
                        </TooltipProvider>
                    </section>

                    <Separator />

                    {/* User Assistance */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            User Assistance
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {/* Glossary */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="justify-start gap-3 h-12 border-dashed">
                                        <HelpCircle size={16} className="text-primary" />
                                        <div className="text-left">
                                            <p className="text-xs font-semibold">Glossary of Terms</p>
                                            <p className="text-[9px] text-muted-foreground">Definition of motifs and indicators</p>
                                        </div>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Glossary of Terms</DialogTitle>
                                        <DialogDescription className="text-[10px] italic">Definition of motifs and indicators</DialogDescription>
                                    </DialogHeader>
                                    <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                                        {[
                                            { t: "Cycle (Circular Routing)", d: "A closed loop of transactions where funds move through multiple accounts and return to the origin, often used to obscure money trails." },
                                            { t: "Fan-In (Aggregation)", d: "A pattern where many accounts send funds into a single account within a short time window, commonly used to pool illicit funds." },
                                            { t: "Fan-Out (Distribution)", d: "A pattern where one account disperses funds to many other accounts rapidly, often to evade reporting thresholds." },
                                            { t: "Shell / Layering Chain", d: "A multi-hop transfer path involving intermediary accounts with minimal activity, used to distance funds from their source." },
                                            { t: "Ring", d: "A group of accounts connected through one or more coordinated suspicious patterns." },
                                            { t: "Risk Score", d: "A normalized score (0–100) representing the severity of detected suspicious behavior based on structural patterns." },
                                            { t: "Confidence", d: "An indicator (0–100) representing how strongly the observed data supports the assigned risk score." },
                                            { t: "Coordination Strength", d: "A measure of how tightly connected, time-compressed, and flow-balanced a suspicious network is." }
                                        ].map(item => (
                                            <div key={item.t} className="space-y-1">
                                                <p className="text-xs font-bold text-primary">{item.t}</p>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{item.d}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-[9px] text-muted-foreground opacity-60 border-t pt-2">
                                        All terms are analytical descriptors and do not imply criminal activity.
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Workflow Guide */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="justify-start gap-3 h-12 border-dashed">
                                        <FileText size={16} className="text-primary" />
                                        <div className="text-left">
                                            <p className="text-xs font-semibold">Workflow Guide</p>
                                            <p className="text-[9px] text-muted-foreground">Step-by-step investigation process</p>
                                        </div>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Workflow Guide</DialogTitle>
                                        <DialogDescription className="text-[10px] italic">Step-by-step investigation process</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        {[
                                            { s: "Step 1 — Upload Data", d: "Upload a transaction CSV file following the required schema." },
                                            { s: "Step 2 — Analyze", d: "The system builds a transaction graph and detects structural patterns such as cycles, aggregation, and layering." },
                                            { s: "Step 3 — Review Results", d: "Explore detected suspicious networks, risk scores, and supporting evidence." },
                                            { s: "Step 4 — Investigate Graph", d: "Interact with the transaction graph to inspect flows, nodes, and ring structures." },
                                            { s: "Step 5 — Export Findings", d: "Download structured JSON or PDF reports for compliance review or further analysis." }
                                        ].map(step => (
                                            <div key={step.s} className="space-y-1">
                                                <p className="text-xs font-bold text-primary">{step.s}</p>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{step.d}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-[9px] text-muted-foreground opacity-60 border-t pt-2">
                                        MuleCatcher provides decision-support insights only. Final conclusions require human investigation.
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <section className="mt-2 space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
                                <div className="flex items-center gap-2 mb-1">
                                    <MessageSquare size={14} className="text-primary" />
                                    <h4 className="text-xs font-bold">Contact & Feedback</h4>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[11px] font-medium">Have feedback, questions, or issues?</p>
                                    <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                                        <li>Report a bug or UI issue</li>
                                        <li>Request clarification on analytics</li>
                                        <li>Suggest feature improvements</li>
                                    </ul>
                                    <div className="pt-1">
                                        <p className="text-[10px] text-muted-foreground">Contact Email:</p>
                                        <a href="mailto:support@mulecatcher.demo" className="text-[10px] text-primary hover:underline font-mono">support@mulecatcher.demo</a>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground italic border-t pt-1.5 opacity-60">
                                        This demo does not process real customer data. Do not upload sensitive or personal information.
                                    </p>
                                </div>
                            </section>
                        </div>
                    </section>

                    <Separator />

                    {/* About */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            About
                        </h3>
                        <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium">System Version</span>
                                    <Badge variant="secondary" className="text-[10px] font-mono">v2.4.0-stable</Badge>
                                </div>
                                <p className="text-[9px] text-muted-foreground italic opacity-60">Current stable demo version used for evaluation and demonstration purposes.</p>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium">Data Policy</span>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="link" className="p-0 h-auto text-[10px] font-bold">View Policy <ExternalLink size={8} className="ml-1" /></Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Data Handling & Privacy Policy</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-6 py-2">
                                            {[
                                                { t: "1. Data Processing Scope", c: ["Uploaded CSV files are processed in-memory for analytical purposes only.", "No transaction data is permanently stored."] },
                                                { t: "2. Storage & Retention", c: ["No persistent database storage of uploaded datasets.", "Data is cleared after session completion."] },
                                                { t: "3. Data Sharing", c: ["No uploaded data is transmitted to third parties.", "No external APIs receive user transaction data."] },
                                                { t: "4. Model Usage", c: ["No machine learning model training occurs on uploaded data.", "No behavioral profiling outside the uploaded dataset."] },
                                                { t: "5. Intended Use", c: ["This platform is a decision-support analytical tool.", "Not intended for direct enforcement or automated action."] },
                                                { t: "6. Security Notice", c: ["Users should not upload real customer-sensitive or personally identifiable information in demo environments."] }
                                            ].map(section => (
                                                <div key={section.t} className="space-y-2">
                                                    <h4 className="text-xs font-bold text-primary">{section.t}</h4>
                                                    <ul className="space-y-1">
                                                        {section.c.map((item, i) => (
                                                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                            <div className="pt-2 border-t text-[11px] text-muted-foreground italic leading-relaxed">
                                                This system is designed for demonstration and evaluation only.
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="w-full">Close</Button>
                                            </DialogTrigger>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="pt-2 border-t mt-2">
                                <p className="text-[10px] leading-relaxed text-muted-foreground italic opacity-80">
                                    All outputs are non-binding analytical indicators intended for compliance review only.
                                    MuleCatcher does not determine fraud or criminal intent.
                                    Final decisions require human investigation and regulatory judgment.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default SettingsDrawer;
