import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
}

interface NeuralBackgroundProps {
  intensity?: number;
  particleCount?: number;
  connectionDistance?: number;
  pulseActive?: boolean;
}

export default function NeuralBackground({
  intensity = 0.5,
  particleCount = 80,
  connectionDistance = 150,
  pulseActive = false
}: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          connections: []
        });
      }
      return particles;
    };

    const updateParticles = (particles: Particle[]) => {
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1;

        // Keep within bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
      });
    };

    const drawConnections = (particles: Particle[]) => {
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach((otherParticle, j) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * intensity;
            const pulseIntensity = pulseActive ? 1 + Math.sin(Date.now() * 0.005) * 0.3 : 1;
            
            ctx.strokeStyle = `hsla(178, 100%, 33%, ${opacity * pulseIntensity})`;
            ctx.lineWidth = opacity * 2;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
    };

    const drawParticles = (particles: Particle[]) => {
      particles.forEach(particle => {
        const pulseSize = pulseActive ? 1 + Math.sin(Date.now() * 0.008) * 0.5 : 1;
        
        ctx.fillStyle = `hsla(219, 100%, 31%, ${intensity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2 * pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.shadowColor = 'hsl(178, 100%, 33%)';
        ctx.shadowBlur = pulseActive ? 10 * pulseSize : 5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 1 * pulseSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      updateParticles(particlesRef.current);
      drawConnections(particlesRef.current);
      drawParticles(particlesRef.current);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    particlesRef.current = createParticles();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity, particleCount, connectionDistance, pulseActive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900"
      style={{ zIndex: -1 }}
      data-testid="neural-background"
    />
  );
}