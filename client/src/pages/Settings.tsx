import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save, Settings as SettingsIcon, Bell, Download, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useColorScheme, ColorScheme } from "@/contexts/ColorSchemeContext";

interface ThresholdConfig {
  enabled: boolean;
  warning: number;
  critical: number;
}

interface AlertSettings {
  overall: ThresholdConfig;
  liquidity: ThresholdConfig;
  valuation: ThresholdConfig;
  macro: ThresholdConfig;
  credit: ThresholdConfig;
  technical: ThresholdConfig;
  sentiment: ThresholdConfig;
  qualitative: ThresholdConfig;
  global: ThresholdConfig;
}

const defaultSettings: AlertSettings = {
  overall: { enabled: true, warning: 60, critical: 75 },
  liquidity: { enabled: true, warning: 60, critical: 75 },
  valuation: { enabled: true, warning: 60, critical: 75 },
  macro: { enabled: true, warning: 60, critical: 75 },
  credit: { enabled: true, warning: 60, critical: 75 },
  technical: { enabled: true, warning: 60, critical: 75 },
  sentiment: { enabled: true, warning: 60, critical: 75 },
  qualitative: { enabled: true, warning: 60, critical: 75 },
  global: { enabled: true, warning: 60, critical: 75 },
};

const categoryLabels: Record<string, string> = {
  overall: "Overall Risk",
  liquidity: "Liquidity",
  valuation: "Valuation",
  macro: "Macro",
  credit: "Credit",
  technical: "Technical",
  sentiment: "Sentiment",
  qualitative: "Qualitative",
  global: "Global",
};

export default function Settings() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [settings, setSettings] = useState<AlertSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dailyReport, setDailyReport] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("alertSettings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }
    
    // Load notification settings
    const notifSettings = localStorage.getItem("risk29_settings");
    if (notifSettings) {
      const parsed = JSON.parse(notifSettings);
      setNotifications(parsed.notifications ?? true);
      setDailyReport(parsed.dailyReport ?? false);
      setWeeklyReport(parsed.weeklyReport ?? false);
    }
    
    setLoading(false);
  }, []);

  const handleToggle = (category: keyof AlertSettings) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        enabled: !prev[category].enabled,
      },
    }));
  };

  const handleWarningChange = (category: keyof AlertSettings, value: number[]) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        warning: value[0],
      },
    }));
  };

  const handleCriticalChange = (category: keyof AlertSettings, value: number[]) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        critical: value[0],
      },
    }));
  };

  const handleSave = () => {
    try {
      // Save to localStorage
      localStorage.setItem("alertSettings", JSON.stringify(settings));
      
      // Create downloadable JSON for manual sync
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'alert_settings.json';
      
      toast.success("Settings saved! Download the JSON file and place it in /home/ubuntu/risk29_pipeline/data/");
      
      // Trigger download
      setTimeout(() => {
        link.click();
        URL.revokeObjectURL(url);
      }, 500);
    } catch (e) {
      toast.error("Failed to save settings");
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Alert Settings</h1>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>

        {/* Notifications */}
        <Card className="bg-card border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Smart Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Enable Notifications</div>
                <div className="text-sm text-muted-foreground">Receive risk alerts and updates</div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={(checked) => {
                  setNotifications(checked);
                  const settings = { notifications: checked, dailyReport, weeklyReport };
                  localStorage.setItem("risk29_settings", JSON.stringify(settings));
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Daily Report</div>
                <div className="text-sm text-muted-foreground">Get daily risk summary every morning at 8 AM</div>
              </div>
              <Switch
                checked={dailyReport}
                onCheckedChange={(checked) => {
                  setDailyReport(checked);
                  const settings = { notifications, dailyReport: checked, weeklyReport };
                  localStorage.setItem("risk29_settings", JSON.stringify(settings));
                  if (checked) toast.success("Daily report enabled - you'll receive updates at 8 AM");
                }}
                disabled={!notifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Weekly Report</div>
                <div className="text-sm text-muted-foreground">Get weekly risk analysis every Monday at 9 AM</div>
              </div>
              <Switch
                checked={weeklyReport}
                onCheckedChange={(checked) => {
                  setWeeklyReport(checked);
                  const settings = { notifications, dailyReport, weeklyReport: checked };
                  localStorage.setItem("risk29_settings", JSON.stringify(settings));
                  if (checked) toast.success("Weekly report enabled - you'll receive updates every Monday");
                }}
                disabled={!notifications}
              />
            </div>
          </div>
        </Card>

        {/* Color Scheme Selector */}
        <Card className="bg-card border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Color Scheme</h2>
          <div className="grid grid-cols-4 gap-4">
            {(['blue', 'green', 'purple', 'red'] as ColorScheme[]).map(scheme => (
              <button
                key={scheme}
                onClick={() => setColorScheme(scheme)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  colorScheme === scheme
                    ? 'border-foreground bg-secondary'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-full"
                    style={{
                      backgroundColor:
                        scheme === 'blue' ? '#3b82f6' :
                        scheme === 'green' ? '#10b981' :
                        scheme === 'purple' ? '#a855f7' :
                        '#ef4444'
                    }}
                  />
                  <span className="text-sm capitalize">{scheme}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="bg-card border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Alert Threshold Configuration</h2>
          <p className="text-muted-foreground text-sm">
            Configure when to receive LINE notifications for each risk category. 
            Alerts will be sent only when risk scores exceed your configured thresholds.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-muted-foreground">Warning: Alert when score exceeds warning threshold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-muted-foreground">Critical: Urgent alert when score exceeds critical threshold</span>
            </div>
          </div>
        </Card>

        {/* Settings for each category */}
        <div className="space-y-4">
          {Object.keys(settings).map((category) => {
            const key = category as keyof AlertSettings;
            const config = settings[key];
            
            return (
              <Card key={category} className="bg-card border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{categoryLabels[category]}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {config.enabled ? "Enabled" : "Disabled"}
                    </span>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={() => handleToggle(key)}
                    />
                  </div>
                </div>

                {config.enabled && (
                  <div className="space-y-6">
                    {/* Warning Threshold */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-yellow-500">
                          Warning Threshold
                        </label>
                        <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                          {config.warning}
                        </span>
                      </div>
                      <Slider
                        value={[config.warning]}
                        onValueChange={(value) => handleWarningChange(key, value)}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Critical Threshold */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-red-500">
                          Critical Threshold
                        </label>
                        <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                          {config.critical}
                        </span>
                      </div>
                      <Slider
                        value={[config.critical]}
                        onValueChange={(value) => handleCriticalChange(key, value)}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Data Management */}
        <Card className="bg-card border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Data Management</h2>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const data = {
                  portfolio: localStorage.getItem("risk29_portfolio"),
                  alerts: localStorage.getItem("risk29_alerts"),
                  settings: localStorage.getItem("risk29_settings"),
                  alertSettings: localStorage.getItem("alertSettings"),
                  customization: localStorage.getItem("risk29_customization"),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `risk29_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Data exported successfully");
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Data
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "application/json";
                input.onchange = (e: any) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event: any) => {
                      try {
                        const data = JSON.parse(event.target.result);
                        if (data.portfolio) localStorage.setItem("risk29_portfolio", data.portfolio);
                        if (data.alerts) localStorage.setItem("risk29_alerts", data.alerts);
                        if (data.settings) localStorage.setItem("risk29_settings", data.settings);
                        if (data.alertSettings) localStorage.setItem("alertSettings", data.alertSettings);
                        if (data.customization) localStorage.setItem("risk29_customization", data.customization);
                        toast.success("Data imported successfully - refreshing page...");
                        setTimeout(() => window.location.reload(), 1000);
                      } catch (error) {
                        toast.error("Failed to import data - invalid file format");
                      }
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-red-500 hover:text-red-400 border-red-500/20 hover:border-red-500/40"
              onClick={() => {
                if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                  localStorage.removeItem("risk29_portfolio");
                  localStorage.removeItem("risk29_alerts");
                  localStorage.removeItem("risk29_settings");
                  localStorage.removeItem("alertSettings");
                  localStorage.removeItem("risk29_customization");
                  toast.success("All data cleared - refreshing page...");
                  setTimeout(() => window.location.reload(), 1000);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </Card>

        {/* Save Button (Bottom) */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} size="lg" className="gap-2">
            <Save className="w-4 h-4" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
