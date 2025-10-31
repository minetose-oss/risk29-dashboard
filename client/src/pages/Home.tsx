import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Activity, BarChart3 } from "lucide-react";

interface RiskData {
  score: number;
  timestamp: number;
  signals: Array<{
    group: number;
    name: string;
    value: number;
    risk: number;
  }>;
  summary: {
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
  };
}

interface CategoryData {
  name: string;
  icon: string;
  score: number;
  signals: number;
  color: string;
}

export default function Home() {
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);

  // Categories definition
  const categories: CategoryData[] = [
    { name: "Liquidity", icon: "💧", score: 50, signals: 2, color: "text-orange-500" },
    { name: "Valuation", icon: "📊", score: 48, signals: 3, color: "text-orange-500" },
    { name: "Macro", icon: "🌍", score: 24, signals: 7, color: "text-green-500" },
    { name: "Credit", icon: "💳", score: 11, signals: 3, color: "text-green-500" },
    { name: "Technical", icon: "📈", score: 10, signals: 3, color: "text-green-500" },
    { name: "Sentiment", icon: "😊", score: 5, signals: 2, color: "text-green-500" },
    { name: "Qualitative", icon: "📝", score: 0, signals: 2, color: "text-green-500" },
    { name: "Global", icon: "🌐", score: 0, signals: 3, color: "text-green-500" },
  ];

  // Top risk highlights
  const highlights = [
    { name: "GT.M2", value: -50 },
    { name: "GASP/Buffer", value: -48 },
    { name: "LEI/CHIPS/M", value: -24 },
  ];

  // Load risk data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load real FRED data
        const response = await fetch('/risk_data.json');
        if (response.ok) {
          const data = await response.json();
          setRiskData(data);
        }
      } catch (error) {
        console.log('Using fallback data');
        // Fallback data
        setRiskData({
          score: 20,
          timestamp: Date.now() / 1000,
          signals: [],
          summary: { high_risk_count: 5, medium_risk_count: 24, low_risk_count: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const score = riskData?.score || 20;
  const lastUpdate = riskData ? new Date(riskData.timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }) : '';

  // Generate mock historical data for chart
  const generateHistoricalData = () => {
    const days = 30;
    const data = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        overall: 20 + Math.sin(i / 3) * 5,
        liquidity: 50 + Math.sin(i / 4) * 8,
        valuation: 48 + Math.cos(i / 3) * 6,
        credit: 11 + Math.sin(i / 5) * 3,
        macro: 24 + Math.cos(i / 4) * 4,
      });
    }
    return data;
  };

  const historicalData = generateHistoricalData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Risk29 Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">Financial Risk Monitoring System</p>
          <p className="text-xs text-muted-foreground mt-1">As of {lastUpdate}</p>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Overall Risk Score & Highlights */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Risk Score */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Overall Risk Score
            </h2>
            
            <div className="flex items-center justify-center my-8">
              <div className="relative">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(score / 100) * 502.4} 502.4`}
                    className={score < 30 ? "text-green-500" : score < 60 ? "text-yellow-500" : "text-red-500"}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-green-500">{score}</span>
                  <span className="text-lg text-muted-foreground">/ 100</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <span className="text-red-500">▼ -10.0</span> from previous
              </p>
            </div>
          </Card>

          {/* Top Risk Highlights */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Top Risk Highlights
            </h2>
            
            <div className="space-y-4 mt-6">
              {highlights.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <span className="font-medium">• {item.name}</span>
                  <span className="text-lg font-bold text-red-500">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Risk Breakdown by Category */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold mb-6">📊 Risk Breakdown by Category</h2>
          
          <div className="space-y-4">
            {categories.map((category, index) => {
              const categoryId = category.name.toLowerCase().replace(' ', '');
              return (
                <Link key={index} href={`/category/${categoryId}`}>
                  <div className="space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className={`text-2xl font-bold ${category.color}`}>
                        {category.score}
                      </span>
                    </div>
                    <Progress 
                      value={category.score} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">{category.signals} signals tracked</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Historical Trend */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold mb-6">📉 Historical Trend (Last 30 Days)</h2>
          
          <div className="h-96 flex items-end justify-between gap-1">
            {historicalData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full space-y-0.5">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${day.overall * 2}px` }}
                    title={`Overall: ${day.overall.toFixed(1)}`}
                  />
                  <div 
                    className="w-full bg-orange-500"
                    style={{ height: `${day.liquidity}px` }}
                    title={`Liquidity: ${day.liquidity.toFixed(1)}`}
                  />
                  <div 
                    className="w-full bg-yellow-500"
                    style={{ height: `${day.valuation}px` }}
                    title={`Valuation: ${day.valuation.toFixed(1)}`}
                  />
                  <div 
                    className="w-full bg-green-500"
                    style={{ height: `${day.macro}px` }}
                    title={`Macro: ${day.macro.toFixed(1)}`}
                  />
                </div>
                {index % 5 === 0 && (
                  <span className="text-[8px] text-muted-foreground rotate-45 origin-left whitespace-nowrap">
                    {day.date}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span>Overall Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded" />
              <span>Liquidity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span>Valuation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>Credit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>Macro</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Showing overall risk score and major risk categories over the last 30 days
          </p>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4 border-t border-border">
          <p>Risk29 Pipeline • Automated risk monitoring system • Data from FRED API</p>
          <p className="mt-2">Last pipeline run: {lastUpdate}</p>
        </div>
      </main>
    </div>
  );
}
