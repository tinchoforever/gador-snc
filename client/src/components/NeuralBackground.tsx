import { useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    tsParticles: any;
  }
}

interface NeuralBackgroundProps {
  intensity?: number;
  particleCount?: number;
  connectionDistance?: number;
  pulseActive?: boolean;
}

/**
 * GADOR SNC 85TH ANNIVERSARY - NEURAL BACKGROUND ENGINE
 * Multi-layer tsParticles system implementing exact brand specifications
 * Layers: Neural Net (nodes+links) + Pulse System + Burst Effects + Parallax
 */
export default function NeuralBackground({ 
  intensity = 0.7, 
  particleCount = 120,
  connectionDistance = 180,
  pulseActive = false 
}: NeuralBackgroundProps) {
  const netRef = useRef<HTMLDivElement>(null);
  const pulsesRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // BURST SYSTEM - EXACT bgBurst function from user document
  const triggerGlobalBurst = useCallback((ms: number = 900) => {
    if (!window.tsParticles) return;

    try {
      const pulses = window.tsParticles.domItem(1); // Pulse layer
      if (!pulses) return;
      
      const prev = pulses.actualOptions?.particles?.move?.speed || 1.4;
      if (pulses.options?.particles?.move) {
        pulses.options.particles.move.speed = 2.8;
        pulses.refresh();
        
        setTimeout(() => {
          if (pulses.options?.particles?.move) {
            pulses.options.particles.move.speed = prev;
            pulses.refresh();
          }
        }, ms);
      }
    } catch (error) {
      console.error('Error triggering burst:', error);
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    
    // Wait for tsParticles to load if not available
    if (!window.tsParticles) {
      const timer = setTimeout(() => {
        if (window.tsParticles && !initializedRef.current) {
          initNeuralSystem();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    const initNeuralSystem = async () => {
      try {
        // LAYER 1: NEURAL NETWORK - EXACT from user document
        await window.tsParticles.load("bg-net", {
          fullScreen: { enable: false }, 
          background: { color: "transparent" },               // Transparent - stage has gradient
          fpsLimit: 60, 
          detectRetina: true,
          particles: {
            number: { value: 120, density: { enable: true, area: 1200 } },  // EXACT from spec
            color: { value: ["#00E6FF", "#00A99D", "#78C4E6"] },            // EXACT colors from spec
            shape: { type: "circle" },
            size: { value: 2, random: { enable: true, minimumValue: 1 } },   // EXACT from spec
            opacity: { 
              value: .55, 
              animation: { enable: true, speed: .35, minimumValue: .3, sync: false } 
            },
            move: { 
              enable: true, 
              speed: .35, 
              random: true, 
              outModes: { default: "bounce" } 
            },
            links: { 
              enable: true, 
              distance: 140, 
              color: "#00E6FF", 
              opacity: .35, 
              width: 1.1 
            }
          }
        });

        // LAYER 2: PULSE SYSTEM - EXACT from user document  
        await window.tsParticles.load("bg-pulses", {
          fullScreen: { enable: false }, 
          background: { color: "transparent" }, 
          fpsLimit: 60, 
          detectRetina: true,
          particles: {
            number: { value: 18, density: { enable: true, area: 1000 } },    // EXACT from spec
            color: { value: ["#00E6FF", "#78C4E6"] },                       // EXACT colors from spec
            shape: { type: "circle" },
            size: { value: { min: 1.5, max: 3.5 } },                        // EXACT from spec
            opacity: { 
              value: .95, 
              animation: { enable: true, speed: 1.2, minimumValue: .5, sync: false } 
            },
            move: { 
              enable: true, 
              speed: 1.4, 
              random: true, 
              outModes: { default: "bounce" } 
            }
          }
        });

        // LAYER 3: BURST EFFECTS (Phrase-triggered)
        await window.tsParticles.load("bg-bursts", {
          fullScreen: { enable: false },
          background: { color: "transparent" },
          fpsLimit: 60,
          detectRetina: true,
          particles: {
            number: { value: 0 }, // Burst-triggered only
            color: { 
              value: [
                "hsl(178, 100%, 50%)", // Intense Teal 
                "hsl(199, 68%, 80%)",  // Bright Light Blue
                "hsl(219, 100%, 55%)"  // Bright Primary Blue
              ]
            },
            shape: { 
              type: ["circle", "edge"],
              options: {
                edge: { sides: 6 }
              }
            },
            opacity: {
              value: { min: 0.4, max: 1.0 },
              animation: { 
                enable: true, 
                speed: 3, 
                sync: false,
                startValue: "max",
                destroy: "min"
              }
            },
            size: {
              value: { min: 8, max: 25 },
              animation: { 
                enable: true, 
                speed: 8, 
                sync: false,
                startValue: "min",
                destroy: "none"
              }
            },
            move: {
              enable: true,
              speed: { min: 2, max: 6 },
              direction: "none",
              random: true,
              straight: false,
              outModes: { default: "destroy" }
            }
          }
        });

        // Expose global burst controller - EXACT bgBurst function from user document
        (window as any).neuralBurst = triggerGlobalBurst;
        (window as any).bgBurst = triggerGlobalBurst;
        initializedRef.current = true;

        console.log('tsParticles neural background initialized with all layers');
      } catch (error) {
        console.error('Error initializing neural system:', error);
      }
    };

    initNeuralSystem();

    return () => {
      // Cleanup on unmount
      if (window.tsParticles) {
        window.tsParticles.domItem(0)?.destroy();
        window.tsParticles.domItem(1)?.destroy();
        window.tsParticles.domItem(2)?.destroy();
      }
      (window as any).neuralBurst = null;
    };
  }, [particleCount, connectionDistance, triggerGlobalBurst]);

  // Phrase-triggered pulse effect
  useEffect(() => {
    if (!pulseActive) return;
    triggerGlobalBurst(intensity);
  }, [pulseActive, intensity, triggerGlobalBurst]);

  return (
    <>
      {/* Background gradient using Gador brand colors */}
      <div
        className="fixed inset-0 z-[-3]"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, hsl(219, 100%, 8%) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, hsl(178, 100%, 6%) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, hsl(199, 68%, 4%) 0%, transparent 50%),
            linear-gradient(135deg, hsl(219, 100%, 4%) 0%, hsl(219, 80%, 6%) 50%, hsl(178, 100%, 8%) 100%)
          `
        }}
        data-testid="neural-background-gradient"
      />
      
      {/* Layer 1: Neural Network */}
      <div
        id="bg-net"
        ref={netRef}
        className="fixed inset-0 z-[1]"
        style={{ pointerEvents: 'none' }}
        data-testid="neural-network-layer"
      />
      
      {/* Layer 2: Pulse System */}
      <div
        id="bg-pulses"
        ref={pulsesRef}
        className="fixed inset-0 z-[2]"
        style={{ pointerEvents: 'none' }}
        data-testid="neural-pulse-layer"
      />
      
      {/* Layer 3: Burst Effects */}
      <div
        id="bg-bursts"
        ref={burstRef}
        className="fixed inset-0 z-[3]"
        style={{ pointerEvents: 'none' }}
        data-testid="neural-burst-layer"
      />
    </>
  );
}

// Export burst controller for external use (maintains compatibility)
export const bgBurst = (duration: number = 900) => {
  if ((window as any).neuralBurst) {
    (window as any).neuralBurst(1.0);
  }
};

// Export enhanced burst controller - consistent naming
export const triggerNeuralBurst = (intensity: number = 1.0) => {
  if ((window as any).neuralBurst) {
    (window as any).neuralBurst(intensity);
  } else {
    // Fallback for when neural system isn't ready
    console.warn('Neural burst system not initialized yet');
  }
};