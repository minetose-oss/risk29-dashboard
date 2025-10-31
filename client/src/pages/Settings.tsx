import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

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
  const [settings, setSettings] = useState<AlertSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
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

        {/* Info Card */}
        <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Alert Threshold Configuration</h2>
          <p className="text-zinc-400 text-sm">
            Configure when to receive LINE notifications for each risk category. 
            Alerts will be sent only when risk scores exceed your configured thresholds.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-zinc-400">Warning: Alert when score exceeds warning threshold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-zinc-400">Critical: Urgent alert when score exceeds critical threshold</span>
            </div>
          </div>
        </Card>

        {/* Settings for each category */}
        <div className="space-y-4">
          {Object.keys(settings).map((category) => {
            const key = category as keyof AlertSettings;
            const config = settings[key];
            
            return (
              <Card key={category} className="bg-zinc-900 border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{categoryLabels[category]}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">
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
                        <span className="text-sm font-mono bg-zinc-800 px-2 py-1 rounded">
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
                        <span className="text-sm font-mono bg-zinc-800 px-2 py-1 rounded">
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
