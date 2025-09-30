import { useState, useEffect, useRef, useCallback } from 'react';
import FloatingPhrase from './FloatingPhrase';
import FloatingIcon from './FloatingIcon';
import PhotoBooth from './PhotoBooth';
import { InstallationState, PhraseState, SCENES } from '@shared/schema';
import { gsap } from 'gsap';

interface StageDisplayProps {
  installationState: InstallationState;
  onStateChange?: (newState: InstallationState) => void;
}

// Ghost phrases for background - from mental health campaign
const GHOST_PHRASES = [
  "qué hacer",
  "debería cancelar",
  "no puedo concentrarme",
  "tengo que verme",
  "incómodo",
  "por qué",
  "inseguro",
  "capaz no es suficiente",
  "me olvido",
];

export default function StageDisplay({ installationState, onStateChange }: StageDisplayProps) {
  const [phrases, setPhrases] = useState<PhraseState[]>(installationState.activePhrases);
  const [floatingIcons, setFloatingIcons] = useState<Array<{ id: string }>>([]);
  const [showPhotoMode, setShowPhotoMode] = useState(false);
  const ghostContainerRef = useRef<HTMLDivElement>(null);
  
  // Audio system
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback((id: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = 0;
    audio.volume = 0.55;
    audio.play().catch(e => console.log('Audio blocked'));
  }, []);

  useEffect(() => {
    setPhrases(installationState.activePhrases);
    
    // Check if we're in photo mode
    const currentScene = SCENES.find(s => s.id === installationState.currentScene);
    setShowPhotoMode(currentScene?.name === 'Photo Booth');
    
    // Clear phrases on scene change
    setPhrases([]);
    console.log(`🔄 Scene changed to ${installationState.currentScene}, cleared all phrases`);
  }, [installationState]);

  // Background ghost phrases removed per user request

  // Phrase-to-lane mapping
  const getPhraseConfig = (text: string, sceneId: number) => {
    const scenePhraseMappings = {
      1: [
        { text: "¿Y si me olvido de lo que tengo que decir?", lane: 'B' as const, entry: 'draw' as const },
        { text: "Capaz no es suficiente lo que preparé...", lane: 'A' as const, entry: 'focus' as const },
        { text: "¿Desenchufé la planchita de pelo?", lane: 'C' as const, entry: 'flash' as const },
        { text: "¿Cómo hago para subirlos a todos al barco de Sistema Nervioso Central?", lane: 'D' as const, entry: 'mask' as const },
        { text: "¿Por qué no me habré puesto zapatos más cómodos?", lane: 'B' as const, entry: 'focus' as const },
      ],
      3: [
        { text: "Espero que Rocío no me pregunte nada difícil", lane: 'B' as const, entry: 'mask' as const },
        { text: "Necesito ese micrófono… ¿estará en Mercado Libre?", lane: 'C' as const, entry: 'flash' as const },
        { text: "Rocío… ¡te olvidaste de presentarme! Tenemos que anunciar mi nueva posición.", lane: 'A' as const, entry: 'focus' as const },
      ],
      4: [
        { text: "¡Sí! Juntos podemos, ¡vamos con todo!", lane: 'A' as const, entry: 'focus' as const },
        { text: "¿Nos sacamos una foto todos juntos?", lane: 'B' as const, entry: 'flash' as const },
        { text: "¡Lo vamos a lograr!", lane: 'C' as const, entry: 'mask' as const },
        { text: "¡Qué bueno estar acá con todos!", lane: 'D' as const, entry: 'flash' as const },
      ]
    };

    const sceneMapping = scenePhraseMappings[sceneId as keyof typeof scenePhraseMappings];
    if (sceneMapping) {
      const config = sceneMapping.find(p => p.text === text);
      if (config) return config;
    }

    return { lane: 'B' as const, entry: 'focus' as const };
  };

  const triggerPhrase = (phraseText: string, sceneId: number) => {
    // PREVENT DUPLICATES
    const existingPhrase = phrases.find(p => p.text === phraseText && p.isActive);
    if (existingPhrase) {
      console.log(`⚠️ Phrase already active, skipping: "${phraseText}"`);
      return;
    }

    const config = getPhraseConfig(phraseText, sceneId);
    
    const newPhrase: PhraseState & { lane: string; entry: string } = {
      id: `phrase-${Date.now()}-${Math.random()}`,
      text: phraseText,
      layer: 'front',
      opacity: 1,
      position: {
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.38,
        z: 0,
      },
      isActive: true,
      sceneId,
      lane: config.lane,
      entry: config.entry,
    };

    setPhrases(prev => [...prev, newPhrase]);
    console.log(`✅ Triggered phrase: "${phraseText}" | Lane: ${config.lane} | Entry: ${config.entry}`);
    
    // NOTIFICATIONS STAY FOREVER - no auto-cleanup
    
    playAudio(newPhrase.id);
  };

  // SCENE ORCHESTRATION - Simplified for manual control

  // Show ALL notifications - they never leave
  const visiblePhrases = phrases;

  return (
    <div 
      id="stage"
      className="relative w-full h-screen overflow-hidden"
      style={{ 
        background: '#c7c7c7',
        cursor: 'default'
      }}
      data-testid="stage-display"
    >
      
      {/* Notifications scattered - NIGHTMARE MODE */}
      <div 
        id="notifications-stack"
        className="absolute inset-0 pointer-events-none"
        style={{ 
          zIndex: 10,
        }}
        data-testid="notifications-stack"
      >
        {visiblePhrases.map((phrase, index) => (
          <FloatingPhrase 
            key={phrase.id}
            phrase={phrase}
            lane={(phrase as any).lane || 'B'}
            entryStyle={(phrase as any).entry || 'focus'}
            stackIndex={index}
            onAnimationComplete={() => {
              setPhrases(prev => prev.filter(p => p.id !== phrase.id));
            }}
          />
        ))}
      </div>

      {/* Íconos flotantes independientes */}
      <div 
        id="floating-icons"
        className="absolute inset-0 pointer-events-none"
        style={{ 
          zIndex: 5,
        }}
        data-testid="floating-icons"
      >
        {floatingIcons.map((icon) => (
          <FloatingIcon
            key={icon.id}
            id={icon.id}
            onAnimationComplete={() => {
              setFloatingIcons(prev => prev.filter(i => i.id !== icon.id));
            }}
          />
        ))}
      </div>
      
      {showPhotoMode && (
        <PhotoBooth 
          onComplete={() => {
            setShowPhotoMode(false);
          }}
        />
      )}
      
      {/* Audio element */}
      <audio 
        ref={audioRef}
        preload="auto"
        data-testid="phrase-audio"
      >
        <source src="/audio/phrase-sound.mp3" type="audio/mpeg" />
        <source src="/audio/phrase-sound.wav" type="audio/wav" />
      </audio>
      
    </div>
  );
}
