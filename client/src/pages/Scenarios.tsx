import { useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Historical scenarios
const scenarios = [
  {
    id: "2008-crisis",
    name: "2008 Financial Crisis",
    period: "Sep 2008 - Mar 2009",
    description: "Global financial crisis triggered by subprime mortgage collapse",
    peakRisk: 92,
    avgRisk: 78,
    duration: 6,
    impact: "severe",
    indicators: {
      liquidity: 95,
      credit: 98,
      valuation: 45,
      macro: 88,
    },
  },
  {
    id: "2020-pandemic",
    name: "COVID-19 Pandemic",
    period: "Mar 2020 - May 2020",
    description: "Market crash due to global pandemic and lockdowns",
    peakRisk: 88,
    avgRisk: 72,
    duration: 3,
    impact: "severe",
    indicators: {
      liquidity: 82,
      credit: 75,
      valuation: 38,
      macro: 95,
    },
  },
  {
    id: "2022-inflation",
    name: "2022 Inflation Surge",
    period: "Jan 2022 - Oct 2022",
    description: "High inflation and aggressive Fed rate hikes",
    peakRisk: 75,
    avgRisk: 65,
    duration: 10,
    impact: "moderate",
    indicators: {
      liquidity: 70,
      credit: 55,
      valuation: 68,
      macro: 80,
    },
  },
  {
    id: "2011-debt-crisis",
    name: "2011 European Debt Crisis",
    period: "May 2011 - Dec 2011",
    description: "Sovereign debt crisis in European countries",
    peakRisk: 70,
    avgRisk: 58,
    duration: 8,
    impact: "moderate",
    indicators: {
      liquidity: 65,
      credit: 85,
      valuation: 52,
      macro: 72,
    },
  },
];

// Current risk profile (mock data)
const currentProfile = {
  overall: 20,
  liquidity: 52,
  credit: 54,
  valuation: 48,
  macro: 24,
};

export default function Scenarios() {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);

  // Generate comparison data
  const comparisonData = [
    { category: "Liquidity", current: currentProfile.liquidity, scenario: selectedScenario.indicators.liquidity },
    { category: "Credit", current: currentProfile.credit, scenario: selectedScenario.indicators.credit },
    { category: "Valuation", current: currentProfile.valuation, scenario: selectedScenario.indicators.valuation },
    { category: "Macro", current: currentProfile.macro, scenario: selectedScenario.indicators.macro },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "severe": return "text-red-500";
      case "moderate": return "text-orange-500";
      case "mild": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "severe": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "moderate": return <TrendingDown className="h-5 w-5 text-orange-500" />;
      default: return <TrendingUp className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Historical Scenario Analysis</h1>
              <p className="text-sm text-muted-foreground">
                Compare current risk profile with historical market events
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Scenario Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedScenario.id === scenario.id
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedScenario(scenario)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm">{scenario.name}</h3>
                {getImpactIcon(scenario.impact)}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{scenario.period}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Peak Risk:</span>
                  <span className="font-semibold text-red-500">{scenario.peakRisk}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Avg Risk:</span>
                  <span className="font-semibold">{scenario.avgRisk}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{scenario.duration} months</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Selected Scenario Details */}
        <Card className="p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">{selectedScenario.name}</h2>
              <p className="text-sm text-muted-foreground mb-1">{selectedScenario.period}</p>
              <p className="text-sm">{selectedScenario.description}</p>
            </div>
            <div className={`text-right ${getImpactColor(selectedScenario.impact)}`}>
              <div className="text-3xl font-bold">{selectedScenario.peakRisk}</div>
              <div className="text-xs uppercase tracking-wide">{selectedScenario.impact} Impact</div>
            </div>
          </div>
        </Card>

        {/* Comparison Chart */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Risk Profile Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="category" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="current"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Current Profile"
              />
              <Line
                type="monotone"
                dataKey="scenario"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name={selectedScenario.name}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk Differential */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Differential Analysis</h3>
          <div className="space-y-4">
            {comparisonData.map((item) => {
              const diff = item.current - item.scenario;
              const diffPercent = ((diff / item.scenario) * 100).toFixed(1);
              const isLower = diff < 0;

              return (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{item.category}</span>
                      <span className={`text-sm font-semibold ${isLower ? "text-green-500" : "text-red-500"}`}>
                        {isLower ? "" : "+"}{diff} ({isLower ? "" : "+"}{diffPercent}%)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(item.current / 100) * 100}%` }}
                        />
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${(item.scenario / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Current: {item.current}</span>
                      <span>Scenario: {item.scenario}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Assessment */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Overall Assessment</h4>
            <p className="text-sm text-muted-foreground">
              {currentProfile.overall < selectedScenario.avgRisk ? (
                <>
                  Current risk levels are <span className="text-green-500 font-semibold">significantly lower</span> than during the {selectedScenario.name}. 
                  The market appears to be in a relatively stable condition compared to this historical crisis period.
                </>
              ) : (
                <>
                  Current risk levels are <span className="text-red-500 font-semibold">approaching</span> those seen during the {selectedScenario.name}. 
                  Increased caution and monitoring are recommended.
                </>
              )}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
