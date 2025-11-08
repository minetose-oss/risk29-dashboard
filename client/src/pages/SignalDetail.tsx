import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { getAssetUrl } from "@/lib/basePath";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SignalData {
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
  category: string;
}

export default function SignalDetail() {
  const [, params] = useRoute("/signal/:id");
  const signalId = params?.id || '';
  const [signal, setSignal] = useState<SignalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    const loadSignalData = async () => {
      try {
        // Use cache busting to always get fresh data
        const response = await fetch(getAssetUrl('risk_data_v2.json', true), {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (response.ok) {
          const data = await response.json();
          
          // Search for signal across all categories
          let foundSignal: SignalData | null = null;
          let foundCategory = '';
          
          Object.entries(data.categories || {}).forEach(([categoryKey, categoryData]: [string, any]) => {
            const signals = categoryData.signals || [];
            const matchedSignal = signals.find((s: any) => s.id === signalId);
            if (matchedSignal) {
              foundSignal = {
                ...matchedSignal,
                category: categoryData.name || categoryKey
              };
              foundCategory = categoryKey;
            }
          });
          
          if (foundSignal) {
            const signalData: SignalData = foundSignal;
            setSignal(signalData);
            
            // Generate mock historical data
            const baseValue = typeof signalData.current_value === 'number' 
              ? signalData.current_value 
              : parseFloat(String(signalData.current_value));
            const baseRiskScore = signalData.risk_score;
            
            const historical = Array.from({ length: 30 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (29 - i));
              
              return {
                date: date.toISOString().split('T')[0],
                value: baseValue + (Math.random() - 0.5) * (baseValue * 0.1),
                riskScore: baseRiskScore + (Math.random() - 0.5) * 20,
              };
            });
            setHistoricalData(historical);
          }
        }
      } catch (error) {
        console.error('Error loading signal data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSignalData();
  }, [signalId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Loading signal data...</div>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Signal Not Found</h1>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 75) return 'bg-red-500/10 border-red-500/20';
    if (score >= 60) return 'bg-orange-500/10 border-orange-500/20';
    if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-green-500/10 border-green-500/20';
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-zinc-400 mb-2">{signal.category}</div>
              <h1 className="text-4xl font-bold mb-2">{signal.name}</h1>
              <p className="text-zinc-400">{signal.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-400 mb-1">Current Value</div>
              <div className="text-3xl font-bold text-green-400">
                {typeof signal.current_value === 'number' 
                  ? signal.current_value.toLocaleString() 
                  : signal.current_value}
                <span className="text-lg text-zinc-400 ml-2">{signal.unit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Score Card */}
        <Card className={`p-6 mb-8 border ${getRiskBgColor(signal.risk_score)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Risk Score</h2>
              <div className={`text-5xl font-bold ${getRiskColor(signal.risk_score)}`}>
                {signal.risk_score}
                <span className="text-2xl text-zinc-400">/100</span>
              </div>
              <div className="text-sm text-zinc-400 mt-2">{signal.status}</div>
            </div>
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${getRiskBgColor(signal.risk_score)}`}>
              {signal.risk_score >= 60 ? (
                <TrendingUp className="w-16 h-16 text-red-500" />
              ) : (
                <TrendingDown className="w-16 h-16 text-green-500" />
              )}
            </div>
          </div>
        </Card>

        {/* Interpretation Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-green-500/10 border-green-500/20">
            <div className="flex items-start gap-3">
              <TrendingDown className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-bold text-green-500 mb-2">Low Score (Good)</h3>
                <p className="text-sm text-zinc-300">{signal.interpretation.low}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-red-500/10 border-red-500/20">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-red-500 mt-1" />
              <div>
                <h3 className="font-bold text-red-500 mb-2">High Score (Risk)</h3>
                <p className="text-sm text-zinc-300">{signal.interpretation.high}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Historical Trend Chart */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Historical Trend (30 Days)
          </h2>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  tick={{ fill: '#999' }}
                />
                <YAxis 
                  stroke="#666"
                  tick={{ fill: '#999' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #333',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  name={signal.name}
                />
                <Line 
                  type="monotone" 
                  dataKey="riskScore" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={false}
                  name="Risk Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-500"></div>
              <span className="text-zinc-400">Value</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-red-500"></div>
              <span className="text-zinc-400">Risk Score</span>
            </div>
          </div>
        </Card>

        {/* Metadata */}
        <div className="mt-6 text-sm text-zinc-500">
          Last updated: {new Date(signal.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
    </div>
  );
}
