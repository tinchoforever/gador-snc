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

// Animation timing constants (exact specifications)
const TIMING = {
  ENTRY_DURATION: 0.48,     // Entry animation duration
  HOLD_DURATION: 1.5,       // Hold before orbit begins
  FRONT_ORBIT: 8.0,         // L→R front orbit (8 seconds)
  BACK_MIRROR: 8.0,         // R→L back mirror (8 seconds) 
  RETURN_CYCLE: 8.0,        // L→R return cycle (8 seconds)
  LOOP_DELAY: 1.0           // Delay before looping
};

// Opacity and scale values for each phase
const ANIMATION_STATES = {
  ENTRY: { opacity: 1.0, scale: 1.0, blur: 0 },
  FRONT_ORBIT: { opacity: 0.85, scale: 1.0, blur: 0 },
  BACK_MIRROR: { opacity: 0.35, scale: 0.92, blur: 0.5 },
  RETURN: { opacity: 0.75, scale: 0.96, blur: 0.2 }
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

    // Initialize position and styling
    const laneY = LANES[lane as keyof typeof LANES];
    const vw = window.innerWidth;
    
    gsap.set(container, {
      position: 'fixed',
      top: laneY,
      left: '50%',
      xPercent: -50,
      yPercent: 0,  // Use baseline positioning with lane percentages
      opacity: 0,
      zIndex: 100,
      visibility: 'visible'
    });

    // Create master timeline with finite cycles (3 full orbits then complete)
    masterTimeline.current = gsap.timeline({
      onComplete: () => {
        setIsCompleted(true);
        onAnimationComplete?.();
      }
    });

    // Add entry animation
    const entryAnimation = createEntryAnimation(container, textElement, entryStyle);
    masterTimeline.current.add(entryAnimation);

    // Add hold phase
    masterTimeline.current.to(container, { duration: TIMING.HOLD_DURATION });

    // Add orbital cycle animation (finite - 3 cycles then complete)
    const orbitalCycle = createOrbitalCycle(container, textElement, vw, 3);
    masterTimeline.current.add(orbitalCycle);
  };

  const createEntryAnimation = (container: HTMLElement, textElement: HTMLElement, style: string) => {
    const tl = gsap.timeline();

    switch (style) {
      case 'draw':
        return createDrawAnimation(container, textElement);
      case 'flash':
        return createFlashAnimation(container, textElement);
      case 'mask':
        return createMaskAnimation(container, textElement);
      case 'focus':
      default:
        return createFocusAnimation(container, textElement);
    }
  };

  // Draw Animation (Handwriting-style Character Reveal)
  const createDrawAnimation = (container: HTMLElement, textElement: HTMLElement) => {
    const tl = gsap.timeline();
    
    // Split text into characters for handwriting-style reveal
    const text = phrase.text;
    const chars = text.split('').map((char, index) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'scaleX(0)';
      span.style.transformOrigin = 'left center';
      return span;
    });
    
    textElement.innerHTML = '';
    chars.forEach(char => textElement.appendChild(char));
    
    tl.set(container, { opacity: 1 });
    
    // Handwriting-style character reveal with draw effect
    chars.forEach((char, index) => {
      const delay = index * 0.05; // Stagger for handwriting feel
      
      tl.to(char, {
        opacity: 1,
        scaleX: 1,
        duration: 0.12,
        ease: "power2.out",
        textShadow: '0 0 8px #00A99D',
      }, delay)
      // Add subtle glow after drawing
      .to(char, {
        textShadow: '0 0 20px #00A99D, 0 0 40px #00A99D',
        duration: 0.2,
        ease: "power2.out"
      }, delay + 0.08);
    });

    return tl;
  };

  // Per-Character Flash Animation
  const createFlashAnimation = (container: HTMLElement, textElement: HTMLElement) => {
    const tl = gsap.timeline();
    
    // Split text into characters
    const text = phrase.text;
    const chars = text.split('').map((char, index) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      return span;
    });
    
    textElement.innerHTML = '';
    chars.forEach(char => textElement.appendChild(char));
    
    tl.set(container, { opacity: 1 });
    
    // Stagger character appearances with flash effects
    chars.forEach((char, index) => {
      tl.to(char, {
        opacity: 1,
        duration: 0.08,
        ease: "power2.out",
        textShadow: '0 0 15px #00A99D, 0 0 30px #00A99D',
      }, index * 0.04);
      
      tl.to(char, {
        textShadow: '0 0 8px #00A99D, 0 0 16px #00A99D',
        duration: 0.12,
        ease: "power2.inOut"
      }, `-=0.02`);
    });

    return tl;
  };

  // ClipPath Sweep Mask Animation  
  const createMaskAnimation = (container: HTMLElement, textElement: HTMLElement) => {
    const tl = gsap.timeline();
    
    tl.set(container, { opacity: 1 })
      .set(textElement, {
        clipPath: 'inset(0 100% 0 0)',
        transformOrigin: 'left center'
      })
      .to(textElement, {
        clipPath: 'inset(0 0% 0 0)',
        duration: TIMING.ENTRY_DURATION,
        ease: "expo.out"
      })
      .to(textElement, {
        textShadow: '0 0 25px #00A99D, 0 0 50px #00A99D',
        duration: 0.2
      }, '-=0.2');

    return tl;
  };

  // Blur-to-Focus Animation
  const createFocusAnimation = (container: HTMLElement, textElement: HTMLElement) => {
    const tl = gsap.timeline();
    
    tl.fromTo(container,
      { 
        opacity: 0,
        filter: "blur(8px) brightness(0.6)"
      },
      { 
        opacity: ANIMATION_STATES.ENTRY.opacity,
        filter: "blur(0px) brightness(1.0)",
        duration: TIMING.ENTRY_DURATION,
        ease: "power2.out"
      }
    )
    .to(textElement, {
      textShadow: '0 0 20px #00A99D, 0 0 40px #00A99D',
      duration: 0.2
    }, '-=0.2');

    return tl;
  };

  // Complete Orbital Cycle Animation (Exact 8-second phases)
  const createOrbitalCycle = (container: HTMLElement, textElement: HTMLElement, viewportWidth: number, cycles: number = 3) => {
    const tl = gsap.timeline({ repeat: cycles - 1 });  // Finite cycles

    // PHASE 1: FRONT ORBIT L→R (8 seconds exact)
    tl.to(container, {
      x: viewportWidth * 0.4,  // Increased travel distance
      opacity: ANIMATION_STATES.FRONT_ORBIT.opacity,  // 0.85
      scale: ANIMATION_STATES.FRONT_ORBIT.scale,      // 1.0
      filter: `blur(${ANIMATION_STATES.FRONT_ORBIT.blur}px)`,  // 0px
      duration: TIMING.FRONT_ORBIT,  // 8.0 seconds
      ease: "none"  // Linear movement for consistent speed
    })
    .to(textElement, {
      color: '#00A99D',  // Gador Teal
      textShadow: '0 0 12px #00A99D, 0 0 24px #00A99D',
      duration: TIMING.FRONT_ORBIT,
      ease: "none"
    }, '<');  // Start simultaneously

    // PHASE 2: BACK MIRROR R→L (8 seconds exact)
    tl.to(container, {
      x: -viewportWidth * 0.4,  // Full reversal
      opacity: ANIMATION_STATES.BACK_MIRROR.opacity,  // 0.35
      scale: ANIMATION_STATES.BACK_MIRROR.scale,      // 0.92
      filter: `blur(${ANIMATION_STATES.BACK_MIRROR.blur}px)`,  // 0.5px
      duration: TIMING.BACK_MIRROR,  // 8.0 seconds
      ease: "none"  // Linear movement
    })
    .to(textElement, {
      color: '#78C4E6',  // Gador Light Blue
      textShadow: '0 0 6px #78C4E6, 0 0 12px #78C4E6',
      duration: TIMING.BACK_MIRROR,
      ease: "none"
    }, '<');

    // PHASE 3: RETURN L→R (8 seconds exact)
    tl.to(container, {
      x: 0,  // Return to center
      opacity: ANIMATION_STATES.RETURN.opacity,   // 0.75
      scale: ANIMATION_STATES.RETURN.scale,       // 0.96
      filter: `blur(${ANIMATION_STATES.RETURN.blur}px)`,  // 0.2px
      duration: TIMING.RETURN_CYCLE,  // 8.0 seconds
      ease: "none"  // Linear movement
    })
    .to(textElement, {
      color: '#0033A0',  // Gador Primary Blue
      textShadow: '0 0 8px #0033A0, 0 0 16px #0033A0',
      duration: TIMING.RETURN_CYCLE,
      ease: "none"
    }, '<');

    // Loop delay before repeating cycle
    tl.to(container, { 
      duration: TIMING.LOOP_DELAY,  // 1.0 second pause
      ease: "none"
    });

    return tl;
  };

  if (!mounted) return null;

  return (
    <div 
      ref={containerRef}
      className="pointer-events-none select-none"
      data-testid={`floating-phrase-${phrase.id}`}
    >
      <p 
        ref={textRef}
        className="text-heading-2 text-glow-accent font-semibold leading-tight whitespace-nowrap"
        style={{ 
          fontFamily: 'var(--font-display)',
          color: '#FFFFFF',
          textShadow: '0 0 20px #00A99D, 0 0 40px #00A99D',
          userSelect: 'none'
        }}
        data-testid={`phrase-text-${phrase.id}`}
      >
        {phrase.text}
      </p>
    </div>
  );
}