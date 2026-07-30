import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { prefaceText } from '../data/memories';
import RainCanvas from './RainCanvas';
import { useSound } from '../context/SoundContext';

interface PrefaceProps {
  onContinue: () => void;
}

const Preface: React.FC<PrefaceProps> = ({ onContinue }) => {
  const [revealed, setRevealed] = useState(false);
  const { playGlassChime } = useSound();

  const handleContinue = () => {
    playGlassChime();
    onContinue();
  };

  return (
    <motion.div
      className="fixed inset-0 z-20 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <RainCanvas density={0.3} speed={0.2} />

      {/* Content */}
      <div className="relative z-10 h-full overflow-y-auto flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          {/* Letter-like card */}
          <div className="glass-strong rounded-2xl md:rounded-3xl p-8 md:p-10 shadow-glass">
            <div className="text-diary text-sm md:text-base text-ink/80 leading-[2.4]">
              {(() => {
                // Build a flat list of {char, index} pairs, with {br: true} for line breaks
                const chars: Array<{ char: string; index: number } | { br: true }> = [];
                const lines = prefaceText.split('\n');
                lines.forEach((line, lineIdx) => {
                  line.split('').forEach((char) => {
                    chars.push({ char, index: chars.length });
                  });
                  if (lineIdx < lines.length - 1) {
                    chars.push({ br: true });
                  }
                });
                const totalChars = chars.filter((c) => !('br' in c)).length;

                return chars.map((item, i) => {
                  if ('br' in item) {
                    return <br key={`br-${i}`} />;
                  }
                  const { char, index } = item;
                  return (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onAnimationComplete={() => {
                        if (index === totalChars - 1) setRevealed(true);
                      }}
                      transition={{ delay: 0.5 + index * 0.03, duration: 0.1 }}
                      style={{ display: 'inline-block' }}
                    >
                      {char === ' ' ? ' ' : char}
                    </motion.span>
                  );
                });
              })()}
            </div>
          </div>

          {/* Continue button */}
          <motion.div
            className="flex justify-center mt-10"
            initial={{ opacity: 0 }}
            animate={revealed ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            <motion.button
              onClick={handleContinue}
              className="glass rounded-full px-8 py-3 text-subtle text-xs md:text-sm tracking-[0.15em] text-ink-light/60 hover:text-ink-light transition-colors shadow-soft"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              翻开下一页 →
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Preface;
