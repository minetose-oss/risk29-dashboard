import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MethodInfo {
  name: string;
  description: string;
  complexity: number;
  overall_error: number;
  crisis_error: number;
  calm_error: number;
  improvement: number;
  recommended_for: string;
  pros: string[];
  cons: string[];
}

const METHOD_INFO: Record<string, MethodInfo> = {
  simple: {
    name: "Simple Average",
    description: "Treats all indicators equally with no weighting. Good baseline for comparison.",
    complexity: 1,
    overall_error: 15.83,
    crisis_error: 20.10,
    calm_error: 10.50,
    improvement: 0.0,
    recommended_for: "Beginners, baseline comparison",
    pros: ["Simple to understand", "No assumptions"],
    cons: ["Ignores indicator importance", "Slowest to respond"]
  },
  weighted: {
    name: "Weighted Average",
    description: "Uses research-based weights for each indicator. Yield Curve (30%), VIX (40%), Sahm Rule (15%).",
    complexity: 2,
    overall_error: 15.11,
    crisis_error: 18.88,
    calm_error: 10.40,
    improvement: 4.6,
    recommended_for: "General use, balanced approach",
    pros: ["Research-based weights", "Better than simple average"],
    cons: ["Static weights", "Doesn't adapt to conditions"]
  },
  time_decay: {
    name: "Time-Decay Momentum",
    description: "Adjusts momentum multipliers based on how long indicators have been elevated. Prevents overreaction to persistent signals.",
    complexity: 3,
    overall_error: 13.91,
    crisis_error: 16.72,
    calm_error: 10.40,
    improvement: 12.1,
    recommended_for: "Most users - best overall performance",
    pros: ["Best overall accuracy", "Balanced crisis/calm", "Prevents overreaction"],
    cons: ["Moderate complexity"]
  },
  regime_adaptive: {
    name: "Regime-Adaptive Hybrid",
    description: "Adjusts category weights based on market regime (crisis, calm, bubble, etc.). Best for calm periods.",
    complexity: 4,
    overall_error: 13.93,
    crisis_error: 17.12,
    calm_error: 9.95,
    improvement: 12.0,
    recommended_for: "Users focused on calm period accuracy",
    pros: ["Best calm performance", "Adapts to regime"],
    cons: ["Slightly worse in crisis", "More complex"]
  },
  meta_ensemble: {
    name: "Meta-Ensemble",
    description: "Selects the best method for each situation. Time-Decay for crisis, Regime-Adaptive for calm.",
    complexity: 5,
    overall_error: 13.82,
    crisis_error: 16.72,
    calm_error: 9.95,
    improvement: 12.6,
    recommended_for: "Power users, maximum accuracy",
    pros: ["Best overall", "Best crisis", "Best calm"],
    cons: ["Most complex", "Harder to explain"]
  }
};

export const RiskMethodSettings: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>('time_decay');
  const [showComparison, setShowComparison] = useState<boolean>(false);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('riskCalculationMethod');
    if (saved && METHOD_INFO[saved]) {
      setSelectedMethod(saved);
    }
  }, []);

  // Save preference
  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    localStorage.setItem('riskCalculationMethod', method);
    toast.success(`Risk calculation method changed to: ${METHOD_INFO[method].name}`, {
      description: "Please refresh the page to see updated risk scores."
    });
  };

  const currentMethod = METHOD_INFO[selectedMethod];

  return (
    <Card className="bg-card border-border p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Risk Calculation Method</h2>
      <p className="text-muted-foreground text-sm mb-4">
        Choose how risk scores are calculated. Different methods have different strengths.
      </p>

      <div className="mb-4">
        <label htmlFor="method-select" className="text-sm font-medium mb-2 block">
          Selected Method:
        </label>
        <select
          id="method-select"
          value={selectedMethod}
          onChange={(e) => handleMethodChange(e.target.value)}
          className="w-full p-2 rounded-md border border-border bg-background text-foreground"
        >
          <option value="simple">Simple Average (Baseline)</option>
          <option value="weighted">Weighted Average (+4.6% accuracy)</option>
          <option value="time_decay">Time-Decay Momentum (+12.1% accuracy) ⭐ Recommended</option>
          <option value="regime_adaptive">Regime-Adaptive (+12.0% accuracy)</option>
          <option value="meta_ensemble">Meta-Ensemble (+12.6% accuracy)</option>
        </select>
      </div>

      <div className="bg-secondary/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{currentMethod.name}</h3>
          <div className="text-sm text-muted-foreground">
            Complexity: {'⭐'.repeat(currentMethod.complexity)}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{currentMethod.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Overall Accuracy</div>
            <div className="text-lg font-semibold text-green-500">
              {currentMethod.improvement > 0 ? '+' : ''}{currentMethod.improvement.toFixed(1)}%
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-muted-foreground">Crisis Detection</div>
            <div className="text-lg font-semibold">{currentMethod.crisis_error.toFixed(1)}</div>
          </div>

          <div className="text-center">
            <div className="text-xs text-muted-foreground">Calm Periods</div>
            <div className="text-lg font-semibold">{currentMethod.calm_error.toFixed(1)}</div>
          </div>

          <div className="text-center">
            <div className="text-xs text-muted-foreground">Overall Error</div>
            <div className="text-lg font-semibold">{currentMethod.overall_error.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium mb-2">✅ Pros:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {currentMethod.pros.map((pro, idx) => (
                <li key={idx}>• {pro}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">❌ Cons:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {currentMethod.cons.map((con, idx) => (
                <li key={idx}>• {con}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-sm">
          <strong>Recommended for:</strong> <span className="text-muted-foreground">{currentMethod.recommended_for}</span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => setShowComparison(!showComparison)}
        className="w-full mb-4"
      >
        {showComparison ? 'Hide' : 'Show'} Method Comparison
      </Button>

      {showComparison && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2">Method</th>
                <th className="text-right py-2">Overall</th>
                <th className="text-right py-2">Crisis</th>
                <th className="text-right py-2">Calm</th>
                <th className="text-right py-2">Improvement</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(METHOD_INFO)
                .sort((a, b) => a[1].overall_error - b[1].overall_error)
                .map(([key, info]) => (
                  <tr
                    key={key}
                    className={`border-b border-border cursor-pointer hover:bg-secondary/50 ${
                      key === selectedMethod ? 'bg-secondary' : ''
                    }`}
                    onClick={() => handleMethodChange(key)}
                  >
                    <td className="py-2">
                      {info.name}
                      {key === 'time_decay' && ' ⭐'}
                    </td>
                    <td className="text-right">{info.overall_error.toFixed(2)}</td>
                    <td className="text-right">{info.crisis_error.toFixed(2)}</td>
                    <td className="text-right">{info.calm_error.toFixed(2)}</td>
                    <td className="text-right text-green-500">
                      {info.improvement > 0 ? '+' : ''}{info.improvement.toFixed(1)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground mt-2">
            * Lower error values are better. Click on a row to select that method.
          </p>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <h3 className="text-sm font-semibold mb-2">ℹ️ About Risk Calculation Methods</h3>
        <p className="text-xs text-muted-foreground">
          All methods were backtested against 9 historical periods including major crises
          (Dotcom 2000, 2008 Financial Crisis, COVID-19, 2022 Bear Market) and calm periods.
          <strong> Time-Decay Momentum</strong> is recommended for most users as it provides
          the best balance between crisis detection and calm period accuracy.
        </p>
      </div>
    </Card>
  );
};
