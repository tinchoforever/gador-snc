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

  // Phrase-to-lane mapping as specified in animation document
  const getPhraseConfig = (text: string, sceneId: number) => {
    const scenePhraseMappings = {
      1: [ // Scene 1 - Chaotic Thoughts
        { text: "¿Y si me olvido de lo que tengo que decir?", lane: 'B' as const, entry: 'draw' as const },
        { text: "Capaz no es suficiente lo que preparé...", lane: 'A' as const, entry: 'focus' as const },
        { text: "¿Desenchufé la planchita de pelo?", lane: 'C' as const, entry: 'flash' as const },
        { text: "¿Cómo hago para subirlos a todos al barco de Sistema Nervioso Central?", lane: 'D' as const, entry: 'mask' as const },
        { text: "¿Por qué no me habré puesto zapatos más cómodos?", lane: 'B' as const, entry: 'focus' as const },
        { text: "¿Los chicos estarán haciendo la tarea o viendo youtube?", lane: 'A' as const, entry: 'draw' as const },
      ],
      2: [ // Scene 2 - Magic Microphone  
        { text: "Espero que Rocío no me pregunte nada difícil", lane: 'B' as const, entry: 'mask' as const },
        { text: "Necesito ese micrófono… ¿estará en Mercado Libre?", lane: 'C' as const, entry: 'flash' as const },
        { text: "Rocío… ¡te olvidaste de presentarme! Tenemos que anunciar mi nueva posición.", lane: 'A' as const, entry: 'focus' as const },
      ],
      3: [ // Scene 3 - Collective Energy
        { text: "¡Lo vamos a lograr!", lane: 'B' as const, entry: 'flash' as const },
        { text: "¡Sí, juntos podemos!", lane: 'A' as const, entry: 'focus' as const },
        { text: "¡Qué bueno estar acá con todos!", lane: 'C' as const, entry: 'mask' as const },
        { text: "¡Vamos con todo!", lane: 'D' as const, entry: 'flash' as const },
      ]
    };

    const sceneMapping = scenePhraseMappings[sceneId as keyof typeof scenePhraseMappings];
    if (sceneMapping) {
      const config = sceneMapping.find(p => p.text === text);
      if (config) return config;
    }

    // Default fallback
    return { lane: 'B' as const, entry: 'focus' as const };
  };

  const triggerPhrase = (phraseText: string, sceneId: number) => {
    const config = getPhraseConfig(phraseText, sceneId);
    
    const newPhrase: PhraseState & { lane: string; entry: string } = {
      id: `phrase-${Date.now()}-${Math.random()}`,
      text: phraseText,
      layer: 'front',
      opacity: 1,
      position: {
        x: window.innerWidth / 2, // Start center, GSAP will handle positioning
        y: window.innerHeight * 0.38, // Default to lane B
        z: 0,
      },
      isActive: true,
      sceneId,
      lane: config.lane,
      entry: config.entry,
    };

    setPhrases(prev => [...prev, newPhrase]);
    console.log(`Triggered phrase: "${phraseText}" | Lane: ${config.lane} | Entry: ${config.entry}`);
    
    // Remove phrase after full cycle (about 35 seconds)
    setTimeout(() => {
      setPhrases(prev => prev.filter(p => p.id !== newPhrase.id));
    }, 35000);
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
          lane={(phrase as any).lane || 'B'}
          entryStyle={(phrase as any).entry || 'focus'}
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