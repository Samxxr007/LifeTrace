import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface NarrativeBlockProps {
  text: string;
  delay?: number;
}

export const NarrativeBlock: React.FC<NarrativeBlockProps> = ({ text, delay = 0 }) => {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(' ');

  if (prefersReducedMotion) {
    return (
      <div className="py-24 max-w-3xl mx-auto text-center">
        <p className="font-display text-xl md:text-2xl text-ink-700 leading-relaxed">
          {text}
        </p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 10,
    },
  };

  return (
    <div className="py-24 max-w-3xl mx-auto text-center overflow-hidden px-6">
      <motion.p
        className="font-display text-xl md:text-2xl text-ink-700 leading-relaxed flex flex-wrap justify-center gap-x-2"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {words.map((word, index) => (
          <motion.span variants={child} key={index} className="inline-block">
            {word}
          </motion.span>
        ))}
      </motion.p>
    </div>
  );
};
