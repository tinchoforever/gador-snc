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

    // NIGHTMARE MODE: Random positioning across entire screen
    const randomX = gsap.utils.random(5, 95);
    const randomY = gsap.utils.random(10, 85);
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
    
    // Chaotic floating - bigger movements
    tl.to(el, { 
      y: `+=${gsap.utils.random(-20, 20)}`,
      x: `+=${gsap.utils.random(-15, 15)}`,
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

  // Hash function to get consistent random values for each phrase
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  // Deterministic variant based on phrase text
  const variants = ['grey', 'darkBlue', 'accentBlue', 'black', 'errorRed'] as const;
  const phraseHash = getHash(phrase.text);
  const variant = variants[phraseHash % variants.length];
  const styles = VARIANT_STYLES[variant];
  
  // Consistent icon for this phrase (or none)
  const showIcon = (phraseHash % 10) > 3; // 70% chance to show icon
  const iconConfig = ICON_OPTIONS[phraseHash % ICON_OPTIONS.length];
  const IconComponent = iconConfig.icon;
  
  // Consistent shadow depth for this phrase
  const useSoftShadow = (phraseHash % 2) === 0;
  const shadow = useSoftShadow 
    ? '0 8px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)' // soft - background noise
    : '0 20px 50px rgba(0,0,0,0.25), 0 8px 16px rgba(0,0,0,0.15)'; // strong - intrusive foreground
  
  // Generate meta time (still random for variety)
  const metas = ['ahora', 'hace 1 min', 'hace 2 min', 'lun 1:21'];
  const meta = metas[phraseHash % metas.length];

  return (
    <div 
      ref={containerRef}
      className="pointer-events-none select-none"
      style={{
        position: 'absolute',
        display: 'flex',
        gap: showIcon ? '18px' : '0px',
        alignItems: 'flex-start',
        borderRadius: '16px',
        padding: '24px 28px',
        border: 'none',
        boxShadow: shadow,
        background: styles.bg,
        willChange: 'transform, opacity',
        minWidth: '480px',
        maxWidth: '750px',
        width: 'auto',
      }}
      data-testid={`floating-phrase-${phrase.id}`}
    >
      {/* Icon - random distribution for chaos */}
      {showIcon && (
        <div 
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            background: iconConfig.bg,
            color: iconConfig.color,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          aria-hidden="true"
        >
          <IconComponent size={24} strokeWidth={2.5} />
        </div>
      )}
      
      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* System label/timestamp - small regular text */}
        <div 
          style={{
            fontFamily: '"Avenir Next", Helvetica, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
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
            fontSize: 'clamp(24px, 2.8vw, 28px)',
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
