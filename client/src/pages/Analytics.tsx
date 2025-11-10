import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp, Activity, BarChart3 } from "lucide-react";

interface HeatmapDay {
  date: string;
  score: number;
}

export default function Analytics() {
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);

  useEffect(() => {
    // Generate mock heatmap data for last 90 days
    const data: HeatmapDay[] = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        score: Math.floor(Math.random() * 100),
      });
    }
    
    setHeatmapData(data);
  }, []);

  const getHeatmapColor = (score: number) => {
    if (score >= 75) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getHeatmapOpacity = (score: number) => {
    if (score >= 80) return 'opacity-100';
    if (score >= 60) return 'opacity-75';
    if (score >= 40) return 'opacity-50';
    if (score >= 20) return 'opacity-30';
    return 'opacity-20';
  };

  // Group by weeks
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];
  
  heatmapData.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === heatmapData.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Advanced Analytics</h1>

        {/* Risk Heatmap Calendar */}
        <Card className="p-6 bg-card border-border mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold">Risk Heatmap Calendar (Last 90 Days)</h2>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-flex flex-col gap-1 min-w-full">
              {/* Day labels */}
              <div className="flex gap-1 mb-2">
                <div className="w-8"></div>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex gap-1">
                    {week.map((day, dayIndex) => {
                      const date = new Date(day.date);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      return dayIndex === 0 ? (
                        <div key={day.date} className="w-3 text-[8px] text-muted-foreground text-center">
                          {date.getDate()}
                        </div>
                      ) : (
                        <div key={day.date} className="w-3"></div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, dayOfWeek) => (
                <div key={dayName} className="flex gap-1 items-center">
                  <div className="w-8 text-[10px] text-muted-foreground">{dayName}</div>
                  {weeks.map((week, weekIndex) => {
                    const day = week[dayOfWeek];
                    if (!day) return <div key={`empty-${weekIndex}-${dayOfWeek}`} className="w-3 h-3"></div>;
                    
                    return (
                      <div
                        key={day.date}
                        className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.score)} ${getHeatmapOpacity(day.score)} hover:ring-2 hover:ring-white cursor-pointer transition-all`}
                        title={`${day.date}: Risk Score ${day.score}`}
                      ></div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-green-500 opacity-20 rounded-sm"></div>
              <div className="w-4 h-4 bg-blue-500 opacity-30 rounded-sm"></div>
              <div className="w-4 h-4 bg-yellow-500 opacity-50 rounded-sm"></div>
              <div className="w-4 h-4 bg-orange-500 opacity-75 rounded-sm"></div>
              <div className="w-4 h-4 bg-red-500 opacity-100 rounded-sm"></div>
            </div>
            <span className="text-muted-foreground">More</span>
          </div>
        </Card>

        {/* Sector Rotation Analysis */}
        <Card className="p-6 bg-card border-border mb-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold">Sector Rotation Analysis</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { sector: "Liquidity", trend: "Improving", change: "+15%", color: "text-green-500" },
              { sector: "Valuation", trend: "Deteriorating", change: "-8%", color: "text-red-500" },
              { sector: "Macro", trend: "Stable", change: "+2%", color: "text-blue-500" },
              { sector: "Credit", trend: "Improving", change: "+12%", color: "text-green-500" },
              { sector: "Technical", trend: "Stable", change: "-1%", color: "text-blue-500" },
              { sector: "Sentiment", trend: "Improving", change: "+18%", color: "text-green-500" },
            ].map((item) => (
              <div key={item.sector} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <div className="font-medium">{item.sector}</div>
                  <div className="text-sm text-muted-foreground">{item.trend}</div>
                </div>
                <div className={`text-xl font-bold ${item.color}`}>{item.change}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Volatility Clustering */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold">Volatility Clustering Detection</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-red-500">High Volatility Cluster Detected</div>
                <div className="text-sm text-muted-foreground">Oct 25-29, 2025</div>
              </div>
              <div className="text-sm text-foreground">
                Risk scores fluctuated by 25+ points over 5 days, indicating market uncertainty.
                Consider reducing portfolio exposure during this period.
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-yellow-500">Moderate Volatility Cluster</div>
                <div className="text-sm text-muted-foreground">Oct 15-18, 2025</div>
              </div>
              <div className="text-sm text-foreground">
                Risk scores showed 15-point swings. Monitor closely for potential trend changes.
              </div>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-green-500">Low Volatility Period</div>
                <div className="text-sm text-muted-foreground">Oct 1-10, 2025</div>
              </div>
              <div className="text-sm text-foreground">
                Risk scores remained stable with minimal fluctuations. Good environment for portfolio rebalancing.
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics Summary */}
        <div className="grid md:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Avg Risk Score", value: "42", icon: BarChart3 },
            { label: "Max Risk Score", value: "87", icon: TrendingUp },
            { label: "Min Risk Score", value: "12", icon: TrendingUp },
            { label: "Volatility Index", value: "18.5", icon: Activity },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-blue-500" />
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
