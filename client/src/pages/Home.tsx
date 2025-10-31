import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingDown, Activity, BarChart3, Download, FileDown, Sun, Moon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToCSV, exportChartAsPNG, generateHistoricalData } from "@/lib/exportUtils";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useDashboardProfile, DashboardProfile } from "@/contexts/DashboardProfileContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableCategory } from '@/components/SortableCategory';

interface CategoryData {
  name: string;
  icon: string;
  score: number;
  signals: number;
  color: string;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { profile, setProfile, config, getWeightedScore } = useDashboardProfile();
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCategories, setVisibleCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('visibleCategories');
    return saved ? JSON.parse(saved) : ['Liquidity', 'Valuation', 'Macro', 'Credit', 'Technical', 'Sentiment', 'Qualitative', 'Global'];
  });
  const [categoryOrder, setCategoryOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('categoryOrder');
    return saved ? JSON.parse(saved) : ['Liquidity', 'Valuation', 'Macro', 'Credit', 'Technical', 'Sentiment', 'Qualitative', 'Global'];
  });
  const chartRef = useRef<HTMLDivElement>(null);
  const [showCategorySettings, setShowCategorySettings] = useState(false);

  // Save visible categories to localStorage
  useEffect(() => {
    localStorage.setItem('visibleCategories', JSON.stringify(visibleCategories));
  }, [visibleCategories]);

  // Save category order to localStorage
  useEffect(() => {
    localStorage.setItem('categoryOrder', JSON.stringify(categoryOrder));
  }, [categoryOrder]);

  // Drag-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCategoryOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleCategoryVisibility = (categoryName: string) => {
    setVisibleCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  // Handle CSV export
  const handleExportCSV = () => {
    const historicalData = generateHistoricalData();
    exportToCSV(historicalData, `risk29_data_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Data exported to CSV successfully!');
  };

  // Handle chart export
  const handleExportChart = async () => {
    if (!chartRef.current) return;
    try {
      await exportChartAsPNG(chartRef.current, `risk29_chart_${new Date().toISOString().split('T')[0]}.png`);
      toast.success('Chart exported as PNG successfully!');
    } catch (error) {
      toast.error('Failed to export chart');
    }
  };

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

  // Calculate weighted score based on profile
  const categoryScores = {
    liquidity: riskData?.categories?.liquidity?.score || 50,
    valuation: riskData?.categories?.valuation?.score || 48,
    macro: riskData?.categories?.macro?.score || 24,
    credit: riskData?.categories?.credit?.score || 11,
    technical: riskData?.categories?.technical?.score || 10,
    sentiment: riskData?.categories?.sentiment?.score || 5,
    qualitative: riskData?.categories?.qualitative?.score || 0,
    global: riskData?.categories?.global?.score || 0,
  };
  const score = getWeightedScore(categoryScores);
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
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold">Risk29 Dashboard</h1>
            </div>
            <p className="text-zinc-400">Financial Risk Monitoring System</p>
            <p className="text-zinc-500 text-sm">As of {lastUpdate}</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={profile} onValueChange={(value) => setProfile(value as DashboardProfile)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Conservative</span>
                  </div>
                </SelectItem>
                <SelectItem value="balanced">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Balanced</span>
                  </div>
                </SelectItem>
                <SelectItem value="aggressive">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Aggressive</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {toggleTheme && (
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
            )}
            <Link href="/correlation">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Activity className="w-4 h-4" />
                Correlations
              </Button>
            </Link>
            <Link href="/comparison">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Compare
              </Button>
            </Link>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export CSV
            </Button>
            <Link href="/custom-indicator">
            <Button variant="outline" size="sm">
              🔧 Custom
            </Button>
          </Link>
          <Link href="/settings">
              <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Alert Settings
              </button>
            </Link>
          </div>
        </div>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Risk Breakdown by Category</h2>
          </div>
          <Button
            onClick={() => setShowCategorySettings(!showCategorySettings)}
            variant="outline"
            size="sm"
          >
            {showCategorySettings ? 'Done' : 'Customize'}
          </Button>
        </div>

        {showCategorySettings && (
          <Card className="bg-zinc-800 border-zinc-700 p-4 mb-4">
            <h3 className="text-sm font-semibold mb-3">Show/Hide Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Liquidity', 'Valuation', 'Macro', 'Credit', 'Technical', 'Sentiment', 'Qualitative', 'Global'].map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleCategories.includes(cat)}
                    onChange={() => toggleCategoryVisibility(cat)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </Card>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categoryOrder}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {categoryOrder
                .filter(catName => visibleCategories.includes(catName))
                .map(catName => {
                  const category = categories.find(c => c.name === catName);
                  if (!category) return null;
                  return (
                    <SortableCategory
                      key={category.name}
                      category={category}
                    />
                  );
                })}
            </div>
          </SortableContext>
        </DndContext>
      </Card>

      {/* Historical Trend */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="text-zinc-500 text-sm mb-4">
          {Object.values(riskData.categories).reduce((sum: number, cat: any) => sum + (cat?.signals?.length || 0), 0)} signals tracked
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Historical Trend (Last 30 Days)</h2>
          </div>
          <Button
            onClick={handleExportChart}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export Chart
          </Button>
        </div>

        <div ref={chartRef} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis 
                dataKey="date" 
                stroke="#71717a"
                tick={{ fill: '#71717a', fontSize: 12 }}
              />
              <YAxis 
                stroke="#71717a"
                tick={{ fill: '#71717a', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                labelStyle={{ color: '#a1a1aa' }}
                formatter={(value: any) => [`${value.toFixed(1)}`, '']}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="overall" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Overall Risk"
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="liquidity" 
                stroke="#f97316" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Liquidity"
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="valuation" 
                stroke="#eab308" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Valuation"
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="credit" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Credit"
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="macro" 
                stroke="#22c55e" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Macro"
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-4">
          Showing overall risk score and major risk categories over the last 30 days
        </p>
      </Card>

      {/* Risk Levels */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Levels</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-green-500 font-bold text-lg">Info</div>
            <div className="text-zinc-400 text-sm">(0-39)</div>
          </div>
          <div>
            <div className="text-yellow-500 font-bold text-lg">Watch</div>
            <div className="text-zinc-400 text-sm">(40-59)</div>
          </div>
          <div>
            <div className="text-orange-500 font-bold text-lg">Warning</div>
            <div className="text-zinc-400 text-sm">(60-74)</div>
          </div>
          <div>
            <div className="text-red-500 font-bold text-lg">Alert</div>
            <div className="text-zinc-400 text-sm">(75-100)</div>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="mt-8 space-y-2">
        <div className="text-right text-zinc-500 text-sm">
          <p className="font-semibold">Powered by Risk29</p>
          <p>Free-Real API Pack PLUS</p>
        </div>
        <div className="text-right text-zinc-500 text-xs">
          <p>Data sources: FRED, Yahoo Finance, FINRA</p>
        </div>
        <div className="flex items-center justify-end gap-2 text-zinc-500 text-sm">
          <span>Made with Manus</span>
        </div>
        <div className="text-center text-zinc-600 text-xs mt-4">
          <p>Risk29 Pipeline • Automated risk monitoring system</p>
          <p className="mt-1">Last pipeline run: {lastUpdate}</p>
        </div>
      </div>
    </div>
  );
}
