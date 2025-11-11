import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Award, AlertCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModelMetrics {
  mape: number;
  rmse: number;
  mae: number;
}

interface ModelInfo {
  name: string;
  type: string;
  metrics: ModelMetrics;
  predictions_file: string;
}

interface ModelComparison {
  generated_at: string;
  models: ModelInfo[];
}

interface Prediction {
  date: string;
  predicted_risk: number;
  lower_bound: number;
  upper_bound: number;
}

export default function ModelPerformance() {
  const { theme } = useTheme();
  const [comparisonData, setComparisonData] = useState<ModelComparison | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('Prophet');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComparisonData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}model_comparison.json`);
        if (!response.ok) {
          throw new Error('Failed to load model comparison data');
        }
        const data = await response.json();
        setComparisonData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading model comparison:', err);
        setError('Model comparison data not available');
      } finally {
        setLoading(false);
      }
    };

    loadComparisonData();
  }, []);

  useEffect(() => {
    const loadPredictions = async () => {
      if (!comparisonData) return;
      
      const model = comparisonData.models.find(m => m.name === selectedModel);
      if (!model) return;

      try {
        const response = await fetch(`${import.meta.env.BASE_URL}${model.predictions_file}`);
        if (!response.ok) {
          throw new Error('Failed to load predictions');
        }
        const data = await response.json();
        setPredictions(data.predictions || []);
      } catch (err) {
        console.error('Error loading predictions:', err);
        setPredictions([]);
      }
    };

    loadPredictions();
  }, [selectedModel, comparisonData]);

  if (loading) {
    return (
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading model performance data...</div>
        </div>
      </Card>
    );
  }

  if (error || !comparisonData) {
    return (
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-8 h-8" />
            <p>{error || 'No model performance data available'}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Prepare data for metrics comparison chart
  const metricsData = comparisonData.models.map(model => ({
    name: model.name,
    MAPE: model.metrics.mape || 0,
    RMSE: model.metrics.rmse || 0,
    MAE: model.metrics.mae || 0,
  }));

  // Find best model (lowest MAPE)
  const bestModel = comparisonData.models.reduce((best, current) => {
    if (!best.metrics.mape) return current;
    if (!current.metrics.mape) return best;
    return current.metrics.mape < best.metrics.mape ? current : best;
  });

  // Prepare prediction comparison data
  const predictionChartData = predictions.slice(0, 14).map(pred => ({
    date: new Date(pred.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    predicted: pred.predicted_risk,
  }));

  // Theme-aware colors
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#3f3f46' : '#e5e7eb';
  const textColor = isDark ? '#71717a' : '#6b7280';
  const tooltipBg = isDark ? '#18181b' : '#ffffff';
  const tooltipBorder = isDark ? '#3f3f46' : '#e5e7eb';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold">AI Model Performance</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Best Model: <span className="font-semibold text-foreground">{bestModel.name}</span>
            </div>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {comparisonData.models.map(model => (
                  <SelectItem key={model.name} value={model.name}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Model Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparisonData.models.map(model => (
            <Card 
              key={model.name} 
              className={`p-4 ${selectedModel === model.name ? 'border-blue-500 border-2' : 'border-border'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{model.name}</h3>
                {model.name === bestModel.name && (
                  <Award className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{model.type}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MAPE:</span>
                  <span className="font-semibold">{model.metrics.mape?.toFixed(2) || 'N/A'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RMSE:</span>
                  <span className="font-semibold">{model.metrics.rmse?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MAE:</span>
                  <span className="font-semibold">{model.metrics.mae?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Metrics Comparison Chart */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metricsData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="name" 
                stroke={textColor}
                tick={{ fill: textColor, fontSize: 12 }}
              />
              <YAxis 
                stroke={textColor}
                tick={{ fill: textColor, fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                }}
                labelStyle={{ color: textColor }}
              />
              <Legend />
              <Bar dataKey="MAPE" fill="#3b82f6" name="MAPE (%)" />
              <Bar dataKey="RMSE" fill="#10b981" name="RMSE" />
              <Bar dataKey="MAE" fill="#f59e0b" name="MAE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p><strong>MAPE:</strong> Mean Absolute Percentage Error (lower is better)</p>
          <p><strong>RMSE:</strong> Root Mean Square Error (lower is better)</p>
          <p><strong>MAE:</strong> Mean Absolute Error (lower is better)</p>
        </div>
      </Card>

      {/* Selected Model Predictions */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg font-semibold mb-4">{selectedModel} Predictions (Next 14 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={predictionChartData}
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
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                }}
                labelStyle={{ color: textColor }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Predicted Risk"
                dot={{ fill: '#3b82f6', r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
