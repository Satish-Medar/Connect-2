import { useState } from 'react';
import { usePWA } from '@/hooks/use-pwa';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await installApp();
    if (!installed) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <Card className="bg-gradient-to-r from-primary to-secondary text-white border-0 mb-6" data-testid="pwa-install-prompt">
      <CardContent className="p-4 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-white hover:bg-white/20"
          onClick={handleDismiss}
          data-testid="button-dismiss-install"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Smartphone className="h-8 w-8" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Install CivicConnect</h3>
            <p className="text-sm opacity-90 mb-3">
              Get the full app experience! Install CivicConnect for faster access, 
              offline reporting, and push notifications.
            </p>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleInstall}
                className="bg-white/20 hover:bg-white/30 border border-white/30 text-white"
                size="sm"
                data-testid="button-install-app"
              >
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
