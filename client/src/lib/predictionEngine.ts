// Prediction Engine for Risk29 Dashboard
// Uses simple linear regression and moving averages for trend prediction

export interface PredictionResult {
  date: string;
  predicted: number;
  lower: number; // Lower confidence bound
  upper: number; // Upper confidence bound
  confidence: number; // 0-100
}

export interface AnomalyDetection {
  date: string;
  value: number;
  expected: number;
  deviation: number;
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high';
}

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable';
  momentum: number; // -100 to 100
  strength: number; // 0-100
  prediction7day: number;
  prediction30day: number;
}

/**
 * Simple linear regression for trend prediction
 */
function linearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Calculate standard deviation
 */
function standardDeviation(data: number[]): number {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}

/**
 * Predict future values using linear regression
 */
export function predictFuture(historicalData: number[], daysAhead: number): PredictionResult[] {
  const { slope, intercept } = linearRegression(historicalData);
  const stdDev = standardDeviation(historicalData);
  const n = historicalData.length;
  
  const predictions: PredictionResult[] = [];
  
  for (let i = 1; i <= daysAhead; i++) {
    const x = n + i - 1;
    const predicted = slope * x + intercept;
    
    // Confidence decreases with distance
    const confidence = Math.max(50, 95 - (i * 1.5));
    
    // Confidence interval (±2 std dev for ~95% confidence)
    const margin = stdDev * 2 * (i / daysAhead);
    const lower = Math.max(0, predicted - margin);
    const upper = Math.min(100, predicted + margin);
    
    const today = new Date();
    today.setDate(today.getDate() + i);
    
    predictions.push({
      date: today.toISOString().split('T')[0],
      predicted: Math.round(predicted * 10) / 10,
      lower: Math.round(lower * 10) / 10,
      upper: Math.round(upper * 10) / 10,
      confidence: Math.round(confidence),
    });
  }
  
  return predictions;
}

/**
 * Analyze trend direction and momentum
 */
export function analyzeTrend(historicalData: number[]): TrendAnalysis {
  const { slope } = linearRegression(historicalData);
  const n = historicalData.length;
  
  // Calculate momentum (rate of change)
  const recentData = historicalData.slice(-7);
  const olderData = historicalData.slice(-14, -7);
  const recentAvg = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
  const olderAvg = olderData.reduce((sum, val) => sum + val, 0) / olderData.length;
  const momentum = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  // Determine direction
  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (slope > 0.5) direction = 'up';
  else if (slope < -0.5) direction = 'down';
  
  // Calculate trend strength (0-100)
  const strength = Math.min(100, Math.abs(slope) * 10);
  
  // Predict 7 and 30 days ahead
  const prediction7 = predictFuture(historicalData, 7);
  const prediction30 = predictFuture(historicalData, 30);
  
  return {
    direction,
    momentum: Math.round(momentum * 10) / 10,
    strength: Math.round(strength),
    prediction7day: prediction7[prediction7.length - 1].predicted,
    prediction30day: prediction30[prediction30.length - 1].predicted,
  };
}

/**
 * Detect anomalies using z-score method
 */
export function detectAnomalies(historicalData: number[], threshold: number = 2.5): AnomalyDetection[] {
  const mean = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length;
  const stdDev = standardDeviation(historicalData);
  
  const anomalies: AnomalyDetection[] = [];
  
  historicalData.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    const isAnomaly = zScore > threshold;
    
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (zScore > 3.5) severity = 'high';
    else if (zScore > 3) severity = 'medium';
    
    if (isAnomaly) {
      const date = new Date();
      date.setDate(date.getDate() - (historicalData.length - index));
      
      anomalies.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 10) / 10,
        expected: Math.round(mean * 10) / 10,
        deviation: Math.round(zScore * 10) / 10,
        isAnomaly: true,
        severity,
      });
    }
  });
  
  return anomalies;
}

/**
 * Generate prediction summary
 */
export function generatePredictionSummary(historicalData: number[]) {
  const trend = analyzeTrend(historicalData);
  const predictions7 = predictFuture(historicalData, 7);
  const predictions30 = predictFuture(historicalData, 30);
  const anomalies = detectAnomalies(historicalData);
  
  const current = historicalData[historicalData.length - 1];
  const change7 = predictions7[predictions7.length - 1].predicted - current;
  const change30 = predictions30[predictions30.length - 1].predicted - current;
  
  return {
    current: Math.round(current * 10) / 10,
    trend,
    predictions7,
    predictions30,
    anomalies,
    change7day: Math.round(change7 * 10) / 10,
    change30day: Math.round(change30 * 10) / 10,
    changePercent7day: Math.round((change7 / current) * 100 * 10) / 10,
    changePercent30day: Math.round((change30 / current) * 100 * 10) / 10,
  };
}
