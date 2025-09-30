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
    isConnected: true,
    volume: 0.8,
  });

  const [phraseTrigger, setPhraseTrigger] = useState<{ phraseText: string; sceneId: number; timestamp: number } | null>(null);
  const [scene1AutoEnabled, setScene1AutoEnabled] = useState(false);

  // Listen for messages from remote control via localStorage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'gador-scene-change' && e.newValue) {
        const sceneId = parseInt(e.newValue);
        setInstallationState(prev => ({ ...prev, currentScene: sceneId }));
        if (sceneId !== 1) {
          setScene1AutoEnabled(false);
        }
      }
      
      if (e.key === 'gador-phrase-trigger' && e.newValue) {
        const data = JSON.parse(e.newValue);
        setPhraseTrigger(data);
      }
      
      if (e.key === 'gador-scene1-complete' && e.newValue === 'true') {
        setScene1AutoEnabled(true);
        localStorage.removeItem('gador-scene1-complete');
      }
      
      if (e.key === 'gador-volume-change' && e.newValue) {
        const volume = parseFloat(e.newValue);
        setInstallationState(prev => ({ ...prev, volume }));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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
    isConnected: true,
    volume: 0.8,
  });

  const handleSceneChange = (sceneId: number) => {
    setInstallationState(prev => ({ ...prev, currentScene: sceneId }));
    localStorage.setItem('gador-scene-change', sceneId.toString());
    console.log('📡 Remote: Scene changed to:', sceneId);
  };

  const handlePhraseTriggered = (phraseText: string, sceneId: number) => {
    const data = {
      phraseText,
      sceneId,
      timestamp: Date.now()
    };
    localStorage.setItem('gador-phrase-trigger', JSON.stringify(data));
    console.log('📡 Remote: Phrase triggered:', phraseText, 'in scene:', sceneId);
  };

  const handleScene1Complete = () => {
    localStorage.setItem('gador-scene1-complete', 'true');
    console.log('📡 Remote: Scene 1 complete! Auto-mode starting...');
  };

  const handleVolumeChange = (volume: number) => {
    setInstallationState(prev => ({ ...prev, volume }));
    localStorage.setItem('gador-volume-change', volume.toString());
    console.log('📡 Remote: Volume changed to:', volume);
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
