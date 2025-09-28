import { useState, useEffect } from 'react';
import NeuralBackground from './NeuralBackground';
import FloatingPhrase from './FloatingPhrase';
import PhotoBooth from './PhotoBooth';
import { InstallationState, PhraseState, SCENES } from '@shared/schema';

interface StageDisplayProps {
  installationState: InstallationState;
  onStateChange?: (newState: InstallationState) => void;
}

export default function StageDisplay({ installationState, onStateChange }: StageDisplayProps) {
  const [phrases, setPhrases] = useState<PhraseState[]>(installationState.activePhrases);
  const [showPhotoMode, setShowPhotoMode] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  useEffect(() => {
    setPhrases(installationState.activePhrases);
    
    // Check if we're in photo mode
    const currentScene = SCENES.find(s => s.id === installationState.currentScene);
    setShowPhotoMode(currentScene?.name === 'Photo Booth');
    
    // Activate pulse on scene changes
    setPulseActive(true);
    const timer = setTimeout(() => setPulseActive(false), 900);
    return () => clearTimeout(timer);
  }, [installationState]);

  const triggerPhrase = (phraseText: string, sceneId: number) => {
    const newPhrase: PhraseState = {
      id: `phrase-${Date.now()}-${Math.random()}`,
      text: phraseText,
      layer: 'front',
      opacity: 1,
      position: {
        x: Math.random() * (window.innerWidth - 400) + 200,
        y: Math.random() * (window.innerHeight - 200) + 100,
        z: 0,
      },
      isActive: true,
      sceneId,
    };

    setPhrases(prev => [...prev, newPhrase]);
    
    // Simulate phrase lifecycle
    setTimeout(() => {
      setPhrases(prev => prev.map(p => 
        p.id === newPhrase.id 
          ? { ...p, layer: 'floating', opacity: 0.8, position: { ...p.position, x: p.position.x + 300 } }
          : p
      ));
    }, 3000);

    setTimeout(() => {
      setPhrases(prev => prev.map(p => 
        p.id === newPhrase.id 
          ? { ...p, layer: 'mirror', opacity: 0.35, position: { ...p.position, x: window.innerWidth - 200 } }
          : p
      ));
    }, 8000);

    setTimeout(() => {
      setPhrases(prev => prev.map(p => 
        p.id === newPhrase.id 
          ? { ...p, layer: 'return', opacity: 0.65, position: { ...p.position, x: 100 } }
          : p
      ));
    }, 16000);

    setTimeout(() => {
      setPhrases(prev => prev.filter(p => p.id !== newPhrase.id));
    }, 24000);
  };

  // Demo functionality for testing
  const handleClick = () => {
    const currentScene = SCENES.find(s => s.id === installationState.currentScene);
    if (currentScene && currentScene.phrases.length > 0) {
      const randomPhrase = currentScene.phrases[Math.floor(Math.random() * currentScene.phrases.length)];
      triggerPhrase(randomPhrase, currentScene.id);
      console.log('Phrase triggered:', randomPhrase);
    }
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden cursor-none bg-black"
      onClick={handleClick}
      data-testid="stage-display"
    >
      <NeuralBackground 
        intensity={0.7}
        particleCount={100}
        connectionDistance={200}
        pulseActive={pulseActive}
      />
      
      {phrases.map(phrase => (
        <FloatingPhrase 
          key={phrase.id}
          phrase={phrase}
        />
      ))}
      
      {showPhotoMode && (
        <PhotoBooth 
          onComplete={() => {
            console.log('Photo booth completed');
            setShowPhotoMode(false);
          }}
        />
      )}
      
      {/* Scene indicator */}
      <div className="absolute top-4 left-4 z-50">
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm border border-teal-500/30 rounded-lg">
          <p className="text-teal-300 text-sm font-medium">
            Scene {installationState.currentScene}: {SCENES.find(s => s.id === installationState.currentScene)?.name || 'Unknown'}
          </p>
        </div>
      </div>
      
      {/* Click instruction (demo only) */}
      <div className="absolute bottom-4 right-4 z-50">
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-xs font-medium">
            Click anywhere to trigger phrase
          </p>
        </div>
      </div>
    </div>
  );
}