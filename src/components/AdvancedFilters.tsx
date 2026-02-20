import { useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Filter, RotateCcw } from "lucide-react";

export interface FilterState {
  riskLevels: string[];
  patterns: string[];
  searchQuery: string;
  dateRange?: { from: string; to: string };
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  availablePatterns?: string[];
}

const AdvancedFilters = ({ onFiltersChange, availablePatterns = [] }: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    riskLevels: [],
    patterns: [],
    searchQuery: "",
  });

  const handleRiskLevelToggle = useCallback((level: string) => {
    setFilters(prev => {
      const updated = {
        ...prev,
        riskLevels: prev.riskLevels.includes(level)
          ? prev.riskLevels.filter(l => l !== level)
          : [...prev.riskLevels, level]
      };
      onFiltersChange(updated);
      return updated;
    });
  }, [onFiltersChange]);

  const handlePatternToggle = useCallback((pattern: string) => {
    setFilters(prev => {
      const updated = {
        ...prev,
        patterns: prev.patterns.includes(pattern)
          ? prev.patterns.filter(p => p !== pattern)
          : [...prev.patterns, pattern]
      };
      onFiltersChange(updated);
      return updated;
    });
  }, [onFiltersChange]);

  const handleSearchChange = useCallback((query: string) => {
    setFilters(prev => {
      const updated = { ...prev, searchQuery: query };
      onFiltersChange(updated);
      return updated;
    });
  }, [onFiltersChange]);

  const handleReset = useCallback(() => {
    const emptyFilters: FilterState = {
      riskLevels: [],
      patterns: [],
      searchQuery: "",
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  }, [onFiltersChange]);

  const activeFilterCount = filters.riskLevels.length + filters.patterns.length + (filters.searchQuery ? 1 : 0);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-primary" />
          <h3 className="text-sm font-semibold">Advanced Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-[10px] font-mono">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs h-7"
          >
            <RotateCcw size={12} className="mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Search by Entity ID</label>
        <Input
          placeholder="Enter account ID..."
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      {/* Risk Levels */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Risk Levels</label>
        <div className="flex gap-2">
          {["low", "medium", "high"].map(level => (
            <button
              key={level}
              onClick={() => handleRiskLevelToggle(level)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                filters.riskLevels.includes(level)
                  ? level === "high"
                    ? "bg-risk-high text-white"
                    : level === "medium"
                    ? "bg-risk-medium text-white"
                    : "bg-risk-low text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Patterns */}
      {availablePatterns.length > 0 && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Patterns</label>
          <div className="flex flex-wrap gap-2">
            {availablePatterns.map(pattern => (
              <button
                key={pattern}
                onClick={() => handlePatternToggle(pattern)}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  filters.patterns.includes(pattern)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {pattern.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default AdvancedFilters;
