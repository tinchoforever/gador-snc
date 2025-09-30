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

// COLORES OFICIALES DE LA CAMPAÑA GADOR - ESPECIFICACIÓN EXACTA
const VARIANT_STYLES = {
  blue: {
    bg: '#37479d',
    textColor: '#ffffff',
    metaColor: 'rgba(255,255,255,0.8)',
    opacity: 1,
    borderRadius: '12px', // Mensajes complejos
  },
  lightGrayLarge: {
    bg: '#c6c6c6',
    textColor: '#262322',
    metaColor: '#262322',
    opacity: 1,
    borderRadius: '16px', // Notificaciones de sistema - efecto 3D
  },
  lightGraySmall: {
    bg: '#f2f3f7',
    textColor: '#0b1825',
    metaColor: '#0b1825',
    opacity: 1,
    borderRadius: '999px', // Píldoras - redondeadas pero no elipses
  },
  darkGray: {
    bg: '#434f5d',
    textColor: '#c0c0c0',
    metaColor: '#a0a0a0',
    opacity: 1,
    borderRadius: '8px', // Menciones - esquinas suaves
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

  const phraseHash = getHash(phrase.id); // Use ID instead of text for randomness
  
  // TAMAÑOS VARIADOS - determinar primero
  const sizeVariant = phraseHash % 3;
  
  // Colores oficiales Gador - asignar según tamaño
  const colorOptions = sizeVariant === 0 
    ? ['lightGraySmall', 'blue', 'darkGray'] // Pequeños usan gris claro chico
    : sizeVariant === 2 
    ? ['lightGrayLarge', 'blue', 'darkGray'] // Grandes usan gris claro grande
    : ['blue', 'darkGray', 'lightGraySmall', 'lightGrayLarge']; // Medianos pueden usar cualquiera
  
  const variantIndex = Math.floor((phraseHash / 3)) % colorOptions.length;
  const variant = colorOptions[variantIndex] as keyof typeof VARIANT_STYLES;
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

  // TAMAÑOS VARIADOS - 50% MÁS CHICOS
  const sizes = {
    small: {
      padding: '8px 10px',
      gap: '6px',
      iconSize: 16,
      iconContainerSize: 25,
      metaFontSize: 'clamp(6px, 0.7vw, 7px)',
      textFontSize: 'clamp(9px, 1.2vw, 12px)',
      minWidth: 'min(175px, 60vw)',
      maxWidth: 'min(300px, 75vw)',
      fontWeight: 400,
    },
    medium: {
      padding: '12px 15px',
      gap: '9px',
      iconSize: 20,
      iconContainerSize: 32,
      metaFontSize: 'clamp(7px, 0.9vw, 9px)',
      textFontSize: 'clamp(12px, 1.5vw, 16px)',
      minWidth: 'min(250px, 70vw)',
      maxWidth: 'min(375px, 80vw)',
      fontWeight: 600,
    },
    large: {
      padding: '16px 21px',
      gap: '12px',
      iconSize: 24,
      iconContainerSize: 38,
      metaFontSize: 'clamp(8px, 1vw, 11px)',
      textFontSize: 'clamp(15px, 1.9vw, 21px)',
      minWidth: 'min(325px, 75vw)',
      maxWidth: 'min(475px, 85vw)',
      fontWeight: 700,
    }
  };
  
  const currentSize = sizeVariant === 0 ? sizes.small : sizeVariant === 1 ? sizes.medium : sizes.large;

  return (
    <div 
      ref={containerRef}
      className="pointer-events-none select-none"
      style={{
        position: 'absolute',
        display: 'flex',
        gap: showIcon ? currentSize.gap : '0px',
        alignItems: 'flex-start',
        borderRadius: styles.borderRadius,
        padding: currentSize.padding,
        border: 'none',
        boxShadow: shadow,
        backgroundColor: styles.bg,
        opacity: styles.opacity,
        willChange: 'transform, opacity',
        minWidth: currentSize.minWidth,
        maxWidth: currentSize.maxWidth,
        width: 'auto',
      }}
      data-testid={`floating-phrase-${phrase.id}`}
    >
      {/* Icon - tamaño variado */}
      {showIcon && (
        <div 
          style={{
            width: `${currentSize.iconContainerSize}px`,
            height: `${currentSize.iconContainerSize}px`,
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
          <IconComponent size={currentSize.iconSize} strokeWidth={2.5} />
        </div>
      )}
      
      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {/* System label/timestamp - tamaño variado */}
        <div 
          style={{
            fontFamily: '"Avenir Next", Helvetica, sans-serif',
            fontWeight: 400,
            fontSize: currentSize.metaFontSize,
            lineHeight: 1.4,
            color: styles.metaColor,
            letterSpacing: '0.2px',
            marginBottom: '4px',
          }}
        >
          {meta}
        </div>
        
        {/* Main intrusive thought - tamaño y peso variado */}
        <div 
          style={{
            fontFamily: '"Avenir Next", Helvetica, sans-serif',
            fontWeight: currentSize.fontWeight,
            fontSize: currentSize.textFontSize,
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
