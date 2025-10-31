import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateHistoricalData, calculateChange } from "@/lib/exportUtils";

export default function Comparison() {
  const [period1Days] = useState(7);
  const [period2Days] = useState(30);

  // Generate data for both periods
  const allData = generateHistoricalData();
  const period1Data = allData.slice(-period1Days);
  const period2Data = allData;

  // Calculate averages
  const calculateAverage = (data: any[], key: string) => {
    const sum = data.reduce((acc, item) => acc + item[key], 0);
    return sum / data.length;
  };

  const metrics = [
    { key: 'overall', label: 'Overall Risk', color: '#3b82f6' },
    { key: 'liquidity', label: 'Liquidity', color: '#f97316' },
    { key: 'valuation', label: 'Valuation', color: '#eab308' },
    { key: 'credit', label: 'Credit', color: '#ef4444' },
    { key: 'macro', label: 'Macro', color: '#10b981' },
  ];

  const comparisons = metrics.map(metric => {
    const avg1 = calculateAverage(period1Data, metric.key);
    const avg2 = calculateAverage(period2Data, metric.key);
    const change = calculateChange(avg1, avg2);
    
    return {
      ...metric,
      period1: avg1,
      period2: avg2,
      change,
      isIncrease: change > 0,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Period Comparison</h1>
            <p className="text-zinc-400 text-sm">Compare risk metrics across different time periods</p>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {comparisons.map(comp => (
            <Card key={comp.key} className="bg-zinc-900 border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{comp.label}</h3>
                <div className={`flex items-center gap-1 text-sm ${comp.isIncrease ? 'text-red-500' : 'text-green-500'}`}>
                  {comp.isIncrease ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(comp.change).toFixed(1)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-zinc-500">Last 7 Days</div>
                  <div className="text-2xl font-bold" style={{ color: comp.color }}>
                    {comp.period1.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Last 30 Days</div>
                  <div className="text-lg text-zinc-400">
                    {comp.period2.toFixed(1)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Side-by-side Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Last 7 Days */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Last 7 Days</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={period1Data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).getDate().toString()}
                  />
                  <YAxis 
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                    formatter={(value: any) => [`${value.toFixed(1)}`, '']}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconType="line"
                  />
                  {metrics.map(metric => (
                    <Line 
                      key={metric.key}
                      type="monotone" 
                      dataKey={metric.key} 
                      stroke={metric.color} 
                      strokeWidth={2}
                      name={metric.label}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Last 30 Days */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Last 30 Days</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={period2Data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).getDate().toString()}
                  />
                  <YAxis 
                    stroke="#71717a"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                    formatter={(value: any) => [`${value.toFixed(1)}`, '']}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconType="line"
                  />
                  {metrics.map(metric => (
                    <Line 
                      key={metric.key}
                      type="monotone" 
                      dataKey={metric.key} 
                      stroke={metric.color} 
                      strokeWidth={2}
                      name={metric.label}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Summary */}
        <Card className="bg-zinc-900 border-zinc-800 p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="space-y-2 text-sm">
            <p className="text-zinc-400">
              Comparing average risk scores between the last 7 days and last 30 days.
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-1">
              {comparisons.map(comp => (
                <li key={comp.key}>
                  <span className="font-semibold" style={{ color: comp.color }}>{comp.label}</span>: 
                  {comp.isIncrease ? ' increased' : ' decreased'} by {Math.abs(comp.change).toFixed(1)}%
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
