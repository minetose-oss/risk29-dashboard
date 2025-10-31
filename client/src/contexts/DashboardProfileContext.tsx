import React, { createContext, useContext, useState, useEffect } from "react";

export type DashboardProfile = "conservative" | "balanced" | "aggressive";

interface CategoryWeights {
  liquidity: number;
  valuation: number;
  macro: number;
  credit: number;
  technical: number;
  sentiment: number;
  qualitative: number;
  global: number;
}

interface ProfileConfig {
  name: string;
  description: string;
  weights: CategoryWeights;
  warningThreshold: number;
  criticalThreshold: number;
  color: string;
}

const profileConfigs: Record<DashboardProfile, ProfileConfig> = {
  conservative: {
    name: "Conservative",
    description: "Focus on liquidity and credit risk, low risk tolerance",
    weights: {
      liquidity: 2.0,
      valuation: 0.8,
      macro: 1.2,
      credit: 2.0,
      technical: 0.6,
      sentiment: 0.8,
      qualitative: 1.0,
      global: 1.2,
    },
    warningThreshold: 40,
    criticalThreshold: 60,
    color: "#10b981", // green
  },
  balanced: {
    name: "Balanced",
    description: "Equal weight across all categories, moderate risk tolerance",
    weights: {
      liquidity: 1.0,
      valuation: 1.0,
      macro: 1.0,
      credit: 1.0,
      technical: 1.0,
      sentiment: 1.0,
      qualitative: 1.0,
      global: 1.0,
    },
    warningThreshold: 60,
    criticalThreshold: 75,
    color: "#3b82f6", // blue
  },
  aggressive: {
    name: "Aggressive",
    description: "Focus on valuation and technical signals, high risk tolerance",
    weights: {
      liquidity: 0.6,
      valuation: 2.0,
      macro: 1.0,
      credit: 0.8,
      technical: 2.0,
      sentiment: 1.5,
      qualitative: 0.8,
      global: 1.0,
    },
    warningThreshold: 70,
    criticalThreshold: 85,
    color: "#ef4444", // red
  },
};

interface DashboardProfileContextType {
  profile: DashboardProfile;
  setProfile: (profile: DashboardProfile) => void;
  config: ProfileConfig;
  getWeightedScore: (categoryScores: Record<string, number>) => number;
}

const DashboardProfileContext = createContext<DashboardProfileContextType | undefined>(undefined);

export function DashboardProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<DashboardProfile>(() => {
    const saved = localStorage.getItem('dashboardProfile');
    return (saved as DashboardProfile) || 'balanced';
  });

  useEffect(() => {
    localStorage.setItem('dashboardProfile', profile);
  }, [profile]);

  const config = profileConfigs[profile];

  const getWeightedScore = (categoryScores: Record<string, number>): number => {
    const weights = config.weights;
    let totalWeightedScore = 0;
    let totalWeight = 0;

    Object.entries(categoryScores).forEach(([category, score]) => {
      const weight = weights[category as keyof CategoryWeights] || 1.0;
      totalWeightedScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  };

  return (
    <DashboardProfileContext.Provider value={{ profile, setProfile, config, getWeightedScore }}>
      {children}
    </DashboardProfileContext.Provider>
  );
}

export function useDashboardProfile() {
  const context = useContext(DashboardProfileContext);
  if (!context) {
    throw new Error("useDashboardProfile must be used within DashboardProfileProvider");
  }
  return context;
}
