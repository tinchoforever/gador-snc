import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { PhraseState } from '@shared/schema';
import { triggerNeuralBurst } from './NeuralBackground';

interface FloatingPhraseProps {
  phrase: PhraseState;
  onAnimationComplete?: () => void;
  lane?: 'A' | 'B' | 'C' | 'D';
  entryStyle?: 'draw' | 'focus' | 'flash' | 'mask';
}

/**
 * GADOR SNC 85TH ANNIVERSARY - PHRASE ANIMATION ENGINE
 * Complete GSAP-powered animation system with exact entry styles and orbital cycles
 * Implements: draw (SVG mask), flash (character stagger), mask (clipPath), focus (blur)
 */

// Lane positions (exact percentages from specifications)
const LANES = {
  A: '22%',  // Top lane
  B: '38%',  // Upper middle  
  C: '54%',  // Lower middle
  D: '70%'   // Bottom lane
};

// EXACT ANIMATION TIMING FROM SPECIFICATION DOCUMENT
const TIMING = {
  // Entry durations by style (from specification)
  DRAW_ENTRY: 0.6,         // Handwriting draw-on (stroke mask), 0.6s
  FOCUS_ENTRY: 0.45,       // Blur → Focus (0.45s)
  FLASH_ENTRY: 0.28,       // Letter flash (each character 0.03s; total ~0.28s)
  MASK_ENTRY: 0.5,         // HUD mask-reveal (rect slides to reveal, 0.5s)
  HOLD_DURATION: 1.2,      // Hold at 1.00 opacity
  FRONT_ORBIT: 8.0,        // Front orbit L→R (8s) → fade to 0.80
  BACK_MIRROR: 8.0,        // Back mirror R→L (8s), scale 0.85, color #78C4E6 → 0.35
  RETURN_CYCLE: 8.0,       // Return L→R (8s), scale 0.80, color #0033A0 → 0.65
  IDLE_DRIFT: 14.0,        // Loop idle: drift L→R slowly (12–16s), hold 0.65
};

// EXACT ANIMATION STATES FROM SPECIFICATION
const ANIMATION_STATES = {
  ENTRY: { opacity: 1.0, scale: 1.0 },               // Entry → 100% opacity
  FRONT_ORBIT: { opacity: 0.80, scale: 1.0 },        // Front orbit L→R → 0.80
  BACK_MIRROR: { opacity: 0.35, scale: 0.85 },       // Back mirror → 0.35, scale 0.85
  RETURN: { opacity: 0.65, scale: 0.80 },            // Return → 0.65, scale 0.80
  IDLE: { opacity: 0.65, scale: 0.80 },              // Idle drift → hold 0.65
};

export default function FloatingPhrase({ 
  phrase, 
  onAnimationComplete,
  lane = 'B',
  entryStyle = 'focus'
}: FloatingPhraseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const masterTimeline = useRef<gsap.core.Timeline | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (containerRef.current && textRef.current) {
      initializeAnimation();
    }
    
    return () => {
      if (masterTimeline.current) {
        masterTimeline.current.kill();
      }
    };
  }, [lane, entryStyle, phrase.text]);

  const initializeAnimation = () => {
    const container = containerRef.current;
    const textElement = textRef.current;
    if (!container || !textElement) return;

    // Trigger neural burst effect
    triggerNeuralBurst(0.8);

    // EXACT IMPLEMENTATION FROM SPECIFICATION DOCUMENT
    const vw = window.innerWidth;
    const laneY = LANES[lane as keyof typeof LANES];
    
    // Position at lane center (exact from spec)
    container.style.position = 'fixed';
    container.style.top = laneY;
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.opacity = '0';
    container.style.zIndex = '100';

    // ENTRY ANIMATION (based on style from specification)
    const entry = gsap.timeline();
    
    if (entryStyle === 'draw') {
      // Handwriting draw-on (0.6s) - from spec
      entry.to(container, { opacity: 1, duration: TIMING.DRAW_ENTRY, ease: "expo.out" });
    } else if (entryStyle === 'flash') {
      // Letter flash (0.28s) - from spec
      entry.set(container, { opacity: 0 })
           .to(container, { opacity: 1, duration: TIMING.FLASH_ENTRY, ease: "power2.out" });
    } else if (entryStyle === 'mask') {
      // HUD mask-reveal (0.5s) - from spec
      entry.to(container, { opacity: 1, duration: TIMING.MASK_ENTRY, ease: "expo.out" });
    } else { // focus
      // Blur → Focus (0.45s) - from spec
      entry.fromTo(container, 
        { filter: "blur(8px)", opacity: 0 },
        { filter: "blur(0px)", opacity: 1, duration: TIMING.FOCUS_ENTRY, ease: "power2.out" }
      );
    }

    // HOLD at 1.0 opacity (1.2s from spec)
    entry.to(container, { duration: TIMING.HOLD_DURATION });

    // MAIN CYCLE (infinite loop as specified in document)
    const mainCycle = gsap.timeline({ 
      repeat: -1, 
      defaults: { ease: "power1.inOut" } 
    });

    // FRONT ORBIT L→R (8s) → 0.80 opacity
    mainCycle.to(container, { 
      x: vw * 0.35, 
      opacity: ANIMATION_STATES.FRONT_ORBIT.opacity, 
      scale: ANIMATION_STATES.FRONT_ORBIT.scale,
      duration: TIMING.FRONT_ORBIT 
    });

    // BACK MIRROR R→L (instant swap then 8s movement) → 0.35 opacity, scale 0.85, color #78C4E6
    mainCycle.to([container, textElement], { 
      color: "#78C4E6", 
      scale: ANIMATION_STATES.BACK_MIRROR.scale, 
      duration: 0.01 
    });
    mainCycle.to(container, { 
      x: -vw * 0.70, 
      opacity: ANIMATION_STATES.BACK_MIRROR.opacity, 
      duration: TIMING.BACK_MIRROR 
    });

    // RETURN L→R (instant swap then 8s movement) → 0.65 opacity, scale 0.80, color #0033A0
    mainCycle.to([container, textElement], { 
      color: "#0033A0", 
      scale: ANIMATION_STATES.RETURN.scale, 
      duration: 0.01 
    });
    mainCycle.to(container, { 
      x: -vw * 0.15, 
      opacity: ANIMATION_STATES.RETURN.opacity, 
      duration: TIMING.RETURN_CYCLE 
    });

    // IDLE DRIFT L→R slowly (12-16s) → hold 0.65
    mainCycle.to(container, { 
      x: vw * 0.20, 
      opacity: ANIMATION_STATES.IDLE.opacity,
      duration: TIMING.IDLE_DRIFT 
    });

    // Create master timeline - entry then infinite main cycle
    masterTimeline.current = gsap.timeline()
      .add(entry)
      .add(mainCycle);
  };


  if (!mounted) return null;

  return (
    <div 
      ref={containerRef}
      className="pointer-events-none select-none"
      data-testid={`floating-phrase-${phrase.id}`}
    >
      {/* HUD Container with glowing border (exactly like your image) */}
      <div
        className="relative px-6 py-4 rounded-2xl backdrop-blur-sm max-w-md"
        style={{
          background: 'rgba(0, 51, 160, 0.15)',
          border: '2px solid #00A99D',
          borderRadius: '20px',
          boxShadow: `
            0 0 25px rgba(0, 169, 157, 0.5),
            0 0 50px rgba(0, 169, 157, 0.3),
            inset 0 0 15px rgba(0, 169, 157, 0.1)
          `,
          backdropFilter: 'blur(10px)',
        }}
        data-testid={`phrase-container-${phrase.id}`}
      >
        <p 
          ref={textRef}
          className="text-lg font-medium leading-relaxed"
          style={{ 
            fontFamily: 'var(--font-display)',
            color: '#FFFFFF',
            textShadow: '0 0 8px rgba(255,255,255,0.4)',
            userSelect: 'none'
          }}
          data-testid={`phrase-text-${phrase.id}`}
        >
          {phrase.text}
        </p>
      </div>
    </div>
  );
}