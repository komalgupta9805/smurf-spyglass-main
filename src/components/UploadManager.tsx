import { useCallback, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2, BarChart3, Network, Download } from "lucide-react";

const UploadManager = () => {
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
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
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

                    <Card className="p-4">
                        <p className="text-sm font-semibold mb-2">Required Columns</p>
                        <div className="flex flex-wrap gap-1.5">
                            {["transaction_id", "sender_id", "receiver_id", "amount", "timestamp"].map((col) => (
                                <Badge key={col} variant="secondary" className="font-mono text-xs">{col}</Badge>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Timestamp: ISO 8601 or YYYY-MM-DD HH:mm:ss</p>
                    </Card>
                </div>

                <div className="space-y-4">
                    {uploadedFile && (
                        <Card className="p-4">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-primary" />
                                <span className="text-sm font-medium">{uploadedFile.name}</span>
                                <span className="text-xs text-muted-foreground ml-auto">{(uploadedFile.size / 1024).toFixed(0)} KB</span>
                            </div>
                        </Card>
                    )}

                    {validationResult && (
                        <Card className="p-4 space-y-2">
                            <p className="text-sm font-semibold">Validation Results</p>
                            {[
                                { ok: validationResult.columnsDetected, label: `Columns: ${validationResult.columns.join(", ")}` },
                                { ok: validationResult.timestampValid, label: "Timestamp format valid" },
                                { ok: validationResult.amountNumeric, label: "Amount values numeric" },
                                { ok: true, label: `${validationResult.rowsParsed.toLocaleString()} rows parsed` },
                            ].map((v, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    {/* <CheckCircle2 size={14} className="text-risk-low" /> */}
                                    {v.ok ? (
                                        <CheckCircle2 size={14} className="text-risk-low" />
                                    ) : (
                                        <AlertTriangle size={14} className="text-risk-medium" />
                                    )}
                                    <span>{v.label}</span>
                                </div>
                            ))}
                            {validationResult.invalidRows > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                    <AlertTriangle size={14} className="text-risk-medium" />
                                    <span>{validationResult.invalidRows} invalid rows skipped</span>
                                </div>
                            )}
                        </Card>
                    )}
                    {validationResult && !validationResult.columnsDetected && (
                        <Card className="p-3 border border-destructive/30 bg-destructive/5 text-sm">
                            ❌ Invalid CSV format. Required columns:
                            <span className="font-mono"> transaction_id, sender_id, receiver_id, amount, timestamp</span>
                        </Card>
                    )}


                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={validateFile} disabled={!uploadedFile || isProcessing}>
                            Validate
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { loadSampleData(); }} className="gap-1">
                            <Download size={14} /> Sample
                        </Button>
                        <Button size="sm" onClick={runAnalysis} disabled={
                            !uploadedFile ||
                            isProcessing ||
                            (validationResult !== null && !validationResult.columnsDetected)
                        } className="gap-1">
                            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
                            Run Detection
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setUploadedFile(null); }}>Reset</Button>
                    </div>
                </div>
            </div>

            {hasAnalysis && !isProcessing && (
                <Card className="p-4 border-primary/30 bg-accent/50">
                    <p className="text-sm font-semibold text-primary mb-3">✓ Analysis Complete</p>
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => nav("/analytics")} className="gap-1">
                            <BarChart3 size={14} /> Analytics Results
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => nav("/graph")} className="gap-1">
                            <Network size={14} /> Transaction Graph
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default UploadManager;
