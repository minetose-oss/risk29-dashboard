import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { getAssetUrl } from "@/lib/basePath";
import { Progress } from "@/components/ui/progress";
import { Home, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Signal {
  id: string;
  name: string;
  description: string;
  current_value: number | string;
  unit: string;
  risk_score: number;
  date: string;
  status: string;
  interpretation: {
    low: string;
    high: string;
  };
}

interface CategoryInfo {
  name: string;
  icon: string;
  score: number;
  description: string;
  signals: Signal[];
}

export default function CategoryDetail() {
  const [, params] = useRoute("/category/:category");
  const category = params?.category || "";
  const [categoryData, setCategoryData] = useState<CategoryInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Category metadata
  const categoryMeta: Record<string, { icon: string; description: string }> = {
    liquidity: {
      icon: "💧",
      description: "Money supply growth and Federal Reserve balance sheet trends"
    },
    valuation: {
      icon: "📊",
      description: "Market valuation metrics and price-to-earnings ratios"
    },
    macro: {
      icon: "🌍",
      description: "Economic indicators including GDP, unemployment, and inflation"
    },
    credit: {
      icon: "💳",
      description: "Credit spreads and lending conditions"
    },
    technical: {
      icon: "📈",
      description: "Market technical indicators and volatility measures"
    },
    sentiment: {
      icon: "😊",
      description: "Investor sentiment and market psychology indicators"
    },
    qualitative: {
      icon: "📝",
      description: "Policy stance and geopolitical risk assessment"
    },
    global: {
      icon: "🌐",
      description: "Global economic indicators and currency movements"
    },
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Use cache busting to always get fresh data
        const response = await fetch(getAssetUrl('risk_data.json', true), {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (response.ok) {
          const data = await response.json();
          const catData = data.categories?.[category];
          
          if (catData) {
            setCategoryData({
              name: category.charAt(0).toUpperCase() + category.slice(1),
              icon: categoryMeta[category]?.icon || "📊",
              score: catData.score || 0,
              description: categoryMeta[category]?.description || "",
              signals: catData.signals || []
            });
          }
        }
      } catch (error) {
        console.error('Error loading category data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Category not found</div>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score >= 40) return "text-red-500";
    if (score >= 20) return "text-orange-500";
    return "text-green-500";
  };

  const formatValue = (value: number | string, unit: string) => {
    if (typeof value === "string") return value;
    
    if (unit === "Billions") {
      return `${(value / 1000).toFixed(2)}T`;
    } else if (unit === "Trillions") {
      return `${value.toFixed(2)}T`;
    } else if (unit === "Millions") {
      return `${(value / 1000).toFixed(1)}B`;
    } else if (unit === "Percent" || unit === "Ratio") {
      return `${value.toFixed(2)}`;
    } else if (unit === "Index") {
      return `${value.toFixed(2)}`;
    } else if (unit === "Thousands") {
      return `${(value / 1000).toFixed(2)}M`;
    }
    return value.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" className="mb-4 bg-zinc-900 border-zinc-800 hover:bg-zinc-800">
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{categoryData.icon}</span>
              <h1 className="text-3xl font-bold">{categoryData.name} Conditions</h1>
            </div>
            <p className="text-zinc-400">{categoryData.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-500 mb-1">Category Risk Score</div>
            <div className={`text-5xl font-bold ${getRiskColor(categoryData.score)}`}>
              {categoryData.score}
            </div>
            <div className="text-zinc-400 text-lg">/ 100</div>
            <div className="mt-2">
              <span className="text-zinc-500 text-sm">Watch</span>
            </div>
          </div>
        </div>
      </div>

      {/* Signals */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Signals in this Category</h2>
      </div>

      <div className="space-y-6">
        {categoryData.signals.map((signal, index) => (
          <Card key={index} className="bg-zinc-900 border-zinc-800 p-6">
            <div className="space-y-4">
              {/* Signal Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{signal.name}</h3>
                  <p className="text-zinc-400 text-sm">{signal.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm text-zinc-500">Current Value</div>
                  <div className="text-2xl font-bold text-green-500 flex items-center gap-2">
                    {signal.risk_score < 20 && <TrendingDown className="w-5 h-5" />}
                    {signal.risk_score >= 20 && <TrendingUp className="w-5 h-5 text-orange-500" />}
                    {formatValue(signal.current_value, signal.unit)} {signal.unit === "Percent" ? "%" : ""}
                  </div>
                </div>
              </div>

              {/* Risk Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">Risk Score</span>
                  <span className={`text-2xl font-bold ${getRiskColor(signal.risk_score)}`}>
                    {signal.risk_score}
                  </span>
                </div>
                <Progress 
                  value={signal.risk_score} 
                  className="h-2 bg-zinc-800"
                />
              </div>

              {/* Interpretation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-semibold">Low Score (Good)</span>
                  </div>
                  <p className="text-sm text-zinc-300">{signal.interpretation.low}</p>
                </div>

                <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    <span className="text-red-500 font-semibold">High Score (Risk)</span>
                  </div>
                  <p className="text-sm text-zinc-300">{signal.interpretation.high}</p>
                </div>
              </div>

              {/* View Details Button */}
              <div className="mt-4">
                <Link href={`/signal/${signal.id}`}>
                  <Button variant="outline" className="w-full">
                    View Detailed Analysis
                  </Button>
                </Link>
              </div>

              {/* Current Status */}
              <div className={`mt-4 p-4 rounded-lg ${
                signal.risk_score < 20 
                  ? "bg-green-900/20 border border-green-800/30" 
                  : signal.risk_score < 40
                  ? "bg-orange-900/20 border border-orange-800/30"
                  : "bg-red-900/20 border border-red-800/30"
              }`}>
                <div className="font-semibold mb-1">
                  Current Status: <span className={getRiskColor(signal.risk_score)}>{signal.status}</span>
                </div>
                <div className="text-sm text-zinc-400">
                  Last updated: {new Date(signal.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="outline" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800">
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
