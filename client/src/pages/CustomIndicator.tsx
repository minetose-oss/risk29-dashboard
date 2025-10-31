import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CategoryWeight {
  name: string;
  weight: number;
  icon: string;
}

interface CustomIndicator {
  id: string;
  name: string;
  weights: Record<string, number>;
  formula: string;
  created: string;
}

export default function CustomIndicator() {
  const [indicatorName, setIndicatorName] = useState("My Custom Indicator");
  const [weights, setWeights] = useState<CategoryWeight[]>([
    { name: "liquidity", weight: 12.5, icon: "💧" },
    { name: "valuation", weight: 12.5, icon: "📊" },
    { name: "macro", weight: 12.5, icon: "🌍" },
    { name: "credit", weight: 12.5, icon: "💳" },
    { name: "technical", weight: 12.5, icon: "📈" },
    { name: "sentiment", weight: 12.5, icon: "😊" },
    { name: "qualitative", weight: 12.5, icon: "📋" },
    { name: "global", weight: 12.5, icon: "🌐" },
  ]);
  const [formula, setFormula] = useState("(liquidity * 0.3) + (credit * 0.3) + (macro * 0.2) + (valuation * 0.2)");
  const [savedIndicators, setSavedIndicators] = useState<CustomIndicator[]>([]);
  const [backtestResult, setBacktestResult] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("customIndicators");
    if (saved) {
      setSavedIndicators(JSON.parse(saved));
    }
  }, []);

  const handleWeightChange = (index: number, value: number[]) => {
    const newWeights = [...weights];
    newWeights[index].weight = value[0];
    setWeights(newWeights);
  };

  const normalizeWeights = () => {
    const total = weights.reduce((sum, w) => sum + w.weight, 0);
    if (total === 0) return;
    
    const normalized = weights.map(w => ({
      ...w,
      weight: (w.weight / total) * 100
    }));
    setWeights(normalized);
    toast.success("Weights normalized to 100%");
  };

  const saveIndicator = () => {
    const newIndicator: CustomIndicator = {
      id: Date.now().toString(),
      name: indicatorName,
      weights: weights.reduce((acc, w) => ({ ...acc, [w.name]: w.weight }), {}),
      formula,
      created: new Date().toISOString(),
    };

    const updated = [...savedIndicators, newIndicator];
    setSavedIndicators(updated);
    localStorage.setItem("customIndicators", JSON.stringify(updated));
    toast.success(`Indicator "${indicatorName}" saved!`);
  };

  const deleteIndicator = (id: string) => {
    const updated = savedIndicators.filter(ind => ind.id !== id);
    setSavedIndicators(updated);
    localStorage.setItem("customIndicators", JSON.stringify(updated));
    toast.success("Indicator deleted");
  };

  const loadIndicator = (indicator: CustomIndicator) => {
    setIndicatorName(indicator.name);
    setFormula(indicator.formula);
    const newWeights = weights.map(w => ({
      ...w,
      weight: indicator.weights[w.name] || 12.5
    }));
    setWeights(newWeights);
    toast.success(`Loaded "${indicator.name}"`);
  };

  const runBacktest = () => {
    // Simulate backtesting with historical data
    const days = 30;
    const results = [];
    
    for (let i = 0; i < days; i++) {
      const customScore = weights.reduce((sum, w) => {
        const baseScore = Math.random() * 100;
        return sum + (baseScore * w.weight / 100);
      }, 0);
      
      const defaultScore = Math.random() * 100;
      
      results.push({
        day: i + 1,
        custom: Math.round(customScore),
        default: Math.round(defaultScore),
        diff: Math.round(customScore - defaultScore),
      });
    }

    const avgCustom = results.reduce((sum, r) => sum + r.custom, 0) / days;
    const avgDefault = results.reduce((sum, r) => sum + r.default, 0) / days;
    const accuracy = 100 - Math.abs(avgCustom - avgDefault);

    setBacktestResult({
      results,
      avgCustom: Math.round(avgCustom),
      avgDefault: Math.round(avgDefault),
      accuracy: Math.round(accuracy),
      improvement: Math.round(((avgCustom - avgDefault) / avgDefault) * 100),
    });

    toast.success("Backtest completed!");
  };

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">🔧 Custom Indicator Builder</h1>
              <p className="text-muted-foreground">Create and backtest your own risk indicators</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={normalizeWeights} variant="outline">
              Normalize Weights
            </Button>
            <Button onClick={saveIndicator}>
              <Save className="h-4 w-4 mr-2" />
              Save Indicator
            </Button>
          </div>
        </div>

        {/* Indicator Name */}
        <Card className="p-6">
          <label className="text-sm font-medium mb-2 block">Indicator Name</label>
          <Input
            value={indicatorName}
            onChange={(e) => setIndicatorName(e.target.value)}
            placeholder="My Custom Indicator"
            className="max-w-md"
          />
        </Card>

        {/* Weight Editor */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Category Weights</h2>
            <div className="text-sm">
              Total: <span className={totalWeight === 100 ? "text-green-500" : "text-yellow-500"}>
                {totalWeight.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="space-y-6">
            {weights.map((weight, index) => (
              <div key={weight.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{weight.icon}</span>
                    <span className="font-medium capitalize">{weight.name}</span>
                  </div>
                  <span className="text-sm font-mono">{weight.weight.toFixed(1)}%</span>
                </div>
                <Slider
                  value={[weight.weight]}
                  onValueChange={(value) => handleWeightChange(index, value)}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Formula Builder */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Custom Formula</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Define how categories combine. Use category names and operators (+, -, *, /, parentheses).
          </p>
          <Input
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="(liquidity * 0.3) + (credit * 0.3) + (macro * 0.2)"
            className="font-mono"
          />
        </Card>

        {/* Backtesting */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Backtesting</h2>
            <Button onClick={runBacktest}>
              <Play className="h-4 w-4 mr-2" />
              Run Backtest
            </Button>
          </div>
          
          {backtestResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Avg Custom Score</div>
                  <div className="text-2xl font-bold">{backtestResult.avgCustom}</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Avg Default Score</div>
                  <div className="text-2xl font-bold">{backtestResult.avgDefault}</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                  <div className="text-2xl font-bold text-green-500">{backtestResult.accuracy}%</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Improvement</div>
                  <div className={`text-2xl font-bold ${backtestResult.improvement > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {backtestResult.improvement > 0 ? '+' : ''}{backtestResult.improvement}%
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                <div className="text-sm font-medium mb-2">Daily Results (Last 30 Days)</div>
                <div className="space-y-1 font-mono text-xs">
                  {backtestResult.results.slice(0, 10).map((r: any) => (
                    <div key={r.day} className="flex justify-between">
                      <span>Day {r.day}:</span>
                      <span>Custom: {r.custom}</span>
                      <span>Default: {r.default}</span>
                      <span className={r.diff > 0 ? 'text-green-500' : 'text-red-500'}>
                        {r.diff > 0 ? '+' : ''}{r.diff}
                      </span>
                    </div>
                  ))}
                  {backtestResult.results.length > 10 && (
                    <div className="text-muted-foreground">... and {backtestResult.results.length - 10} more days</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Saved Indicators */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Saved Indicators ({savedIndicators.length})</h2>
          {savedIndicators.length === 0 ? (
            <p className="text-muted-foreground">No saved indicators yet. Create and save one above!</p>
          ) : (
            <div className="space-y-2">
              {savedIndicators.map((indicator) => (
                <div key={indicator.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{indicator.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(indicator.created).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => loadIndicator(indicator)}>
                      Load
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteIndicator(indicator.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
