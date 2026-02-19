import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

const SettingsPage = () => {
  const { settings, updateSettings } = useAppStore();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure analytical parameters and display preferences</p>
      </div>

      <Card className="p-3 border-risk-medium-bg bg-risk-medium-bg/30 flex items-start gap-2">
        <AlertTriangle size={14} className="text-risk-medium mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">Adjusting thresholds affects analytical sensitivity. Changes apply to the next analysis run.</p>
      </Card>

      {/* Display */}
      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-semibold">Display</h3>

        <div>
          <Label className="text-xs">Node Limit (graph rendering): {settings.nodeLimit}</Label>
          <Slider value={[settings.nodeLimit]} onValueChange={([v]) => updateSettings({ nodeLimit: v })} min={100} max={5000} step={100} className="mt-2" />
        </div>

        <div>
          <Label className="text-xs">Default Layout</Label>
          <Select value={settings.defaultLayout} onValueChange={(v) => updateSettings({ defaultLayout: v as any })}>
            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="force">Force</SelectItem>
              <SelectItem value="hierarchical">Hierarchical</SelectItem>
              <SelectItem value="circular">Circular</SelectItem>
              <SelectItem value="ring">Ring Cluster</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Default Edge Label</Label>
          <Select value={settings.defaultEdgeLabel} onValueChange={(v) => updateSettings({ defaultEdgeLabel: v as any })}>
            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="amount">Total Amount</SelectItem>
              <SelectItem value="count">Tx Count</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Aggregate Edges by Default</Label>
          <Switch checked={settings.aggregateEdges} onCheckedChange={(v) => updateSettings({ aggregateEdges: v })} />
        </div>
      </Card>

      {/* Thresholds */}
      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-semibold">Analytical Thresholds</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Min Cycle Length: {settings.cycleLengthMin}</Label>
            <Slider value={[settings.cycleLengthMin]} onValueChange={([v]) => updateSettings({ cycleLengthMin: v })} min={2} max={5} step={1} className="mt-2" />
          </div>
          <div>
            <Label className="text-xs">Max Cycle Length: {settings.cycleLengthMax}</Label>
            <Slider value={[settings.cycleLengthMax]} onValueChange={([v]) => updateSettings({ cycleLengthMax: v })} min={3} max={8} step={1} className="mt-2" />
          </div>
        </div>

        <div>
          <Label className="text-xs">Fan-in/out Threshold: {settings.fanThreshold} txs</Label>
          <Slider value={[settings.fanThreshold]} onValueChange={([v]) => updateSettings({ fanThreshold: v })} min={3} max={25} step={1} className="mt-2" />
        </div>

        <div>
          <Label className="text-xs">Time Window: {settings.timeWindowHours}h</Label>
          <Slider value={[settings.timeWindowHours]} onValueChange={([v]) => updateSettings({ timeWindowHours: v })} min={12} max={168} step={12} className="mt-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Shell Tx Min: {settings.shellTxMin}</Label>
            <Slider value={[settings.shellTxMin]} onValueChange={([v]) => updateSettings({ shellTxMin: v })} min={1} max={5} step={1} className="mt-2" />
          </div>
          <div>
            <Label className="text-xs">Shell Tx Max: {settings.shellTxMax}</Label>
            <Slider value={[settings.shellTxMax]} onValueChange={([v]) => updateSettings({ shellTxMax: v })} min={2} max={8} step={1} className="mt-2" />
          </div>
        </div>

        <div>
          <Label className="text-xs">Confidence Weight: {settings.confidenceWeight.toFixed(2)}</Label>
          <Slider value={[settings.confidenceWeight * 100]} onValueChange={([v]) => updateSettings({ confidenceWeight: v / 100 })} min={0} max={100} step={5} className="mt-2" />
        </div>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => updateSettings({
          nodeLimit: 2000, defaultLayout: "force", defaultEdgeLabel: "none", aggregateEdges: true,
          cycleLengthMin: 3, cycleLengthMax: 5, fanThreshold: 10, timeWindowHours: 72,
          shellTxMin: 2, shellTxMax: 3, confidenceWeight: 0.5,
        })}>
          Reset to Default
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
