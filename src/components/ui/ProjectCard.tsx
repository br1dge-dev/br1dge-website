import { motion } from 'framer-motion';
import { useState } from 'react';
import type { CollectionEntry } from 'astro:content';

interface ProjectCardProps {
  project: CollectionEntry<'projects'>;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href={project.data.link}
      target="_blank"
      rel="noopener noreferrer"
      className="relative group w-full overflow-hidden border border-gray-800 bg-[var(--color-surface)]"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      {/* Image with overlay */}
      <div className="relative aspect-video overflow-hidden">
        {/* Placeholder gradient for now */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            project.data.order === 1
              ? 'from-cyan-900 to-blue-900'
              : 'from-purple-900 to-pink-900'
          }`}
        />

        {/* Glitch overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-[var(--color-accent-cyan)] mix-blend-difference"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.3 : 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* Scanline effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"
          animate={{ y: ['-100%', '100%'] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.div
          className="flex items-start justify-between mb-3"
          animate={{ x: isHovered ? 5 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div>
            <h3 className="text-2xl font-bold mb-1 group-hover:text-[var(--color-accent-cyan)] transition-colors">
              {project.data.title}
            </h3>
            <p className="text-gray-400 text-sm">{project.data.description}</p>
          </div>
          <motion.span
            className="text-4xl"
            animate={{ rotate: isHovered ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            ↗
          </motion.span>
        </motion.div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.data.tags.map((tag, index) => (
            <motion.span
              key={tag}
              className="px-3 py-1 text-xs uppercase tracking-wider border border-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                backgroundColor: 'var(--color-accent-magenta)',
                borderColor: 'var(--color-accent-magenta)',
              }}
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Glitch lines on hover */}
      {isHovered && (
        <>
          <motion.div
            className="absolute top-0 left-0 w-full h-0.5 bg-[var(--color-accent-cyan)]"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-full h-0.5 bg-[var(--color-accent-magenta)]"
            initial={{ x: '100%' }}
            animate={{ x: '-100%' }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </>
      )}
    </motion.a>
  );
}
