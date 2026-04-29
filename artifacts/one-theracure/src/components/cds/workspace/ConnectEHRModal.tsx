import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Link, CheckCircle2, Server } from 'lucide-react';

const EHR_SYSTEMS = [
  { id: 'practo', name: 'Practo', region: 'India', logo: '🏥' },
  { id: 'epic', name: 'Epic', region: 'Global', logo: '🔵' },
  { id: 'cerner', name: 'Oracle Cerner', region: 'Global', logo: '🟠' },
  { id: 'athena', name: 'athenahealth', region: 'Global', logo: '🟢' },
  { id: 'ndhm', name: 'ABDM / NDHM', region: 'India', logo: '🇮🇳' },
  { id: 'bahmni', name: 'Bahmni (OpenMRS)', region: 'India / Global', logo: '🌍' },
  { id: 'custom', name: 'Custom FHIR Endpoint', region: 'Any', logo: '⚙️' },
];

const STORAGE_KEY = 'onetheracure_ehr_config';

interface EHRConfig {
  systemId: string;
  systemName: string;
  endpoint: string;
  clientId: string;
  connectedAt: string;
}

interface ConnectEHRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConnectEHRModal = ({ open, onOpenChange }: ConnectEHRModalProps) => {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState('');
  const [clientId, setClientId] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!selectedSystem) return;
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 1500));

    const config: EHRConfig = {
      systemId: selectedSystem,
      systemName: EHR_SYSTEMS.find((s) => s.id === selectedSystem)?.name || selectedSystem,
      endpoint: endpoint || `https://${selectedSystem}.example.com/fhir/r4`,
      clientId: clientId || `otc-${Date.now()}`,
      connectedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

    setConnecting(false);
    setConnected(true);
    toast({ title: 'EHR Connected', description: `Connected to ${config.systemName}` });
  };

  const handleClose = () => {
    setSelectedSystem(null);
    setEndpoint('');
    setClientId('');
    setConnected(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-playfair">
            <Link className="h-5 w-5 text-primary" />
            Connect EHR System
          </DialogTitle>
          <DialogDescription>
            Link your EHR to import patient data and sync clinical documents.
          </DialogDescription>
        </DialogHeader>

        {connected ? (
          <div className="flex flex-col items-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-base font-semibold text-foreground">Connected Successfully</p>
            <p className="text-sm text-muted-foreground">
              {EHR_SYSTEMS.find((s) => s.id === selectedSystem)?.name} is now linked.
            </p>
            <Badge variant="outline" className="text-sm px-3 py-1 border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              FHIR R4 Endpoint Active
            </Badge>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Select EHR System</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {EHR_SYSTEMS.map((sys) => (
                  <button
                    key={sys.id}
                    onClick={() => setSelectedSystem(sys.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                      selectedSystem === sys.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-border hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-xl">{sys.logo}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{sys.name}</p>
                      <p className="text-xs text-muted-foreground">{sys.region}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedSystem && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="space-y-1">
                  <Label className="text-sm">FHIR Endpoint URL</Label>
                  <Input
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder={`https://${selectedSystem}.example.com/fhir/r4`}
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Client ID (optional)</Label>
                  <Input
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="OAuth2 client ID"
                    className="text-sm h-9"
                  />
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                  <Server className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    This is a mock connection for demonstration. In production, OAuth2/SMART-on-FHIR authentication will be required.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            {connected ? 'Done' : 'Cancel'}
          </Button>
          {!connected && (
            <Button
              onClick={handleConnect}
              disabled={!selectedSystem || connecting}
              className="gap-1.5"
            >
              {connecting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4" />
                  Connect
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectEHRModal;
