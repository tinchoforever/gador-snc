import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { PhraseState } from '@shared/schema';
import { MessageCircle, Zap, Bell, Brain, MessageSquare, Smartphone, Mail, Phone, Calendar, Camera, Music, Heart, AlertCircle, BatteryLow, Wifi, Volume2 } from 'lucide-react';

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

// COLORES OFICIALES DE LA CAMPAÑA GADOR
const VARIANT_STYLES = {
  standard: {
    bg: '#FFFFFF',
    textColor: '#000000',
    metaColor: '#666666',
    opacity: 1,
  },
  sent: {
    bg: '#3B82F6',
    textColor: '#FFFFFF',
    metaColor: 'rgba(255,255,255,0.8)',
    opacity: 1,
  },
  received: {
    bg: '#D1FAE5',
    textColor: '#000000',
    metaColor: '#333333',
    opacity: 1,
  },
  alert: {
    bg: '#F8D7DA',
    textColor: '#721C24',
    metaColor: '#721C24',
    opacity: 1,
  },
  reminder: {
    bg: '#000000',
    textColor: '#FFFFFF',
    metaColor: 'rgba(255,255,255,0.75)',
    opacity: 0.8,
  },
  mention: {
    bg: '#606368',
    textColor: '#FFFFFF',
    metaColor: 'rgba(255,255,255,0.8)',
    opacity: 0.9,
  },
  tag: {
    bg: '#E5E7EB',
    textColor: '#000000',
    metaColor: '#555555',
    opacity: 1,
  }
};

// Icon configurations with specific colors - VARIED APPS
const ICON_OPTIONS = [
  { icon: MessageCircle, color: '#FFFFFF', bg: '#25D366', label: 'WhatsApp' }, // WhatsApp green
  { icon: Mail, color: '#FFFFFF', bg: '#EA4335', label: 'Gmail' }, // Gmail red
  { icon: Camera, color: '#FFFFFF', bg: '#E1306C', label: 'Instagram' }, // Instagram pink
  { icon: Phone, color: '#FFFFFF', bg: '#007AFF', label: 'Teléfono' }, // Phone blue
  { icon: MessageSquare, color: '#1C1C1C', bg: '#FFCC00', label: 'Mensaje' }, // SMS yellow
  { icon: Calendar, color: '#FFFFFF', bg: '#FF3B30', label: 'Calendario' }, // Calendar red
  { icon: Music, color: '#FFFFFF', bg: '#1DB954', label: 'Spotify' }, // Spotify green
  { icon: Bell, color: '#FFFFFF', bg: '#5856D6', label: 'Notificación' }, // Purple notification
  { icon: Heart, color: '#FFFFFF', bg: '#FF2D55', label: 'Salud' }, // Health pink
  { icon: AlertCircle, color: '#1C1C1C', bg: '#FFCC00', label: 'Alerta' }, // Alert yellow
  { icon: BatteryLow, color: '#FFFFFF', bg: '#FF3B30', label: 'Batería' }, // Battery red
  { icon: Wifi, color: '#FFFFFF', bg: '#007AFF', label: 'WiFi' }, // WiFi blue
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
    const randomX = gsap.utils.random(15, 85); 
    const randomY = gsap.utils.random(15, 85); 
    const rotation = gsap.utils.random(-15, 15); // MÁS VARIACIÓN EN INCLINACIÓN
    
    // Get the target opacity from data attribute or default to 1
    const targetOpacity = parseFloat(el.style.opacity || '1');
    
    // Position with percentages and translate to keep within bounds
    gsap.set(el, { 
      position: 'absolute',
      left: `${randomX}%`,
      top: `${randomY}%`,
      transform: `translate(-50%, -50%)`,
      opacity: 0, 
      scale: 0.7, // Más pequeña al inicio para entrada más dramática
      rotate: rotation,
      transformOrigin: "50% 50%",
      maxWidth: '40vw',
    });
    
    const tl = gsap.timeline({
      onComplete: () => {
        if (onAnimationComplete) {
          onAnimationComplete();
          console.log(`🗑️ Removed completed phrase: "${phrase.text}"`);
        }
      }
    });
    
    // ENTRADA MÁS RÁPIDA Y DINÁMICA
    const delay = (stackIndex || 0) * 0.15; // Menos delay entre notificaciones
    
    tl.to(el, { 
      opacity: targetOpacity, // Fade to the variant's target opacity
      scale: 1, 
      duration: 0.3, // MÁS RÁPIDO
      ease: "back.out(1.7)", // Más bounce
      delay: delay
    });
    
    // Floating más dinámico y rápido
    tl.to(el, { 
      y: `+=${gsap.utils.random(-12, 12)}`,
      x: `+=${gsap.utils.random(-10, 10)}`,
      duration: 2, // MÁS RÁPIDO
      yoyo: true, 
      repeat: 4, // Más repeticiones
      ease: "sine.inOut" 
    }, "+=0.1");
    
    // Rotación más pronunciada y variada
    tl.to(el, { 
      rotate: `+=${gsap.utils.random(-8, 8)}`, // MÁS ROTACIÓN
      duration: 2.5, 
      yoyo: true, 
      repeat: 3,
      ease: "sine.inOut" 
    }, "<");

    // Exit animation - más rápida
    tl.to(el, {
      opacity: 0,
      scale: 0.85,
      duration: 0.5, // MÁS RÁPIDO
      ease: "power2.in"
    }, "+=1");

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
  const variants = ['standard', 'sent', 'received', 'alert', 'reminder', 'mention', 'tag'] as const;
  const phraseHash = getHash(phrase.id); // Use ID instead of text for randomness
  const variant = variants[phraseHash % variants.length];
  const styles = VARIANT_STYLES[variant];
  
  // ALL notifications have icons - 100%
  const showIcon = true; // ALWAYS show icon
  const iconConfig = ICON_OPTIONS[phraseHash % ICON_OPTIONS.length];
  const IconComponent = iconConfig.icon;
  
  // Random shadow depth per instance
  const useSoftShadow = (phraseHash % 2) === 0;
  const shadow = useSoftShadow 
    ? '0 8px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)' // soft - background noise
    : '0 20px 50px rgba(0,0,0,0.25), 0 8px 16px rgba(0,0,0,0.15)'; // strong - intrusive foreground
  
  // Generate meta time - MÁS VARIEDAD
  const metas = [
    'ahora', 
    'hace 1 min', 
    'hace 2 min', 
    'hace 5 min',
    'hace 15 min',
    'lun 9:21', 
    'mar 14:33',
    'mié 11:05',
    'jue 16:42',
    'vie 8:17',
    'sáb 13:29',
    'dom 10:44',
    '7:30',
    '12:15',
    '18:22',
    '21:08'
  ];
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
        border: variant === 'standard' ? '1px solid #E5E7EB' : 'none', // Border for white notifications
        boxShadow: shadow,
        backgroundColor: styles.bg,
        opacity: styles.opacity, // Base opacity - GSAP will override during animations
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
