import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { PhraseState } from '@shared/schema';

interface NotificationToastProps {
  phrase: PhraseState;
  onAnimationComplete?: () => void;
  variant?: 'grey' | 'blue' | 'green';
}

/**
 * GADOR MENTAL HEALTH CAMPAIGN - NOTIFICATION TOAST
 * iOS-style notification cards on white background
 * Simple entrance animations without crazy effects
 */

const VARIANT_STYLES = {
  grey: {
    bg: '#F7F8FA',
    titleColor: '#374151',
    msgColor: '#0F172A',
    metaColor: '#6B7280',
    iconBg: 'linear-gradient(180deg, #00A99D, #78C4E6)',
  },
  blue: {
    bg: '#2F6BED',
    titleColor: 'rgba(255,255,255,0.9)',
    msgColor: '#FFFFFF',
    metaColor: 'rgba(255,255,255,0.9)',
    iconBg: 'linear-gradient(180deg, #00A99D, #78C4E6)',
  },
  green: {
    bg: '#0B1F17',
    titleColor: '#E8FFF5',
    msgColor: '#E8FFF5',
    metaColor: 'rgba(232,255,245,0.8)',
    iconBg: 'linear-gradient(180deg, #0EA36E, #00A99D)',
  }
};

const ICONS = ['💬', '⚡', '🔔', '🧠', '💭', '📱'];

export default function NotificationToast({ 
  phrase, 
  onAnimationComplete,
  variant = 'grey'
}: NotificationToastProps) {
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

    // Get random rotation for this notification
    const rotation = gsap.utils.random(-2, 3);
    
    // SIMPLE ENTRANCE: slide up + fade in
    gsap.set(el, { 
      opacity: 0, 
      y: 12, 
      scale: 0.995, 
      rotate: rotation,
      transformOrigin: "50% 50%" 
    });
    
    const tl = gsap.timeline();
    
    // Entrada suave - NO crazy animation
    tl.to(el, { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      duration: 0.42, 
      ease: "cubic-bezier(.22,.61,.36,1)" 
    });
    
    // Hold readable
    tl.to(el, { duration: 1.2 });
    
    // IDLE: subtle floating - only 6px up/down, very gentle
    tl.to(el, { 
      y: "+=6", 
      duration: 3.2, 
      yoyo: true, 
      repeat: -1, 
      ease: "sine.inOut" 
    }, "<");
    
    // Very subtle rotation drift
    tl.to(el, { 
      rotate: `+=${gsap.utils.random(-0.6, 0.6)}`, 
      duration: 6, 
      yoyo: true, 
      repeat: -1, 
      ease: "sine.inOut" 
    }, "<");

    masterTimeline.current = tl;
  };

  const styles = VARIANT_STYLES[variant];
  const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
  
  // Generate meta time
  const metas = ['ahora', 'hace 1 min', 'hace 2 min', 'lun 1:21'];
  const meta = metas[Math.floor(Math.random() * metas.length)];

  return (
    <div 
      ref={containerRef}
      className="pointer-events-none select-none"
      style={{
        position: 'relative',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        borderRadius: '18px',
        padding: '16px 18px',
        margin: '16px 0',
        border: '1px solid rgba(15,23,42,0.06)',
        boxShadow: '0 12px 28px rgba(15,23,42,0.10), 0 3px 8px rgba(15,23,42,0.06)',
        background: styles.bg,
        willChange: 'transform, opacity',
        maxWidth: '600px',
      }}
      data-testid={`notification-toast-${phrase.id}`}
    >
      {/* Icon */}
      <div 
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          fontSize: '18px',
          background: styles.iconBg,
          color: '#fff',
          boxShadow: '0 2px 6px rgba(0,0,0,.08), inset 0 0 0 2px rgba(255,255,255,.75)',
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
      
      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div 
          style={{
            fontFamily: '"Avenir Next", Helvetica, sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: 1.3,
            color: styles.titleColor,
            letterSpacing: '0.2px',
          }}
        >
          {variant === 'blue' ? 'Te enviaste un mensaje' : variant === 'green' ? 'Chat' : 'Notificación'}
        </div>
        <div 
          style={{
            fontFamily: '"Avenir Next", Helvetica, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(18px, 2.1vw, 28px)',
            lineHeight: 1.15,
            color: styles.msgColor,
            marginTop: '2px',
            wordBreak: 'break-word',
          }}
        >
          {phrase.text}
        </div>
      </div>
      
      {/* Meta */}
      <div 
        style={{
          color: styles.metaColor,
          fontFamily: '"Avenir Next", Helvetica, sans-serif',
          fontWeight: 400,
          fontSize: '12px',
          lineHeight: 1,
          marginLeft: '8px',
        }}
      >
        {meta}
      </div>
    </div>
  );
}
