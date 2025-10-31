import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateHistoricalData } from "@/lib/exportUtils";

interface SignalData {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  riskScore: number;
  interpretation: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

// Mock signal data
const SIGNALS: Record<string, SignalData> = {
  'dff': {
    id: 'dff',
    name: 'Federal Funds Rate (DFF)',
    category: 'Liquidity',
    currentValue: 5.33,
    riskScore: 65,
    interpretation: 'Elevated interest rates indicate tighter monetary policy',
    trend: 'stable',
    change: 0.0
  },
  't10y2y': {
    id: 't10y2y',
    name: '10Y-2Y Treasury Spread',
    category: 'Credit',
    currentValue: -0.45,
    riskScore: 75,
    interpretation: 'Inverted yield curve suggests recession risk',
    trend: 'down',
    change: -5.2
  },
  'vix': {
    id: 'vix',
    name: 'VIX Volatility Index',
    category: 'Sentiment',
    currentValue: 18.5,
    riskScore: 45,
    interpretation: 'Moderate market volatility',
    trend: 'up',
    change: 12.3
  },
  'sp500': {
    id: 'sp500',
    name: 'S&P 500 Index',
    category: 'Valuation',
    currentValue: 4500,
    riskScore: 55,
    interpretation: 'Market at elevated valuation levels',
    trend: 'up',
    change: 2.5
  },
};

export default function SignalDetail() {
  const [, params] = useRoute("/signal/:id");
  const signalId = params?.id || '';
  const signal = SIGNALS[signalId];

  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);

  useEffect(() => {
    // Generate mock historical data for this signal
    const data = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        value: signal?.currentValue + (Math.random() - 0.5) * 10,
        riskScore: signal?.riskScore + (Math.random() - 0.5) * 20,
      };
    });
    setHistoricalData(data);

    // Calculate performance metrics
    const values = data.map(d => d.value);
    const scores = data.map(d => d.riskScore);
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const volatility = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length);
    
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const daysAboveThreshold = scores.filter(s => s > 60).length;
    
    setPerformance({
      average: avg,
      min,
      max,
      volatility,
      avgRiskScore: avgScore,
      daysAboveThreshold,
      range: max - min,
    });
  }, [signalId]);

  if (!signal) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Signal Not Found</h1>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score < 40) return 'text-green-500';
    if (score < 60) return 'text-yellow-500';
    if (score < 75) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRiskLevel = (score: number) => {
    if (score < 40) return 'Info';
    if (score < 60) return 'Watch';
    if (score < 75) return 'Warning';
    return 'Alert';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/category/${signal.category.toLowerCase()}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to {signal.category}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{signal.name}</h1>
            <p className="text-zinc-400 text-sm">{signal.category} Category</p>
          </div>
        </div>

        {/* Signal Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Current Value */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="text-zinc-500 text-sm mb-2">Current Value</div>
            <div className="text-3xl font-bold mb-2">
              {signal.currentValue.toFixed(2)}
            </div>
            <div className={`flex items-center gap-1 text-sm ${signal.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {signal.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(signal.change).toFixed(1)}% from previous
            </div>
          </Card>

          {/* Risk Score */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="text-zinc-500 text-sm mb-2">Risk Score</div>
            <div className={`text-3xl font-bold mb-2 ${getRiskColor(signal.riskScore)}`}>
              {signal.riskScore}/100
            </div>
            <div className="text-sm text-zinc-400">
              Level: {getRiskLevel(signal.riskScore)}
            </div>
          </Card>

          {/* Trend */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="text-zinc-500 text-sm mb-2">Trend</div>
            <div className="text-3xl font-bold mb-2 capitalize">
              {signal.trend}
            </div>
            <div className="text-sm text-zinc-400">
              Last 30 days
            </div>
          </Card>
        </div>

        {/* Interpretation */}
        <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Interpretation
          </h2>
          <p className="text-zinc-300">{signal.interpretation}</p>
        </Card>

        {/* Performance Metrics */}
        {performance && (
          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">30-Day Performance Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-zinc-500 text-sm mb-1">Average Value</div>
                <div className="text-2xl font-bold">{performance.average.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-sm mb-1">Range</div>
                <div className="text-2xl font-bold">{performance.range.toFixed(2)}</div>
                <div className="text-xs text-zinc-500">{performance.min.toFixed(2)} - {performance.max.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-zinc-500 text-sm mb-1">Volatility</div>
                <div className="text-2xl font-bold">{performance.volatility.toFixed(2)}</div>
                <div className="text-xs text-zinc-500">Standard deviation</div>
              </div>
              <div>
                <div className="text-zinc-500 text-sm mb-1">Avg Risk Score</div>
                <div className={`text-2xl font-bold ${getRiskColor(performance.avgRiskScore)}`}>
                  {performance.avgRiskScore.toFixed(1)}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Days Above Warning Threshold (60)</span>
                <span className="text-lg font-semibold">{performance.daysAboveThreshold} / 30</span>
              </div>
              <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500"
                  style={{ width: `${(performance.daysAboveThreshold / 30) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Historical Chart - Value */}
        <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Historical Value (Last 30 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).getDate().toString()}
                />
                <YAxis 
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(value: any) => [value.toFixed(2), 'Value']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Historical Chart - Risk Score */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Risk Score History (Last 30 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).getDate().toString()}
                />
                <YAxis 
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(value: any) => [value.toFixed(1), 'Risk Score']}
                />
                <Line 
                  type="monotone" 
                  dataKey="riskScore" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
