import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'lg';
  className?: string;
}

export function LoadingState({ message = 'Analyzing...', size = 'lg', className }: LoadingStateProps) {
  return (
    <div 
      className={cn('flex flex-col items-center justify-center p-8', className)}
      role="status" 
      aria-live="polite"
    >
      <motion.div
        className="flex space-x-2"
        initial="initial"
        animate="animate"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'rounded-full bg-ink-300',
              size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
            )}
            variants={{
              initial: { opacity: 0.3, scale: 0.8 },
              animate: { opacity: 1, scale: 1 }
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>
      {message && (
        <p className={cn(
          'mt-4 font-body text-ink-500 animate-pulse',
          size === 'sm' ? 'text-sm' : 'text-base'
        )}>
          {message}
        </p>
      )}
      <span className="sr-only">{message}</span>
    </div>
  );
}
