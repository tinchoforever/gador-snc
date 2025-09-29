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
  };

  // SCENE ORCHESTRATION SYSTEM - Complete scheduling per specification
  const [sceneState, setSceneState] = useState({
    lastTrigger: 0,
    scene1Cooldown: 0,
    scene3LoopIndex: 0,
    scene5CrescendoActive: false,
    autonomousIntervals: new Map<number, number>()
  });

  // Scene 1: Autonomous cadence with cooldowns (4-8 second intervals)
  useEffect(() => {
    if (installationState.currentScene === 1) {
      const scene1Interval = setInterval(() => {
        const now = Date.now();
        if (now - sceneState.scene1Cooldown > 4000) { // Min 4s cooldown
          const currentScene = SCENES.find(s => s.id === 1);
          if (currentScene) {
            const randomPhrase = currentScene.phrases[Math.floor(Math.random() * currentScene.phrases.length)];
            triggerPhrase(randomPhrase, 1);
            setSceneState(prev => ({ ...prev, scene1Cooldown: now }));
            console.log(`🔄 Scene 1 autonomous trigger: "${randomPhrase}"`);
          }
        }
      }, Math.random() * 4000 + 4000); // 4-8 second random intervals

      return () => clearInterval(scene1Interval);
    }
  }, [installationState.currentScene, sceneState.scene1Cooldown]);

  // Scene 3: Orchestrated affirmations loop (all 4 phrases cycling)
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
          console.log(`🔁 Scene 3 loop: "${phrase}" (${phraseIndex + 1}/${currentScene.phrases.length})`);
        }
      }, 6000); // 6 second intervals for positive affirmations

      return () => clearInterval(scene3Loop);
    }
  }, [installationState.currentScene, sceneState.scene3LoopIndex]);

  // Scene 5: Crescendo - Multiple phrases cascading rapidly
  useEffect(() => {
    if (installationState.currentScene === 5 && !sceneState.scene5CrescendoActive) {
      setSceneState(prev => ({ ...prev, scene5CrescendoActive: true }));
      
      const crescendoSequence = async () => {
        const scene5 = SCENES.find(s => s.id === 5);
        if (scene5) {
          console.log('🌟 SCENE 5 CRESCENDO STARTING!');
          
          // Trigger all phrases with staggered timing for crescendo effect
          scene5.phrases.forEach((phrase, index) => {
            setTimeout(() => {
              triggerPhrase(phrase, 5);
              console.log(`🎭 Crescendo phrase ${index + 1}: "${phrase}"`);
            }, index * 1500); // 1.5s stagger for building intensity
          });

          // Continue with overlapping waves every 8 seconds
          const crescendoInterval = setInterval(() => {
            const randomPhrase = scene5.phrases[Math.floor(Math.random() * scene5.phrases.length)];
            triggerPhrase(randomPhrase, 5);
            console.log(`🌊 Crescendo wave: "${randomPhrase}"`);
          }, 8000);

          // Store interval for cleanup
          setSceneState(prev => ({
            ...prev,
            autonomousIntervals: new Map(prev.autonomousIntervals.set(5, crescendoInterval as any))
          }));
        }
      };

      crescendoSequence();
    }

    // Cleanup crescendo when leaving scene 5
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

  // Scene 2: Manual trigger handler (with UI feedback)
  const handleManualTrigger = () => {
    const now = Date.now();
    if (now - sceneState.lastTrigger < 2000) return; // 2s cooldown for manual triggers
    
    const currentScene = SCENES.find(s => s.id === installationState.currentScene);
    if (currentScene?.id === 2 && currentScene.phrases.length > 0) {
      const randomPhrase = currentScene.phrases[Math.floor(Math.random() * currentScene.phrases.length)];
      triggerPhrase(randomPhrase, 2);
      setSceneState(prev => ({ ...prev, lastTrigger: now }));
      
      // Trigger neural background pulse for feedback
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 800);
      
      console.log(`🎤 Manual Scene 2 trigger: "${randomPhrase}"`);
    }
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden cursor-none"
      style={{ 
        background: 'transparent'  // Let neural background show through
      }}
      onClick={handleManualTrigger}
      data-testid="stage-display"
    >
      <NeuralBackground 
        intensity={0.7}
        particleCount={120}
        connectionDistance={180}
        pulseActive={pulseActive}
      />
      
      {/* Safe areas - 7% 10% padding as specced */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ padding: '7% 10%' }}
        data-testid="safe-area"
      >
        {phrases.map(phrase => (
          <FloatingPhrase 
            key={phrase.id}
            phrase={phrase}
            lane={(phrase as any).lane || 'B'}
            entryStyle={(phrase as any).entry || 'focus'}
            onAnimationComplete={() => {
              // Remove phrase when animation completes
              setPhrases(prev => prev.filter(p => p.id !== phrase.id));
            }}
          />
        ))}
      </div>
      
      {showPhotoMode && (
        <PhotoBooth 
          onComplete={() => {
            console.log('Photo booth completed');
            setShowPhotoMode(false);
          }}
        />
      )}
      
    </div>
  );
}