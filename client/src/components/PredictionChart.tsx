import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart, Brush } from 'recharts';
import { TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Prediction {
  date: string;
  predicted_risk: number;
  lower_bound: number;
  upper_bound: number;
}

interface PredictionData {
  generated_at: string;
  forecast_horizon_days: number;
  predictions: Prediction[];
  metadata: {
    model: string;
    confidence_interval: string;
    description: string;
  };
}

export default function PredictionChart() {
  const { theme } = useTheme();
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>('30');

  useEffect(() => {
    const loadPredictions = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}predictions.json`);
        if (!response.ok) {
          throw new Error('Failed to load predictions');
        }
        const data = await response.json();
        setPredictionData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading predictions:', err);
        setError('Predictions not available yet. Model training in progress.');
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
  }, []);

  if (loading) {
    return (
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading predictions...</div>
        </div>
      </Card>
    );
  }

  if (error || !predictionData) {
    return (
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-8 h-8" />
            <p>{error || 'No prediction data available'}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Format data for chart with date range filter
  const allChartData = predictionData.predictions.map(pred => ({
    date: new Date(pred.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: pred.date,
    predicted: pred.predicted_risk,
    lower: pred.lower_bound,
    upper: pred.upper_bound,
  }));
  
  // Filter by date range
  const chartData = allChartData.slice(0, parseInt(dateRange));

  // Calculate average predicted risk
  const avgRisk = predictionData.predictions.reduce((sum, pred) => sum + pred.predicted_risk, 0) / predictionData.predictions.length;

  // Determine risk level
  const getRiskLevel = (score: number) => {
    if (score >= 50) return { label: 'High', color: 'text-red-500' };
    if (score >= 30) return { label: 'Moderate', color: 'text-yellow-500' };
    return { label: 'Low', color: 'text-green-500' };
  };

  const riskLevel = getRiskLevel(avgRisk);

  // Theme-aware colors
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#3f3f46' : '#e5e7eb';
  const textColor = isDark ? '#71717a' : '#6b7280';
  const tooltipBg = isDark ? '#18181b' : '#ffffff';
  const tooltipBorder = isDark ? '#3f3f46' : '#e5e7eb';

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Risk Forecast (Next {dateRange} Days)</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Average Predicted Risk</div>
            <div className={`text-2xl font-bold ${riskLevel.color}`}>
              {avgRisk.toFixed(1)}
              <span className="text-sm ml-2 font-normal">{riskLevel.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="date" 
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 12 }}
            />
            <YAxis 
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 12 }}
              domain={[0, 100]}
              label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', fill: textColor }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
              }}
              labelStyle={{ color: textColor }}
              formatter={(value: any, name: string, props: any) => {
                const val = Number(value).toFixed(1);
                if (name === 'Predicted Risk') {
                  // Calculate % change from previous day
                  const index = chartData.findIndex(d => d.date === props.payload.date);
                  if (index > 0) {
                    const prevValue = chartData[index - 1].predicted;
                    const change = ((value - prevValue) / prevValue * 100).toFixed(1);
                    const changeStr = change > 0 ? `+${change}%` : `${change}%`;
                    return [`${val} (${changeStr})`, name];
                  }
                }
                return [`${val}`, name];
              }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', padding: '12px' }}>
                      <p style={{ color: textColor, fontWeight: 'bold', marginBottom: '8px' }}>{label}</p>
                      <p style={{ color: '#3b82f6', marginBottom: '4px' }}>
                        <strong>Predicted:</strong> {data.predicted.toFixed(1)}
                      </p>
                      <p style={{ color: textColor, fontSize: '12px', marginBottom: '2px' }}>
                        <strong>Upper Bound:</strong> {data.upper.toFixed(1)}
                      </p>
                      <p style={{ color: textColor, fontSize: '12px' }}>
                        <strong>Lower Bound:</strong> {data.lower.toFixed(1)}
                      </p>
                      <p style={{ color: textColor, fontSize: '11px', marginTop: '8px', opacity: 0.7 }}>
                        95% Confidence Interval
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            
            {/* Confidence interval area */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.1}
              name="Upper Bound"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.1}
              name="Lower Bound"
            />
            
            {/* Predicted risk line */}
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Predicted Risk"
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-center text-muted-foreground text-sm">
          {predictionData.metadata.description}
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>Model: {predictionData.metadata.model}</span>
          <span>•</span>
          <span>Confidence: {predictionData.metadata.confidence_interval}</span>
          <span>•</span>
          <span>Updated: {new Date(predictionData.generated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
}
