import { DashboardProfile } from "@/contexts/DashboardProfileContext";

export interface DashboardState {
  profile: DashboardProfile;
  theme: 'light' | 'dark';
  colorScheme: string;
  visibleCategories: string[];
  categoryOrder: string[];
}

export function encodeDashboardState(state: DashboardState): string {
  const compressed = {
    p: state.profile,
    t: state.theme,
    c: state.colorScheme,
    v: state.visibleCategories.join(','),
    o: state.categoryOrder.join(','),
  };
  
  const json = JSON.stringify(compressed);
  const encoded = btoa(json);
  return encoded;
}

export function decodeDashboardState(encoded: string): DashboardState | null {
  try {
    const json = atob(encoded);
    const compressed = JSON.parse(json);
    
    return {
      profile: compressed.p || 'balanced',
      theme: compressed.t || 'dark',
      colorScheme: compressed.c || 'blue',
      visibleCategories: compressed.v ? compressed.v.split(',') : [],
      categoryOrder: compressed.o ? compressed.o.split(',') : [],
    };
  } catch (error) {
    console.error('Failed to decode dashboard state:', error);
    return null;
  }
}

export function generateShareableURL(state: DashboardState): string {
  const encoded = encodeDashboardState(state);
  const baseURL = window.location.origin + window.location.pathname;
  return `${baseURL}?share=${encoded}`;
}

export function getDashboardStateFromURL(): DashboardState | null {
  const params = new URLSearchParams(window.location.search);
  const shareParam = params.get('share');
  
  if (!shareParam) {
    return null;
  }
  
  return decodeDashboardState(shareParam);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    return new Promise((resolve, reject) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        resolve();
      } catch (error) {
        document.body.removeChild(textArea);
        reject(error);
      }
    });
  }
}

export function generateQRCodeDataURL(text: string): string {
  // Simple QR code generation using a public API
  // In production, you might want to use a library like qrcode.react
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;
}

export function shareViaLINE(url: string, message: string = 'Check out my Risk29 Dashboard'): void {
  const lineURL = `https://line.me/R/msg/text/?${encodeURIComponent(message + '\n' + url)}`;
  window.open(lineURL, '_blank');
}

export function shareViaEmail(url: string, subject: string = 'Risk29 Dashboard', body: string = 'Check out my dashboard configuration'): void {
  const mailtoURL = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\n' + url)}`;
  window.location.href = mailtoURL;
}
