import { useRoute, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Home, TrendingDown, TrendingUp, ArrowLeft } from "lucide-react";

interface Signal {
  name: string;
  description: string;
  currentValue: string;
  riskScore: number;
  interpretation: {
    low: string;
    high: string;
  };
  status: "low" | "medium" | "high";
}

interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  score: number;
  description: string;
  signals: Signal[];
}

const categoryData: Record<string, CategoryInfo> = {
  liquidity: {
    id: "liquidity",
    name: "Liquidity Conditions",
    icon: "🏦",
    score: 50,
    description: "Money supply growth and Federal Reserve balance sheet trends",
    signals: [
      {
        name: "M2 Money Supply YoY",
        description: "Broad money supply growth. Negative growth = tight liquidity conditions.",
        currentValue: "4.49 % YoY",
        riskScore: 0,
        interpretation: {
          low: "Money supply is growing - ample liquidity",
          high: "Money supply is contracting - tight liquidity"
        },
        status: "low"
      },
      {
        name: "Fed Balance Sheet YoY",
        description: "Federal Reserve balance sheet growth rate",
        currentValue: "-15.2 % YoY",
        riskScore: 85,
        interpretation: {
          low: "Fed balance sheet expanding - supportive liquidity",
          high: "Fed balance sheet contracting - tightening conditions"
        },
        status: "high"
      }
    ]
  },
  valuation: {
    id: "valuation",
    name: "Valuation Metrics",
    icon: "📊",
    score: 48,
    description: "Market valuation indicators and price-to-earnings ratios",
    signals: [
      {
        name: "S&P 500 P/E Ratio",
        description: "Price-to-earnings ratio of S&P 500",
        currentValue: "24.5x",
        riskScore: 65,
        interpretation: {
          low: "Valuations are reasonable - attractive entry points",
          high: "Valuations are stretched - potential correction risk"
        },
        status: "high"
      },
      {
        name: "CAPE Ratio",
        description: "Cyclically adjusted price-to-earnings ratio",
        currentValue: "32.1x",
        riskScore: 75,
        interpretation: {
          low: "Long-term valuations attractive",
          high: "Long-term valuations elevated - mean reversion risk"
        },
        status: "high"
      },
      {
        name: "Market Cap to GDP",
        description: "Total market capitalization relative to GDP (Buffett Indicator)",
        currentValue: "178%",
        riskScore: 70,
        interpretation: {
          low: "Market size reasonable relative to economy",
          high: "Market significantly overvalued relative to economy"
        },
        status: "high"
      }
    ]
  },
  macro: {
    id: "macro",
    name: "Macro Conditions",
    icon: "🌍",
    score: 24,
    description: "Economic growth, inflation, and employment indicators",
    signals: [
      {
        name: "GDP Growth Rate",
        description: "Real GDP growth year-over-year",
        currentValue: "2.8 %",
        riskScore: 15,
        interpretation: {
          low: "Strong economic growth - supportive for markets",
          high: "Economic contraction - recession risk"
        },
        status: "low"
      },
      {
        name: "Unemployment Rate",
        description: "U.S. unemployment rate",
        currentValue: "4.3 %",
        riskScore: 20,
        interpretation: {
          low: "Low unemployment - healthy labor market",
          high: "Rising unemployment - economic weakness"
        },
        status: "low"
      },
      {
        name: "CPI Inflation YoY",
        description: "Consumer price index year-over-year change",
        currentValue: "3.2 %",
        riskScore: 35,
        interpretation: {
          low: "Inflation under control - supportive for equities",
          high: "High inflation - Fed tightening risk"
        },
        status: "medium"
      },
      {
        name: "ISM Manufacturing PMI",
        description: "Manufacturing purchasing managers index",
        currentValue: "48.7",
        riskScore: 45,
        interpretation: {
          low: "Manufacturing expansion - economic strength",
          high: "Manufacturing contraction - economic weakness"
        },
        status: "medium"
      },
      {
        name: "Consumer Confidence",
        description: "Consumer confidence index",
        currentValue: "102.6",
        riskScore: 25,
        interpretation: {
          low: "Strong consumer confidence - spending support",
          high: "Weak consumer confidence - spending risk"
        },
        status: "low"
      },
      {
        name: "Housing Starts",
        description: "New residential construction starts (thousands)",
        currentValue: "1,372K",
        riskScore: 30,
        interpretation: {
          low: "Strong housing market - economic health",
          high: "Weak housing market - economic slowdown"
        },
        status: "low"
      },
      {
        name: "Retail Sales Growth",
        description: "Retail sales growth year-over-year",
        currentValue: "3.8 %",
        riskScore: 18,
        interpretation: {
          low: "Strong retail sales - consumer spending healthy",
          high: "Weak retail sales - consumer pullback"
        },
        status: "low"
      }
    ]
  },
  credit: {
    id: "credit",
    name: "Credit Conditions",
    icon: "💳",
    score: 11,
    description: "Credit spreads and lending conditions",
    signals: [
      {
        name: "High Yield Spread",
        description: "Spread between high yield bonds and treasuries",
        currentValue: "3.45 %",
        riskScore: 15,
        interpretation: {
          low: "Tight spreads - healthy credit markets",
          high: "Wide spreads - credit stress"
        },
        status: "low"
      },
      {
        name: "Investment Grade Spread",
        description: "Spread between investment grade bonds and treasuries",
        currentValue: "1.12 %",
        riskScore: 8,
        interpretation: {
          low: "Tight spreads - strong credit quality",
          high: "Wide spreads - credit concerns"
        },
        status: "low"
      },
      {
        name: "Bank Lending Standards",
        description: "Net percentage of banks tightening lending standards",
        currentValue: "12.5 %",
        riskScore: 22,
        interpretation: {
          low: "Easing lending standards - credit availability",
          high: "Tightening lending standards - credit crunch risk"
        },
        status: "low"
      }
    ]
  },
  technical: {
    id: "technical",
    name: "Technical Indicators",
    icon: "📈",
    score: 10,
    description: "Market momentum and technical signals",
    signals: [
      {
        name: "S&P 500 vs 200-day MA",
        description: "S&P 500 position relative to 200-day moving average",
        currentValue: "+8.5 %",
        riskScore: 12,
        interpretation: {
          low: "Above 200-day MA - bullish trend",
          high: "Below 200-day MA - bearish trend"
        },
        status: "low"
      },
      {
        name: "RSI (14-day)",
        description: "Relative strength index",
        currentValue: "58.3",
        riskScore: 15,
        interpretation: {
          low: "Neutral momentum - balanced market",
          high: "Overbought/oversold - reversal risk"
        },
        status: "low"
      },
      {
        name: "Advance-Decline Line",
        description: "Market breadth indicator",
        currentValue: "Positive",
        riskScore: 5,
        interpretation: {
          low: "Broad market participation - healthy rally",
          high: "Narrow market leadership - fragile rally"
        },
        status: "low"
      }
    ]
  },
  sentiment: {
    id: "sentiment",
    name: "Sentiment Indicators",
    icon: "😊",
    score: 5,
    description: "Investor sentiment and positioning",
    signals: [
      {
        name: "Put/Call Ratio",
        description: "Ratio of put options to call options",
        currentValue: "0.85",
        riskScore: 8,
        interpretation: {
          low: "Balanced sentiment - neutral positioning",
          high: "Extreme sentiment - contrarian signal"
        },
        status: "low"
      },
      {
        name: "AAII Bull/Bear Spread",
        description: "Individual investor sentiment survey spread",
        currentValue: "+15 %",
        riskScore: 12,
        interpretation: {
          low: "Neutral sentiment - room for upside",
          high: "Extreme optimism/pessimism - reversal risk"
        },
        status: "low"
      }
    ]
  },
  qualitative: {
    id: "qualitative",
    name: "Qualitative Factors",
    icon: "📝",
    score: 0,
    description: "Policy and geopolitical considerations",
    signals: [
      {
        name: "Fed Policy Stance",
        description: "Federal Reserve monetary policy direction",
        currentValue: "Neutral",
        riskScore: 0,
        interpretation: {
          low: "Accommodative policy - market supportive",
          high: "Restrictive policy - market headwind"
        },
        status: "low"
      },
      {
        name: "Geopolitical Risk",
        description: "Assessment of geopolitical tensions",
        currentValue: "Moderate",
        riskScore: 0,
        interpretation: {
          low: "Low geopolitical risk - stable environment",
          high: "High geopolitical risk - uncertainty"
        },
        status: "low"
      }
    ]
  },
  global: {
    id: "global",
    name: "Global Indicators",
    icon: "🌐",
    score: 0,
    description: "International economic and market conditions",
    signals: [
      {
        name: "Global PMI",
        description: "Global purchasing managers index",
        currentValue: "51.2",
        riskScore: 0,
        interpretation: {
          low: "Global expansion - supportive backdrop",
          high: "Global contraction - headwind for markets"
        },
        status: "low"
      },
      {
        name: "Emerging Markets Performance",
        description: "MSCI Emerging Markets index performance",
        currentValue: "+2.5 % MTD",
        riskScore: 0,
        interpretation: {
          low: "EM strength - global risk-on",
          high: "EM weakness - global risk-off"
        },
        status: "low"
      },
      {
        name: "Dollar Index (DXY)",
        description: "U.S. dollar index strength",
        currentValue: "103.5",
        riskScore: 0,
        interpretation: {
          low: "Weak dollar - supportive for risk assets",
          high: "Strong dollar - headwind for risk assets"
        },
        status: "low"
      }
    ]
  }
};

export default function CategoryDetail() {
  const [, params] = useRoute("/category/:id");
  const categoryId = params?.id || "liquidity";
  const category = categoryData[categoryId] || categoryData.liquidity;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "high": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getStatusText = (score: number) => {
    if (score < 30) return { text: "Very low risk - conditions are favorable", color: "text-green-500" };
    if (score < 60) return { text: "Moderate risk - monitor closely", color: "text-yellow-500" };
    return { text: "High risk - caution advised", color: "text-red-500" };
  };

  const status = getStatusText(category.score);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Risk29 Dashboard</h1>
            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Category Header */}
        <Card className="p-6 bg-card border-border mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="text-6xl">{category.icon}</div>
              <div>
                <h2 className="text-3xl font-bold mb-2">{category.name}</h2>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Category Risk Score</p>
              <p className="text-5xl font-bold text-orange-500">{category.score}</p>
              <p className="text-lg text-muted-foreground">/ 100</p>
              <Button variant="outline" size="sm" className="mt-2">Watch</Button>
            </div>
          </div>
        </Card>

        {/* Signals */}
        <h3 className="text-2xl font-bold mb-4">Signals in this Category</h3>
        
        <div className="space-y-4">
          {category.signals.map((signal, index) => (
            <Card key={index} className="p-6 bg-card border-border">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-2">{signal.name}</h4>
                    <p className="text-sm text-muted-foreground">{signal.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      {signal.status === "low" ? (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      )}
                      {signal.currentValue}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Score</span>
                  <span className={`text-2xl font-bold ${getStatusColor(signal.status)}`}>
                    {signal.riskScore}
                  </span>
                </div>

                <Progress value={signal.riskScore} className="h-2" />

                {/* Interpretation */}
                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-500">Low Score (Good)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{signal.interpretation.low}</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-semibold text-red-500">High Score (Risk)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{signal.interpretation.high}</p>
                  </div>
                </div>

                {/* Current Status */}
                <div className="pt-3 border-t border-border">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Current Status: </span>
                    <span className={getStatusColor(signal.status) + " font-semibold"}>
                      {signal.status === "low" && "Very low risk - conditions are favorable"}
                      {signal.status === "medium" && "Moderate risk - monitor closely"}
                      {signal.status === "high" && "High risk - caution advised"}
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
