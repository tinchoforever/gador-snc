import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MessageCircle, Mail, Camera, Phone, MessageSquare, Calendar, Music, Bell, Heart, AlertCircle, BatteryLow, Wifi, Volume2 } from 'lucide-react';

interface FloatingIconProps {
  id: string;
  onAnimationComplete?: () => void;
}

// Íconos flotantes independientes - solo el ícono, sin notificación
const SOLO_ICON_OPTIONS = [
  { icon: MessageCircle, bg: '#25D366' }, // WhatsApp
  { icon: Mail, bg: '#EA4335' }, // Gmail
  { icon: Camera, bg: '#E1306C' }, // Instagram
  { icon: Phone, bg: '#007AFF' }, // Phone
  { icon: MessageSquare, bg: '#FFCC00' }, // SMS
  { icon: Calendar, bg: '#FF3B30' }, // Calendar
  { icon: Music, bg: '#1DB954' }, // Spotify
  { icon: Bell, bg: '#5856D6' }, // Notification
  { icon: Heart, bg: '#FF2D55' }, // Health
  { icon: AlertCircle, bg: '#FFCC00' }, // Alert
  { icon: BatteryLow, bg: '#FF3B30' }, // Battery
  { icon: Wifi, bg: '#007AFF' }, // WiFi
  { icon: Volume2, bg: '#34C759' }, // Sound
];

export default function FloatingIcon({ id, onAnimationComplete }: FloatingIconProps) {
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
  }, [id]);

  const initializeAnimation = () => {
    const el = containerRef.current;
    if (!el) return;

    // Posición aleatoria
    const randomX = gsap.utils.random(10, 90); 
    const randomY = gsap.utils.random(10, 90); 
    const rotation = gsap.utils.random(-25, 25); // Mucha variación
    const size = gsap.utils.random(50, 80); // Tamaños variados
    
    gsap.set(el, { 
      position: 'absolute',
      left: `${randomX}%`,
      top: `${randomY}%`,
      transform: `translate(-50%, -50%)`,
      opacity: 0, 
      scale: 0.5,
      rotate: rotation,
      transformOrigin: "50% 50%",
    });
    
    const tl = gsap.timeline({
      onComplete: () => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    });
    
    // Entrada rápida
    tl.to(el, { 
      opacity: 0.7, 
      scale: 1, 
      duration: 0.4, 
      ease: "back.out(1.5)",
      delay: gsap.utils.random(0, 1) // Delay aleatorio
    });
    
    // Floating dinámico
    tl.to(el, { 
      y: `+=${gsap.utils.random(-20, 20)}`,
      x: `+=${gsap.utils.random(-15, 15)}`,
      duration: 2.5, 
      yoyo: true, 
      repeat: 3,
      ease: "sine.inOut" 
    }, "+=0.2");
    
    // Rotación continua
    tl.to(el, { 
      rotate: `+=${gsap.utils.random(-30, 30)}`,
      duration: 3, 
      yoyo: true, 
      repeat: 2,
      ease: "sine.inOut" 
    }, "<");

    // Fade out
    tl.to(el, {
      opacity: 0,
      scale: 0.6,
      duration: 0.6,
      ease: "power2.in"
    }, "+=1.5");

    masterTimeline.current = tl;
  };

  // Hash para selección aleatoria
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const iconHash = getHash(id);
  const iconConfig = SOLO_ICON_OPTIONS[iconHash % SOLO_ICON_OPTIONS.length];
  const IconComponent = iconConfig.icon;
  const size = 50 + (iconHash % 30); // Entre 50 y 80px

  return (
    <div 
      ref={containerRef}
      className="pointer-events-none select-none"
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        backgroundColor: iconConfig.bg,
        color: '#FFFFFF',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        willChange: 'transform, opacity',
      }}
      data-testid={`floating-icon-${id}`}
    >
      <IconComponent size={size * 0.5} strokeWidth={2.5} />
    </div>
  );
}
