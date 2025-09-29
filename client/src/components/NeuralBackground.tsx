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

  // Global burst controller for phrase synchronization
  const triggerGlobalBurst = useCallback((burstIntensity: number = 1.0) => {
    if (!window.tsParticles) return;

    try {
      const burstContainer = window.tsParticles.domItem(2); // Burst layer
      if (burstContainer) {
        const burstCount = Math.floor(8 * burstIntensity);
        const positions = [
          { x: 25, y: 25 }, { x: 75, y: 25 }, { x: 50, y: 50 },
          { x: 25, y: 75 }, { x: 75, y: 75 }, { x: 10, y: 50 },
          { x: 90, y: 50 }, { x: 50, y: 10 }
        ];

        for (let i = 0; i < burstCount; i++) {
          const pos = positions[i % positions.length];
          burstContainer.particles.addParticle({
            x: (pos.x / 100) * window.innerWidth,
            y: (pos.y / 100) * window.innerHeight,
            color: { value: ["hsl(178, 100%, 33%)", "hsl(199, 68%, 69%)", "hsl(219, 100%, 45%)"] },
            size: { value: Math.random() * 12 + 8 },
            opacity: { value: 0.9 }
          });
        }
      }
    } catch (error) {
      console.error('Error triggering global burst:', error);
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current || !window.tsParticles) return;

    const initNeuralSystem = async () => {
      try {
        // LAYER 1: NEURAL NETWORK (Nodes + Connections)
        await window.tsParticles.load("bg-net", {
          fullScreen: { enable: false },
          background: { color: "transparent" },
          fpsLimit: 60,
          detectRetina: true,
          particles: {
            number: { 
              value: particleCount,
              density: { enable: true, area: 1000 }
            },
            color: { 
              value: [
                "hsl(219, 100%, 31%)", // Gador Primary Blue
                "hsl(178, 100%, 33%)", // Gador Teal
                "hsl(199, 68%, 69%)"   // Gador Light Blue
              ]
            },
            shape: { 
              type: "circle",
              options: {
                circle: { radius: 1 }
              }
            },
            opacity: {
              value: { min: 0.15, max: 0.7 },
              animation: { 
                enable: true, 
                speed: 1.2, 
                sync: false,
                destroy: "none"
              }
            },
            size: {
              value: { min: 0.8, max: 3.5 },
              animation: { 
                enable: true, 
                speed: 2, 
                sync: false,
                destroy: "none"
              }
            },
            links: {
              enable: true,
              distance: 140,                    // EXACT from your spec
              color: "#00A99D",                 // EXACT teal from your spec
              opacity: 0.4,                     // EXACT from your spec  
              width: 1.15                       // EXACT from your spec
              // NO triangles - pure nodes+links network as specified
            },
            move: {
              enable: true,
              speed: { min: 0.3, max: 0.8 },
              direction: "none",
              random: true,
              straight: false,
              outModes: { default: "bounce" },
              attract: { enable: false }
            }
          },
          interactivity: {
            detectsOn: "canvas",
            events: {
              onHover: { 
                enable: true, 
                mode: ["connect", "bubble"],
                parallax: { enable: true, force: 8, smooth: 15 }
              },
              resize: { enable: true }
            },
            modes: {
              connect: { distance: 220, links: { opacity: 0.4 } },
              bubble: { distance: 180, size: 6, duration: 0.8, opacity: 0.6 }
            }
          }
        });

        // LAYER 2: PULSE SYSTEM (Neural Impulses)
        await window.tsParticles.load("bg-pulses", {
          fullScreen: { enable: false },
          background: { color: "transparent" },
          fpsLimit: 60,
          detectRetina: true,
          particles: {
            number: { value: 0 }, // Emitter-based generation
            color: { 
              value: [
                "hsl(178, 100%, 40%)", // Bright Teal pulses
                "hsl(199, 68%, 75%)"   // Bright Light Blue pulses
              ]
            },
            shape: { type: "circle" },
            opacity: {
              value: { min: 0.2, max: 0.8 },
              animation: { 
                enable: true, 
                speed: 4, 
                sync: false,
                startValue: "max",
                destroy: "min"
              }
            },
            size: {
              value: { min: 3, max: 12 },
              animation: { 
                enable: true, 
                speed: 6, 
                sync: false,
                startValue: "min",
                destroy: "none"
              }
            },
            move: {
              enable: true,
              speed: { min: 1.5, max: 4 },
              direction: "none",
              random: true,
              straight: false,
              outModes: { default: "destroy" }
            }
          },
          emitters: {
            direction: "none",
            life: { count: 0, duration: 0.2, delay: { min: 2, max: 5 } },
            rate: { delay: { min: 0.8, max: 2 }, quantity: { min: 1, max: 3 } },
            size: { width: 100, height: 100 },
            position: { 
              x: { min: 10, max: 90 }, 
              y: { min: 10, max: 90 } 
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

        // Expose global burst controller
        (window as any).neuralBurst = triggerGlobalBurst;
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
        className="absolute inset-0 z-10"
        style={{ background: 'transparent', pointerEvents: 'none' }}
        data-testid="neural-network-layer"
      />
      
      {/* Layer 2: Pulse System */}
      <div
        id="bg-pulses"
        ref={pulsesRef}
        className="absolute inset-0 z-20"
        style={{ background: 'transparent', pointerEvents: 'none' }}
        data-testid="neural-pulse-layer"
      />
      
      {/* Layer 3: Burst Effects */}
      <div
        id="bg-bursts"
        ref={burstRef}
        className="absolute inset-0 z-30"
        style={{ background: 'transparent', pointerEvents: 'none' }}
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