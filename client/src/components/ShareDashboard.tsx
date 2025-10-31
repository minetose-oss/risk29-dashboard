import { useState } from "react";
import { Share2, Copy, Mail, QrCode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  generateShareableURL,
  copyToClipboard,
  generateQRCodeDataURL,
  shareViaLINE,
  shareViaEmail,
  DashboardState,
} from "@/lib/dashboardSharing";

interface ShareDashboardProps {
  dashboardState: DashboardState;
}

export default function ShareDashboard({ dashboardState }: ShareDashboardProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareableURL = generateShareableURL(dashboardState);
  const qrCodeURL = generateQRCodeDataURL(shareableURL);

  const handleCopy = async () => {
    try {
      await copyToClipboard(shareableURL);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShareLINE = () => {
    shareViaLINE(shareableURL, 'Check out my Risk29 Dashboard configuration!');
  };

  const handleShareEmail = () => {
    shareViaEmail(
      shareableURL,
      'Risk29 Dashboard Configuration',
      'I wanted to share my Risk29 Dashboard configuration with you. Click the link below to view it:'
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Dashboard</DialogTitle>
          <DialogDescription>
            Share your dashboard configuration with others. They'll see your profile, theme, and customization settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Shareable URL */}
          <div className="flex items-center gap-2">
            <Input
              value={shareableURL}
              readOnly
              className="flex-1"
            />
            <Button onClick={handleCopy} size="icon" variant="outline">
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleShareLINE} variant="outline" className="w-full">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              LINE
            </Button>
            
            <Button onClick={handleShareEmail} variant="outline" className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <Button
              onClick={() => setShowQR(!showQR)}
              variant="outline"
              className="w-full"
            >
              <QrCode className="h-4 w-4 mr-2" />
              {showQR ? 'Hide' : 'Show'} QR Code
            </Button>
            
            {showQR && (
              <div className="mt-4 p-4 bg-white rounded-lg inline-block">
                <img
                  src={qrCodeURL}
                  alt="QR Code"
                  className="w-48 h-48"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Scan to view dashboard
                </p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground">
            <p className="mb-1">This link includes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Dashboard profile ({dashboardState.profile})</li>
              <li>Theme preference ({dashboardState.theme})</li>
              <li>Color scheme ({dashboardState.colorScheme})</li>
              <li>Visible categories</li>
              <li>Category order</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
