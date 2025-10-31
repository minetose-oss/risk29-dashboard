import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { setupInstallPrompt, showInstallPrompt, isAppInstalled } from "@/lib/pwaUtils";

export default function InstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (isAppInstalled()) {
      return;
    }

    // Check if previously dismissed
    const wasDismissed = localStorage.getItem('install-prompt-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Setup install prompt listener
    setupInstallPrompt((canInstall) => {
      setCanInstall(canInstall);
    });
  }, []);

  const handleInstall = async () => {
    const accepted = await showInstallPrompt();
    if (accepted) {
      setCanInstall(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  if (!canInstall || dismissed || isAppInstalled()) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 bg-card border-border shadow-lg z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">Install Risk29 App</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Install our app for faster access and offline support
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleInstall} className="flex-1">
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
