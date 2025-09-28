import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { PhraseState } from '@shared/schema';
import { bgBurst } from './NeuralBackground';

interface FloatingPhraseProps {
  phrase: PhraseState;
  onAnimationComplete?: () => void;
  lane?: 'A' | 'B' | 'C' | 'D';
  entryStyle?: 'draw' | 'focus' | 'flash' | 'mask';
}

// Lane positions (1080p reference)
const LANES = {
  A: '22%',
  B: '38%', 
  C: '54%',
  D: '70%'
};

export default function FloatingPhrase({ 
  phrase, 
  onAnimationComplete,
  lane = 'B',
  entryStyle = 'focus'
}: FloatingPhraseProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (elementRef.current) {
      animatePhrase(elementRef.current, lane, entryStyle);
    }
    
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [lane, entryStyle]);

  const animatePhrase = (el: HTMLElement, laneY: string, entryStyle: string) => {
    const vw = window.innerWidth;
    
    // Trigger background burst
    bgBurst(900);
    
    // Position element
    gsap.set(el, {
      position: 'fixed',
      top: laneY,
      left: '50%',
      x: '-50%',
      opacity: 0,
      zIndex: 100
    });

    // ENTRY ANIMATION
    const entry = gsap.timeline();
    
    switch (entryStyle) {
      case 'draw':
        // Handwriting draw-on effect (fallback to fade for now)
        entry.to(el, { 
          opacity: 1, 
          duration: 0.6, 
          ease: "expo.out",
          textShadow: '0 0 20px #00A99D, 0 0 40px #00A99D'
        });
        break;
      case 'flash':
        // Letter flash effect
        entry.set(el, { opacity: 0 })
             .to(el, { 
               opacity: 1, 
               duration: 0.28, 
               ease: "power2.out",
               textShadow: '0 0 15px #00A99D'
             });
        break;
      case 'mask':
        // HUD mask-reveal effect
        entry.fromTo(el, 
          { opacity: 0, scaleX: 0, transformOrigin: 'left center' },
          { 
            opacity: 1, 
            scaleX: 1, 
            duration: 0.5, 
            ease: "expo.out",
            textShadow: '0 0 25px #00A99D'
          }
        );
        break;
      default: // focus
        entry.fromTo(el, 
          { filter: "blur(8px)", opacity: 0 },
          { 
            filter: "blur(0px)", 
            opacity: 1, 
            duration: 0.45, 
            ease: "power2.out",
            textShadow: '0 0 20px #00A99D'
          }
        );
        break;
    }

    // HOLD
    entry.to(el, { duration: 1.2 });

    // MAIN ANIMATION CYCLE
    const mainCycle = gsap.timeline({ 
      repeat: -1, 
      defaults: { ease: "power1.inOut" } 
    });

    // FRONT ORBIT L→R (1.00→0.80)
    mainCycle.to(el, { 
      x: vw * 0.35, 
      opacity: 0.8, 
      duration: 8,
      color: '#00A99D',
      textShadow: '0 0 15px #00A99D, 0 0 30px #00A99D'
    });

    // BACK MIRROR R→L (instant swap, 0.35)
    mainCycle.to(el, { 
      color: "#78C4E6", 
      scale: 0.85, 
      duration: 0.01,
      textShadow: '0 0 10px #78C4E6'
    });
    mainCycle.to(el, { 
      x: -vw * 0.70, 
      opacity: 0.35, 
      duration: 8,
      scaleX: -0.85  // Mirror effect
    });

    // RETURN L→R (smaller, 0.65)
    mainCycle.to(el, { 
      color: "#0033A0", 
      scale: 0.80, 
      scaleX: 0.80,  // Remove mirror
      duration: 0.01,
      textShadow: '0 0 12px #0033A0'
    });
    mainCycle.to(el, { 
      x: -vw * 0.15, 
      opacity: 0.65, 
      duration: 8 
    });

    // IDLE LOOP (slow drift)
    mainCycle.to(el, {
      x: vw * 0.2,
      duration: 14,
      ease: "none"
    });

    // Combine entry and main cycle
    timelineRef.current = gsap.timeline()
      .add(entry)
      .add(mainCycle);
  };

  if (!mounted) return null;

  const isHudStyle = phrase.text.length > 50; // Long phrases get HUD treatment

  return (
    <div
      ref={elementRef}
      className="pointer-events-none"
      data-testid={`floating-phrase-${phrase.id}`}
    >
      {isHudStyle ? (
        <div className="relative">
          <div
            className="px-6 py-4 border-2 rounded-lg backdrop-blur-sm"
            style={{
              borderColor: '#00A99D',
              backgroundColor: 'rgba(0, 169, 157, 0.1)',
            }}
          >
            <div 
              className="absolute inset-0 rounded-lg animate-pulse"
              style={{
                boxShadow: 'inset 0 0 20px rgba(0, 169, 157, 0.3)',
              }}
            />
            <p className="relative z-10 text-white font-medium leading-tight">
              {phrase.text}
            </p>
          </div>
        </div>
      ) : (
        <p 
          className="text-white font-semibold leading-tight whitespace-nowrap"
          style={{ 
            fontFamily: "'Avenir Next', 'Helvetica Neue', sans-serif",
            fontSize: '2.5rem',
            fontWeight: 600
          }}
        >
          {phrase.text}
        </p>
      )}
    </div>
  );
}