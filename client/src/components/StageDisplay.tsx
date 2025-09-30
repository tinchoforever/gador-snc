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
        { text: "Los chicos estarán haciendo la tarea o viendo YouTube?", lane: 'A' as const, entry: 'draw' as const },
        { text: "Hoy la misión es clara: motivar, inspirar y sumar confianza.", lane: 'C' as const, entry: 'focus' as const },
        { text: "¿Traje el cargador del celu? ¿Necesitaré adaptador?", lane: 'D' as const, entry: 'flash' as const },
        { text: "Respirá profundo: convención, allá vamos.", lane: 'A' as const, entry: 'mask' as const },
        { text: "Último repaso mental: todo bajo control.", lane: 'B' as const, entry: 'draw' as const },
        { text: "Ojalá que la energía positiva sea contagiosa.", lane: 'C' as const, entry: 'focus' as const },
        { text: "¿Estará mi perfume en el freeshop?", lane: 'D' as const, entry: 'flash' as const },
        { text: "Tengo que comprar garotos para todos en la oficina.", lane: 'A' as const, entry: 'mask' as const },
        { text: "Preparada, enfocada y con toda la energía lista.", lane: 'B' as const, entry: 'draw' as const },
      ],
      2: [
        { text: "Espero que Rocío no me pregunte nada difícil", lane: 'B' as const, entry: 'mask' as const },
        { text: "Necesito ese micrófono… ¿estará en Mercado Libre?", lane: 'C' as const, entry: 'flash' as const },
        { text: "Rocío… ¡te olvidaste de presentarme! Tenemos que anunciar mi nueva posición.", lane: 'A' as const, entry: 'focus' as const },
      ],
      3: [
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

  // SCENE ORCHESTRATION
  const [sceneState, setSceneState] = useState({
    lastTrigger: 0,
    scene1Cooldown: 0,
    scene3LoopIndex: 0,
    scene5CrescendoActive: false,
    autonomousIntervals: new Map<number, number>()
  });

  // Scene 1: Autonomous cadence - MÁS RÁPIDO Y DINÁMICO
  useEffect(() => {
    if (installationState.currentScene === 1) {
      const scene1Interval = setInterval(() => {
        const now = Date.now();
        if (now - sceneState.scene1Cooldown > 2000) { // Reducido de 4000 a 2000
          const currentScene = SCENES.find(s => s.id === 1);
          if (currentScene) {
            const randomPhrase = currentScene.phrases[Math.floor(Math.random() * currentScene.phrases.length)];
            triggerPhrase(randomPhrase, 1);
            setSceneState(prev => ({ ...prev, scene1Cooldown: now }));
          }
        }
      }, Math.random() * 2000 + 1500); // Más rápido: 1.5-3.5 segundos

      return () => clearInterval(scene1Interval);
    }
  }, [installationState.currentScene, sceneState.scene1Cooldown]);

  // Íconos flotantes independientes - Scene 1 - RESTAURADOS
  useEffect(() => {
    if (installationState.currentScene === 1) {
      const iconInterval = setInterval(() => {
        // 50% chance de generar un ícono flotante
        if (Math.random() > 0.5) {
          const newIcon = {
            id: `icon-${Date.now()}-${Math.random()}`
          };
          setFloatingIcons(prev => [...prev, newIcon]);
        }
      }, 2000 + Math.random() * 3000); // Cada 2-5 segundos

      return () => clearInterval(iconInterval);
    } else {
      // Limpiar íconos cuando cambia de escena
      setFloatingIcons([]);
    }
  }, [installationState.currentScene]);

  // Scene 3: Affirmations loop
  useEffect(() => {
    if (installationState.currentScene === 3) {
      const scene3Loop = setInterval(() => {
        const currentScene = SCENES.find(s => s.id === 3);
        if (currentScene) {
          const phraseIndex = sceneState.scene3LoopIndex % currentScene.phrases.length;
          const phrase = currentScene.phrases[phraseIndex];
          triggerPhrase(phrase, 3);
          setSceneState(prev => ({ 
            ...prev, 
            scene3LoopIndex: prev.scene3LoopIndex + 1 
          }));
        }
      }, 6000);

      return () => clearInterval(scene3Loop);
    }
  }, [installationState.currentScene, sceneState.scene3LoopIndex]);

  // Scene 5: Crescendo
  useEffect(() => {
    if (installationState.currentScene === 5 && !sceneState.scene5CrescendoActive) {
      setSceneState(prev => ({ ...prev, scene5CrescendoActive: true }));
      
      const crescendoSequence = async () => {
        const scene5 = SCENES.find(s => s.id === 5);
        if (scene5) {
          console.log('🌟 SCENE 5 CRESCENDO STARTING!');
          
          scene5.phrases.forEach((phrase, index) => {
            setTimeout(() => {
              triggerPhrase(phrase, 5);
            }, index * 1500);
          });

          const crescendoInterval = setInterval(() => {
            const randomPhrase = scene5.phrases[Math.floor(Math.random() * scene5.phrases.length)];
            triggerPhrase(randomPhrase, 5);
          }, 8000);

          setSceneState(prev => ({
            ...prev,
            autonomousIntervals: new Map(prev.autonomousIntervals.set(5, crescendoInterval as any))
          }));
        }
      };

      crescendoSequence();
    }

    if (installationState.currentScene !== 5 && sceneState.scene5CrescendoActive) {
      const interval = sceneState.autonomousIntervals.get(5);
      if (interval) {
        clearInterval(interval);
        setSceneState(prev => {
          const newIntervals = new Map(prev.autonomousIntervals);
          newIntervals.delete(5);
          return { 
            ...prev, 
            scene5CrescendoActive: false,
            autonomousIntervals: newIntervals
          };
        });
      }
    }
  }, [installationState.currentScene, sceneState.scene5CrescendoActive]);

  // Scene 2: Manual trigger
  const handleManualTrigger = () => {
    const now = Date.now();
    if (now - sceneState.lastTrigger < 2000) return;
    
    const currentScene = SCENES.find(s => s.id === installationState.currentScene);
    if (currentScene?.id === 2 && currentScene.phrases.length > 0) {
      const randomPhrase = currentScene.phrases[Math.floor(Math.random() * currentScene.phrases.length)];
      triggerPhrase(randomPhrase, 2);
      setSceneState(prev => ({ ...prev, lastTrigger: now }));
    }
  };

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
      onClick={handleManualTrigger}
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
