import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { generatePredictionSummary } from "@/lib/predictionEngine";

export default function Predictions() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate sample historical data (30 days)
    const historicalData = Array.from({ length: 30 }, (_, i) => {
      const base = 45;
      const trend = i * 0.3; // Slight upward trend
      const noise = (Math.random() - 0.5) * 10;
      const seasonal = Math.sin(i / 5) * 5;
      return Math.max(0, Math.min(100, base + trend + noise + seasonal));
    });

    const predictionSummary = generatePredictionSummary(historicalData);
    setSummary(predictionSummary);
    setLoading(false);
  }, []);

  if (loading || !summary) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-xl">Loading predictions...</div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = [
    ...summary.predictions7.map((p: any, i: number) => ({
      day: `Day ${i + 1}`,
      predicted: p.predicted,
      lower: p.lower,
      upper: p.upper,
      type: '7-day',
    })),
  ];

  const getTrendIcon = () => {
    if (summary.trend.direction === 'up') return <TrendingUp className="h-6 w-6 text-green-500" />;
    if (summary.trend.direction === 'down') return <TrendingDown className="h-6 w-6 text-red-500" />;
    return <Minus className="h-6 w-6 text-yellow-500" />;
  };

  const getTrendColor = () => {
    if (summary.trend.direction === 'up') return 'text-green-500';
    if (summary.trend.direction === 'down') return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">🔮 Predictive Analytics</h1>
            <p className="text-muted-foreground">AI-powered risk forecasting and anomaly detection</p>
          </div>
        </div>

        {/* Current Status & Trend */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Current Risk Score</div>
            <div className="text-4xl font-bold">{summary.current}</div>
            <div className="text-xs text-muted-foreground mt-1">/ 100</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Trend Direction</div>
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className={`text-2xl font-bold capitalize ${getTrendColor()}`}>
                {summary.trend.direction}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Strength: {summary.trend.strength}%
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">7-Day Forecast</div>
            <div className="text-4xl font-bold">{summary.trend.prediction7day}</div>
            <div className={`text-sm mt-1 ${summary.change7day > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {summary.change7day > 0 ? '+' : ''}{summary.change7day} ({summary.changePercent7day > 0 ? '+' : ''}{summary.changePercent7day}%)
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">30-Day Forecast</div>
            <div className="text-4xl font-bold">{summary.trend.prediction30day}</div>
            <div className={`text-sm mt-1 ${summary.change30day > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {summary.change30day > 0 ? '+' : ''}{summary.change30day} ({summary.changePercent30day > 0 ? '+' : ''}{summary.changePercent30day}%)
            </div>
          </Card>
        </div>

        {/* Prediction Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">7-Day Prediction with Confidence Intervals</h2>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="#3b82f6"
                fillOpacity={0.1}
                name="Upper Bound"
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="#3b82f6"
                fillOpacity={0.1}
                name="Lower Bound"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Predicted Risk"
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            Shaded area represents 95% confidence interval. Confidence decreases with prediction distance.
          </div>
        </Card>

        {/* Momentum Indicator */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Momentum Analysis</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Momentum</span>
                <span className={`font-bold ${summary.trend.momentum > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {summary.trend.momentum > 0 ? '+' : ''}{summary.trend.momentum}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full ${summary.trend.momentum > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, Math.abs(summary.trend.momentum) * 2)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Trend Strength</span>
                <span className="font-bold">{summary.trend.strength}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${summary.trend.strength}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Anomaly Detection */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Anomaly Detection</h2>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>{summary.anomalies.length} anomalies detected</span>
            </div>
          </div>
          
          {summary.anomalies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No anomalies detected in the last 30 days. Risk levels are within normal range.
            </div>
          ) : (
            <div className="space-y-2">
              {summary.anomalies.map((anomaly: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    anomaly.severity === 'high'
                      ? 'border-red-500 bg-red-500/10'
                      : anomaly.severity === 'medium'
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-blue-500 bg-blue-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{anomaly.date}</div>
                      <div className="text-sm text-muted-foreground">
                        Value: {anomaly.value} (Expected: {anomaly.expected})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium uppercase ${
                        anomaly.severity === 'high' ? 'text-red-500' :
                        anomaly.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`}>
                        {anomaly.severity} severity
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Deviation: {anomaly.deviation}σ
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Methodology */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Methodology</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Prediction Model:</strong> Linear regression with moving averages for trend analysis. Confidence intervals calculated using historical standard deviation.
            </p>
            <p>
              <strong className="text-foreground">Anomaly Detection:</strong> Z-score method with threshold of 2.5σ. Severity levels: Low (2.5-3σ), Medium (3-3.5σ), High (&gt;3.5σ).
            </p>
            <p>
              <strong className="text-foreground">Momentum:</strong> Rate of change calculated by comparing recent 7-day average vs previous 7-day average.
            </p>
            <p>
              <strong className="text-foreground">Trend Strength:</strong> Derived from regression slope magnitude, scaled 0-100.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
