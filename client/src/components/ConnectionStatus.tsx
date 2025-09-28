import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  latency?: number;
}

export default function ConnectionStatus({ isConnected, latency }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2" data-testid="connection-status">
      <Badge 
        variant="outline"
        className={`flex items-center gap-1.5 px-2 py-1 ${
          isConnected 
            ? 'border-green-400 text-green-300 bg-green-900/20' 
            : 'border-red-400 text-red-300 bg-red-900/20'
        }`}
      >
        {isConnected ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        <span className="text-xs font-medium">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {isConnected && latency && (
          <span className="text-xs opacity-75">
            {latency}ms
          </span>
        )}
      </Badge>
    </div>
  );
}