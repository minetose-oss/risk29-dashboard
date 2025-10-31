import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFReportData {
  overallRiskScore: number;
  lastUpdate: string;
  categories: Array<{
    name: string;
    score: number;
    signals: number;
  }>;
  topHighlights: Array<{
    name: string;
    value: number;
  }>;
  predictions?: {
    sevenDay: number;
    thirtyDay: number;
    trend: string;
  };
}

export async function generatePDFReport(data: PDFReportData): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(33, 150, 243); // Blue
  pdf.text('Risk29 Financial Risk Report', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Generated on ${data.lastUpdate}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;

  // Overall Risk Score Section
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Overall Risk Score', 20, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(48);
  const riskColor = data.overallRiskScore < 40 ? [34, 197, 94] : 
                    data.overallRiskScore < 60 ? [251, 191, 36] :
                    data.overallRiskScore < 75 ? [249, 115, 22] : [239, 68, 68];
  pdf.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  pdf.text(data.overallRiskScore.toString(), pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  pdf.text('/ 100', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;

  // Risk Level Indicator
  checkPageBreak(15);
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  const riskLevel = data.overallRiskScore < 40 ? 'INFO - Low Risk' :
                    data.overallRiskScore < 60 ? 'WATCH - Moderate Risk' :
                    data.overallRiskScore < 75 ? 'WARNING - High Risk' : 'ALERT - Critical Risk';
  pdf.text(`Risk Level: ${riskLevel}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;

  // Top Risk Highlights
  checkPageBreak(40);
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Top Risk Highlights', 20, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(11);
  data.topHighlights.forEach((highlight, idx) => {
    checkPageBreak(8);
    pdf.setTextColor(239, 68, 68);
    pdf.text(`• ${highlight.name}`, 25, yPosition);
    pdf.text(highlight.value.toString(), pageWidth - 25, yPosition, { align: 'right' });
    yPosition += 8;
  });
  
  yPosition += 10;

  // Category Breakdown
  checkPageBreak(50);
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Risk Breakdown by Category', 20, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(10);
  
  data.categories.forEach((category, idx) => {
    checkPageBreak(15);
    
    // Category name and signals
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${category.name} (${category.signals} signals)`, 25, yPosition);
    
    // Score
    const catColor = category.score < 40 ? [34, 197, 94] :
                     category.score < 60 ? [251, 191, 36] :
                     category.score < 75 ? [249, 115, 22] : [239, 68, 68];
    pdf.setTextColor(catColor[0], catColor[1], catColor[2]);
    pdf.setFontSize(12);
    pdf.text(category.score.toString(), pageWidth - 25, yPosition, { align: 'right' });
    
    yPosition += 5;
    
    // Progress bar
    const barWidth = pageWidth - 50;
    const barHeight = 4;
    const fillWidth = (category.score / 100) * barWidth;
    
    // Background
    pdf.setFillColor(240, 240, 240);
    pdf.rect(25, yPosition, barWidth, barHeight, 'F');
    
    // Fill
    pdf.setFillColor(catColor[0], catColor[1], catColor[2]);
    pdf.rect(25, yPosition, fillWidth, barHeight, 'F');
    
    yPosition += 10;
    pdf.setFontSize(10);
  });

  yPosition += 10;

  // Predictions Section (if available)
  if (data.predictions) {
    checkPageBreak(40);
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Risk Predictions', 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(11);
    pdf.text(`7-Day Forecast: ${data.predictions.sevenDay}`, 25, yPosition);
    yPosition += 8;
    pdf.text(`30-Day Forecast: ${data.predictions.thirtyDay}`, 25, yPosition);
    yPosition += 8;
    pdf.text(`Trend: ${data.predictions.trend}`, 25, yPosition);
    yPosition += 15;
  }

  // Footer
  const footerY = pageHeight - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text('Powered by Risk29 Free-Real API Pack PLUS', pageWidth / 2, footerY, { align: 'center' });
  pdf.text('Data sources: FRED, Yahoo Finance, FINRA', pageWidth / 2, footerY + 4, { align: 'center' });
  pdf.text('Made with Manus', pageWidth / 2, footerY + 8, { align: 'center' });

  // Save PDF
  const filename = `Risk29_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}

export async function captureChartAsPDF(chartElement: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(chartElement, {
    backgroundColor: '#09090b',
    scale: 2,
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('l', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20));
  pdf.save(filename);
}

export async function generateFullReport(
  data: PDFReportData,
  chartElement?: HTMLElement
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Generate text report (same as above)
  await generatePDFReport(data);

  // If chart element provided, add it to a new page
  if (chartElement) {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#09090b',
      scale: 2,
    });
    
    const imgData = canvas.toDataURL('image/png');
    pdf.addPage();
    
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20));
    
    const filename = `Risk29_Full_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  }
}
