import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import SceneSelector from './SceneSelector';
import ConnectionStatus from './ConnectionStatus';
import { InstallationState, SCENES } from '@shared/schema';
import { Volume2, VolumeX, Play, Square, Camera, Zap, Timer, Activity } from 'lucide-react';

interface RemoteControlProps {
  installationState: InstallationState;
  onSceneChange?: (sceneId: number) => void;
  onPhraseTriggered?: (phraseText: string, sceneId: number) => void;
  onPhotoTrigger?: () => void;
  onVolumeChange?: (volume: number) => void;
}

export default function RemoteControl({
  installationState,
  onSceneChange,
  onPhraseTriggered,
  onPhotoTrigger,
  onVolumeChange
}: RemoteControlProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [lastTriggerTime, setLastTriggerTime] = useState(0);
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [volume, setVolume] = useState(installationState.volume * 100);
  const [sceneActivity, setSceneActivity] = useState<Record<number, number>>({});
  const [hapticFeedback, setHapticFeedback] = useState(false);

  // Cooldown management (2 seconds for manual triggers)
  const COOLDOWN_DURATION = 2000;
  
  useEffect(() => {
    if (lastTriggerTime > 0) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - lastTriggerTime;
        const progress = Math.min((elapsed / COOLDOWN_DURATION) * 100, 100);
        setCooldownProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setCooldownProgress(0);
        }
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [lastTriggerTime]);

  // Simulate real-time scene activity indicators
  useEffect(() => {
    const activityInterval = setInterval(() => {
      if (installationState.currentScene === 1) {
        // Scene 1: Show autonomous activity
        setSceneActivity(prev => ({ ...prev, 1: Date.now() }));
      } else if (installationState.currentScene === 3) {
        // Scene 3: Show loop activity  
        setSceneActivity(prev => ({ ...prev, 3: Date.now() }));
      } else if (installationState.currentScene === 5) {
        // Scene 5: Show crescendo activity
        setSceneActivity(prev => ({ ...prev, 5: Date.now() }));
      }
    }, 1000);

    return () => clearInterval(activityInterval);
  }, [installationState.currentScene]);

  // Haptic feedback simulation (for mobile devices)
  const triggerHaptic = () => {
    setHapticFeedback(true);
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]); // Pattern: vibrate, pause, vibrate
    }
    setTimeout(() => setHapticFeedback(false), 200);
  };

  const currentScene = SCENES.find(s => s.id === installationState.currentScene);

  const handlePhraseSelect = (phrase: string) => {
    const now = Date.now();
    
    // Check cooldown for Scene 2 manual triggers
    if (installationState.currentScene === 2 && now - lastTriggerTime < COOLDOWN_DURATION) {
      triggerHaptic(); // Haptic feedback for blocked action
      return;
    }
    
    setSelectedPhrase(phrase);
    setLastTriggerTime(now);
    onPhraseTriggered?.(phrase, installationState.currentScene);
    triggerHaptic(); // Success haptic feedback
    console.log('🎤 Phrase triggered from remote:', phrase);
    
    // Clear selection after a brief moment
    setTimeout(() => setSelectedPhrase(null), 1200);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    const normalizedVolume = vol / 100;
    setIsMuted(vol === 0);
    onVolumeChange?.(normalizedVolume);
    console.log('Volume changed to:', vol + '%');
  };

  const handleVolumeToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const newVol = newMuted ? 0 : 80;
    setVolume(newVol);
    onVolumeChange?.(newVol / 100);
    console.log('Volume toggled:', newMuted ? 'muted' : 'unmuted');
  };

  const handleEmergencyStop = () => {
    onSceneChange?.(1); // Reset to first scene
    console.log('Emergency stop triggered');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4" data-testid="remote-control">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <Card className="border-teal-500/30 bg-black/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-teal-300 text-xl font-bold">
                Gador SNC 85th
              </CardTitle>
              <ConnectionStatus isConnected={installationState.isConnected} />
            </div>
            <p className="text-blue-200 text-sm opacity-80">
              Interactive Installation Control
            </p>
          </CardHeader>
        </Card>

        {/* Scene Selection */}
        <Card className="border-blue-500/30 bg-black/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-300 text-lg">Scenes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SceneSelector
              scenes={SCENES}
              currentSceneId={installationState.currentScene}
              onSceneSelect={onSceneChange}
            />
          </CardContent>
        </Card>

        {/* Current Scene Info with Activity Indicators */}
        {currentScene && (
          <Card className="border-teal-500/30 bg-black/40 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-teal-300 text-lg">{currentScene.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {/* Real-time activity indicator */}
                  {sceneActivity[currentScene.id] && Date.now() - sceneActivity[currentScene.id] < 2000 && (
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-green-400 animate-pulse" />
                      <span className="text-xs text-green-400">LIVE</span>
                    </div>
                  )}
                  <Badge variant="outline" className="border-teal-400 text-teal-300">
                    Active
                  </Badge>
                </div>
              </div>
              <p className="text-blue-200 text-sm opacity-80">
                {currentScene.description}
              </p>
              
              {/* Scene-specific status */}
              {currentScene.id === 1 && (
                <div className="flex items-center gap-2 mt-2">
                  <Timer className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-300">Autonomous mode • 4-8s intervals</span>
                </div>
              )}
              {currentScene.id === 2 && cooldownProgress > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-blue-300">Trigger Cooldown</span>
                    <span className="text-xs text-blue-400">{Math.ceil((100 - cooldownProgress) * 0.02)}s</span>
                  </div>
                  <Progress value={cooldownProgress} className="h-1" />
                </div>
              )}
              {currentScene.id === 3 && (
                <div className="flex items-center gap-2 mt-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-300">Orchestrated loop • 6s cycle</span>
                </div>
              )}
            </CardHeader>
            {currentScene.phrases.length > 0 && (
              <CardContent className="space-y-3">
                <h4 className="text-white font-medium mb-3">Trigger Phrases:</h4>
                <div className="space-y-2">
                  {currentScene.phrases.map((phrase, index) => {
                    const isSelected = selectedPhrase === phrase;
                    const isOnCooldown = currentScene.id === 2 && cooldownProgress > 0;
                    const isDisabled = isOnCooldown && !isSelected;
                    
                    return (
                      <Button
                        key={index}
                        variant={isSelected ? "default" : "outline"}
                        disabled={isDisabled}
                        className={`w-full text-left h-auto py-3 px-4 transition-all duration-200 ${
                          isSelected
                            ? 'bg-teal-600 border-teal-400 text-white shadow-lg shadow-teal-500/20' 
                            : isDisabled
                              ? 'border-gray-600 text-gray-500 opacity-50 cursor-not-allowed'
                              : 'border-blue-400/50 text-blue-200 hover:border-blue-400 hover-elevate'
                        } ${hapticFeedback && isSelected ? 'scale-95' : ''}`}
                        onClick={() => handlePhraseSelect(phrase)}
                        data-testid={`button-phrase-${index}`}
                      >
                        <div className="flex items-center gap-3">
                          <Play className={`w-4 h-4 flex-shrink-0 ${
                            isSelected ? 'text-white' : isDisabled ? 'text-gray-500' : 'text-blue-400'
                          }`} />
                          <span className="text-sm leading-relaxed">{phrase}</span>
                          {isOnCooldown && !isSelected && (
                            <Timer className="w-3 h-3 text-gray-500 ml-auto" />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Photo Booth */}
        {currentScene?.name === 'Photo Booth' && (
          <Card className="border-orange-500/30 bg-black/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Button
                size="lg"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white border-orange-500"
                onClick={onPhotoTrigger}
                data-testid="button-trigger-photo"
              >
                <Camera className="w-5 h-5 mr-3" />
                Start Photo Session
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Volume Controls */}
        <Card className="border-gray-500/30 bg-black/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-300 text-lg">Audio Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Volume Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Volume</label>
                <span className="text-sm text-gray-400">{Math.round(volume)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-gray-400" />
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={5}
                  className="flex-1"
                  data-testid="slider-volume"
                />
                <Volume2 className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className={`flex-1 ${
                  isMuted 
                    ? 'border-red-400 text-red-300 hover:border-red-300' 
                    : 'border-green-400 text-green-300 hover:border-green-300'
                }`}
                onClick={handleVolumeToggle}
                data-testid="button-volume-toggle"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 mr-2" />
                ) : (
                  <Volume2 className="w-5 h-5 mr-2" />
                )}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-red-400 text-red-300 hover:border-red-300 hover-elevate"
                onClick={handleEmergencyStop}
                data-testid="button-emergency-stop"
              >
                <Square className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-blue-200/60 text-xs">
            Interactive Motion Design Installation
          </p>
        </div>
      </div>
    </div>
  );
}