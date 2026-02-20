import { useCallback, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2, BarChart3, Network, Download } from "lucide-react";

const UploadData = () => {
  const { uploadedFile, setUploadedFile, validationResult, validateFile, runAnalysis, isProcessing, hasAnalysis, loadSampleData } = useAppStore();
  const nav = useNavigate();
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    setUploadedFile(file);
  }, [setUploadedFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Upload Data</h1>
        <p className="text-sm text-muted-foreground">Upload a transaction CSV for fraud analysis</p>
      </div>

      {/* Drop zone */}
      <Card
        className={`border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${dragOver ? "border-primary bg-accent" : "hover:border-primary/50"
          }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".csv";
          input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            if (f) handleFile(f);
          };
          input.click();
        }}
      >
        <Upload className="mx-auto text-muted-foreground mb-3" size={32} />
        <p className="font-medium text-sm">Drop CSV file here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">Accepts .csv files up to 50MB</p>
      </Card>

      {/* Requirements */}
      <Card className="p-4">
        <p className="text-sm font-semibold mb-2">Required Columns</p>
        <div className="flex flex-wrap gap-1.5">
          {["sender", "receiver", "amount", "timestamp"].map((col) => (
            <Badge key={col} variant="secondary" className="font-mono text-xs">{col}</Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Timestamp format: ISO 8601 or YYYY-MM-DD HH:mm:ss</p>
      </Card>

      {/* File info */}
      {uploadedFile && (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <span className="text-sm font-medium">{uploadedFile.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {uploadedFile.size < 1024
                ? `${uploadedFile.size} B`
                : `${(uploadedFile.size / 1024).toFixed(1)} KB`}
            </span>
          </div>
        </Card>
      )}

      {/* Validation */}
      {validationResult && (
        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold">Analytical Integrity Check</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { ok: validationResult.columnsDetected, label: `Column Schema`, detail: validationResult.columns.join(", ") },
              { ok: validationResult.timestampValid, label: "Temporal Format", detail: "Valid ISO/Standard" },
              { ok: validationResult.amountNumeric, label: "Numerical Consistency", detail: "Amounts numeric" },
              { ok: validationResult.amountPositive, label: "Volume Integrity", detail: "All values > 0" },
              { ok: validationResult.duplicateTxCount === 0, label: "Identifier Integrity", detail: `${validationResult.duplicateTxCount} duplicates` },
              { ok: true, label: "Record Count", detail: `${validationResult.rowsParsed.toLocaleString()} parsed` },
            ].map((v, i) => (
              <div key={i} className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded border border-border">
                {v.ok ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertTriangle size={14} className="text-red-500" />}
                <div>
                  <p className="font-semibold">{v.label}</p>
                  <p className="text-[10px] text-muted-foreground">{v.detail}</p>
                </div>
              </div>
            ))}
          </div>
          {validationResult.invalidRows > 0 && (
            <div className="flex items-center gap-2 text-xs text-risk-medium-dark font-medium mt-1">
              <AlertTriangle size={14} />
              <span>{validationResult.invalidRows} records failed validation and will be skipped</span>
            </div>
          )}
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={validateFile} disabled={!uploadedFile || isProcessing}>
          Validate Ingest
        </Button>
        <Button variant="outline" onClick={() => { loadSampleData(); }} className="gap-1">
          <Download size={14} /> Load Synthetic Case
        </Button>
        <Button
          onClick={runAnalysis}
          disabled={!uploadedFile || !validationResult || isProcessing}
          className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
          Run Behavioral Analysis
        </Button>
        <Button variant="ghost" className="text-xs" onClick={() => { setUploadedFile(null); }}>Reset</Button>
      </div>

      {/* Post-analysis */}
      {hasAnalysis && !isProcessing && (
        <Card className="p-4 border-primary/30 bg-accent">
          <p className="text-sm font-semibold text-primary mb-3">✓ Analysis Complete</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => nav("/analytics")} className="gap-1">
              <BarChart3 size={14} /> Analytics Results
            </Button>
            <Button size="sm" variant="outline" onClick={() => nav("/graph")} className="gap-1">
              <Network size={14} /> Transaction Graph
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              const json = JSON.stringify({ accounts: useAppStore.getState().accounts, rings: useAppStore.getState().rings }, null, 2);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "analysis.json"; a.click();
              URL.revokeObjectURL(url);
            }} className="gap-1">
              <Download size={14} /> Download JSON
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UploadData;
