import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  life: number;
}

export default function MouseTracker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [bridgeHovered, setBridgeHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Cursor collision with bridge
  useEffect(() => {
    const bridgeElement = bridgeRef.current;
    if (!bridgeElement) return;

    const checkCollision = () => {
      const bridgeRect = bridgeElement.getBoundingClientRect();
      const cx = mouseX.get();
      const cy = mouseY.get();

      const isNear = (
        cx >= bridgeRect.left &&
        cx <= bridgeRect.right &&
        cy >= bridgeRect.top &&
        cy <= bridgeRect.bottom
      );

      setBridgeHovered(isNear);
    };

    const interval = setInterval(checkCollision, 50);
    return () => clearInterval(interval);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Add particle every few frames
      if (Math.random() > 0.8) {
        const newParticle: Particle = {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
        };
        setParticles((prev) => [...prev.slice(-15), newParticle]);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const newRipple: Ripple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        life: 1,
      };
      setRipples((prev) => [...prev, newRipple]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [mouseX, mouseY]);

  // Update particles
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.025,
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  // Update ripples
  useEffect(() => {
    if (ripples.length === 0) return;

    const interval = setInterval(() => {
      setRipples((prev) =>
        prev
          .map((r) => ({
            ...r,
            life: r.life - 0.04,
          }))
          .filter((r) => r.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [ripples.length]);

  return (
    <>
      {/* Bridge element for collision detection */}
      <div ref={bridgeRef} className="fixed inset-0 pointer-events-none" />

      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ cursor: 'none' }}
      >
        {/* Simple dot cursor */}
        <motion.div
          className="fixed top-0 left-0 w-1 h-1 rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
          style={{
            x: cursorX,
            y: cursorY,
            backgroundColor: bridgeHovered
              ? 'var(--color-accent-magenta)'
              : 'var(--color-accent-cyan)',
          }}
          animate={{
            scale: bridgeHovered ? 2 : 1,
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Click ripples */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              className="fixed top-0 left-0 rounded-full border-2 border-[var(--color-accent-magenta)] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
              style={{ x: ripple.x, y: ripple.y }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: 3,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </AnimatePresence>

        {/* Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="fixed w-1 h-1 rounded-full bg-[var(--color-accent-magenta)] -translate-x-1/2 -translate-y-1/2"
            style={{
              x: particle.x,
              y: particle.y,
              opacity: particle.life,
              mixBlendMode: 'screen',
            }}
          />
        ))}
      </div>
    </>
  );
}
