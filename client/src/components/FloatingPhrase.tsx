import { useEffect, useState } from 'react';
import { PhraseState } from '@shared/schema';

interface FloatingPhraseProps {
  phrase: PhraseState;
  onAnimationComplete?: () => void;
}

export default function FloatingPhrase({ phrase, onAnimationComplete }: FloatingPhraseProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(phrase.layer);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setCurrentLayer(phrase.layer);
  }, [phrase.layer]);

  const getLayerStyles = () => {
    const baseStyles = {
      transform: `translate3d(${phrase.position.x}px, ${phrase.position.y}px, ${phrase.position.z || 0}px)`,
      opacity: phrase.opacity,
    };

    switch (currentLayer) {
      case 'front':
        return {
          ...baseStyles,
          zIndex: 100,
          fontSize: '2.5rem',
          fontWeight: 600,
          textShadow: '0 0 20px hsl(178, 100%, 33%), 0 0 40px hsl(178, 100%, 33%)',
          color: 'hsl(178, 100%, 33%)',
        };
      case 'floating':
        return {
          ...baseStyles,
          zIndex: 80,
          fontSize: '2rem',
          fontWeight: 500,
          textShadow: '0 0 15px hsl(199, 68%, 69%), 0 0 30px hsl(199, 68%, 69%)',
          color: 'hsl(199, 68%, 69%)',
        };
      case 'mirror':
        return {
          ...baseStyles,
          zIndex: 30,
          fontSize: '1.8rem',
          fontWeight: 400,
          textShadow: '0 0 10px hsl(219, 100%, 31%)',
          color: 'hsl(219, 100%, 31%)',
          transform: `${baseStyles.transform} scaleX(-1)`,
        };
      case 'return':
        return {
          ...baseStyles,
          zIndex: 60,
          fontSize: '2.2rem',
          fontWeight: 500,
          textShadow: '0 0 18px hsl(178, 100%, 33%)',
          color: 'hsl(178, 100%, 33%)',
        };
      default:
        return baseStyles;
    }
  };

  const isHudStyle = phrase.text.length > 50; // Long phrases get HUD treatment

  return (
    <div
      className={`fixed pointer-events-none transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={getLayerStyles()}
      data-testid={`floating-phrase-${phrase.id}`}
    >
      {isHudStyle ? (
        <div className="relative">
          <div
            className="px-6 py-4 border-2 rounded-lg backdrop-blur-sm"
            style={{
              borderColor: `hsl(${currentLayer === 'front' ? '178, 100%, 33%' : '219, 100%, 31%'})`,
              backgroundColor: `hsla(${currentLayer === 'front' ? '178, 100%, 33%' : '219, 100%, 31%'}, 0.1)`,
            }}
          >
            <div className="absolute inset-0 rounded-lg animate-pulse"
                 style={{
                   boxShadow: `inset 0 0 20px hsla(${currentLayer === 'front' ? '178, 100%, 33%' : '219, 100%, 31%'}, 0.3)`,
                 }}
            />
            <p className="relative z-10 text-white font-medium leading-tight">
              {phrase.text}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-white font-semibold leading-tight whitespace-nowrap">
          {phrase.text}
        </p>
      )}
    </div>
  );
}