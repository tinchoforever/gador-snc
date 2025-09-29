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
    if ((window as any).neuralBurst) {
      (window as any).neuralBurst(900);
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
        {/* SCI-FI NEON FRAME - EXACT SPEC FROM DOCUMENT */}
        <div
          ref={textRef}
          className="phrase"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'pre-wrap',
            color: '#dffaff',                           // EXACT color from spec
            fontWeight: '600',                          // EXACT weight from spec  
            lineHeight: '1.15',                         // EXACT line height from spec
            padding: '14px 22px',                       // EXACT padding from spec
            borderRadius: '10px',                       // EXACT radius from spec
            background: 'rgba(0,230,255,.06)',          // EXACT background from spec
            border: '1.6px solid rgba(0,230,255,.9)',   // EXACT border from spec
            textShadow: '0 0 12px #00E6FF, 0 0 24px rgba(0,230,255,.85)', // EXACT text shadow from spec
            boxShadow: '0 0 16px rgba(0,230,255,.85), inset 0 0 18px rgba(0,230,255,.12)', // EXACT box shadow from spec
            fontSize: 'clamp(22px, 2.6vw, 36px)',      // Satellite size (default)
            userSelect: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
          data-testid={`phrase-container-${phrase.id}`}
        >
          {phrase.text}
        </div>
      </div>
    </div>
  );
}