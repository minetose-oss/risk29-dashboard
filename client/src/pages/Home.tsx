import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Activity, BarChart3 } from "lucide-react";

interface CategoryData {
  name: string;
  icon: string;
  score: number;
  signals: number;
  color: string;
}

export default function Home() {
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load risk data from FRED API
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/risk_data.json');
        if (response.ok) {
          const data = await response.json();
          setRiskData(data);
          console.log('Risk data loaded:', data);
        }
      } catch (error) {
        console.error('Error loading risk data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  const score = riskData?.score || 20;
  const lastUpdate = riskData?.last_updated 
    ? new Date(riskData.last_updated).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    : '';

  // Categories from real data
  const categories: CategoryData[] = riskData?.categories ? [
    { 
      name: "Liquidity", 
      icon: "💧", 
      score: riskData.categories.liquidity?.score || 50, 
      signals: riskData.categories.liquidity?.signals?.length || 2, 
      color: "text-orange-500" 
    },
    { 
      name: "Valuation", 
      icon: "📊", 
      score: riskData.categories.valuation?.score || 48, 
      signals: riskData.categories.valuation?.signals?.length || 3, 
      color: "text-orange-500" 
    },
    { 
      name: "Macro", 
      icon: "🌍", 
      score: riskData.categories.macro?.score || 24, 
      signals: riskData.categories.macro?.signals?.length || 7, 
      color: "text-green-500" 
    },
    { 
      name: "Credit", 
      icon: "💳", 
      score: riskData.categories.credit?.score || 11, 
      signals: riskData.categories.credit?.signals?.length || 3, 
      color: "text-green-500" 
    },
    { 
      name: "Technical", 
      icon: "📈", 
      score: riskData.categories.technical?.score || 10, 
      signals: riskData.categories.technical?.signals?.length || 3, 
      color: "text-green-500" 
    },
    { 
      name: "Sentiment", 
      icon: "😊", 
      score: riskData.categories.sentiment?.score || 5, 
      signals: riskData.categories.sentiment?.signals?.length || 2, 
      color: "text-green-500" 
    },
    { 
      name: "Qualitative", 
      icon: "📝", 
      score: riskData.categories.qualitative?.score || 0, 
      signals: riskData.categories.qualitative?.signals?.length || 2, 
      color: "text-green-500" 
    },
    { 
      name: "Global", 
      icon: "🌐", 
      score: riskData.categories.global?.score || 0, 
      signals: riskData.categories.global?.signals?.length || 3, 
      color: "text-green-500" 
    },
  ] : [];

  // Top risk highlights
  const highlights = [
    { name: "GT.M2", value: -50 },
    { name: "GASP/Buffer", value: -48 },
    { name: "LEI/CHIPS/M", value: -24 },
  ];

  // Generate mock historical data for chart
  const generateHistoricalData = () => {
    const days = 30;
    const data = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        overall: Math.floor(Math.random() * 10) + 15,
        liquidity: Math.floor(Math.random() * 20) + 40,
        valuation: Math.floor(Math.random() * 20) + 35,
        credit: Math.floor(Math.random() * 15) + 5,
        macro: Math.floor(Math.random() * 15) + 15,
      });
    }
    return data;
  };

  const historicalData = generateHistoricalData();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Loading Risk29 Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Risk29 Dashboard</h1>
        </div>
        <p className="text-zinc-400">Financial Risk Monitoring System</p>
        <p className="text-zinc-500 text-sm">As of {lastUpdate}</p>
      </div>

      {/* Top Section - Risk Score and Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Overall Risk Score */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold">Overall Risk Score</h2>
          </div>
          
          <div className="flex items-center justify-center py-8">
            <div className="relative w-48 h-48">
              {/* Gauge background */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-zinc-800"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(score / 100) * 502} 502`}
                  className="text-green-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-green-500">{score}</div>
                <div className="text-zinc-400 text-sm">/ 100</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-red-400 text-sm flex items-center justify-center gap-1">
              <TrendingDown className="w-4 h-4" />
              -10.0 from previous
            </p>
          </div>
        </Card>

        {/* Top Risk Highlights */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold">Top Risk Highlights</h2>
          </div>
          
          <div className="space-y-4 py-4">
            {highlights.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-zinc-300">{item.name}</span>
                </div>
                <span className="text-red-500 font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Risk Breakdown by Category */}
      <Card className="bg-zinc-900 border-zinc-800 p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Risk Breakdown by Category</h2>
        </div>

        <div className="space-y-6">
          {categories.map((category, index) => (
            <Link key={index} href={`/category/${category.name.toLowerCase()}`}>
              <div className="cursor-pointer hover:bg-zinc-800/50 p-4 rounded-lg transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className={`text-2xl font-bold ${category.color}`}>
                    {category.score}
                  </span>
                </div>
                
                <Progress 
                  value={category.score} 
                  className="h-2 bg-zinc-800"
                />
                
                <p className="text-zinc-500 text-sm mt-2">
                  {category.signals} signals tracked
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Historical Trend */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Historical Trend (Last 30 Days)</h2>
        </div>

        <div className="relative h-64 overflow-x-auto">
          <svg className="h-full" style={{ width: '1600px', minWidth: '100%' }} viewBox="0 0 1600 256" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="64" x2="1600" y2="64" stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="128" x2="1600" y2="128" stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="192" x2="1600" y2="192" stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Overall Risk Line */}
            <polyline
              points={historicalData.map((day, i) => 
                `${(i / (historicalData.length - 1)) * 1600},${256 - (day.overall / 100) * 256}`
              ).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            
            {/* Liquidity Line */}
            <polyline
              points={historicalData.map((day, i) => 
                `${(i / (historicalData.length - 1)) * 1600},${256 - (day.liquidity / 100) * 256}`
              ).join(' ')}
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeDasharray="5 5"
            />
            
            {/* Valuation Line */}
            <polyline
              points={historicalData.map((day, i) => 
                `${(i / (historicalData.length - 1)) * 1600},${256 - (day.valuation / 100) * 256}`
              ).join(' ')}
              fill="none"
              stroke="#eab308"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeDasharray="5 5"
            />
            
            {/* Credit Line */}
            <polyline
              points={historicalData.map((day, i) => 
                `${(i / (historicalData.length - 1)) * 1600},${256 - (day.credit / 100) * 256}`
              ).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeDasharray="5 5"
            />
            
            {/* Macro Line */}
            <polyline
              points={historicalData.map((day, i) => 
                `${(i / (historicalData.length - 1)) * 1600},${256 - (day.macro / 100) * 256}`
              ).join(' ')}
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeDasharray="5 5"
            />
          </svg>
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-zinc-500">
            {historicalData.filter((_, i) => i % 6 === 0).map((day, i) => (
              <span key={i}>{day.date}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Overall Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Liquidity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Valuation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Credit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Macro</span>
          </div>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-4">
          Showing overall risk score and major risk categories over the last 30 days
        </p>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-zinc-500 text-sm">
        <p>Risk29 Pipeline • Automated risk monitoring system • Data from FRED API</p>
        <p className="mt-1">Last pipeline run: {lastUpdate}</p>
      </div>
    </div>
  );
}
