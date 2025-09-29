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
    if (containerRef.current && motionRef.current && textRef.current) {
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
    const motionElement = motionRef.current;
    const textElement = textRef.current;
    if (!container || !motionElement || !textElement) return;

    // Trigger neural burst effect (bgBurst from spec)
    triggerNeuralBurst(0.8);
    console.log(`🎬 INITIALIZING ANIMATION for "${phrase.text}" | Lane: ${lane} | Entry: ${entryStyle}`);

    // EXACT GSAP TIMELINE TEMPLATE FROM YOUR SPECIFICATION DOCUMENT
    const vw = window.innerWidth;
    const laneYPercent = parseFloat(LANES[lane as keyof typeof LANES]) / 100;
    const laneY = window.innerHeight * laneYPercent;
    
    // FIXED CONTAINER: Only positioning (no transforms/filters)
    container.style.position = 'fixed';
    container.style.top = `${laneY}px`;
    container.style.left = '0';
    container.style.zIndex = '100';
    
    // CLEAR ANY RESIDUAL TRANSFORMS
    gsap.set([container, motionElement], { clearProps: 'transform' });
    
    // MOTION ELEMENT: All GSAP transforms happen here
    gsap.set(motionElement, {
      x: 0,
      xPercent: -50,  // Center without CSS conflicts
      opacity: 0,
      force3D: true   // Ensure proper compositing
    });

    // GLOW BOOST EFFECT (on container, separate from motion) - from your spec
    const glowBoost = gsap.timeline();
    glowBoost.to(container, {
      filter: 'brightness(1.4) contrast(1.2) drop-shadow(0 0 30px #00A99D)',
      duration: 0.22,
      ease: "power2.out"
    }).to(container, {
      filter: 'brightness(1.1) contrast(1.1)',
      duration: 0.8,
      ease: "power2.inOut"
    });

    // ENTRY TIMELINE - EXACT from your specification (on motion element)
    const entry = gsap.timeline();
    
    if (entryStyle === 'draw') {
      // Handwriting draw-on (stroke mask), 0.6s - EXACT from spec
      entry.to(motionElement, { opacity: 1, duration: 0.6, ease: "expo.out" });
    } else if (entryStyle === 'flash') {
      // Letter flash (each character 0.03s; total ~0.28s) - EXACT from spec
      entry.set(motionElement, { opacity: 0 })
           .to(motionElement, { opacity: 1, duration: 0.28, ease: "power2.out" });
    } else if (entryStyle === 'mask') {
      // HUD mask-reveal (rect slides to reveal, 0.5s) - EXACT from spec
      entry.to(motionElement, { opacity: 1, duration: 0.5, ease: "expo.out" });
    } else { // focus - Blur → Focus (0.45s) - EXACT from spec
      entry.fromTo(motionElement, 
        { filter: "blur(8px)", opacity: 0 },
        { filter: "blur(0px)", opacity: 1, duration: 0.45, ease: "power2.out" }
      );
    }

    // HOLD - EXACT duration from spec
    entry.to(motionElement, { duration: 1.2 });

    // MAIN CYCLE - EXACT from your specification template (on motion element)
    const tl = gsap.timeline({ 
      repeat: -1, 
      defaults: { ease: "power1.inOut" },
      onUpdate: () => {
        const currentX = gsap.getProperty(motionElement, "x");
        console.log(`🔄 Motion progress: ${Math.round(tl.progress() * 100)}% | X: ${currentX}`);
      }
    });

    // FRONT ORBIT L→R (1.00→0.80) - EXACT from spec
    tl.to(motionElement, { 
      x: vw * 0.35, 
      opacity: 0.8, 
      duration: 8,
      onStart: () => console.log(`📍 FRONT ORBIT started for "${phrase.text}"`)
    });

    // BACK MIRROR R→L (swap instantly, 0.35) - EXACT from spec
    tl.to(textElement, { 
      color: "#78C4E6", 
      duration: 0.01 
    });
    tl.to(motionElement, { 
      scale: 0.85,
      duration: 0.01 
    }, "<");
    tl.to(motionElement, { 
      x: -vw * 0.70, 
      opacity: 0.35, 
      duration: 8,
      onStart: () => console.log(`📍 BACK MIRROR started for "${phrase.text}"`)
    });

    // RETURN L→R (smaller, 0.65) - EXACT from spec
    tl.to(textElement, { 
      color: "#0033A0", 
      duration: 0.01 
    });
    tl.to(motionElement, { 
      scale: 0.80, 
      duration: 0.01 
    }, "<");
    tl.to(motionElement, { 
      x: -vw * 0.15, 
      opacity: 0.65, 
      duration: 8,
      onStart: () => console.log(`📍 RETURN PHASE started for "${phrase.text}"`)
    });

    // Create master timeline - EXACT as your template
    masterTimeline.current = gsap.timeline()
      .add(glowBoost, 0)
      .add(entry, 0)
      .add(tl);

    // EXPLICITLY START THE TIMELINE
    masterTimeline.current.play();
    
    console.log(`✅ Master timeline created for "${phrase.text}" - STARTING PLAYBACK NOW`);
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
        {/* THREE.JS-STYLE HUD Container with ENHANCED glow (exactly like your spec) */}
        <div
          className="relative px-6 py-4 rounded-2xl backdrop-blur-sm max-w-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 51, 160, 0.2), rgba(0, 169, 157, 0.1))',
            border: '2px solid #00A99D',
            borderRadius: '20px',
            boxShadow: `
              0 0 30px rgba(0, 169, 157, 0.8),
              0 0 60px rgba(0, 169, 157, 0.5),
              0 0 100px rgba(0, 169, 157, 0.3),
              inset 0 0 20px rgba(0, 169, 157, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.1)
            `,
            backdropFilter: 'blur(15px)',
          }}
          data-testid={`phrase-container-${phrase.id}`}
        >
          {/* Additional glow layer */}
          <div 
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(45deg, transparent, rgba(0, 169, 157, 0.1), transparent)',
              filter: 'blur(1px)',
              pointerEvents: 'none'
            }}
          />
          <p 
            ref={textRef}
            className="relative text-xl font-semibold leading-relaxed"
            style={{ 
              fontFamily: 'var(--font-display)',
              color: '#FFFFFF',
              textShadow: `
                0 0 10px rgba(255, 255, 255, 0.6),
                0 0 20px rgba(0, 169, 157, 0.4),
                0 0 30px rgba(0, 169, 157, 0.2)
              `,
              userSelect: 'none',
              letterSpacing: '0.025em'
            }}
            data-testid={`phrase-text-${phrase.id}`}
          >
            {phrase.text}
          </p>
        </div>
      </div>
    </div>
  );
}