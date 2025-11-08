import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAssetUrl } from "@/lib/basePath";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Asset {
  id: string;
  name: string;
  ticker: string;
  value: number;
  weight: number;
}

interface PortfolioRisk {
  category: string;
  exposure: number;
  impact: number;
  recommendation: string;
}

export default function Portfolio() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [newAsset, setNewAsset] = useState({ name: "", ticker: "", value: 0 });
  const [riskData, setRiskData] = useState<any>(null);

  // Load portfolio from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("portfolio");
    if (saved) {
      setAssets(JSON.parse(saved));
    }
  }, []);

  // Load risk data
  useEffect(() => {
    // Use cache busting to always get fresh data
    fetch(getAssetUrl("risk_data_v2.json", true), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
      .then((res) => res.json())
      .then((data) => setRiskData(data))
      .catch((err) => console.error("Failed to load risk data:", err));
  }, []);

  // Save portfolio to localStorage
  useEffect(() => {
    if (assets.length > 0) {
      localStorage.setItem("portfolio", JSON.stringify(assets));
    }
  }, [assets]);

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  // Calculate weights
  const assetsWithWeights = assets.map((asset) => ({
    ...asset,
    weight: totalValue > 0 ? (asset.value / totalValue) * 100 : 0,
  }));

  const addAsset = () => {
    if (newAsset.name && newAsset.ticker && newAsset.value > 0) {
      setAssets([
        ...assets,
        {
          id: Date.now().toString(),
          ...newAsset,
          weight: 0,
        },
      ]);
      setNewAsset({ name: "", ticker: "", value: 0 });
    }
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter((a) => a.id !== id));
  };

  // Calculate portfolio risk exposure
  const calculatePortfolioRisk = (): PortfolioRisk[] => {
    if (!riskData) return [];

    const categories = [
      { name: "Liquidity", key: "liquidity" },
      { name: "Valuation", key: "valuation" },
      { name: "Macro", key: "macro" },
      { name: "Credit", key: "credit" },
      { name: "Technical", key: "technical" },
      { name: "Sentiment", key: "sentiment" },
      { name: "Qualitative", key: "qualitative" },
      { name: "Global", key: "global" },
    ];

    return categories.map((cat) => {
      const categoryData = riskData.categories?.[cat.key];
      const score = categoryData?.score || 0;
      
      // Calculate exposure based on risk score
      const exposure = score;
      
      // Calculate impact on portfolio (higher risk = higher potential impact)
      const impact = (score / 100) * totalValue;
      
      // Generate recommendation
      let recommendation = "";
      if (score < 40) {
        recommendation = "Low risk - Maintain current allocation";
      } else if (score < 60) {
        recommendation = "Moderate risk - Monitor closely";
      } else if (score < 75) {
        recommendation = "High risk - Consider reducing exposure";
      } else {
        recommendation = "Critical risk - Reduce exposure immediately";
      }

      return {
        category: cat.name,
        exposure: Math.round(exposure),
        impact: Math.round(impact),
        recommendation,
      };
    });
  };

  const portfolioRisks = calculatePortfolioRisk();
  const avgPortfolioRisk = portfolioRisks.length > 0
    ? Math.round(portfolioRisks.reduce((sum, r) => sum + r.exposure, 0) / portfolioRisks.length)
    : 0;

  const marketRisk = riskData?.overall_risk_score || 0;

  // Pie chart colors
  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#6366f1", "#ef4444"];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Portfolio Risk Analysis</h1>
              <p className="text-muted-foreground">
                Analyze your portfolio exposure to market risks
              </p>
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-card text-card-foreground">
            <div className="text-sm text-muted-foreground mb-2">Total Portfolio Value</div>
            <div className="text-3xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {assets.length} assets
            </div>
          </Card>

          <Card className="p-6 bg-card text-card-foreground">
            <div className="text-sm text-muted-foreground mb-2">Portfolio Risk Score</div>
            <div className="text-3xl font-bold flex items-center gap-2">
              {avgPortfolioRisk}
              {avgPortfolioRisk > marketRisk ? (
                <TrendingUp className="h-6 w-6 text-red-500" />
              ) : (
                <TrendingDown className="h-6 w-6 text-green-500" />
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Market: {marketRisk}
            </div>
          </Card>

          <Card className="p-6 bg-card text-card-foreground">
            <div className="text-sm text-muted-foreground mb-2">Risk vs Market</div>
            <div className="text-3xl font-bold">
              {avgPortfolioRisk > marketRisk ? "+" : ""}
              {avgPortfolioRisk - marketRisk}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {avgPortfolioRisk > marketRisk ? "Higher risk" : "Lower risk"} than market
            </div>
          </Card>
        </div>

        {/* Add Asset Form */}
        <Card className="p-6 mb-8 bg-card text-card-foreground">
          <h2 className="text-xl font-bold mb-4">Add Asset</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Asset Name"
              value={newAsset.name}
              onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
            />
            <Input
              placeholder="Ticker"
              value={newAsset.ticker}
              onChange={(e) => setNewAsset({ ...newAsset, ticker: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Value ($)"
              value={newAsset.value || ""}
              onChange={(e) => setNewAsset({ ...newAsset, value: parseFloat(e.target.value) || 0 })}
            />
            <Button onClick={addAsset} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </Card>

        {/* Assets List */}
        {assets.length > 0 && (
          <Card className="p-6 mb-8 bg-card text-card-foreground">
            <h2 className="text-xl font-bold mb-4">Portfolio Holdings</h2>
            <div className="space-y-2">
              {assetsWithWeights.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{asset.name}</div>
                    <div className="text-sm text-muted-foreground">{asset.ticker}</div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-semibold">${asset.value.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.weight.toFixed(1)}%
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAsset(asset.id)}
                    className="ml-4"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Portfolio Allocation Chart */}
        {assets.length > 0 && (
          <Card className="p-6 mb-8 bg-card text-card-foreground">
            <h2 className="text-xl font-bold mb-4">Portfolio Allocation</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetsWithWeights}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name} (${entry.weight.toFixed(1)}%)`}
                >
                  {assetsWithWeights.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Risk Exposure Analysis */}
        {portfolioRisks.length > 0 && (
          <>
            <Card className="p-6 mb-8 bg-card text-card-foreground">
              <h2 className="text-xl font-bold mb-4">Risk Exposure by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={portfolioRisks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="category" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f1f1f",
                      border: "1px solid #333",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="exposure" fill="#3b82f6" name="Risk Exposure" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Recommendations */}
            <Card className="p-6 bg-card text-card-foreground">
              <h2 className="text-xl font-bold mb-4">Risk Recommendations</h2>
              <div className="space-y-4">
                {portfolioRisks
                  .filter((r) => r.exposure >= 60)
                  .map((risk, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                    >
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-1" />
                      <div className="flex-1">
                        <div className="font-semibold">{risk.category}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Risk Score: {risk.exposure} | Potential Impact: $
                          {risk.impact.toLocaleString()}
                        </div>
                        <div className="text-sm mt-2">{risk.recommendation}</div>
                      </div>
                    </div>
                  ))}
                {portfolioRisks.filter((r) => r.exposure >= 60).length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No high-risk categories detected. Your portfolio appears well-balanced.
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {assets.length === 0 && (
          <Card className="p-12 text-center bg-card text-card-foreground">
            <div className="text-muted-foreground mb-4">
              No assets in your portfolio yet
            </div>
            <div className="text-sm text-muted-foreground">
              Add your first asset using the form above to start analyzing your portfolio risk
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
