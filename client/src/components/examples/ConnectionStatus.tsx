import ConnectionStatus from '../ConnectionStatus';

export default function ConnectionStatusExample() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-teal-300 mb-6 text-center">
          Connection Status Demo
        </h1>
        
        <div className="space-y-4">
          <div className="p-4 border border-gray-600 rounded-lg">
            <h3 className="text-white mb-2">Connected State</h3>
            <ConnectionStatus isConnected={true} latency={45} />
          </div>
          
          <div className="p-4 border border-gray-600 rounded-lg">
            <h3 className="text-white mb-2">Disconnected State</h3>
            <ConnectionStatus isConnected={false} />
          </div>
          
          <div className="p-4 border border-gray-600 rounded-lg">
            <h3 className="text-white mb-2">High Latency</h3>
            <ConnectionStatus isConnected={true} latency={250} />
          </div>
        </div>
      </div>
    </div>
  );
}