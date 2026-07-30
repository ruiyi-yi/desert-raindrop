import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { reverseMemories } from '../data/memories';
import RainCanvas from './RainCanvas';
import { useSound } from '../context/SoundContext';

const ReversePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [revealedYears, setRevealedYears] = useState<Set<string>>(new Set());
  const { playGlassChime } = useSound();

  const handleYearClick = (year: string) => {
    setRevealedYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  const handleBackClick = () => {
    playGlassChime();
    onBack();
  };

  return (
    <motion.div
      className="fixed inset-0 z-20 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Reversed rain - going upward */}
      <RainCanvas direction="up" density={0.35} speed={0.25} />

      {/* Back button */}
      <motion.button
        onClick={handleBackClick}
        className="absolute top-6 left-6 z-30 glass rounded-full w-10 h-10 flex items-center justify-center text-ink-light/50 hover:text-ink-light transition-colors"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>

      {/* Title */}
      <motion.div
        className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-subtle text-[10px] tracking-[0.2em] text-ink-light/50">
          如果时间倒流
        </p>
      </motion.div>

      {/* Content */}
      <div className="h-full overflow-y-auto pt-28 pb-32 px-4">
        <div className="relative max-w-lg mx-auto">
          {/* Central line with upward animation */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(0deg, transparent 0%, rgba(160,210,230,0.3) 5%, rgba(126,200,227,0.5) 50%, rgba(160,210,230,0.3) 95%, transparent 100%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(0deg, transparent 0%, rgba(180,220,240,0.5) 10%, rgba(160,210,230,0.7) 50%, rgba(180,220,240,0.5) 90%, transparent 100%)',
                backgroundSize: '100% 60px',
                animation: 'flowLine 4s linear infinite',
              }}
            />
          </div>

          {/* Year nodes */}
          {reverseMemories.map((item, index) => {
            const isRevealed = revealedYears.has(item.year);
            return (
              <motion.div
                key={item.year}
                className="relative flex items-center justify-center mb-24 md:mb-28"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.2, duration: 0.7 }}
              >
                {/* Year node */}
                <motion.button
                  onClick={() => handleYearClick(item.year)}
                  className="relative z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Rising raindrop */}
                  <div className="relative w-6 h-8 flex items-center justify-center">
                    <svg width="24" height="30" viewBox="0 0 20 24" fill="none">
                      <motion.path
                        d="M10 0C10 0 0 12 0 17C0 20.866 4.477 24 10 24C15.523 24 20 20.866 20 17C20 12 10 0 10 0Z"
                        fill={isRevealed ? 'rgba(126,200,227,0.65)' : 'rgba(180,210,235,0.4)'}
                        stroke="rgba(180,220,240,0.5)"
                        strokeWidth="0.5"
                        animate={isRevealed ? {
                          y: [0, -3, 0],
                          fill: ['rgba(126,200,227,0.65)', 'rgba(91,155,213,0.55)', 'rgba(126,200,227,0.65)'],
                        } : {}}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </svg>
                  </div>

                  {/* Year label */}
                  <p className={`absolute -top-7 left-1/2 -translate-x-1/2 text-subtle text-xs tracking-[0.1em] whitespace-nowrap transition-colors duration-500 ${isRevealed ? 'text-ink' : 'text-ink-light/40'}`}>
                    {item.year}
                  </p>
                </motion.button>

                {/* Revealed text */}
                {isRevealed && (
                  <motion.div
                    className="absolute top-12 left-1/2 -translate-x-1/2 w-64 md:w-72 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  >
                    <motion.p
                      className="text-diary text-sm md:text-base text-ink/80 leading-[2.2] whitespace-pre-line"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 1 }}
                    >
                      {item.text.split('').map((char, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + i * 0.06, duration: 0.2 }}
                          style={{ display: 'inline-block' }}
                        >
                          {char === ' ' ? ' ' : char}
                        </motion.span>
                      ))}
                    </motion.p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* End note */}
          <motion.div
            className="relative flex justify-center pt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="glass rounded-full px-6 py-2">
              <p className="text-subtle text-[10px] tracking-[0.2em] text-ink-light/40">
                · 雨正在回到天空 ·
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Subtle bottom hint */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5 }}
      >
        <p className="text-subtle text-[10px] tracking-[0.15em] text-ink-light/40">
          点击雨滴，看看藏起来的话
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ReversePage;
