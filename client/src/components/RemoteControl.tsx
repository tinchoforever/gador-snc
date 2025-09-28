import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SceneSelector from './SceneSelector';
import ConnectionStatus from './ConnectionStatus';
import { InstallationState, SCENES } from '@shared/schema';
import { Volume2, VolumeX, Play, Square, Camera } from 'lucide-react';

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

  const currentScene = SCENES.find(s => s.id === installationState.currentScene);

  const handlePhraseSelect = (phrase: string) => {
    setSelectedPhrase(phrase);
    onPhraseTriggered?.(phrase, installationState.currentScene);
    console.log('Phrase triggered from remote:', phrase);
    
    // Clear selection after a brief moment
    setTimeout(() => setSelectedPhrase(null), 1000);
  };

  const handleVolumeToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    onVolumeChange?.(newMuted ? 0 : 0.8);
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

        {/* Current Scene Info */}
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
            </CardHeader>
            {currentScene.phrases.length > 0 && (
              <CardContent className="space-y-3">
                <h4 className="text-white font-medium mb-3">Trigger Phrases:</h4>
                <div className="space-y-2">
                  {currentScene.phrases.map((phrase, index) => (
                    <Button
                      key={index}
                      variant={selectedPhrase === phrase ? "default" : "outline"}
                      className={`w-full text-left h-auto py-3 px-4 ${
                        selectedPhrase === phrase 
                          ? 'bg-teal-600 border-teal-400 text-white' 
                          : 'border-blue-400/50 text-blue-200 hover:border-blue-400'
                      }`}
                      onClick={() => handlePhraseSelect(phrase)}
                      data-testid={`button-phrase-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <Play className={`w-4 h-4 flex-shrink-0 ${
                          selectedPhrase === phrase ? 'text-white' : 'text-blue-400'
                        }`} />
                        <span className="text-sm leading-relaxed">{phrase}</span>
                      </div>
                    </Button>
                  ))}
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

        {/* Controls */}
        <Card className="border-gray-500/30 bg-black/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-300 text-lg">Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                className="flex-1 border-red-400 text-red-300 hover:border-red-300"
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