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
import { InstallationState, type RealtimeEvent } from "@shared/schema";
import { Monitor, Smartphone, Sparkles } from 'lucide-react';
import NotFound from "@/pages/not-found";
import { useRealtimeConnection } from "@/hooks/use-realtime-connection";

// Home page - Unified Control + Display
function Home() {
  const [installationState, setInstallationState] = useState<InstallationState>({
    currentScene: 1,
    activePhrases: [],
    isConnected: true,
    volume: 0.8,
  });

  const [phraseTrigger, setPhraseTrigger] = useState<{ phraseText: string; sceneId: number; timestamp: number } | null>(null);
  const [scene1AutoEnabled, setScene1AutoEnabled] = useState(false);

  const handleSceneChange = (sceneId: number) => {
    setInstallationState(prev => ({ ...prev, currentScene: sceneId }));
    // Reset scene1 auto mode when changing scenes
    if (sceneId !== 1) {
      setScene1AutoEnabled(false);
    }
    console.log('Scene changed to:', sceneId);
  };

  const handlePhraseTriggered = (phraseText: string, sceneId: number) => {
    console.log('🎯 Remote triggered phrase:', phraseText, 'in scene:', sceneId);
    setPhraseTrigger({
      phraseText,
      sceneId,
      timestamp: Date.now()
    });
  };

  const handleScene1Complete = () => {
    console.log('🎉 Scene 1 manual phrases complete! Starting auto-trigger mode...');
    setScene1AutoEnabled(true);
  };

  const handleVolumeChange = (volume: number) => {
    setInstallationState(prev => ({ ...prev, volume }));
    console.log('Volume changed to:', volume);
  };

  return (
    <div className="flex h-screen">
      <div className="w-96 flex-shrink-0 overflow-y-auto">
        <RemoteControl 
          installationState={installationState}
          onSceneChange={handleSceneChange}
          onPhraseTriggered={handlePhraseTriggered}
          onVolumeChange={handleVolumeChange}
          onScene1Complete={handleScene1Complete}
        />
      </div>
      <div className="flex-1">
        <StageDisplay 
          installationState={installationState}
          onStateChange={setInstallationState}
          phraseTrigger={phraseTrigger}
          scene1AutoEnabled={scene1AutoEnabled}
        />
      </div>
    </div>
  );
}

// Stage Display Page (for projector)
function StagePage() {
  const [installationState, setInstallationState] = useState<InstallationState>({
    currentScene: 1,
    activePhrases: [],
    isConnected: false,
    volume: 0.8,
  });

  const [phraseTrigger, setPhraseTrigger] = useState<{ phraseText: string; sceneId: number; timestamp: number } | null>(null);
  const [scene1AutoEnabled, setScene1AutoEnabled] = useState(false);

  // WebSocket connection for stage display
  const { isConnected, sendEvent } = useRealtimeConnection({
    role: "stage",
    onMessage: (event: RealtimeEvent) => {
      switch (event.type) {
        case "state_sync":
          // Sync initial state from server
          setInstallationState(prev => ({
            ...prev,
            currentScene: event.state.currentScene,
            volume: event.state.volume,
            isConnected: true,
          }));
          setScene1AutoEnabled(event.state.scene1AutoEnabled);
          break;

        case "scene_change":
          setInstallationState(prev => ({ ...prev, currentScene: event.sceneId }));
          if (event.sceneId !== 1) {
            setScene1AutoEnabled(false);
          }
          break;

        case "phrase_trigger":
          setPhraseTrigger({
            phraseText: event.phraseText,
            sceneId: event.sceneId,
            timestamp: Date.now()
          });
          break;

        case "scene1_complete":
          setScene1AutoEnabled(true);
          break;

        case "volume_change":
          setInstallationState(prev => ({ ...prev, volume: event.volume }));
          break;
      }
    },
  });

  // Update connection status
  useEffect(() => {
    setInstallationState(prev => ({ ...prev, isConnected }));
  }, [isConnected]);

  return (
    <StageDisplay 
      installationState={installationState}
      onStateChange={setInstallationState}
      phraseTrigger={phraseTrigger}
      scene1AutoEnabled={scene1AutoEnabled}
    />
  );
}

// Remote Control Page (for mobile)
function RemotePage() {
  const [installationState, setInstallationState] = useState<InstallationState>({
    currentScene: 1,
    activePhrases: [],
    isConnected: false,
    volume: 0.8,
  });

  // WebSocket connection for remote control
  const { isConnected, sendEvent } = useRealtimeConnection({
    role: "remote",
    onMessage: (event: RealtimeEvent) => {
      switch (event.type) {
        case "state_sync":
          // Sync initial state from server
          setInstallationState(prev => ({
            ...prev,
            currentScene: event.state.currentScene,
            volume: event.state.volume,
            isConnected: true,
          }));
          break;

        case "scene_change":
          setInstallationState(prev => ({ ...prev, currentScene: event.sceneId }));
          break;

        case "volume_change":
          setInstallationState(prev => ({ ...prev, volume: event.volume }));
          break;
      }
    },
  });

  // Update connection status
  useEffect(() => {
    setInstallationState(prev => ({ ...prev, isConnected }));
  }, [isConnected]);

  const handleSceneChange = (sceneId: number) => {
    setInstallationState(prev => ({ ...prev, currentScene: sceneId }));
    sendEvent({ type: "scene_change", sceneId });
  };

  const handlePhraseTriggered = (phraseText: string, sceneId: number) => {
    sendEvent({ type: "phrase_trigger", phraseText, sceneId });
  };

  const handleScene1Complete = () => {
    sendEvent({ type: "scene1_complete" });
  };

  const handleVolumeChange = (volume: number) => {
    setInstallationState(prev => ({ ...prev, volume }));
    sendEvent({ type: "volume_change", volume });
  };

  return (
    <RemoteControl 
      installationState={installationState}
      onSceneChange={handleSceneChange}
      onPhraseTriggered={handlePhraseTriggered}
      onVolumeChange={handleVolumeChange}
      onScene1Complete={handleScene1Complete}
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
  // Hide cursor on stage display for projector
  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname === '/stage') {
        document.body.style.cursor = 'none';
      } else {
        document.body.style.cursor = 'auto';
      }
    };
    
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

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
