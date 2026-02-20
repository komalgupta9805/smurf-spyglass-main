import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Download, FileJson, FileText, Sheet } from "lucide-react";

type ExportFormat = "json" | "csv" | "excel" | "pdf";

interface ExportOption {
  format: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

const ExportWizard = () => {
  const { currentCase, accounts, rings, edges } = useAppStore();
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");

  const exportOptions: ExportOption[] = [
    {
      format: "json",
      label: "JSON Export",
      description: "Complete analysis data with all entities, networks, and scores",
      icon: <FileJson size={20} />,
      available: true,
    },
    {
      format: "csv",
      label: "CSV Tables",
      description: "Entities and networks as separate CSV files for spreadsheet analysis",
      icon: <Sheet size={20} />,
      available: true,
    },
    {
      format: "excel",
      label: "Excel Workbook",
      description: "Multi-sheet Excel file with formatted tables and charts",
      icon: <Sheet size={20} />,
      available: false,
    },
    {
      format: "pdf",
      label: "PDF Report",
      description: "Formatted compliance report with executive summary and findings",
      icon: <FileText size={20} />,
      available: false,
    },
  ];

  const handleExport = (format: ExportFormat) => {
    const timestamp = new Date().toISOString().split("T")[0];
    
    if (format === "json") {
      const data = {
        case: currentCase,
        accounts: accounts.map(a => ({
          id: a.id,
          riskScore: a.riskScore,
          confidence: a.confidence,
          patterns: a.patterns,
          ringId: a.ringId,
          inDegree: a.inDegree,
          outDegree: a.outDegree,
          centralityScore: a.centralityScore,
        })),
        rings: rings.map(r => ({
          id: r.id,
          members: r.members,
          patternType: r.patternType,
          riskScore: r.riskScore,
          coordStrength: r.coordStrength,
        })),
        exportDate: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      downloadFile(blob, `smurfatcher-analysis-${timestamp}.json`);
    } else if (format === "csv") {
      // Export accounts CSV
      const accountsCSV = [
        ["Account ID", "Risk Score", "Confidence", "Patterns", "Ring ID", "In-Degree", "Out-Degree", "Centrality"].join(","),
        ...accounts.map(a =>
          [a.id, a.riskScore, a.confidence.toFixed(2), a.patterns.join("|"), a.ringId || "—", a.inDegree, a.outDegree, a.centralityScore.toFixed(2)].join(",")
        ),
      ].join("\n");

      // Export rings CSV
      const ringsCSV = [
        ["Ring ID", "Members", "Pattern Type", "Risk Score", "Coordination Strength"].join(","),
        ...rings.map(r =>
          [r.id, r.members.length, r.patternType, r.riskScore, r.coordStrength.toFixed(2)].join(",")
        ),
      ].join("\n");

      // Download as ZIP (using data URLs for multiple files)
      const blob1 = new Blob([accountsCSV], { type: "text/csv" });
      const blob2 = new Blob([ringsCSV], { type: "text/csv" });
      
      downloadFile(blob1, `smurfatcher-accounts-${timestamp}.csv`);
      downloadFile(blob2, `smurfatcher-rings-${timestamp}.csv`);
    }

    setOpen(false);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!currentCase) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Download size={14} />
          Export Results
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Analysis Results</DialogTitle>
          <DialogDescription>
            Choose your preferred format to export the analysis data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <RadioGroup value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as ExportFormat)}>
            {exportOptions.map((option) => (
              <div key={option.format} className="space-y-2">
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value={option.format} id={option.format} disabled={!option.available} />
                  <Label
                    htmlFor={option.format}
                    className="flex-1 cursor-pointer flex items-center gap-3"
                  >
                    <div className="text-muted-foreground">{option.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.label}</span>
                        {!option.available && (
                          <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleExport(selectedFormat)}
            disabled={!exportOptions.find(o => o.format === selectedFormat)?.available}
            className="gap-2"
          >
            <Download size={14} />
            Export as {exportOptions.find(o => o.format === selectedFormat)?.label}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportWizard;
