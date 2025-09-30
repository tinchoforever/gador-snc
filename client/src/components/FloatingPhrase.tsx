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

    // NIGHTMARE MODE: Random positioning - but keep within screen bounds
    // Use smaller range to ensure notifications don't go off-screen
    const randomX = gsap.utils.random(15, 85); // More centered to avoid edges
    const randomY = gsap.utils.random(15, 75); // Keep away from top/bottom edges
    const rotation = gsap.utils.random(-8, 8);
    
    // Position absolutely and randomly
    gsap.set(el, { 
      position: 'absolute',
      left: `${randomX}%`,
      top: `${randomY}%`,
      transform: `translate(-50%, -50%)`,
      opacity: 0, 
      scale: 0.8, 
      rotate: rotation,
      transformOrigin: "50% 50%" 
    });
    
    const tl = gsap.timeline();
    
    // Dramatic entrance
    tl.to(el, { 
      opacity: 1, 
      scale: 1, 
      duration: 0.6, 
      ease: "back.out(1.4)" 
    });
    
    // Chaotic floating - smaller movements to keep in bounds
    tl.to(el, { 
      y: `+=${gsap.utils.random(-10, 10)}`,
      x: `+=${gsap.utils.random(-10, 10)}`,
      duration: 4, 
      yoyo: true, 
      repeat: -1, 
      ease: "sine.inOut" 
    }, "+=0.5");
    
    // More dramatic rotation
    tl.to(el, { 
      rotate: `+=${gsap.utils.random(-4, 4)}`, 
      duration: 5, 
      yoyo: true, 
      repeat: -1, 
      ease: "sine.inOut" 
    }, "<");

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
        gap: showIcon ? '27px' : '0px',
        alignItems: 'flex-start',
        borderRadius: '24px',
        padding: '36px 42px',
        border: 'none',
        boxShadow: shadow,
        backgroundColor: styles.bg,
        willChange: 'transform, opacity',
        minWidth: '720px',
        maxWidth: '1050px',
        width: 'auto',
      }}
      data-testid={`floating-phrase-${phrase.id}`}
    >
      {/* Icon - random distribution for chaos */}
      {showIcon && (
        <div 
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            backgroundColor: iconConfig.bg,
            color: iconConfig.color,
            boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
          }}
          aria-hidden="true"
        >
          <IconComponent size={36} strokeWidth={2.5} />
        </div>
      )}
      
      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* System label/timestamp - small regular text */}
        <div 
          style={{
            fontFamily: '"Avenir Next", Helvetica, sans-serif',
            fontWeight: 400,
            fontSize: '21px',
            lineHeight: 1.4,
            color: styles.metaColor,
            letterSpacing: '0.3px',
            marginBottom: '6px',
          }}
        >
          {meta}
        </div>
        
        {/* Main intrusive thought - large bold */}
        <div 
          style={{
            fontFamily: '"Avenir Next", Helvetica, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(36px, 4.2vw, 42px)',
            lineHeight: 1.25,
            color: styles.textColor,
            wordBreak: 'break-word',
          }}
        >
          {phrase.text}
        </div>
      </div>
    </div>
  );
}
