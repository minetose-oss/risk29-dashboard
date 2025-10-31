/**
 * Utility functions for exporting data in various formats
 */

export interface RiskDataPoint {
  date: string;
  overall: number;
  liquidity: number;
  valuation: number;
  credit: number;
  macro: number;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: RiskDataPoint[], filename: string = 'risk29_data.csv') {
  // Create CSV header
  const headers = ['Date', 'Overall Risk', 'Liquidity', 'Valuation', 'Credit', 'Macro'];
  
  // Create CSV rows
  const rows = data.map(point => [
    point.date,
    point.overall.toFixed(2),
    point.liquidity.toFixed(2),
    point.valuation.toFixed(2),
    point.credit.toFixed(2),
    point.macro.toFixed(2),
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export chart as PNG image using html2canvas
 */
export async function exportChartAsPNG(chartElement: HTMLElement, filename: string = 'risk29_chart.png') {
  try {
    // Dynamically import html2canvas
    const html2canvas = (await import('html2canvas')).default;
    
    // Capture the chart element
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#09090b', // zinc-950
      scale: 2, // Higher quality
      logging: false,
    });
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error('Failed to export chart:', error);
    throw error;
  }
}

/**
 * Generate mock historical data for testing
 */
export function generateHistoricalData(days = 30): RiskDataPoint[] {
  const data: RiskDataPoint[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      overall: 20 + Math.random() * 30,
      liquidity: 40 + Math.random() * 20,
      valuation: 35 + Math.random() * 25,
      credit: 10 + Math.random() * 15,
      macro: 15 + Math.random() * 20,
    });
  }
  
  return data;
}

/**
 * Calculate percentage change between two values
 */
export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}
