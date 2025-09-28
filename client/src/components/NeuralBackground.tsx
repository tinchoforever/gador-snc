import { useEffect, useRef } from 'react';

// Brand colors as specified
const BLUE = "#0033A0";
const TEAL = "#00A99D";
const LBLUE = "#78C4E6";

interface NeuralBackgroundProps {
  intensity?: number;
  particleCount?: number;
  connectionDistance?: number;
  pulseActive?: boolean;
}

// Global burst function
let bgBurstFunction: ((duration?: number) => void) | null = null;

export function bgBurst(duration = 900) {
  if (bgBurstFunction) {
    bgBurstFunction(duration);
  }
}

export default function NeuralBackground({
  intensity = 0.7,
  particleCount = 110,
  connectionDistance = 140,
  pulseActive = false
}: NeuralBackgroundProps) {
  const netRef = useRef<HTMLDivElement>(null);
  const pulsesRef = useRef<HTMLDivElement>(null);
  const particlesInitializedRef = useRef(false);

  useEffect(() => {
    if (particlesInitializedRef.current || !window.tsParticles) return;
    
    const initParticles = async () => {
      try {
        // Layer 1 - Neural Net (Connections)
        await window.tsParticles.load("bg-net", {
          fullScreen: { enable: false },
          background: { color: "transparent" },
          fpsLimit: 60,
          detectRetina: true,
          particles: {
            number: { value: particleCount, density: { enable: true, area: 1200 } },
            color: { value: [TEAL, LBLUE, BLUE] },
            shape: { type: "circle" },
            size: { value: 2, random: { enable: true, minimumValue: 1 } },
            opacity: {
              value: 0.65,
              animation: { enable: true, speed: 0.4, minimumValue: 0.35, sync: false }
            },
            move: {
              enable: true,
              speed: 0.35,
              random: true,
              outModes: { default: "bounce" }
            },
            links: {
              enable: true,
              distance: connectionDistance,
              color: TEAL,
              opacity: 0.40,
              width: 1.15
            }
          }
        });

        // Layer 2 - Pulses (Spikes)
        await window.tsParticles.load("bg-pulses", {
          fullScreen: { enable: false },
          background: { color: "transparent" },
          fpsLimit: 60,
          detectRetina: true,
          particles: {
            number: { value: 18, density: { enable: true, area: 1000 } },
            color: { value: [TEAL, LBLUE] },
            shape: { type: "circle" },
            size: { value: { min: 1.5, max: 3.5 } },
            opacity: {
              value: 0.95,
              animation: { enable: true, speed: 1.2, minimumValue: 0.5, sync: false }
            },
            move: {
              enable: true,
              speed: 1.4,
              random: true,
              straight: false,
              angle: { offset: 0, value: { min: -20, max: 20 } },
              outModes: { default: "bounce" }
            },
            links: { enable: false }
          }
        });

        // Setup burst function
        bgBurstFunction = (duration = 900) => {
          const pulses = window.tsParticles.domItem(1); // second loaded instance
          if (!pulses) return;
          const prev = pulses.actualOptions.particles.move.speed;
          pulses.options.particles.move.speed = 2.8;
          pulses.refresh();
          setTimeout(() => {
            pulses.options.particles.move.speed = prev;
            pulses.refresh();
          }, duration);
        };

        particlesInitializedRef.current = true;
        console.log('tsParticles neural background initialized');
      } catch (error) {
        console.error('Failed to initialize tsParticles:', error);
      }
    };

    // Wait for tsParticles to be available
    if (window.tsParticles) {
      initParticles();
    } else {
      const checkTsParticles = () => {
        if (window.tsParticles) {
          initParticles();
        } else {
          setTimeout(checkTsParticles, 100);
        }
      };
      checkTsParticles();
    }

    return () => {
      // Cleanup particles on unmount
      if (window.tsParticles) {
        window.tsParticles.domItem(0)?.destroy();
        window.tsParticles.domItem(1)?.destroy();
      }
      bgBurstFunction = null;
    };
  }, [particleCount, connectionDistance]);

  // Trigger pulse when pulseActive changes
  useEffect(() => {
    if (pulseActive && bgBurstFunction) {
      bgBurstFunction(900);
    }
  }, [pulseActive]);

  return (
    <>
      <div
        id="bg-net"
        ref={netRef}
        className="fixed inset-0 z-[-1]"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
          filter: 'drop-shadow(0 0 4px rgba(0,169,157,.35)) drop-shadow(0 0 6px rgba(120,196,230,.25))'
        }}
        data-testid="neural-background"
      />
      <div
        id="bg-pulses"
        ref={pulsesRef}
        className="fixed inset-0 z-[-1]"
        style={{
          background: 'transparent',
          filter: 'drop-shadow(0 0 10px rgba(0,169,157,.8)) drop-shadow(0 0 16px rgba(120,196,230,.6))'
        }}
      />
    </>
  );
}

// Type declaration for tsParticles global
declare global {
  interface Window {
    tsParticles: any;
  }
}