import { motion } from 'framer-motion';

export default function BridgeLogo() {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
      }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{
        scale: 1.1,
        rotate: 3,
      }}
      whileTap={{
        scale: 0.95,
        rotate: -3,
      }}
    >
      {/* Brückensymbol ͆ (U+0346 Combining Bridge Above) */}
      <motion.span
        className="text-[clamp(4rem,15vw,12rem)] font-bold leading-none tracking-tight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {String.fromCharCode(0x0346)}
      </motion.span>

      {/* Glitch overlay effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
      >
        <motion.span
          className="absolute inset-0 text-[var(--color-accent-cyan)]"
          style={{ mixBlendMode: 'difference' }}
          animate={{ x: [-2, 2, -2] }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          {String.fromCharCode(0x0346)}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
