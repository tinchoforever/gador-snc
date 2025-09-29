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
    const container = containerRef.current;
    const motionElement = motionRef.current;
    const textElement = textRef.current;
    if (!container || !motionElement || !textElement) return;

    // Trigger neural burst effect (bgBurst from spec)
    triggerNeuralBurst(0.8);

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

    // GLOW PULSE ON ENTRY - EXACT as spec (pulse then settle, not constant neon)
    const glowBoost = gsap.timeline();
    
    // Entry brightness pulse - EXACT from your spec
    glowBoost.fromTo(motionElement, 
      { filter: "brightness(1.25)" },
      { filter: "brightness(1)", duration: 0.25, ease: "power2.out" }
    );
    
    // Idle pulse every ~3s (subtle, eye doesn't tire) - EXACT from your spec
    gsap.to(textElement, { 
      repeat: -1, 
      yoyo: true, 
      duration: 3.2, 
      ease: "sine.inOut",
      textShadow: '0 0 12px rgba(0,169,157,.9), 0 0 20px rgba(120,196,230,.7)'
    });

    // ENTRY TIMELINE - EXACT from your specification (on motion element)
    const entry = gsap.timeline();
    
    if (entryStyle === 'draw') {
      // Handwriting draw-on (SVG stroke), 0.6s - EXACT from spec
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const svgText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.pointerEvents = 'none';
      
      svgText.textContent = phrase.text;
      svgText.setAttribute('x', '50%');
      svgText.setAttribute('y', '50%');
      svgText.setAttribute('text-anchor', 'middle');
      svgText.setAttribute('dominant-baseline', 'middle');
      svgText.setAttribute('fill', 'none');
      svgText.setAttribute('stroke', '#00A99D');
      svgText.setAttribute('stroke-width', '2');
      svgText.setAttribute('stroke-dasharray', '1000');
      svgText.setAttribute('stroke-dashoffset', '1000');
      svgText.style.fontFamily = 'var(--font-display)';
      svgText.style.fontSize = '1.25rem';
      svgText.style.fontWeight = '600';
      
      svg.appendChild(svgText);
      textElement.parentElement?.appendChild(svg);
      textElement.style.opacity = '0';
      
      entry.set(motionElement, { opacity: 1 })
           .to(svgText, { 
             strokeDashoffset: 0, 
             duration: 0.5, 
             ease: "expo.out" 
           })
           .to(svgText, { fill: '#FFFFFF', stroke: 'none', duration: 0.1 })
           .set(textElement, { opacity: 1 })
           .set(svg, { display: 'none' });
    } else if (entryStyle === 'flash') {
      // Letter flash (each character 0.03s stagger) - EXACT from spec
      const text = phrase.text;
      textElement.textContent = ''; // Clear safely
      
      text.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        textElement.appendChild(span);
      });
      
      const charElements = textElement.querySelectorAll('span');
      entry.set(motionElement, { opacity: 1 })
           .to(charElements, { 
             opacity: 1, 
             stagger: 0.03,
             duration: 0.01, // Minimal duration per char
             ease: "power2.out" 
           });
    } else if (entryStyle === 'mask') {
      // HUD mask-reveal (rect slides to reveal, 0.5s) - EXACT from spec
      textElement.style.clipPath = 'inset(0 100% 0 0)';
      entry.set(motionElement, { opacity: 1 })
           .to(textElement, { 
             clipPath: 'inset(0 0% 0 0)', 
             duration: 0.5, 
             ease: "expo.out" 
           });
    } else { // focus - Blur → Focus (0.45s) - EXACT from spec
      entry.fromTo(motionElement, 
        { filter: "blur(8px)", opacity: 0 },
        { filter: "blur(0px)", opacity: 1, duration: 0.45, ease: "power2.out" }
      );
    }

    // HOLD - EXACT duration from spec
    entry.to(motionElement, { duration: 1.2 });

    // DEPTH/OPACITY CYCLE - YOUR EXACT CODE (front 100%→80%, back mirror 35%, return 65%)
    const tl = gsap.timeline({ repeat: -1 });
    
    // Front L→R - EXACT from your spec
    tl.to(motionElement, { x: vw*0.35, opacity: 0.8, duration: 8, ease:"power1.inOut" })
    
    // Swap back - EXACT from your spec  
    tl.to(textElement, { color:"#78C4E6", duration:0.01 })
    tl.to(motionElement, { scale:0.85, duration:0.01 }, "<")
    
    // Back R→L - EXACT from your spec
    tl.to(motionElement, { x:-vw*0.70, opacity:0.35, duration: 8, ease:"power1.inOut" })
    
    // Return front - EXACT from your spec
    tl.to(textElement, { color:"#0033A0", duration:0.01 })
    tl.to(motionElement, { scale:0.80, duration:0.01 }, "<")
    
    // Front L→R - EXACT from your spec  
    tl.to(motionElement, { x:-vw*0.15, opacity:0.65, duration: 8, ease:"power1.inOut" });

    // Create master timeline - EXACT as your template
    masterTimeline.current = gsap.timeline()
      .add(glowBoost, 0)
      .add(entry, 0)
      .add(tl);

    // EXPLICITLY START THE TIMELINE
    masterTimeline.current.play();
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
        {/* FUTURISTIC HUD Container - EXACT SPEC (not chat bubble) */}
        <div
          className="relative max-w-4xl"
          style={{
            padding: '14px 20px',               // bigger padding as spec
            borderRadius: '14px',               // tighter radius as spec  
            border: '2px solid rgba(0,169,157,.65)',  // teal outline
            background: 'rgba(0,51,160,.18)',         // blue translucent fill
            backdropFilter: 'blur(6px)',
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
            className="relative leading-relaxed"
            style={{ 
              fontFamily: 'var(--font-display)',
              fontWeight: '700',                        // heavier for distance
              fontSize: 'clamp(28px, 3.2vw, 68px)',   // EXACT as spec
              color: '#FFFFFF',                        // white text
              letterSpacing: '.2px',                   // EXACT as spec
              textShadow: '0 0 10px rgba(0,169,157,.8), 0 0 18px rgba(120,196,230,.6)', // EXACT glow
              userSelect: 'none'
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