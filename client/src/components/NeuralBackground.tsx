import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    tsParticles: any;
    bgBurst: (ms?: number) => void;
  }
}

interface NeuralBackgroundProps {
  intensity?: number;
  particleCount?: number;
  connectionDistance?: number;
  pulseActive?: boolean;
}

/**
 * DIGITAL ANXIETY BACKGROUND - EXACT FROM USER SPECIFICATION
 * Layer stack: Base + Ghost Formulas + Neural NET + Pulses
 */
export default function NeuralBackground({ 
  intensity = 0.7, 
  particleCount = 120,
  connectionDistance = 180,
  pulseActive = false 
}: NeuralBackgroundProps) {
  const formulasRef = useRef<HTMLCanvasElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    
    const initDigitalAnxietyBackground = () => {
      const CYAN = "#7DF9FF";
      
      // LAYER 2: Neural NET (nodes + links) - EXACT from user spec
      if (window.tsParticles) {
        window.tsParticles.load("bg-net", {
          fullScreen: { enable: false },
          background: { color: "transparent" },
          fpsLimit: 60,
          detectRetina: true,
          particles: {
            number: { value: 120, density: { enable: true, area: 1200 } },
            color: { value: CYAN },
            shape: { type: "circle" },
            size: { value: 2, random: { enable: true, minimumValue: 1 } },
            opacity: { value: 0.40, animation: { enable: true, speed: 0.3, minimumValue: 0.25, sync: false } },
            move: { enable: true, speed: 0.35, random: true, outModes: { default: "bounce" } },
            links: { enable: true, distance: 140, color: CYAN, opacity: 0.30, width: 1.05 }
          }
        });

        // LAYER 3: Pulses (energy blips + reactive burst) - EXACT from user spec
        window.tsParticles.load("bg-pulses", {
          fullScreen: { enable: false },
          background: { color: "transparent" },
          fpsLimit: 60,
          detectRetina: true,
          particles: {
            number: { value: 18, density: { enable: true, area: 1000 } },
            color: { value: CYAN }, 
            shape: { type: "circle" },
            size: { value: { min: 1.5, max: 3.5 } },
            opacity: { value: 0.95, animation: { enable: true, speed: 1.2, minimumValue: 0.5, sync: false } },
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

        // BURST FUNCTION - EXACT from user spec
        window.bgBurst = (ms = 900) => {
          const pulses = window.tsParticles.domItem(1); // second instance
          if (!pulses) return;
          const prev = pulses.actualOptions.particles.move.speed;
          pulses.options.particles.move.speed = 2.8;
          pulses.refresh();
          setTimeout(() => { 
            pulses.options.particles.move.speed = prev; 
            pulses.refresh(); 
          }, ms);
        };
      }

      // LAYER 1: Ghost formulas (canvas) - EXACT from user spec
      const cv = formulasRef.current;
      if (cv) {
        const ctx = cv.getContext("2d");
        if (!ctx) return;
        
        const fit = () => { 
          cv.width = window.innerWidth; 
          cv.height = window.innerHeight; 
        };
        fit(); 
        window.addEventListener("resize", fit);

        const glyphs = ["x","y","∑","≈","→","sin","cos","∂","α","β","γ","π","Δ","θ","ln","ƒ"];
        const items = Array.from({length: 60}).map(() => ({
          x: Math.random() * cv.width,
          y: Math.random() * cv.height,
          s: 0.8 + Math.random() * 1.4,     // scale
          v: 0.12 + Math.random() * 0.22,   // vertical drift
          a: Math.random() * Math.PI * 2,   // small lateral sway
          w: 0.15 + Math.random() * 0.25,   // sway speed
          g: glyphs[(Math.random() * glyphs.length) | 0]
        }));

        const tick = () => {
          if (!ctx || !cv) return;
          ctx.clearRect(0, 0, cv.width, cv.height);
          ctx.fillStyle = "rgba(255,255,255,0.15)"; // 15% white
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          items.forEach(it => {
            it.y += it.v; 
            if (it.y > cv.height + 20) it.y = -20;
            it.a += it.w * 0.016;
            const x = it.x + Math.sin(it.a) * 8;  // gentle sway
            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.translate(x, it.y);
            ctx.scale(it.s, it.s);
            ctx.font = "16px Helvetica, Arial, sans-serif";
            ctx.fillText(it.g, 0, 0);
            ctx.restore();
          });
          requestAnimationFrame(tick);
        };
        tick();
      }

      initializedRef.current = true;
    };

    // Wait for tsParticles to load
    if (window.tsParticles) {
      initDigitalAnxietyBackground();
    } else {
      const timer = setTimeout(() => {
        if (window.tsParticles) {
          initDigitalAnxietyBackground();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {/* Layer 0: Base + vignette - EXACT from user spec */}
      <div 
        id="bg-base"
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -4 }}
      />
      
      {/* Layer 1: Ghost formulas - EXACT from user spec */}
      <canvas 
        id="bg-formulas"
        ref={formulasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -3 }}
      />
      
      {/* Layer 2: Neural NET - EXACT from user spec */}
      <div
        id="bg-net"
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -2, background: 'transparent' }}
      />
      
      {/* Layer 3: Pulses - EXACT from user spec */}
      <div
        id="bg-pulses"
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -1, background: 'transparent' }}
      />
    </>
  );
}

// Export burst controller for external use
export const bgBurst = (duration: number = 900) => {
  if (window.bgBurst) {
    window.bgBurst(duration);
  }
};