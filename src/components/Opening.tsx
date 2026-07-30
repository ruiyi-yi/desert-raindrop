import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../data/memories';

interface OpeningProps {
  onComplete: () => void;
}

const FloatingLight: React.FC<{ index: number; isBirthday: boolean }> = ({ index, isBirthday }) => {
  const randomDelay = Math.random() * 3;
  const randomDuration = 5 + Math.random() * 6;
  const startX = 20 + (index % 6) * 12;
  const color = isBirthday ? 'rgba(240,200,120,0.5)' : 'rgba(180,220,240,0.5)';
  const glow = isBirthday ? '0 0 8px rgba(240,200,120,0.4)' : '0 0 8px rgba(180,220,240,0.4)';

  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full pointer-events-none"
      style={{ background: color, boxShadow: glow, left: `${startX}%` }}
      initial={{ opacity: 0, y: '70%' }}
      animate={{ opacity: [0, 0.6, 0.6, 0], y: ['70%', '15%'], x: [`${startX}%`, `${startX + (Math.random() * 30 - 15)}%`] }}
      transition={{ duration: randomDuration, delay: randomDelay, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }}
    />
  );
};

const Opening: React.FC<OpeningProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(-1);
  const [phase, setPhase] = useState<'loading' | 'text' | 'done'>('loading');

  // Birthday detection
  const isBirthday = useMemo(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${mm}-${dd}` === siteConfig.birthday;
  }, []);

  const openingTexts = isBirthday
    ? [
        `今天有一场特别的雨。`,
        `生日快乐，${siteConfig.birthdayName}。`,
      ]
    : [
        '有一场雨，曾经落在很远的沙漠里。',
        '这里记录了她的一些成长历程。',
      ];

  const bgGradient = isBirthday
    ? 'linear-gradient(180deg, #E8DFC8 0%, #F0E8D8 30%, #F8F2E8 60%, #F0E8D8 100%)'
    : 'linear-gradient(180deg, #C5DFF0 0%, #DCEBF4 30%, #E8F4FD 60%, #DCEBF4 100%)';

  const progressColor = isBirthday
    ? 'linear-gradient(90deg, rgba(210,170,100,0.7), rgba(190,140,60,0.6))'
    : 'linear-gradient(90deg, rgba(126,200,227,0.6), rgba(91,155,213,0.5))';

  const dropColor = isBirthday ? 'rgba(210,170,100,0.9)' : 'rgba(126,200,227,0.8)';
  const dropGlow = isBirthday ? '0 0 8px rgba(210,170,100,0.6)' : '0 0 6px rgba(126,200,227,0.5)';

  useEffect(() => {
    const duration = 3500;
    const interval = 30;
    const step = (interval / duration) * 100;
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        setProgress(100);

        // Show first text after a pause
        setTimeout(() => {
          setTextIndex(0);
          setPhase('text');

          // Show second text after first
          setTimeout(() => {
            setTextIndex(1);

            // Done after second text
            setTimeout(() => {
              setPhase('done');
              setTimeout(onComplete, 800);
            }, 2500);
          }, 2800);
        }, 400);
      }
      setProgress(current);
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: bgGradient }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Subtle floating light particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <FloatingLight key={i} index={i} isBirthday={isBirthday} />
        ))}
      </div>

      {/* Progress bar */}
      <motion.div
        className="relative w-48 md:w-64 h-[2px] mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-white/30 rounded-full" />

        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: progressColor,
            width: `${progress}%`,
          }}
        />

        {progress > 0 && progress < 100 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{
              left: `${progress}%`,
              background: dropColor,
              boxShadow: dropGlow,
            }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>

      {/* Loading text */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.p
            className="text-subtle text-xs md:text-sm tracking-[0.2em] text-ink-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            Collecting raindrops...
          </motion.p>
        )}
      </AnimatePresence>

      {/* Opening texts — cycle through each phrase */}
      <AnimatePresence mode="wait">
        {textIndex >= 0 && phase === 'text' && (
          <motion.div
            key={textIndex}
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              className="text-title text-xl md:text-2xl text-ink-dark text-center leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              {openingTexts[textIndex].split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  style={{ display: 'inline-block' }}
                >
                  {char === ' ' ? ' ' : char}
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Opening;
