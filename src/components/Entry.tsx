import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../context/SoundContext';

interface EntryProps {
  onEnter: () => void;
  onReverse: () => void;
}

const Entry: React.FC<EntryProps> = ({ onEnter, onReverse }) => {
  const { playRaindropSound, playGlassChime } = useSound();
  const [enterClicked, setEnterClicked] = useState(false);
  const [reverseClicked, setReverseClicked] = useState(false);

  const handleEnter = () => {
    setEnterClicked(true);
    playGlassChime();
    setTimeout(() => onEnter(), 800);
  };

  const handleReverse = () => {
    setReverseClicked(true);
    playRaindropSound();
    setTimeout(() => onReverse(), 800);
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-12 md:gap-16 px-6"
      style={{ background: 'linear-gradient(180deg, #C5DFF0 0%, #DCEBF4 30%, #E8F4FD 60%, #DCEBF4 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Subtle title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <h1 className="text-title text-2xl md:text-3xl text-ink-dark mb-2">
          沙漠一粒雨
        </h1>
        <p className="text-subtle text-xs md:text-sm tracking-[0.15em] text-ink-light/60">
          A raindrop in the desert
        </p>
      </motion.div>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
        {/* ENTER button */}
        <motion.button
          onClick={handleEnter}
          className="group relative flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={enterClicked ? { scale: 0.95, opacity: 0 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {/* Ripple effect on hover */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 rounded-full bg-sky-rain/10 animate-[ripple_2s_ease-out_infinite]" />
              <div className="absolute inset-0 rounded-full bg-sky-rain/8 animate-[ripple_2s_ease-out_0.5s_infinite]" />
              <div className="absolute inset-0 rounded-full bg-sky-rain/5 animate-[ripple_2s_ease-out_1s_infinite]" />
            </div>
          </div>

          <div className="glass-strong rounded-full w-24 h-24 md:w-28 md:h-28 flex flex-col items-center justify-center shadow-glass hover:shadow-glass-hover transition-shadow duration-500">
            <span className="text-title text-sm md:text-base text-ink-dark tracking-[0.2em]">
              ENTER
            </span>
          </div>
          <p className="mt-4 text-subtle text-[10px] md:text-xs tracking-[0.15em] text-ink-light/50 text-center">
            进入这场雨
          </p>
        </motion.button>

        {/* OR? button */}
        <motion.button
          onClick={handleReverse}
          className="group relative flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={reverseClicked ? { scale: 0.95, opacity: 0 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 rounded-full bg-sky-rain/10 animate-[ripple_2s_ease-out_infinite]" />
              <div className="absolute inset-0 rounded-full bg-sky-rain/8 animate-[ripple_2s_ease-out_0.5s_infinite]" />
            </div>
          </div>

          <div className="glass rounded-full w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center shadow-glass hover:shadow-glass-hover transition-shadow duration-500">
            <span className="text-title text-xs md:text-sm text-ink-light/70 tracking-[0.15em]">
              OR?
            </span>
          </div>
          <p className="mt-4 text-subtle text-[10px] md:text-xs tracking-[0.15em] text-ink-light/40 text-center">
            如果时间倒流
          </p>
        </motion.button>
      </div>

      {/* Footer hint */}
      <motion.p
        className="absolute bottom-12 text-subtle text-[10px] tracking-[0.2em] text-ink-light/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        选择一段你想重温的时间
      </motion.p>
    </motion.div>
  );
};

export default Entry;
