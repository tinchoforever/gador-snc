import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { PhraseState } from '@shared/schema';
import { MessageCircle, Zap, Bell, Brain, MessageSquare, Smartphone } from 'lucide-react';

interface FloatingPhraseProps {
  phrase: PhraseState;
  onAnimationComplete?: () => void;
  lane?: 'A' | 'B' | 'C' | 'D';
  entryStyle?: 'draw' | 'focus' | 'flash' | 'mask';
  stackIndex?: number;
}

/**
 * GADOR MENTAL HEALTH CAMPAIGN - NOTIFICATION TOAST
 * iOS-style notification cards on white background
 * Simple entrance animations - NO crazy orbital effects
 */

const VARIANT_STYLES = {
  grey: {
    bg: '#F1F1F4',
    textColor: '#1C1C1C',
    metaColor: '#6E6E73',
  },
  darkBlue: {
    bg: '#3B4D5E',
    textColor: '#FFFFFF',
    metaColor: 'rgba(255,255,255,0.8)',
  },
  accentBlue: {
    bg: '#007AFF',
    textColor: '#FFFFFF',
    metaColor: 'rgba(255,255,255,0.85)',
  },
  black: {
    bg: '#1C1C1C',
    textColor: '#FFFFFF',
    metaColor: 'rgba(255,255,255,0.75)',
  },
  errorRed: {
    bg: '#FF3B30',
    textColor: '#FFFFFF',
    metaColor: 'rgba(255,255,255,0.9)',
  }
};

// Icon configurations with specific colors
const ICON_OPTIONS = [
  { icon: Zap, color: '#007AFF', bg: '#FFFFFF', label: '⚡' }, // Lightning - blue on white
  { icon: Bell, color: '#FF3B30', bg: '#F1F1F4', label: '🔋' }, // Low battery style - red on grey
  { icon: MessageCircle, color: '#FFFFFF', bg: '#34C759', label: '📞' }, // Call - white on green
  { icon: Brain, color: '#1C1C1C', bg: '#FFCC00', label: '😟' }, // Emoji - dark on yellow
];

export default function FloatingPhrase({ 
  phrase, 
  onAnimationComplete,
  lane = 'B',
  entryStyle = 'focus',
  stackIndex = 0
}: FloatingPhraseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const masterTimeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      initializeAnimation();
    }
    
    return () => {
      if (masterTimeline.current) {
        masterTimeline.current.kill();
      }
    };
  }, [phrase.id]);

  const initializeAnimation = () => {
    const el = containerRef.current;
    if (!el) return;

    // CHAOTIC POSITIONING: Allow overlap, tight stacking, claustrophobia
    // Wider range but with percentage-based positioning to keep content visible
    const randomX = gsap.utils.random(20, 80); 
    const randomY = gsap.utils.random(20, 80); 
    const rotation = gsap.utils.random(-8, 8);
    
    // Position with percentages and translate to keep within bounds
    gsap.set(el, { 
      position: 'absolute',
      left: `${randomX}%`,
      top: `${randomY}%`,
      transform: `translate(-50%, -50%)`,
      opacity: 0, 
      scale: 0.85, 
      rotate: rotation,
      transformOrigin: "50% 50%",
      // Ensure it stays within viewport
      maxWidth: '40vw', // Constrain to 40% of viewport width
    });
    
    const tl = gsap.timeline({
      onComplete: () => {
        if (onAnimationComplete) {
          onAnimationComplete();
          console.log(`🗑️ Removed completed phrase: "${phrase.text}"`);
        }
      }
    });
    
    // SEQUENTIAL entrance with stagger based on stackIndex
    const delay = (stackIndex || 0) * 0.3; // Stagger by 0.3s per notification
    
    tl.to(el, { 
      opacity: 1, 
      scale: 1, 
      duration: 0.5, 
      ease: "back.out(1.2)",
      delay: delay
    });
    
    // Subtle floating - minimal to maintain chaos/claustrophobia
    tl.to(el, { 
      y: `+=${gsap.utils.random(-8, 8)}`,
      x: `+=${gsap.utils.random(-6, 6)}`,
      duration: 3.5, 
      yoyo: true, 
      repeat: 3,
      ease: "sine.inOut" 
    }, "+=0.3");
    
    // Subtle rotation drift
    tl.to(el, { 
      rotate: `+=${gsap.utils.random(-3, 3)}`, 
      duration: 4.5, 
      yoyo: true, 
      repeat: 2,
      ease: "sine.inOut" 
    }, "<");

    // Exit animation - fade out after life cycle
    tl.to(el, {
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      ease: "power2.in"
    }, "+=2");

    masterTimeline.current = tl;
  };

  // Hash function based on phrase ID for truly unique random per instance
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  // TRULY RANDOM variant based on unique phrase ID (not text)
  const variants = ['grey', 'darkBlue', 'accentBlue', 'black', 'errorRed'] as const;
  const phraseHash = getHash(phrase.id); // Use ID instead of text for randomness
  const variant = variants[phraseHash % variants.length];
  const styles = VARIANT_STYLES[variant];
  
  // Random icon for each instance
  const showIcon = (phraseHash % 10) > 3; // 70% chance to show icon
  const iconConfig = ICON_OPTIONS[phraseHash % ICON_OPTIONS.length];
  const IconComponent = iconConfig.icon;
  
  // Random shadow depth per instance
  const useSoftShadow = (phraseHash % 2) === 0;
  const shadow = useSoftShadow 
    ? '0 8px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)' // soft - background noise
    : '0 20px 50px rgba(0,0,0,0.25), 0 8px 16px rgba(0,0,0,0.15)'; // strong - intrusive foreground
  
  // Generate meta time
  const metas = ['ahora', 'hace 1 min', 'hace 2 min', 'lun 1:21'];
  const meta = metas[phraseHash % metas.length];

  return (
    <div 
      ref={containerRef}
      className="pointer-events-none select-none"
      style={{
        position: 'absolute',
        display: 'flex',
        gap: showIcon ? '20px' : '0px',
        alignItems: 'flex-start',
        borderRadius: '20px',
        padding: '28px 34px',
        border: 'none',
        boxShadow: shadow,
        backgroundColor: styles.bg,
        willChange: 'transform, opacity',
        minWidth: 'min(600px, 85vw)', // Responsive: never exceed 85% viewport width
        maxWidth: 'min(900px, 90vw)',
        width: 'auto',
      }}
      data-testid={`floating-phrase-${phrase.id}`}
    >
      {/* Icon - random distribution for chaos */}
      {showIcon && (
        <div 
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            backgroundColor: iconConfig.bg,
            color: iconConfig.color,
            boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
          }}
          aria-hidden="true"
        >
          <IconComponent size={30} strokeWidth={2.5} />
        </div>
      )}
      
      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {/* System label/timestamp - small regular text */}
        <div 
          style={{
            fontFamily: '"Avenir Next", Helvetica, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(14px, 1.8vw, 18px)',
            lineHeight: 1.4,
            color: styles.metaColor,
            letterSpacing: '0.2px',
            marginBottom: '4px',
          }}
        >
          {meta}
        </div>
        
        {/* Main intrusive thought - large bold */}
        <div 
          style={{
            fontFamily: '"Avenir Next", Helvetica, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(26px, 3.2vw, 34px)',
            lineHeight: 1.25,
            color: styles.textColor,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {phrase.text}
        </div>
      </div>
    </div>
  );
}
