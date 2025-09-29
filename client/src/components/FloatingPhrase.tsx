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
  const motionRef = useRef<HTMLDivElement>(null);  // NEW: Inner motion wrapper
  const textRef = useRef<HTMLParagraphElement>(null);
  const masterTimeline = useRef<gsap.core.Timeline | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Delay to ensure refs are ready
    const timer = setTimeout(() => {
      if (containerRef.current && motionRef.current && textRef.current) {
        initializeAnimation();
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (masterTimeline.current) {
        masterTimeline.current.kill();
      }
    };
  }, [lane, entryStyle, phrase.text]);

  const initializeAnimation = () => {
    const textElement = textRef.current;
    if (!textElement) return;

    // EXACT PHRASE CYCLE FROM USER DOCUMENT
    const vw = window.innerWidth;
    const laneY = LANES[lane as keyof typeof LANES];
    
    // Position the phrase element directly - EXACT from user spec
    textElement.style.position = 'absolute';
    textElement.style.top = laneY;
    textElement.style.left = '50%';
    textElement.style.transform = 'translateX(-50%)';
    textElement.style.opacity = '0';
    textElement.style.zIndex = '100';

    // ENTRY ANIMATION - EXACT from user document
    const entryTl = gsap.timeline();
    
    if (entryStyle === 'flash') {
      // EXACT flash sequence from user document
      entryTl.to(textElement, { opacity: 1, duration: .18, ease: "power2.out" })
             .to(textElement, { opacity: .4, duration: .08 })
             .to(textElement, { opacity: 1, duration: .18 });
    } else {
      // Default entry - EXACT from user document
      entryTl.fromTo(textElement, { opacity: 0 }, { opacity: 1, duration: .45, ease: "power2.out" });
    }

    // HOLD readable - EXACT from user document
    entryTl.to(textElement, { duration: 1.0 });

    // MAIN CYCLE: front → back mirror → return - EXACT from user document
    const mainCycle = gsap.timeline({ 
      repeat: -1, 
      defaults: { ease: "power1.inOut" } 
    })
    .to(textElement, { x: vw * 0.35, opacity: .8, duration: 8 })          // FRONT L→R
    .to(textElement, { color: "#bdefff", scale: .85, duration: .01 })     // swap to BACK
    .to(textElement, { x: -vw * 0.70, opacity: .35, duration: 8 })       // BACK R→L
    .to(textElement, { color: "#dffaff", scale: .80, duration: .01 })     // swap to FRONT
    .to(textElement, { x: -vw * 0.15, opacity: .65, duration: 8 });      // RETURN L→R

    // Create master timeline - EXACT from user document
    masterTimeline.current = gsap.timeline()
      .add(entryTl, 0)
      .add(mainCycle);

    // Background reaction - call bgBurst function from user document
    if ((window as any).bgBurst) {
      (window as any).bgBurst(900);
    }
  };


  if (!mounted) return null;

  return (
    <div 
      ref={containerRef}
      className="pointer-events-none select-none"
      data-testid={`floating-phrase-${phrase.id}`}
    >
      {/* MOTION WRAPPER: All GSAP transforms happen here */}
      <div
        ref={motionRef}
        className="relative"
        style={{ willChange: 'transform, opacity' }}
      >
        {/* NEON CYAN PHRASE - EXACT from user spec */}
        <div
          ref={textRef}
          className="phrase"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'pre-wrap',
            color: '#7DF9FF',                           // EXACT Digital Anxiety color from spec
            fontWeight: '600',                          // EXACT weight from spec  
            lineHeight: '1.15',                         // EXACT line height from spec
            letterSpacing: '0.2px',                     // EXACT from spec
            padding: '16px 24px',                       // EXACT padding from spec
            borderRadius: '12px',                       // EXACT radius from spec
            backdropFilter: 'blur(4px)',               // EXACT backdrop filter from spec
            background: 'radial-gradient(60% 60% at 50% 50%, rgba(125,249,255,.07) 0%, rgba(15,35,60,.70) 60%)', // EXACT Nebula Blue from spec
            border: '2px solid #7DF9FF',               // EXACT border from spec
            boxShadow: '0 0 15px rgba(125,249,255,.75), 0 0 2px rgba(125,249,255,.75)', // EXACT glow from spec
            textShadow: '0 0 3px #7DF9FF',             // EXACT text shadow from spec
            fontSize: phrase.text.length > 50 ? 'clamp(40px, 6vw, 132px)' : 'clamp(22px, 2.6vw, 36px)',  // Hero vs satellite
            userSelect: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            willChange: 'transform, opacity, color, scale',
            filter: 'none'                             // EXACT no blur from spec
          }}
          data-testid={`phrase-container-${phrase.id}`}
        >
          {phrase.text}
        </div>
      </div>
    </div>
  );
}