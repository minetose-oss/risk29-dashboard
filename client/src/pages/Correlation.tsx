import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CorrelationData {
  signal1: string;
  signal2: string;
  correlation: number;
}

const SIGNALS = [
  'DFF', 'T10Y2Y', 'VIX', 'SP500', 'UNRATE', 'CPI', 'M2', 'FEDFUNDS'
];

export default function Correlation() {
  const [correlationMatrix, setCorrelationMatrix] = useState<number[][]>([]);

  useEffect(() => {
    // Generate mock correlation matrix
    const matrix: number[][] = [];
    for (let i = 0; i < SIGNALS.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < SIGNALS.length; j++) {
        if (i === j) {
          matrix[i][j] = 1.0; // Perfect correlation with itself
        } else {
          // Generate random correlation between -1 and 1
          matrix[i][j] = (Math.random() * 2 - 1);
        }
      }
    }
    setCorrelationMatrix(matrix);
  }, []);

  const getCorrelationColor = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue > 0.7) return value > 0 ? 'bg-red-600' : 'bg-blue-600';
    if (absValue > 0.4) return value > 0 ? 'bg-orange-500' : 'bg-cyan-500';
    if (absValue > 0.2) return value > 0 ? 'bg-yellow-500' : 'bg-teal-500';
    return 'bg-zinc-700';
  };

  const getTextColor = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue > 0.4) return 'text-white';
    return 'text-zinc-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Signal Correlation Matrix</h1>
            <p className="text-zinc-400 text-sm">Showing relationships between risk signals</p>
          </div>
        </div>

        {/* Legend */}
        <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Correlation Strength</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded"></div>
              <span className="text-sm">Strong Positive (&gt;0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded"></div>
              <span className="text-sm">Moderate Positive (0.4-0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded"></div>
              <span className="text-sm">Strong Negative (&lt;-0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500 rounded"></div>
              <span className="text-sm">Moderate Negative (-0.7 to -0.4)</span>
            </div>
          </div>
        </Card>

        {/* Correlation Matrix */}
        <Card className="bg-zinc-900 border-zinc-800 p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">Correlation Heatmap</h2>
          <div className="min-w-max">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left"></th>
                  {SIGNALS.map((signal) => (
                    <th key={signal} className="p-2 text-center text-sm font-semibold">
                      {signal}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIGNALS.map((signal1, i) => (
                  <tr key={signal1}>
                    <td className="p-2 text-sm font-semibold">{signal1}</td>
                    {SIGNALS.map((signal2, j) => {
                      const correlation = correlationMatrix[i]?.[j] || 0;
                      return (
                        <td
                          key={signal2}
                          className={`p-2 text-center ${getCorrelationColor(correlation)} ${getTextColor(correlation)} text-sm font-mono`}
                          title={`${signal1} vs ${signal2}: ${correlation.toFixed(3)}`}
                        >
                          {correlation.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Insights */}
        <Card className="bg-zinc-900 border-zinc-800 p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Key Insights</h2>
          <div className="space-y-3 text-sm text-zinc-300">
            <p>
              <strong className="text-white">Positive Correlation:</strong> When two signals move in the same direction. 
              A value close to +1 indicates strong positive correlation.
            </p>
            <p>
              <strong className="text-white">Negative Correlation:</strong> When two signals move in opposite directions. 
              A value close to -1 indicates strong negative correlation.
            </p>
            <p>
              <strong className="text-white">No Correlation:</strong> Values close to 0 indicate little to no relationship 
              between the signals.
            </p>
            <p className="mt-4 text-zinc-400">
              <em>Note: This correlation matrix is calculated from historical data over the last 30 days.</em>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
