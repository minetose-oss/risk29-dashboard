import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, DollarSign, Percent, Calendar, Target } from "lucide-react";
import { Line } from "react-chartjs-2";

interface PerformanceData {
  date: string;
  portfolioValue: number;
  actualRisk: number;
  predictedRisk: number;
}

export default function Performance() {
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [currentValue, setCurrentValue] = useState(105000);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    // Generate mock performance data for last 30 days
    const data: PerformanceData[] = [];
    const today = new Date();
    let value = initialInvestment;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate portfolio growth with some volatility
      value += (Math.random() - 0.45) * 1000;
      
      data.push({
        date: date.toISOString().split('T')[0],
        portfolioValue: value,
        actualRisk: Math.floor(Math.random() * 40) + 10,
        predictedRisk: Math.floor(Math.random() * 40) + 10,
      });
    }
    
    setPerformanceData(data);
    setCurrentValue(value);
  }, [initialInvestment]);

  const totalReturn = currentValue - initialInvestment;
  const returnPercentage = ((currentValue - initialInvestment) / initialInvestment) * 100;
  const avgRisk = performanceData.reduce((sum, d) => sum + d.actualRisk, 0) / performanceData.length;

  const chartData = {
    labels: performanceData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Portfolio Value',
        data: performanceData.map(d => d.portfolioValue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const riskChartData = {
    labels: performanceData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Actual Risk',
        data: performanceData.map(d => d.actualRisk),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Predicted Risk',
        data: performanceData.map(d => d.predictedRisk),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        borderDash: [5, 5],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#a1a1aa' },
      },
    },
    scales: {
      x: {
        grid: { color: '#27272a' },
        ticks: { color: '#a1a1aa' },
      },
      y: {
        grid: { color: '#27272a' },
        ticks: { color: '#a1a1aa' },
      },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Performance Tracking</h1>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-zinc-900/50 border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              <div className="text-sm text-zinc-400">Current Value</div>
            </div>
            <div className="text-2xl font-bold">${currentValue.toLocaleString()}</div>
          </Card>

          <Card className="p-4 bg-zinc-900/50 border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              {totalReturn >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <div className="text-sm text-zinc-400">Total Return</div>
            </div>
            <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${Math.abs(totalReturn).toLocaleString()}
            </div>
          </Card>

          <Card className="p-4 bg-zinc-900/50 border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-purple-500" />
              <div className="text-sm text-zinc-400">Return %</div>
            </div>
            <div className={`text-2xl font-bold ${returnPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
            </div>
          </Card>

          <Card className="p-4 bg-zinc-900/50 border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-yellow-500" />
              <div className="text-sm text-zinc-400">Avg Risk Score</div>
            </div>
            <div className="text-2xl font-bold">{avgRisk.toFixed(1)}</div>
          </Card>
        </div>

        {/* Portfolio Value Chart */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800 mb-6">
          <h2 className="text-xl font-bold mb-4">Portfolio Value (Last 30 Days)</h2>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Card>

        {/* Risk Comparison Chart */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800 mb-6">
          <h2 className="text-xl font-bold mb-4">Actual vs Predicted Risk</h2>
          <div className="h-64">
            <Line data={riskChartData} options={chartOptions} />
          </div>
          <div className="mt-4 text-sm text-zinc-400">
            Compare how well our risk predictions matched actual market conditions. Lower deviation indicates better forecasting accuracy.
          </div>
        </Card>

        {/* ROI Calculator */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h2 className="text-xl font-bold mb-4">ROI Calculator</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Initial Investment</label>
              <Input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time Period</label>
              <select className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md">
                <option>30 Days</option>
                <option>90 Days</option>
                <option>1 Year</option>
                <option>All Time</option>
              </select>
            </div>
          </div>

          <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-zinc-400 mb-1">Initial Investment</div>
                <div className="text-xl font-bold">${initialInvestment.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400 mb-1">Current Value</div>
                <div className="text-xl font-bold">${currentValue.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400 mb-1">ROI</div>
                <div className={`text-xl font-bold ${returnPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded">
              <span className="text-sm text-zinc-400">Annualized Return</span>
              <span className="font-bold">{(returnPercentage * 12).toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded">
              <span className="text-sm text-zinc-400">Risk-Adjusted Return</span>
              <span className="font-bold">{(returnPercentage / (avgRisk / 10)).toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded">
              <span className="text-sm text-zinc-400">Sharpe Ratio (Est.)</span>
              <span className="font-bold">{(returnPercentage / avgRisk).toFixed(3)}</span>
            </div>
          </div>
        </Card>

        {/* Performance Summary */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h3 className="font-bold mb-2">Performance Summary</h3>
          <p className="text-sm text-zinc-300">
            Your portfolio has {returnPercentage >= 0 ? 'gained' : 'lost'} {Math.abs(returnPercentage).toFixed(2)}% 
            over the last 30 days with an average risk score of {avgRisk.toFixed(1)}. 
            {returnPercentage >= 0 
              ? ' Great job maintaining a balanced risk-return profile!' 
              : ' Consider reviewing your risk management strategy.'}
          </p>
        </div>
      </div>
    </div>
  );
}
