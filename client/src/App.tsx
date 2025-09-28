import { useState, useEffect } from 'react';
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StageDisplay from "@/components/StageDisplay";
import RemoteControl from "@/components/RemoteControl";
import { InstallationState } from "@shared/schema";
import { Monitor, Smartphone, Sparkles } from 'lucide-react';
import NotFound from "@/pages/not-found";

// Home page with installation selector
function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-teal-400" />
            <h1 
              className="text-6xl font-bold text-teal-300"
              style={{ textShadow: '0 0 30px hsl(178, 100%, 33%)' }}
            >
              Gador SNC
            </h1>
            <Sparkles className="w-12 h-12 text-teal-400" />
          </div>
          <h2 className="text-3xl font-semibold text-blue-300 mb-2">
            85th Anniversary
          </h2>
          <p className="text-xl text-blue-200 opacity-80">
            Interactive Motion Design Installation
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <Card className="border-teal-500/30 bg-black/40 backdrop-blur-sm hover-elevate">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Monitor className="w-8 h-8 text-teal-400" />
                <CardTitle className="text-teal-300 text-2xl">Stage Display</CardTitle>
              </div>
              <p className="text-blue-200 text-sm opacity-80">
                Fullscreen projection with neural network background and floating Spanish phrases
              </p>
            </CardHeader>
            <CardContent>
              <Link href="/stage">
                <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700 text-white border-teal-500">
                  Open Stage Display
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="border-blue-500/30 bg-black/40 backdrop-blur-sm hover-elevate">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Smartphone className="w-8 h-8 text-blue-400" />
                <CardTitle className="text-blue-300 text-2xl">Remote Control</CardTitle>
              </div>
              <p className="text-blue-200 text-sm opacity-80">
                Mobile interface for triggering scenes, phrases, and controlling the installation
              </p>
            </CardHeader>
            <CardContent>
              <Link href="/remote">
                <Button size="lg" variant="outline" className="w-full border-blue-400 text-blue-300 hover:border-blue-300">
                  Open Remote Control
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-blue-200/60 text-sm">
            A futuristic audiovisual experience visualizing thoughts and inner voices
          </p>
          <p className="text-blue-200/60 text-xs mt-2">
            Celebrating energy, science, and creativity
          </p>
        </div>
      </div>
    </div>
  );
}

// Stage Display Page (for projector)
function StagePage() {
  const [installationState, setInstallationState] = useState<InstallationState>({
    currentScene: 1,
    activePhrases: [],
    isConnected: true,
    volume: 0.8,
  });

  // todo: remove mock functionality - replace with WebSocket connection
  const handleStateChange = (newState: InstallationState) => {
    setInstallationState(newState);
    console.log('Installation state updated:', newState);
  };

  return (
    <StageDisplay 
      installationState={installationState}
      onStateChange={handleStateChange}
    />
  );
}

// Remote Control Page (for mobile)
function RemotePage() {
  const [installationState, setInstallationState] = useState<InstallationState>({
    currentScene: 1,
    activePhrases: [],
    isConnected: true,
    volume: 0.8,
  });

  // todo: remove mock functionality - replace with WebSocket communication
  const handleSceneChange = (sceneId: number) => {
    setInstallationState(prev => ({ ...prev, currentScene: sceneId }));
    console.log('Scene changed to:', sceneId);
  };

  const handlePhraseTriggered = (phraseText: string, sceneId: number) => {
    console.log('Phrase triggered:', phraseText, 'in scene:', sceneId);
    // In real implementation, this would send WebSocket message to stage
  };

  const handlePhotoTrigger = () => {
    setInstallationState(prev => ({ ...prev, currentScene: 4 })); // Switch to photo booth scene
    console.log('Photo session triggered');
  };

  const handleVolumeChange = (volume: number) => {
    setInstallationState(prev => ({ ...prev, volume }));
    console.log('Volume changed to:', volume);
  };

  return (
    <RemoteControl 
      installationState={installationState}
      onSceneChange={handleSceneChange}
      onPhraseTriggered={handlePhraseTriggered}
      onPhotoTrigger={handlePhotoTrigger}
      onVolumeChange={handleVolumeChange}
    />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/stage" component={StagePage} />
      <Route path="/remote" component={RemotePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Hide cursor on stage display for projector
  useEffect(() => {
    if (location === '/stage') {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'auto';
    }
    
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
