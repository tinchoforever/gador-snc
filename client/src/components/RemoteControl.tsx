import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import SceneSelector from './SceneSelector';
import ConnectionStatus from './ConnectionStatus';
import { InstallationState, SCENES } from '@shared/schema';
import { Volume2, VolumeX, Play, Square } from 'lucide-react';

interface RemoteControlProps {
  installationState: InstallationState;
  onSceneChange?: (sceneId: number) => void;
  onPhraseTriggered?: (phraseText: string, sceneId: number) => void;
  onPhotoTrigger?: () => void;
  onVolumeChange?: (volume: number) => void;
  onScene1Complete?: () => void;
}

export default function RemoteControl({
  installationState,
  onSceneChange,
  onPhraseTriggered,
  onPhotoTrigger,
  onVolumeChange,
  onScene1Complete
}: RemoteControlProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [lastTriggerTime, setLastTriggerTime] = useState(0);
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [volume, setVolume] = useState(installationState.volume * 100);
  const [hapticFeedback, setHapticFeedback] = useState(false);
  const [scene1Index, setScene1Index] = useState(0);
  const [scene4Index, setScene4Index] = useState(0);

  // Cooldown management (2 seconds for manual triggers)
  const COOLDOWN_DURATION = 2000;
  
  // Reset sequential indices when scene changes
  useEffect(() => {
    setScene1Index(0);
    setScene4Index(0);
  }, [installationState.currentScene]);
  
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
    
    // Check cooldown
    if (now - lastTriggerTime < COOLDOWN_DURATION) {
      triggerHaptic();
      return;
    }
    
    setSelectedPhrase(phrase);
    setLastTriggerTime(now);
    onPhraseTriggered?.(phrase, installationState.currentScene);
    triggerHaptic();
    console.log('🎤 Phrase triggered from remote:', phrase);
    
    setTimeout(() => setSelectedPhrase(null), 1200);
  };

  const handleScene1Next = () => {
    if (!currentScene || currentScene.phrases.length === 0) return;
    
    const now = Date.now();
    if (now - lastTriggerTime < COOLDOWN_DURATION) {
      triggerHaptic();
      return;
    }
    
    const phrase = currentScene.phrases[scene1Index];
    onPhraseTriggered?.(phrase, 1);
    setLastTriggerTime(now);
    triggerHaptic();
    
    const nextIndex = scene1Index + 1;
    
    // After completing all 5 phrases, trigger auto mode
    if (nextIndex >= currentScene.phrases.length) {
      onScene1Complete?.();
      setScene1Index(0); // Reset to beginning
    } else {
      setScene1Index(nextIndex);
    }
  };

  const handleScene4Next = () => {
    if (!currentScene || currentScene.phrases.length === 0) return;
    
    const now = Date.now();
    if (now - lastTriggerTime < COOLDOWN_DURATION) {
      triggerHaptic();
      return;
    }
    
    const phrase = currentScene.phrases[scene4Index];
    onPhraseTriggered?.(phrase, 4);
    setLastTriggerTime(now);
    triggerHaptic();
    
    setScene4Index((scene4Index + 1) % currentScene.phrases.length);
  };

  const handleScene2Start = () => {
    const now = Date.now();
    if (now - lastTriggerTime < COOLDOWN_DURATION) {
      triggerHaptic();
      return;
    }
    
    triggerHaptic();
    setLastTriggerTime(now);
    onSceneChange?.(3);
    console.log('Scene 2 start button clicked - transitioning to Scene 3');
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
                <Badge variant="outline" className="border-teal-400 text-teal-300">
                  Active
                </Badge>
              </div>
              <p className="text-blue-200 text-sm opacity-80">
                {currentScene.description}
              </p>
              
              {/* Scene-specific status */}
              {cooldownProgress > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-blue-300">Trigger Cooldown</span>
                    <span className="text-xs text-blue-400">{Math.ceil((100 - cooldownProgress) * 0.02)}s</span>
                  </div>
                  <Progress value={cooldownProgress} className="h-1" />
                </div>
              )}
            </CardHeader>
            
            {/* Scene 1: Sequential button */}
            {currentScene.id === 1 && currentScene.phrases.length > 0 && (
              <CardContent className="space-y-3">
                <h4 className="text-white font-medium mb-3">Sequential Phrases ({scene1Index + 1}/{currentScene.phrases.length})</h4>
                <div className="mb-3 p-3 bg-blue-500/10 border border-blue-400/30 rounded-md">
                  <p className="text-sm text-blue-200 italic">"{currentScene.phrases[scene1Index]}"</p>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                  onClick={handleScene1Next}
                  disabled={cooldownProgress > 0}
                  data-testid="button-scene1-next"
                >
                  <Play className="w-5 h-5 mr-3" />
                  Trigger Next Phrase
                </Button>
              </CardContent>
            )}

            {/* Scene 2: Start button */}
            {currentScene.id === 2 && (
              <CardContent className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white border-green-500"
                  onClick={handleScene2Start}
                  disabled={cooldownProgress > 0}
                  data-testid="button-scene2-start"
                >
                  <Play className="w-5 h-5 mr-3" />
                  Start
                </Button>
              </CardContent>
            )}

            {/* Scene 3: Individual buttons */}
            {currentScene.id === 3 && currentScene.phrases.length > 0 && (
              <CardContent className="space-y-3">
                <h4 className="text-white font-medium mb-3">Trigger Individual Phrases:</h4>
                <div className="space-y-2">
                  {currentScene.phrases.map((phrase, index) => {
                    const isSelected = selectedPhrase === phrase;
                    const isOnCooldown = cooldownProgress > 0;
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
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            )}

            {/* Scene 4: Sequential button */}
            {currentScene.id === 4 && currentScene.phrases.length > 0 && (
              <CardContent className="space-y-3">
                <h4 className="text-white font-medium mb-3">Sequential Closing ({scene4Index + 1}/{currentScene.phrases.length})</h4>
                <div className="mb-3 p-3 bg-purple-500/10 border border-purple-400/30 rounded-md">
                  <p className="text-sm text-purple-200 italic">"{currentScene.phrases[scene4Index]}"</p>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                  onClick={handleScene4Next}
                  disabled={cooldownProgress > 0}
                  data-testid="button-scene4-next"
                >
                  <Play className="w-5 h-5 mr-3" />
                  Trigger Next Phrase
                </Button>
              </CardContent>
            )}
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